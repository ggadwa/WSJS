import PointClass from '../utility/point.js';
import EntityFPSPlayerClass from '../entity/entity_fps_player.js';
import EntityFPSBotClass from '../entity/entity_fps_bot.js';
import EntityFPSMonsterClass from '../entity/entity_fps_monster.js';
import EntityKartPlayerClass from '../entity/entity_kart_player.js';
import EntityKartBotClass from '../entity/entity_kart_bot.js';
import EntityPlatformPlayerClass from '../entity/entity_platform_player.js';
import EntityPlatformMonsterClass from '../entity/entity_platform_monster.js';
import EntityWeaponClass from '../entity/entity_weapon.js';
import EntityProjectileClass from '../entity/entity_projectile.js';
import EntityContainerClass from '../entity/entity_container.js';
import EntityPickupClass from '../entity/entity_pickup.js';
import EntityDecorationClass from '../entity/entity_decoration.js';

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
        // entity classes
        //
        
    getEntityClass(jsonName)
    {
        let json;
        
            // get json
            
        json=this.core.game.entityCache.getJson(jsonName);
        if (json===undefined) {
            console.log('Unable to find entity json in the cache, probably missing from core.json entities list: '+jsonName);
            return(null);
        }
        
            // lookup type
            
        switch (json.type) {
            case 'fps_player':
                return(EntityFPSPlayerClass);
            case 'fps_bot':
                return(EntityFPSBotClass);
            case 'fps_monster':
                return(EntityFPSMonsterClass);
            case 'kart_player':
                return(EntityKartPlayerClass);
            case 'kart_bot':
                return(EntityKartBotClass);
            case 'platform_player':
                return(EntityPlatformPlayerClass);
            case 'platform_monster':
                return(EntityPlatformMonsterClass);
            case 'weapon':
                return(EntityWeaponClass);
            case 'projectile':
                return(EntityProjectileClass);
            case 'container':
                return(EntityContainerClass);
            case 'pickup':
                return(EntityPickupClass);
            case 'decoration':
                return(EntityDecorationClass);
        }
        
        console.log('Unknown entity type: '+json.type);
        return(null);
    }
    
        //
        // list items
        //
    
    addFromMap(jsonName,name,position,angle,data,show)
    {
        let entity,entityClass;
        
            // get the correct entity class
            
        entityClass=this.getEntityClass(jsonName);        
        if (entityClass===null) return(null);
        
            // create the entity
            
        entity=new entityClass(this.core,name,jsonName,position,angle,data,true,null,null,show);        
        this.entities.push(entity);
        
        return(entity);
    }
        
    addDynamic(jsonName,name,position,angle,data,spawnedBy,heldBy,show)
    {
        let entity,entityClass;
        
            // get the correct entity class
            
        entityClass=this.getEntityClass(jsonName);        
        if (entityClass===null) return(null);
        
            // create the entity
            
        entity=new entityClass(this.core,name,jsonName,position,angle,data,false,spawnedBy,heldBy,show);        
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
        
    initializeMapEntities()
    {
        let n,nameIdx;
        let entity,entityCount;
            
            // add any bots if it's a local multiplayer game
            /*
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_LOCAL) {
            for (n=0;n!==this.core.setup.botCount;n++) {
                nameIdx=n%this.core.json.bot.names.length;
                
                if (this.addFromMap(this.core.json.bot.json,this.core.json.bot.names[nameIdx],new PointClass(0,0,0),new PointClass(0,0,0),null,true)===null) return(false);
            }
        }
*/
            // initialize everything
            
        this.entityPlayerIdx=-1;
        
        entityCount=this.entities.length;       // dynamic entities can be added in the initialize
        
        for (n=0;n!==entityCount;n++) {
            entity=this.entities[n];
            
                // check for player types
                
            if (this.entityPlayerIdx===-1) {
                if ((entity.constructor.name==='EntityFPSPlayerClass') || (entity.constructor.name==='EntityKartPlayerClass') || (entity.constructor.name==='EntityPlatformPlayerClass')) this.entityPlayerIdx=n;
            }
            
                // initialize
                
            if (!entity.initialize()) return(false);
        }

            // player is required
            
        if (this.entityPlayerIdx===-1) {
            console.log('no player entity in this map');
            return(false);
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
    
    findClosest(position,typeList)
    {
        let d,dist;
        let entity,foundEntity;
        
        dist=0;
        foundEntity=null;
         
        for (entity of this.entities) {
            if (typeList!==null) {
                if (typeList.indexOf(entity.json.type)===-1) continue;
            }
            
            d=entity.position.distance(position);
            if ((foundEntity===null) || (d<dist)) {
                dist=d;
                foundEntity=entity;
            }
        }
        
        return(foundEntity);
    }
    
    findClosestWithMaxAngle(position,angle,typeList,maxAngle)
    {
        let d,dist,ang,y,addway,subway;
        let entity,foundEntity;
        
        dist=0;
        foundEntity=null;
         
        for (entity of this.entities) {
            if (typeList!==null) {
                if (typeList.indexOf(entity.json.type)===-1) continue;
            }
            
                // check angle
                
            if (maxAngle!==360) {
                y=position.angleYTo(entity.position);
                
                if (angle.y>y) {
                    addway=360.0-(angle.y-y);
                    subway=angle.y-y;
                }
                else {
                    addway=y-angle.y;
                    subway=360.0-(y-angle.y);
                }
                
                ang=(addway<subway)?addway:subway;
                if (ang>maxAngle) continue;
            }
            
                // then distance
            
            d=entity.position.distance(position);
            if ((foundEntity===null) || (d<dist)) {
                dist=d;
                foundEntity=entity;
            }
        }
        
        return(foundEntity);
    }
    
        //
        // multi entity routines
        //
        
    meshPush(mesh,movePnt,rotateAng)
    {
        let entity;
        
        for (entity of this.entities) {
            entity.meshPush(mesh,movePnt,rotateAng);
        }
    }
    
    damageForRadius(hitEntity,damagePosition,maxDistance,maxDamage)
    {
        let entity,dist,damage;

        for (entity of this.core.game.map.entityList.entities) {
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
        let n,entity;
        
        for (n=0;n!==this.entities.length;n++) {
            entity=this.entities[n];

            if (heldBy!==null) {
                if (entity.heldBy!==heldBy) continue;
            }
            else {
                if (entity.heldBy!==null) continue;
            }
            
            entity.draw();
        }
    }
    
    drawDeveloper(drawSkeletons)
    {
        let n,entity;
        
        for (n=0;n!==this.entities.length;n++) {
            entity=this.entities[n];
            if (entity.heldBy!==null) continue;
            
            entity.drawDeveloper(this.core.developer.isEntitySelected(n),drawSkeletons);
        }
    }

}
