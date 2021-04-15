import EntityClass from '../game/entity.js';

//
// network class
//

export default class NetworkClass
{
    constructor(core)
    {
        //this.PORT=52419;
        this.PORT=52418;
        
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
        
        Object.seal(this);
    }
    
        //
        // connect and disconnect from multiplayer server
        //
    
    connect(okCallback,errorCallback)
    {
        this.connectOKCallback=okCallback;
        this.connectErrorCallback=errorCallback;
        this.inConnectWait=true;
        
        this.queue=[];
        
            // now connect
            
        this.socket=new WebSocket('ws://'+this.core.setup.multiplayerServerURL+':'+this.PORT);
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
        // this is the initial sync.  The first player in list is considered
        // the master player, and his time and map are 
        //
        
    sync(okCallback,errorCallback)
    {
        let buffer=new ArrayBuffer(4);
        let dataView=new DataView(buffer);
        
        this.syncOKCallback=okCallback;
        this.syncErrorCallback=errorCallback;
        this.inSyncWait=true;
        
        dataView.setInt16(0,this.MESSAGE_TYPE_MAP_SYNC_REQUEST);
        dataView.setInt16(2,this.id);
        
        this.socket.send(buffer);
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
        this.setStringInDataView(dataView,2,this.core.setup.multiplayerName,this.USER_NAME_LENGTH);
        
        this.socket.send(msg);
    }
    
    close(event)
    {
    }
    
    async message(event)
    {
        let buffer=await (new Response(event.data).arrayBuffer());
        let dataView;
        
            // special case of waiting for connection
            
        if (this.inConnectWait) {
            
                // ignore any spurious no logon replies
                
            dataView=new DataView(buffer);
            if (dataView.getInt16(0)!==this.MESSAGE_TYPE_ENTITY_LOGON_REPLY) return;
            
                // got the connection
                
            this.inConnectWait=false;
            
                // negative ids are errors
                
            this.id=dataView.getInt16(2);
            if (this.id<0) {
                this.connectErrorCallback("Invalid Logon");
                return;
            }

                // we connected OK
                
            this.connectOKCallback();
            return;
        }
        
            // special case of waiting for sync
            
        if (this.inSyncWait) {
            
                // ignore any spurious no logon replies
                
            dataView=new DataView(buffer);
            if (dataView.getInt16(0)!==this.MESSAGE_TYPE_MAP_SYNC_REPLY) return;
            
                // got the connection
                
            this.inSyncWait=false;
            
            
            this.syncOKCallback();
            return;
        }
        
            // otherwise drop message in queue
            
        this.queue.push(buffer);
    }
    
    error(event)
    {
            // for now log the error and disconnect
            // sadly, these errors give no information, forcing
            // users to check console

        this.disconnect();
        
            // if we hit a bad status while
            // waiting to connect, call the startup error

        if (this.inConnectWait) {
            this.inConnectWait=false;
            this.connectErrorCallback("Unable to connect, check console for more info");
        }
    }
    
        //
        // server message handlers
        //
        
    handleEntityEnter(remoteId,dataView)
    {
        let userName,entity;
        
        userName=this.getStringFromDataView(dataView,4,this.USER_NAME_LENGTH);
        
        console.info('ENTER>'+remoteId+'>'+userName);
        
        entity=new EntityClass(this.core,userName,null,new PointClass(0,0,0),new PointClass(0,0,0),null,false,null,null,false);
        entity.remoteId=remoteId;
        entity.initialize();        // errors here!
        
        this.core.game.map.entityList.add(entity);       // need addRemote?
        
        this.core.game.remoteEntering(userName);
    }
    
    handleEntityLeave(remoteId,dataView)
    {
        let entity;
        
        console.info('LEAVE>'+remoteId);
        
        entity=this.core.game.map.entityList.findRemoteById(remoteId);
        if (entity!==null) entity.markDelete=true;
        
        this.core.game.remoteLeaving(entity.name);
    }
    
    handleEntityUpdate(remoteId,dataView)
    {
        let entity;
        
        entity=this.core.game.map.entityList.findRemoteById(remoteId);
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
            
        this.core.game.map.entityList.clearEntityRemoteUpdateFlags();
        
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
            
        this.sendEntityUpdate(this.core.game.map.entityList.getPlayer());
        
            // do all the remote updates
            
        this.runMessageQueue();
    }
}
