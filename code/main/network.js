//
// network class
//

export default class NetworkClass
{
    static PORT=52419;
    
    static MESSAGE_TYPE_ENTITY_UPDATE=0;
    
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
        
            // if we are waiting for a connect ok,
            // the id should be returned.  If a negative
            // number, we failed to logon
            
        if (this.inConnectWait) {
            this.inConnectWait=false;
            
            this.id=dataView.getInt16(0);
            
            if (this.id<0) {
                this.connectErrorCallback();
            }
            else {
                this.connectOKCallback();
            }
            return;
        }
        
            // otherwise it's a queued message

        this.queue.push(dataView);
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
    
    sendEntityUpdate(entity)
    {
        let buffer=new ArrayBuffer(53);
        let dataView=new DataView(buffer);
        
        dataView.setInt16(0,NetworkClass.MESSAGE_TYPE_ENTITY_UPDATE);
        dataView.setInt32(2,entity.position.x);
        dataView.setInt32(6,entity.position.y);
        dataView.setInt32(10,entity.position.z);
        dataView.setFloat32(14,entity.angle.x);
        dataView.setFloat32(18,entity.angle.y);
        dataView.setFloat32(22,entity.angle.z);
        dataView.setFloat32(26,entity.scale.x);
        dataView.setFloat32(30,entity.scale.y);
        dataView.setFloat32(34,entity.scale.z);
        dataView.setInt16(38,entity.modelEntityAlter.currentAnimationIdx);
        dataView.setInt32(40,entity.modelEntityAlter.currentAnimationStartTimestamp);
        dataView.setInt32(44,entity.modelEntityAlter.currentAnimationLoopStartTick);
        dataView.setInt32(48,entity.modelEntityAlter.currentAnimationLoopEndTick);
        dataView.setInt8(52,(entity.modelEntityAlter.queuedAnimationStop?0:1));
        
        this.socket.send(buffer);
    }
}
