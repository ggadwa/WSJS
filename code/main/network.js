//
// network class
//

export default class NetworkClass
{
    static PORT=10867;
    
    serverURL=null;
    userId=null;
    socket=null;
    queue=null;
    textEncoder=null;
    
    constructor(serverURL,userId)
    {
        this.serverURL=serverURL;
        this.userId=userId;
        
        this.socket=null;
        
        this.textEncoder=new TextEncoder();     // preallocate this as we will use it a bit
        
        Object.seal(this);
    }
    
    connect()
    {
            // empty the queue
            
        this.queue=[];
        
            // now connect
            
        this.socket=new WebSocket('ws://'+this.serverURL);
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

        this.socket.send(this.textEncoder.encode(userId));
    }
    
    close(event)
    {
        
    }
    
    message(event)
    {
        this.queue.push(event.data);
    }
    
    error(event)
    {
        console.info('socket error='+event);
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
