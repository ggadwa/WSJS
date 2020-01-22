//
// map class
//

export default class MapEntityListClass
{
    constructor()
    {
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
        // sets up the model entity alter which each
        // entity has to track the animations/nodes/etc
        // for their shared models
        //
        
    setupModelEntityAlters()
    {
        let entity;
        
        for (entity of this.entities) {
            if (entity.modelEntityAlter!==null) entity.modelEntityAlter.finishSetup();
        }
    }

        //
        // list items
        //
        
    setPlayer(entity)
    {
        entity.id=0;
        this.entities[0]=entity;
        
        entity.initialize();
    }

    add(entity)
    {
        entity.id=this.entityCurrentId++;
        this.entities.push(entity);
        
        entity.initialize();
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
    
    find(name)
    {
        let entity;
         
        for (entity of this.entities) {
            if ((entity.active) && (entity.name===name)) return(entity);
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
            if ((entity.active) && (entity.heldBy===parentEntity)) {
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
            if (entity.active) entity.meshPush(meshIdx,movePnt,rotateAng);
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
            if (entity.active) entity.ready(this);
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
            if (entity.active) entity.run();
        }
    }
    
        //
        // draw entities
        //
        
    draw(heldBy)
    {
        let entity;

        for (entity of this.entities) {
            if (!entity.active) continue;
            
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
