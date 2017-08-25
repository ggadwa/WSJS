import * as constants from '../../code/main/constants.js';
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
        this.entityCurrentId=1;
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
        this.entities[0]=entity;
    }

    add(entity)
    {
        entity.id=this.entityCurrentId++;
        this.entities.push(entity);
    }
    
    clear()
    {
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
        let n,entity;
        let nEntity=this.entities.length;
            
        for (n=0;n!==nEntity;n++) {
            entity=this.entities[n];
            if (entity.id===id) return(entity);
        }
        
        return(null);
    }
    
        //
        // movements against entities
        //
        
    movementPush(meshIdx,movePnt)
    {
        let n,entity;
        let nEntity=this.entities.length;
        
            // check the entities, skipping
            // any projectiles
            
        for (n=0;n!==nEntity;n++) {
            entity=this.entities[n];
            if (entity instanceof EntityProjectileClass) continue;
            
            entity.movementPush(meshIdx,movePnt);
        }
    }
    
        //
        // run entities
        //
        
    run()
    {
        let n;
        let nEntity=this.entities.length;
        
            // run the entities
            
        for (n=0;n!==nEntity;n++) {
            this.entities[n].run(this);
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
    
        //
        // draw entities
        //
        
    draw()
    {
        let n,entity;
        let nEntity=this.entities.length;

            // skip index 0 as that's the player
            
        for (n=1;n<nEntity;n++) {
            entity=this.entities[n];
            if (entity.inFrustum()) entity.draw();
        }
    }
}
