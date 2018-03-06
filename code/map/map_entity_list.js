import * as constants from '../../code/main/constants.js';
import EntityPlayerClass from '../../code/entities/entity_player.js';
import EntityProjectileClass from '../../code/entities/entity_projectile.js';
import config from '../../code/main/config.js';
import genRandom from '../../generate/utility/random.js';

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
        this.entities=[];
    }

        //
        // list items
        //
        
    setPlayer(entity)
    {
        entity.id=0;
        entity.initialize();
        
        this.entities[0]=entity;
    }

    add(entity)
    {
        entity.id=this.entityCurrentId++;
        entity.initialize();
        
        this.entities.push(entity);
    }
    
    clear()
    {
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
    
    findById(id)
    {
        let entity;
         
        for (entity of this.entities) {
            if (entity.id===id) return(entity);
        }
        
        return(null);
    }
    
        //
        // movements against entities
        //
        
    movementPush(meshIdx,movePnt)
    {
        let entity;
        
            // check the entities, skipping
            // any projectiles
            
        for (entity of this.entities) {
            if (entity instanceof EntityProjectileClass) continue;
            
            entity.movementPush(meshIdx,movePnt);
        }
    }
    
        //
        // run entities
        //
        
    run()
    {
        let n,nEntity;
        let entity;
        
            // run the entities
            
        for (entity of this.entities) {
            entity.run(this);
        }
        
            // now clean up any that got
            // marked for deleting
            
        n=0;
        nEntity=this.entities.length;
        
        while (n<nEntity) {
            if (this.entities[n].isMarkedForDeletion()) {
                entity.release();
                this.entities.splice(n,1);
                nEntity--;
                continue;
            }
            n++;
        }
    }
    
        //
        // draw entities
        //
        
    draw()
    {
        let entity;

            // skip index 0 as that's the player
            
        for (entity of this.entities) {
            if (entity instanceof EntityPlayerClass) continue;

            if (entity.inFrustum()) entity.draw();
        }
    }
}
