import PointClass from '../utility/point.js';

//
// map class
//

export default class MapEntityListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.entityCurrentId=1;     // 0 is always the player
        this.entities=[];

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
            // first entity is always the player
            // so lock that off

        this.entities=[];
        this.entities.push(null);
        
        return(true);
    }

    release()
    {
        this.clear();
    }
    
        //
        // setups network flags to tell if remotes got an update in a loop cycle
        //
        
    clearEntityRemoteUpdateFlags()
    {
        let entity;
        
        for (entity of this.entities) {
            entity.hadRemoteUpdate=false;
        }
    }

        //
        // list items
        //
        
    setPlayer(entity)
    {
        entity.id=0;
        this.entities[0]=entity;
        
        return(entity.initialize());
    }

    add(entity)
    {
        entity.id=this.entityCurrentId++;
        this.entities.push(entity);
        
        return(entity.initialize());
    }
    
    clear()
    {
        let entity;
        
        for (entity of this.entities) {
            entity.release();
        }
        
        this.entities=[];
    }

    count()
    {
        return(this.entities.length);
    }

    get(entityIdx)
    {
        return(this.entities[entityIdx]);
    }
    
    getPlayer()
    {
        return(this.entities[0]);
    }
        
    cleanUpMarkedAsDeleted()
    {
        let n,entity;
         
        for (n=(this.entities.length-1);n>=0;n--) {
            entity=this.entities[n];
            if (entity.markDelete) {
                entity.release();
                this.entities.splice(n,1);
            }
        }
    }
        
        //
        // load map entities
        //
        
    loadMapEntities()
    {
        let importSettings=this.core.projectMap.getImportSettings();
        let entityList=importSettings.entities;
        let n,entityDef;
        let entity,entityName,entityPosition,entityAngle,entityData;
        let botClass;

            // at least a player entity is required
            
        if (entityList===undefined) {
            console.log('no entities in map setup, at least one entity, the player (entity 0), is required');
            return(false);
        }
        
            // load entities from map import settings
            
        for (n=0;n!==entityList.length;n++) {
            entityDef=entityList[n];
            
            entityName=(entityDef.name===undefined)?'':entityDef.name;
            
            if (entityDef.position!==undefined) {
                entityPosition=new PointClass(entityDef.position.x,entityDef.position.y,entityDef.position.z);
            }
            else {
                entityPosition=new PointClass(0,0,0);
            }
            if (entityDef.angle!==undefined) {
                entityAngle=new PointClass(entityDef.angle.x,entityDef.angle.y,entityDef.angle.z);
            }
            else {
                entityAngle=new PointClass(0,0,0);
            }
            
            entityData=(entityDef.data===undefined)?null:entityDef.data;
            
                // first entity is always assumed to be the player, anything
                // else is a map entity

            if (n===0) {
                if (!this.setPlayer(new entityDef.entity(this.core,entityName,entityPosition,entityAngle,entityData))) return(false);
            }
            else {
                entity=new entityDef.entity(this.core,entityName,entityPosition,entityAngle,entityData);
                if (!this.add(entity)) return(false);
            }
        }
            
            // load any bots if it's a local multiplayer game
            
        if (!((this.core.isMultiplayer) && (this.core.setup.localGame))) return(true);
/*
        botClass=EntityMultiplayerBotClass; // this.core.game.getBotClass();  - TODO DEAL WITH THIS AFTER JSON

        for (n=0;n!==this.core.setup.botCount;n++) {
            entity=new botClass(this.core,this.core.game.json.bot.names[n],new PointClass(0,0,0),new PointClass(0,0,0),null);
            if (!this.add(entity)) return(false);
        }
*/        
        return(true);
    }
    
        //
        // finds
        //
        
    find(name)
    {
        let entity;
         
        for (entity of this.entities) {
            if (entity.name===name) return(entity);
        }
        
        return(null);
    }
    
    findRemoteById(remoteId)
    {
        let entity;
         
        for (entity of this.entities) {
            if (entity.remoteId===remoteId) return(entity);
        }
        
        return(null);
    }
    
    findHold(parentEntity,name)
    {
        let entity;
         
        for (entity of this.entities) {
            if (entity.heldBy===parentEntity) {
                if (entity.name===name) return(entity);
            }
        }
        
        return(null);
    }
    
        //
        // pushing
        //
        
    meshPush(meshIdx,movePnt,rotateAng)
    {
        let entity;
        
        for (entity of this.entities) {
            entity.meshPush(meshIdx,movePnt,rotateAng);
        }
    }
    
        //
        // ready entities
        //
        
    ready()
    {
        let entity;
        
            // run the entities
            
        for (entity of this.entities) {
            entity.ready(this);
        }
    }
    
        //
        // run entities
        //
        
    run()
    {
        let entity;
        
            // run the entities
            
        for (entity of this.entities) {
            entity.run();
        }
    }
    
        //
        // draw entities
        //
        
    draw(heldBy)
    {
        let entity;

        for (entity of this.entities) {
            if (heldBy!==null) {
                if (entity.heldBy!==heldBy) continue;
            }
            else {
                if (entity.heldBy!==null) continue;
            }
            
            entity.draw();
        }
    }
}
