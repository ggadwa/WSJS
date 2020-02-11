import ProjectEntityRemoteClass from '../project/project_entity_remote.js';

//
// network class
//

export default class NetworkClass
{
    constructor(core)
    {
        this.PORT=52419;
        
        this.MESSAGE_TYPE_ENTITY_ENTER=0;
        this.MESSAGE_TYPE_ENTITY_LEAVE=1;
        this.MESSAGE_TYPE_ENTITY_LOGON_REQUEST=2;
        this.MESSAGE_TYPE_ENTITY_LOGON_REPLY=3;
        this.MESSAGE_TYPE_MAP_SYNC_REQUEST=4;
        this.MESSAGE_TYPE_MAP_SYNC_REPLY=5;
        this.MESSAGE_TYPE_ENTITY_UPDATE=4;
        this.MESSAGE_TYPE_ENTITY_CUSTOM=5;
        
        this.USER_NAME_LENGTH=32;

        this.core=core;
        
        this.socket=null;
        this.queue=null;
    
        this.id=0;
        
        this.connectOKCallback=null;
        this.connectErrorCallback=null;
        this.inConnectWait=false;
    
        this.syncOKCallback=null;
        this.syncErrorCallback=null;
        this.inSyncWait=false;
            
        this.lastErrorMessage=null;
        
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
            
        this.socket=new WebSocket('ws://'+this.core.setup.serverURL+':'+this.PORT);
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
        // sync -- this makes sure that our time is equivalent to
        // server time, which is got by bounching a message to the first player
        // in the list (who is considered real time.)
        //
        
    sync(okCallback,errorCallback)
    {
        this.syncOKCallback=okCallback;
        this.syncErrorCallback=errorCallback;
        
        this.syncOKCallback();      // TODO -- implement
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
        
        dataView.setInt16(0,this.MESSAGE_TYPE_ENTITY_LOGON_REQUEST);
        this.setStringInDataView(dataView,2,this.core.setup.name,this.USER_NAME_LENGTH);
        
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
            
                // ignore any spurious no logon replies
                
            dataView=new DataView(buffer);
            if (dataView.getInt16(0)!==this.MESSAGE_TYPE_ENTITY_LOGON_REPLY) return;
            
                // negative ids are errors
                // todo: probably some specific errors here based on negative id
                
            this.id=dataView.getInt16(2);
            if (this.id<0) {
                this.lastErrorMessage='Network error: logon not allowed';
                this.connectErrorCallback();
                return;
            }

                // we connected OK
                
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
        let remoteClass=EntityRemoteClass; // this.core.game.getRemoteClass();  -- TODO deal with this after json
        
        userName=this.getStringFromDataView(dataView,4,this.USER_NAME_LENGTH);
        
        console.info('ENTER>'+remoteId+'>'+userName);
        
        entity=new remoteClass(this.core,remoteId,userName);
        this.core.map.entityList.add(entity);
        
        this.core.map.entityList.getPlayer().remoteEntering(userName);
    }
    
    handleEntityLeave(remoteId,dataView)
    {
        let entity;
        
        console.info('LEAVE>'+remoteId);
        
        entity=this.core.map.entityList.findRemoteById(remoteId);
        if (entity!==null) entity.markDelete=true;
        
        this.core.map.entityList.getPlayer().remoteLeaving(entity.name);
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
                
                case this.MESSAGE_TYPE_ENTITY_ENTER:
                    this.handleEntityEnter(remoteId,dataView);
                    break;
                    
                case this.MESSAGE_TYPE_ENTITY_LEAVE:
                    this.handleEntityLeave(remoteId,dataView);
                    break;
                    
                case this.MESSAGE_TYPE_ENTITY_UPDATE:
                    this.handleEntityUpdate(remoteId,dataView);
                    break;
            }
        }
    }
    
        //
        // send entity's update message
        //
        
    sendEntityUpdate(entity)
    {
        this.socket.send(entity.getUpdateNetworkData(this.MESSAGE_TYPE_ENTITY_UPDATE,this.id));
    }
    
        //
        // custom messages
        //
        
    sendCustomMessage(entity,intParam0,intParam1,intParam2,floatParam0,floatParam1,floatParam2,stringParam0,stringParam1,stringParam2)
    {
        let buffer=new ArrayBuffer(92);
        let dataView=new DataView(buffer);
        
        dataView.setInt16(0,this.MESSAGE_TYPE_ENTITY_CUSTOM);
        dataView.setInt16(2,this.id);
        dataView.setInt32(4,((intParam0===null)?0:intParam0));
        dataView.setInt32(8,((intParam1===null)?0:intParam1));
        dataView.setInt32(12,((intParam2===null)?0:intParam2));
        dataView.setFloat32(16,((floatParam0===null)?0:floatParam0));
        dataView.setFloat32(20,((floatParam1===null)?0:floatParam1));
        dataView.setFloat32(24,((floatParam2===null)?0:floatParam2));
        this.setStringInDataView(dataView,28,((stringParam0===null)?'':stringParam0),32);
        this.setStringInDataView(dataView,60,((stringParam1===null)?'':stringParam1),32);
        this.setStringInDataView(dataView,92,((stringParam2===null)?'':stringParam2),32);
        
        this.socket.send(buffer);
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
