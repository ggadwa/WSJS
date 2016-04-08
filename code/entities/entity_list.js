"use strict";

//
// entity list class
//

class EntityListClass
{
    constructor()
    {
        this.entityCurrentId=1;
        this.entities=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release entityList
        //

    initialize(view)
    {
            // first entity is always the player
            // so reserve it
            
        this.entities.push(null);
        
        return(true);
    }

    release(view)
    {
    }

        //
        // add to entity
        //
        // entity index 0 is always the player, so that's always
        // a set
        //

    setPlayer(entity)
    {
        entity.id=0;
        this.entities[0]=entity;
    }

    addEntity(entity)
    {
        entity.id=this.entityCurrentId++;
        this.entities.push(entity);
    }

        //
        // entity list
        //

    countEntity()
    {
        return(this.entities.length);
    }

    getEntity(entityIdx)
    {
        return(this.entities[entityIdx]);
    }
    
    getPlayer()
    {
        return(this.entities[0]);
    }
    
        //
        // handle movement pushes from moving map segments
        //
        
    movementPush(map,meshIdx,movePnt)
    {
        var n,entity;
        var nEntity=this.entities.length;
        
            // check the entities, skipping
            // any projectiles
            
        for (n=0;n!==nEntity;n++) {
            entity=this.entities[n];
            if (entity instanceof EntityProjectileClass) continue;
            
            entity.movementPush(map,meshIdx,movePnt);
        }
    }
    
        //
        // run all entities
        //
        
    run(view,map)
    {
        var n;
        var nEntity=this.entities.length;
        
            // run the entities
            
        for (n=0;n!==nEntity;n++) {
            this.entities[n].run(view,map,this);
        }
        
            // now clean up any that got
            // marked for deleting
            
        n=0;
        
        while (n<nEntity) {
            if (this.entities[n].isMarkedForDeletion()) {
                this.entities.splice(n,1);
                nEntity--;
                continue;
            }
            n++;
        }
    }

}
    
