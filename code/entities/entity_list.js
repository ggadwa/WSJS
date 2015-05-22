"use strict";

//
// entity list class
//

function EntityListObject()
{
    this.entities=[];
    this.entities.push(null);       // first entity is always the player entity
    
        //
        // initialize/release entityList
        //

    this.initialize=function(view)
    {
        return(true);
    };

    this.rRelease=function(view)
    {
    };

        //
        // add to entity
        //

    this.addPlayer=function(entity)
    {
        this.entities[0]=entity;
    };

    this.add=function(entity)
    {
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
        
    this.run=function()
    {
        var n;
        var nEntity=this.entities.length;
        
        for (n=0;n!==nEntity;n++) {
            this.entities[n].run();
        }
    };

}
    
