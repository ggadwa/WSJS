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
        
        let event,variable;
        
        super.initialize();
        
        this.json=this.getJson();
        
            // run through all the actions and force
            // a fired property so we can track fire once actions
            
        if (this.json.events!==undefined) {
            for (event of this.json.events) {
                event.fired=false;
            }
        }
        
            // variables
          
        this.variables=new Map();
        
        if (this.json.variables!==undefined) {
            for (variable of this.json.variables) {
                this.variables.set(variable.name,variable.value);
            }
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
    }
    
    getJson()
    {
        return(null);
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
    
    jsonContentTranslate(content)
    {
        if (typeof(content)!=='string') return(content);
        
        if (content==='@content') return(this.currentMessageContent);
        return(content);
    }
    
    jsonVariableTranslate(value)
    {
        let varValue;
        
        if (typeof(value)!=='string') return(value);
        
        if (value.length<1) return(value);
        if (value.charAt(0)!=='#') return(value);
        
        varValue=this.variables.get(value.substring(1));
        if (varValue!==undefined) return(varValue);
        
        console.log('Unknown variable name: '+value.substring(1));
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
        // calculator
        //
        
    calc(action)
    {
            // have we already compiled this?
            
        if (action.compiledCalc===undefined) {
            action.compileCalc=new CalcClass(this.core,this,action.code);
            if (!action.compileCalc.compile()) return;        // compile failed
        }
        
            // run it
            
        action.compileCalc.run(this.currentMessageContent,action.minClamp,action.maxClamp);
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
                    this.core.interface.updateText(action.element,this.jsonVariableTranslate(action.text));
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
                    this.calc(action);
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
                
            if ((event.fireOnce) && (event.fired)) continue;
            if (!this.areConditionsMet(event.conditions)) continue;
            
                // run the actions
            
            this.runActions(event.actions);
            event.fired=true;
        }
    }
        
        //
        // messages
        //
        
    receiveMessage(name,content)
    {
        let message;
        let messages=this.json.messages;
        
        if (messages===undefined) return;
        
            // remember what the content is for @content lookups
            
        this.currentMessageContent=content;
        
            // run through the messages
            // if we have conditions, we can have the same message
            // defined and it falls through until hitting one with
            // a met condition
            
        for (message of messages) {
            if (message.message===name) {
                if (this.areConditionsMet(message.conditions)) {
                    this.runActions(message.actions);
                    return;
                }
            }
        }
        
        console.log('Unhandled message in '+this.name+': '+name);
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
