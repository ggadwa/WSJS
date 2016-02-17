"use strict";

//
// entity list class
//

function EntityListObject()
{
    this.entityCurrentId=1;
    this.entities=[];
    
        //
        // initialize/release entityList
        //

    this.initialize=function(view)
    {
            // first entity is always the player
            // so reserve it
            
        this.entities.push(null);
        
        return(true);
    };

    this.release=function(view)
    {
    };

        //
        // add to entity
        //
        // entity index 0 is always the player, so that's always
        // a set
        //

    this.setPlayer=function(entity)
    {
        entity.setId(0);
        this.entities[0]=entity;
    };

    this.add=function(entity)
    {
        entity.setId(this.entityCurrentId++);
        this.entities.push(entity);
    };

        //
        // entity list
        //

    this.count=function()
    {
        return(this.entities.length);
    };

    this.get=function(entityIdx)
    {
        return(this.entities[entityIdx]);
    };
    
    this.getPlayer=function()
    {
        return(this.entities[0]);
    };
    
        //
        // run all entities
        //
        
    this.run=function(view,map)
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
    };

}
    
