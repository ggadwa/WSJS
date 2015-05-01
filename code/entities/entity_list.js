"use strict";

//
// initialize/release entityList
//

function entityListInitialize(view)
{
    return(true);
}

function entityListRelease(view)
{
}

//
// add to entity
//

function entityListAddPlayer(entity)
{
    this.entities[0]=entity;
}

function entityAdd(entity)
{
    this.entities.push(entity);
}

//
// entity list object
//

function entityListObject()
{
    this.entities=[];
    this.entities.push(null);       // first entity is always the player entity
    
    this.initialize=entityListInitialize;
    this.release=entityListRelease;
    
    this.addPlayer=entityListAddPlayer;
    this.add=entityAdd;
}
    
