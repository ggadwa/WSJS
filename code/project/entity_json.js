import PointClass from '../utility/point.js';
import CalcClass from '../project/calc.js';
import ProjectEntityClass from '../project/project_entity.js';

//
// json entity class
//

export default class EntityJsonClass extends ProjectEntityClass
{
    initialize()
    {
        this.DRAW_TYPE_NORMAL=0;
        this.DRAW_TYPE_PLAYER=1;
        this.DRAW_TYPE_IN_HAND=2;
        
        super.initialize();
        
        this.json=this.getJson();
        
            // variables
          
        this.variables=new Map();
        this.createVariables();
        
            // compile any calcs
            
        if (!this.compileCalcs()) {
            // fail here
        }
        
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
        
            // misc
            
        this.currentMessageContent=null;        // used to track current message content for @content look ups
        
        return(true);
    }
    
    getJson()
    {
        return(null);
    }
    
        //
        // create variables
        //
        
    createVariables()
    {
        let variable;
                
        if (this.json.variables===undefined) return;
        
        for (variable of this.json.variables) {
            this.variables.set(variable.name,variable.value);
        }
    }
    
        //
        // compile calcs
        //
    
    compileCalcsConditions(conditions)
    {
        let condition;
        
        if (conditions===undefined) return(true);
        
        for (condition of conditions) {
            if (condition.type==='calc') {
                condition.compileCalc=new CalcClass(this.core,this,null,condition.code,null,null);
                if (!condition.compileCalc.compile()) return(false);        // compile failed
            }
        }
        
        return(true);
    }
    
    compileCalcsActions(actions)
    {
        let action,minClamp,maxClamp;
        
        if (actions===undefined) return(true);
        
        for (action of actions) {
            if (action.type==='calc') {
                if (action.set===undefined) {
                    console.log('Action calcs require a set attribute');
                    return(false);
                }
                
                minClamp=(action.minClamp===undefined)?null:action.minClamp;
                maxClamp=(action.maxClamp===undefined)?null:action.maxClamp;
                
                action.compileCalc=new CalcClass(this.core,this,action.set,action.code,minClamp,maxClamp);
                if (!action.compileCalc.compile()) return(false);        // compile failed
            }
        }
        
        return(true);
    }
    
    compileCalcs()
    {
        let event,message;
        
        if (this.json.events!==undefined) {
            for (event of this.json.events) {
                if (!this.compileCalcsConditions(event.conditions)) return(false);
                if (!this.compileCalcsActions(event.actions)) return(false);
            }
        }
        if (this.json.messages!==undefined) {
            for (message of this.json.messages) {
                if (!this.compileCalcsConditions(message.conditions)) return(false);
                if (!this.compileCalcsActions(message.actions)) return(false);
            }
        }
        
        return(true);
    }
    
        //
        // utilities and lookups
        //
        
    jsonNameTranslate(name)
    {
        if (name.length<1) return(name);
        if (name.charAt(0)!=='@') return(name);
        
            // data lookups
            
        if (name.startsWith("@data.")) return(this.data[name.substring(6)]);
        
            // otherwise an error
            
        console.log('Unknown special name: '+name);
        return(name);
    }
    
    jsonContentTranslate(value)
    {
        if (typeof(value)!=='string') return(value);
        
        if (value==='@timestamp') return(this.core.timestamp);
        if (value==='@content') return(this.currentMessageContent);
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
            
            switch(action.type) {
                
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
                    name=this.jsonNameTranslate(action.name);
                    if (name!==undefined) this.setTrigger(name);
                    break;
                    
                case 'send':
                    entity=this.getEntityFromJson(action.entity);
                    if (entity===null) return(false);
                    
                    entity.receiveMessage(action.message,this.jsonContentTranslate(action.content));
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
        let condition,entity;
        
            // no conditions means always
            
        if (conditions===undefined) return(true);
        
            // otherwise fast fail the conditions in order
            
        for (condition of conditions) {
            
            switch(condition.type) {
                
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
        let message,handled;
        let messages=this.json.messages;
        
        if (messages===undefined) return;
        
            // remember what the content is for @content lookups
            
        this.currentMessageContent=content;
        
            // run through the messages
            // if we have conditions, we can have the same message
            // defined and it falls through until hitting one with
            // a met condition
            
        handled=false;
        
        for (message of messages) {
            if (message.message===name) {
                handled=true;
                if (this.areConditionsMet(message.conditions)) {
                    this.runActions(message.actions);
                    return;
                }
            }
        }
        
        if (!handled) console.log('Unhandled message in '+this.name+': '+name);
    }

        //
        // old mainlines -- todo replace later
        //
        
    ready()
    {
        this.runActions(this.json.readyActions);
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
