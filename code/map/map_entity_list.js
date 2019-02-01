import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import genRandom from '../../code/utility/random.js';

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
            if (entity.name===name) return(entity);
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
        // load all models
        //
        
    async loadAllModels()
    {
        let n;
        let nEntity=this.entities.length;

        for (n=0;n<nEntity;n++) {
            if (!(await this.entities[n].loadModel())) return(false);
        }
        
        return(true);
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
        let n;
        let nEntity=this.entities.length;

            // skip index 0 as that's the player
            
        for (n=1;n<nEntity;n++) {
            this.entities[n].draw();
        }
    }
}
