import PointClass from '../utility/point.js';
import EntityUtilityClass from '../project/entity_utility.js';
import ProjectEntityClass from '../project/project_entity.js';

//
// json entity class
//

export default class EntityJsonClass extends ProjectEntityClass
{
    constructor(core,name,position,angle,data)
    {
        super(core,name,position,angle,data);
        
        this.utility=new EntityUtilityClass(core,this);
    }
    
    initialize()
    {
        this.DRAW_TYPE_NORMAL=0;
        this.DRAW_TYPE_PLAYER=1;
        this.DRAW_TYPE_IN_HAND=2;
        
        super.initialize();
        
            // variables
          
        this.variables=new Map();
        
            // load the json
            
        this.json=this.core.game.getCachedJson(this.getJsonName(),this.variables,this.data);
        if (this.json===null) return(false);
        
            // setup
            
        this.radius=this.json.setup.radius;
        this.height=this.json.setup.height;
            
        this.setModel(this.json.model.name);
        this.scale.setFromValues(this.json.model.scale.x,this.json.model.scale.y,this.json.model.scale.z);
        
            // get the draw type
            
        this.drawType=(['normal','player','inHand']).indexOf(this.json.draw.type);
        if (this.drawType<0) this.drawType=0;
        
        this.drawAngle=new PointClass(0,0,0);
        this.handPosition=this.getPointFromJson(this.json.draw.handPosition);
        this.handAngle=this.getPointFromJson(this.json.draw.handAngle);
        
            // messages
            
        this.messageQueue=new Map();
        this.currentMessageContent=null;        // used to track current message content for @message look ups
        
        return(true);
    }
    
    getJsonName()
    {
        return(null);
    }
        
        //
        // utilities and lookups
        //
        
    jsonContentTranslate(value)
    {
        if (typeof(value)!=='string') return(value);
        
        if (value==='@timestamp') return(this.core.timestamp);
        if (value==='@message') return(this.currentMessageContent);
        return(value);
    }
    
    jsonVariableTranslate(name)
    {
        let value=this.variables.get(name);
        if (value!==undefined) return(value);
        
        console.log('Unknown variable name: '+name);
        return('');
    }
    
    getEntityFromJson(name)
    {
        let entity;
        
            // special lookups
            
        if (name==='@player') return(this.getPlayerEntity());
        if (name==='@parent') return((this.spawnedBy!==null)?this.spawnedBy:this);
        if (name==='@self') return(this);
        
        if (name.startsWith('@hold.')) {
            entity=this.core.map.entityList.findHold(this,name.substring(6));
            if (entity!==null) return(entity);
            
            console.log('Unknown held entity: '+name.substring(6));
            return(null);
        }
        
            // by name
            
        entity=this.getEntityList().find(name);
        if (entity!==null) return(entity);
        
        console.log('Unknown entity: '+name);
        return(null);
    }
    
    getPointFromJson(jsonPnt)
    {
        if (jsonPnt===undefined) return(new PointClass(0,0,0));
        return(new PointClass(jsonPnt.x,jsonPnt.y,jsonPnt.z));
    }
    
        //
        // actions
        //
        
    runActions(actions)
    {
        let action,name,entity;
        
        if (actions===undefined) return;
        
        for (action of actions) {
            
            switch(action.action) {
                
                case 'animationStart':
                    this.startModelAnimationChunkInFrames(null,30,action.startFrame,action.endFrame);
                    break;
                    
                case 'animationQueue':
                    this.queueModelAnimationChunkInFrames(null,30,action.startFrame,action.endFrame);
                    break;
                    
                case 'playSound':
                    entity=this;
                    if (action.entity!==undefined) {
                        entity=this.getEntityFromJson(action.entity);
                        if (entity===null) return(false);
                    }
                    
                    this.core.soundList.play(entity,null,action.name,action.rate,action.loop);
                    break;
                    
                case 'pulseInterface':
                    this.core.interface.pulseElement(action.element,action.tick,action.expand);
                    break;
                    
                case 'updateInterfaceText':
                    if (action.text!==undefined) {
                        this.core.interface.updateText(action.element,action.text);
                    }
                    else {
                        this.core.interface.updateText(action.element,this.jsonVariableTranslate(action.variable));
                    }
                    break;
                    
                case 'trigger':
                    if ((action.name===undefined) || (action.name===null)) break;
                    this.setTrigger(action.name);
                    break;
                    
                case 'hitScan':
                    entity=this.getEntityFromJson(action.entity);
                    if (entity===null) return(false);
                    
                    this.utility.hitScan(entity,action.istance,action.hitFilter,action.damage,action.hitEffect);
                    break;
                    
                case 'send':
                    entity=this.getEntityFromJson(action.entity);
                    if (entity===null) return(false);
                    if (entity.json.events===undefined) {
                        console.log('Entity '+entity.name+' can not receive messages, it has no events');
                        return(false);
                    }
                        
                    entity.messageQueue.set(action.name,this.jsonContentTranslate(action.content));
                    break;
                    
                case 'calc':
                    action.compileCalc.run(this.currentMessageContent);
                    break;
                    
                default:
                    console.log('Unknown action type: '+action.type);
                    return(false);
            }
        }
    }
    
        //
        // conditions
        //
        
    areConditionsMet(conditions)
    {
        let condition,entity,messageContent;
        
            // no conditions means always
            
        if (conditions===undefined) return(true);
        
            // otherwise fast fail the conditions in order
            
        for (condition of conditions) {
            
            switch(condition.condition) {
                
                case 'receive':
                    messageContent=this.messageQueue.get(condition.name);
                    if (messageContent===undefined) return(false);
                    
                    this.currentMessageContent=messageContent;      // to pick up in actions
                    this.messageQueue.delete(condition.name);
                    break;
                
                case "key":
                    if (!this.isKeyDown(condition.key)) return(false);
                    break;
                    
                case "nearEntity":
                    entity=this.getEntityFromJson(condition.entity);
                    if (entity===null) return(false);
                    
                    if (!this.isEntityInRange(entity,condition.distance)) return(false);
                    break;
                    
                case 'calc':
                    if (!condition.compileCalc.run(this.currentMessageContent)) return(false);
                    break;
                    
                default:
                    console.log('Unknown condition type: '+condition.type);
                    return(false);
            }
        }
        
        return(true);
    }
    
        //
        // events
        //
        
    runEvents(events)
    {
        let event;
        
        if (events===undefined) return;
        
        for (event of events) {
            
                // are the conditions met?
                
            if (!this.areConditionsMet(event.conditions)) continue;
            
                // run the actions
            
            this.runActions(event.actions);
        }
    }
        
        //
        // messages
        //
        
    receiveMessage(name,content)
    {
        if (this.json.events!==undefined) this.messageQueue.set(name,content);  // if no events, we can't take messages
    }

        //
        // old mainlines -- todo replace later
        //
        
    ready()
    {
        if (this.json.ready!==undefined) this.runActions(this.json.ready.actions);
    }
    
    run()
    {
        this.runEvents(this.json.events);
    }
    
        //
        // old draw setup -- redo this later
        //
        
    drawSetup()
    {
        switch (this.drawType) {
            
            case this.DRAW_TYPE_NORMAL:
                this.setModelDrawPosition(this.position,this.angle,this.scale,false);
                return(true);
                
            case this.DRAW_TYPE_PLAYER:
                this.drawAngle.setFromValues(0,this.angle.y,0);
                this.setModelDrawPosition(this.position,this.drawAngle,this.scale,false);
                return(this.core.camera.isThirdPersonBehind()) ;
            
            case this.DRAW_TYPE_IN_HAND:
                this.setModelDrawPosition(this.handPosition,this.handAngle,this.scale,true);
                return(this.core.camera.isFirstPerson());
        }
    }

}
