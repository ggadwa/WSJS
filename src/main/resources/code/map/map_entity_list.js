import PointClass from '../utility/point.js';

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
    
    addFromMap(typeName,name,position,angle,data,show)
    {
        let entity,entityClass;
        
        entityClass=this.core.project.entityClasses.get(typeName);
        if (entityClass===null) {
            console.log('Unable to find an entity for this name: '+typeName);
            return(null);
        }
        
            // create the entity
            
        entity=new entityClass(this.core,name,position,angle,data,true,null,null,show);        
        this.entities.push(entity);
        
        return(entity);
    }
        
    addDynamic(typeName,name,position,angle,data,spawnedBy,heldBy,show)
    {
        let entity,entityClass;
        
            // get the correct entity class
            
        entityClass=this.core.project.entityClasses.get(typeName);
        if (entityClass===null) {
            console.log('Unable to find an entity for this name: '+typeName);
            return(null);
        }
        
            // create the entity
            
        entity=new entityClass(this.core,name,position,angle,data,false,spawnedBy,heldBy,show);        
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
        
    addDynamicMultiplayerEntities()
    {
        let n,character,name,idx;
        let nameMap;
        
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_LOCAL) {
            nameMap=new Map();
            
            for (n=0;n!==10;n++) {
                if (this.core.setup.multiplayerBotCharacters[n]!=='') {
                    character=this.core.project.getCharacter(this.core.setup.multiplayerBotCharacters[n]);
                    
                        // don't use the same name
                        
                    name=character.name;
                    if (nameMap.has(name)) {
                        idx=nameMap.get(name);
                        nameMap.set(name,(idx+1));
                        name=name+' '+idx;
                    }
                    else {
                        nameMap.set(name,2);
                    }
                    
                        // add the character
                    
                    if (this.addFromMap(character.botJsonName,name,new PointClass(0,0,0),new PointClass(0,0,0),character.data,true)===null) return(false);
                }
            }
        }
            
            // if a multiplayer game, we need to add player
            // we add these after the bots so local games don't
            // telefrag right off the bat
            
        if (this.core.game.multiplayerMode!==this.core.game.MULTIPLAYER_MODE_NONE) {
            character=this.core.project.getCharacter(this.core.project.multiplayerDefaultCharacter);
            if (this.addFromMap(character.playerJsonName,this.core.setup.multiplayerName,new PointClass(0,0,0),new PointClass(0,0,0),character.data,true)===null) return(false);
        }
        
        return(true);
    }
    
    initializeMapEntities()
    {
        let n;
        let entity,entityCount;
        
            // no player found yet
            
        this.entityPlayerIdx=-1;

            // initialize entities
        
        entityCount=this.entities.length;       // dynamic entities can be added in the initialize
        
        for (n=0;n!==entityCount;n++) {
            entity=this.entities[n];
            
                // check for player types
                
            if (this.entityPlayerIdx===-1) {
                if ((entity.isPlayer)) this.entityPlayerIdx=n;
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
    
    findClosestWithMaxAngle(position,angle,namePrefix,skipEntity,maxAngle,maxDistance)
    {
        let d,dist,ang,y,addway,subway;
        let entity,foundEntity;
        
        dist=0;
        foundEntity=null;
         
        for (entity of this.entities) {
            if (skipEntity!==null) {
                if (entity===skipEntity) continue;
            }
            if (namePrefix!==null) {
                if (!entity.name.startsWith(namePrefix)) continue;
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
            if (d>maxDistance) continue;
            
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
