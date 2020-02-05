import PointClass from '../../../code/utility/point.js';
import ProjectEntityClass from '../../../code/project/project_entity.js';

//
// captain chest class
//

export default class EntityJsonClass extends ProjectEntityClass
{
    initialize()
    {
        let event;
        
        super.initialize();
        
        this.json=this.getJson();
        
            // run through all the actions and force
            // a fired property so we can track fire once actions
            
        if (this.json.events!==undefined) {
            for (event of this.json.events) {
                event.fired=false;
            }
        }
        
            // setup
            
        this.radius=this.json.setup.radius;
        this.height=this.json.setup.height;
            
        this.setModel(this.json.model.name);
        this.scale.setFromValues(this.json.model.scale.x,this.json.model.scale.y,this.json.model.scale.z);
    }
    
    getJson()
    {
        return(null);
    }
    
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
    
    runActions(actions)
    {
        let action,name;
        
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
                    this.playSound(this.jsonNameTranslate(action.name),action.rate,action.loop);
                    break;
                    
                case 'pulseInterface':
                    this.pulseInterfaceElement(action.element,action.tick,action.expand);
                    break;
                    
                case 'trigger':
                    name=this.jsonNameTranslate(action.name);
                    if (name!==undefined) this.setTrigger(name);
                    break;
                    
                case 'send':
                    break;
                    
                case 'sendToHold':
                    break;
                    
                default:
                    console.log('Unknown action type: '+action.type);
                    return(false);
            }
        }
    }
    
    /*
     * 

                                    {"type":"send","entity":"@player","message":"addHealth","value":25},
                                    {"type":"sendToHold","entity":"@player","holdEntity":"weapon_pistol","message":"addAmmo","content":10},
                                    {"type":"sendToHold","entity":"@player","holdEntity":"weapon_m16","message":"addAmmo","content":50},
                                    {"type":"sendToHold","entity":"@player","holdEntity":"weapon_grenade","message":"addAmmo","content":1},

     */
    
    getEntityFromJson(name)
    {
        let entity;
        
            // special lookups
            
        if (name==='@player') return(this.getPlayerEntity());
        if (name==='@self') return(this);
        
            // by name
            
        entity=this.getEntityList().find(name);
        if (entity==null) {
            console.log('Unknown entity: '+name);
            return(null);
        }
        
        return(entity);
    }
    
    getEntityHoldFromJson(entityName,holdName)
    {
        let entity=this.getEntityFromJson(entityName);
        if (entity==null) return(null);
        
        entity=this.core.map.entityList.findHold(entity,holdName);
        if (entity==null) {
            console.log('Unknown entity: '+name);
            return(null);
        }
        
        return(entity);
    }
    
    areConditionsMet(conditions)
    {
        let condition,entity;
        
        if (conditions===undefined) return(false);
        
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
        
    ready()
    {
        this.runActions(this.json.readyActions);
    }
    
    run()
    {
        this.runEvents(this.json.events);
    }
}
