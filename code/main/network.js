//
// network class
//

export default class NetworkClass
{
    static PORT=52419;
    
    static STATUS_OK=0;
    static STATUS_INTERNAL_ERROR=1;
    static STATUS_UNAUTHORIZED=2;
    
    static STATUS_STRINGS=['OK','Internal Error','Unauthorized'];
    
    core=null;
    socket=null;
    queue=null;
    textEncoder=null;
    
    id=0;
    connectOKCallback=null;
    connectErrorCallback=null;
    inConnectWait=false;
    lastErrorMessage=null;
    
    constructor(core)
    {
        this.core=core;
        
        this.socket=null;
        this.textEncoder=new TextEncoder();     // preallocate this as we will use it a bit
        
        Object.seal(this);
    }
    
    connect(okCallback,errorCallback)
    {
        this.connectOKCallback=okCallback;
        this.connectErrorCallback=errorCallback;
        this.inConnectWait=true;
        this.lastErrorMessage=null;
        
            // empty the queue
            
        this.queue=[];
        
            // now connect
            
        this.socket=new WebSocket('ws://'+this.core.setup.serverURL+':'+NetworkClass.PORT);
        this.socket.addEventListener('open',this.open.bind(this));
        this.socket.addEventListener('close',this.close.bind(this));
        this.socket.addEventListener('message',this.message.bind(this));
        this.socket.addEventListener('error',this.error.bind(this)); 
    }
    
    disconnect()
    {
        if (this.socket!==null) {
            this.socket.close(1000);        // 1000 is code for normal close
            this.socket=null;
        } 
    }

    open(event)
    {
            // after opening, the very first message from
            // us is the client info, for now, just a userId
            // which is the setup name, we then wait for the first
            // message to be ok and we are connected at this point

        this.socket.send(this.textEncoder.encode(this.core.setup.name));
    }
    
    close(event)
    {
        
    }
    
    async message(event)
    {
        let dataView=new DataView(await (new Response(event.data).arrayBuffer()));
        let status=dataView.getInt8(0);
        
            // stop on bad statuses
            
        if (status!==NetworkClass.STATUS_OK) {
            this.lastErrorMessage='Network error: '+NetworkClass.STATUS_STRINGS[status];
            this.disconnect();
            
                // if we hit a bad status while
                // waiting to connect, call the startup error
                
            if (this.inConnectWait) {
                this.inConnectWait=false;
                this.connectErrorCallback();
            }
            return;
        }
        
            // if we are waiting for a connect ok,
            // get the id and we are now connected
            
        if (this.inConnectWait) {
            this.inConnectWait=false;
            
            this.id=dataView.getInt16(1);
            this.connectOKCallback();
            return;
        }
        
            // otherwise it's a queued message

        this.queue.push();
    }
    
    error(event)
    {
            // for now log the error and disconnect
            // sadly, these errors give no information, forcing
            // users to check console

        this.lastErrorMessage='Network error: Check the console for more info';
        this.disconnect();
        
            // if we hit a bad status while
            // waiting to connect, call the startup error

        if (this.inConnectWait) {
            this.inConnectWait=false;
            this.connectErrorCallback();
        }
    }
    
        //
        // user message API
        //
        
    getMessage()
    {
        if (this.queue.length===0) return(null);
        return(this.queue.pop());
    }
    
    sendMessage(msg)
    {
        
    }
}
