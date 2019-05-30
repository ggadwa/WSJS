//
// network class
//

export default class NetworkClass
{
    static PORT=52419;
    
    static USER_NAME_LENGTH=32;

    static MESSAGE_TYPE_ENTITY_ENTER=0;
    static MESSAGE_TYPE_ENTITY_LEAVE=1;
    static MESSAGE_TYPE_ENTITY_LOGON_REQUEST=2;
    static MESSAGE_TYPE_ENTITY_LOGON_REPLY=3;
    static MESSAGE_TYPE_ENTITY_UPDATE=4;
    
    core=null;
    socket=null;
    
    id=0;
    connectOKCallback=null;
    connectErrorCallback=null;
    inConnectWait=false;
    lastErrorMessage=null;
    
    constructor(core)
    {
        this.core=core;
        
        this.socket=null;
        
        Object.seal(this);
    }
    
    connect(okCallback,errorCallback)
    {
        this.connectOKCallback=okCallback;
        this.connectErrorCallback=errorCallback;
        this.inConnectWait=true;
        this.lastErrorMessage=null;
        
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
    
        //
        // utilities
        // 
    
    getStringFromDataView(dataView,offset,bufferLen)
    {
        let n,b,str;
        
        str='';
        
        for (n=0;n!==bufferLen;n++) {
            b=dataView.getInt8(offset++);
            if (b==0) break;
            
            str+=String.fromCodePoint(b);     // we are only doing ascii here (it's &0x7F) so this is OK
        }
        
        return(str);
    }
    
    setStringInDataView(dataView,offset,str,bufferLen)
    {
        let n,len;
        
        len=str.length;
        if (len>bufferLen) len=bufferLen;
        
        for (n=0;n!==len;n++) {
            dataView.setInt8(offset++,(str.codePointAt(n)&0x7F));       // we only handle simple ascii
        }
        for (n=len;n<bufferLen;n++) {
            dataView.setInt8(offset++,0);
        }
    }
    
        //
        // events
        //

    open(event)
    {
            // after opening, we send the logon message, which is:
            // int16 MESSAGE_TYPE_ENTITY_LOGON_REQUEST
            // str[USER_NAME_LENGTH] user name
            
            // we then wait for the reply, which tells us if we
            // have properly logged in
            
        let msg=new ArrayBuffer(2+32+2+4);
        let dataView=new DataView(msg);
        
        dataView.setInt16(0,NetworkClass.MESSAGE_TYPE_ENTITY_LOGON_REQUEST);
        this.setStringInDataView(dataView,2,this.core.setup.name,NetworkClass.USER_NAME_LENGTH);
        
        this.socket.send(msg);
    }
    
    close(event)
    {
        
    }
    
    async message(event)
    {
        let dataView=new DataView(await (new Response(event.data).arrayBuffer()));
        let msgType=dataView.getInt16(0);
        
            // if we are waiting for a connect ok,
            // then look for the specific reply message,
            // otherwise it's an error.  If the id is negative
            // we weren't authorized to logon
            
        if (this.inConnectWait) {
            this.inConnectWait=false;
            
            if (msgType!==NetworkClass.MESSAGE_TYPE_ENTITY_LOGON_REPLY) {
                this.connectErrorCallback();
                return;
            }
            
            this.id=dataView.getInt16(2);
            if (this.id<0) {
                this.connectErrorCallback();
                return;
            }

            this.connectOKCallback();
            return;
        }
        
            // handle the messages
            
        switch (msgType) {
            case NetworkClass.MESSAGE_TYPE_ENTITY_ENTER:
                this.handleEntityEnter(dataView);
                return;
            case NetworkClass.MESSAGE_TYPE_ENTITY_LEAVE:
                this.handleEntityLeave(dataView);
                return;
            case NetworkClass.MESSAGE_TYPE_ENTITY_UPDATE:
                this.handleEntityUpdate(dataView);
                return;
        }
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
        // server message handlers
        //
        
    handleEntityEnter(dataView)
    {
        let id,userName;
        
        id=dataView.getInt16(2);
        userName=this.getStringFromDataView(dataView,4,NetworkClass.USER_NAME_LENGTH);
        
        //console.info('ENTER>'+id+'>'+userName);
        
        //this.core.map.entityList.add(new entityDef.entity(this.core,entityDef.name,entityPosition,entityAngle,entityData));

    }
    
    handleEntityLeave(dataView)
    {
        let id;
        
        id=dataView.getInt16(2);
        
        //console.info('LEAVE>'+id);
        
    }
    
    handleEntityUpdate(dataView)
    {
        let id;
        
        id=dataView.getInt16(2);
        
        //console.info('UPDATE>'+id);
        
    }
    
        //
        // user message API
        //
        
    sendEntityUpdate(entity)
    {
        let buffer=new ArrayBuffer(55);
        let dataView=new DataView(buffer);
        
        dataView.setInt16(0,NetworkClass.MESSAGE_TYPE_ENTITY_UPDATE);
        dataView.setInt16(2,this.id);
        dataView.setInt32(4,entity.position.x);
        dataView.setInt32(8,entity.position.y);
        dataView.setInt32(12,entity.position.z);
        dataView.setFloat32(16,entity.angle.x);
        dataView.setFloat32(20,entity.angle.y);
        dataView.setFloat32(24,entity.angle.z);
        dataView.setFloat32(28,entity.scale.x);
        dataView.setFloat32(32,entity.scale.y);
        dataView.setFloat32(36,entity.scale.z);
        dataView.setInt16(40,entity.modelEntityAlter.currentAnimationIdx);
        dataView.setInt32(42,entity.modelEntityAlter.currentAnimationStartTimestamp);
        dataView.setInt32(46,entity.modelEntityAlter.currentAnimationLoopStartTick);
        dataView.setInt32(50,entity.modelEntityAlter.currentAnimationLoopEndTick);
        dataView.setInt8(54,(entity.modelEntityAlter.queuedAnimationStop?0:1));
        
        this.socket.send(buffer);
    }
}
