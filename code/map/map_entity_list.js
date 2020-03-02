import PointClass from '../utility/point.js';
import EntityFPSPlayerClass from '../project/entity_fps_player.js';
import EntityFPSBotClass from '../project/entity_fps_bot.js';
import EntityFPSMonsterClass from '../project/entity_fps_monster.js';
import EntityKartPlayerClass from '../project/entity_kart_player.js';
import EntityKartBotClass from '../project/entity_kart_bot.js';
import EntityWeaponClass from '../project/entity_weapon.js';
import EntityProjectileClass from '../project/entity_projectile.js';
import EntityContainerClass from '../project/entity_container.js';
import EntityPickupClass from '../project/entity_pickup.js';
import EntityDecorationClass from '../project/entity_decoration.js';

//
// map entity list class
//

export default class MapEntityListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.entityPlayerIdx=-1;
        
        this.entities=[];

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        this.entityPlayerIdx=-1;
        this.entities=[];
        
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
        
    add(spawnedByEntity,jsonName,name,position,angle,data,show,hold)
    {
        let json,entity,entityClass;
        
            // load the json
            
        json=this.core.game.getCachedJson(jsonName);
        if (json===null) return(null);

            // get the correct entity
            
        entityClass=null;
        
        switch (json.type) {
            case 'fps_player':
                entityClass=EntityFPSPlayerClass;
                break;
            case 'fps_bot':
                entityClass=EntityFPSBotClass;
                break;
            case 'fps_monster':
                entityClass=EntityFPSMonsterClass;
                break;
            case 'kart_player':
                entityClass=EntityKartPlayerClass;
                break;
            case 'kart_bot':
                entityClass=EntityKartBotClass;
                break;
            case 'weapon':
                entityClass=EntityWeaponClass;
                break;
            case 'projectile':
                entityClass=EntityProjectileClass;
                break;
            case 'container':
                entityClass=EntityContainerClass;
                break;
            case 'pickup':
                entityClass=EntityPickupClass;
                break;
            case 'decoration':
                entityClass=EntityDecorationClass;
                break;
        }
        
        if (entityClass===null) {
            console.log('Unknown entity type: '+json.type);
            return(null);
        }
        
            // create the entity
            
        entity=new entityClass(this.core,name,json,position,angle,data);
        
        entity.spawnedBy=spawnedByEntity;
        if (hold) entity.heldBy=spawnedByEntity;
        entity.show=show;
        
        this.entities.push(entity);
        
            // finally initialize it
        
        if (!entity.initialize()) return(null);
        
        return(entity);
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
        return(this.entities[this.entityPlayerIdx]);
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
        let entityList=this.core.map.json.entities;
        let n,entityDef;
        let entity,entityName,entityPosition,entityAngle,entityData;

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
            
                // mark if the player
                
            if (entityDef.player) this.entityPlayerIdx=this.entities.length;
            
                // add the entity
                
            entity=this.add(null,entityDef.json,entityName,entityPosition,entityAngle,entityData,true,false);
            if (entity===null) return(false);
        }
        
            // player is required
            
        if (this.entityPlayerIdx===-1) {
            console.log('no player entity in this map');
            return(false);
        }
            
            // load any bots if it's a local multiplayer game
            
        if (!((this.core.isMultiplayer) && (this.core.setup.localGame))) return(true);

        for (n=0;n!==this.core.setup.botCount;n++) {
            entity=this.add(null,this.core.game.json.bot.json,this.core.game.json.bot.names[n],new PointClass(0,0,0),new PointClass(0,0,0),null,true,false);
            if (entity===null) return(false);
        }

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
        // multi entity routines
        //
        
    meshPush(meshIdx,movePnt,rotateAng)
    {
        let entity;
        
        for (entity of this.entities) {
            entity.meshPush(meshIdx,movePnt,rotateAng);
        }
    }
    
    damageForRadius(hitEntity,damagePosition,maxDistance,maxDamage)
    {
        let entity,dist,damage;

        for (entity of this.core.map.entityList.entities) {
            if (!entity.show) continue;
            
            dist=damagePosition.distance(entity.position);
            if (dist>maxDistance) continue;
            
            damage=Math.trunc((1.0-(dist/maxDistance))*maxDamage);
            entity.damage(hitEntity,damage,damagePosition);
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
