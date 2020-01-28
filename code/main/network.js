import ProjectEntityRemoteClass from '../project/project_entity_remote.js';

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
    queue=null;
    
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
        let buffer=await (new Response(event.data).arrayBuffer());
        let dataView;
        
            // if we are waiting for a connect ok,
            // then look for the specific reply message,
            // otherwise it's an error.  If the id is negative
            // we weren't authorized to logon
            
        if (this.inConnectWait) {
            this.inConnectWait=false;
            
            dataView=new DataView(buffer);
            
            if (dataView.getInt16(0)!==NetworkClass.MESSAGE_TYPE_ENTITY_LOGON_REPLY) {
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
        
            // drop in queue
            
        this.queue.push(buffer);
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
        
    handleEntityEnter(remoteId,dataView)
    {
        let userName,entity;
        let remoteClass=this.core.projectGame.getRemoteClass();
        
        userName=this.getStringFromDataView(dataView,4,NetworkClass.USER_NAME_LENGTH);
        
        console.info('ENTER>'+remoteId+'>'+userName);
        
        entity=new remoteClass(this.core,remoteId,userName);
        this.core.map.entityList.add(entity);
    }
    
    handleEntityLeave(remoteId,dataView)
    {
        let entity;
        
        console.info('LEAVE>'+remoteId);
        
        //entity=this.core.map.entityList.findRemoteById(remoteId);
        //if (entity!==null) 
    }
    
    handleEntityUpdate(remoteId,dataView)
    {
        let entity;
        
        entity=this.core.map.entityList.findRemoteById(remoteId);
        if (entity!==null) {
            if (!entity.hadRemoteUpdate) entity.putUpdateNetworkData(dataView);     // only use the first (the latest) update, skip all others
        }
    }
    
    runMessageQueue()
    {
        let buffer,dataView,msgType,remoteId;
        
            // clear all the had update flag, we use this
            // to only apply the latest update and check if
            // we didn't have an update so need to predict
            
        this.core.map.entityList.clearEntityRemoteUpdateFlags();
        
            // run through the messages
            
        while (this.queue.length!==0) {
            buffer=this.queue.pop();
            
            dataView=new DataView(buffer);
            msgType=dataView.getInt16(0);
            remoteId=dataView.getInt16(2);

            switch (msgType) {
                
                case NetworkClass.MESSAGE_TYPE_ENTITY_ENTER:
                    this.handleEntityEnter(remoteId,dataView);
                    break;
                    
                case NetworkClass.MESSAGE_TYPE_ENTITY_LEAVE:
                    this.handleEntityLeave(remoteId,dataView);
                    break;
                    
                case NetworkClass.MESSAGE_TYPE_ENTITY_UPDATE:
                    this.handleEntityUpdate(remoteId,dataView);
                    break;
            }
        }
    }
    
        //
        // user message API
        //
        
    sendEntityUpdate(entity)
    {
        this.socket.send(entity.getUpdateNetworkData(this.id));
    }
    
        //
        // run networking
        //
        
    run()
    {
            // send my update to other players
            
        this.sendEntityUpdate(this.core.map.entityList.getPlayer());
        
            // do all the remote updates
            
        this.runMessageQueue();
    }
}
