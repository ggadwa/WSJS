"use strict";

//
// settings class
//

function SettingsObject()
{
        // map construction
        
    this.maxRoomCount=1;                   // the maximum possible number of rooms in the map
    
    this.maxRoomRecursion=3;                // how far down you will recurse to make rooms off a single room
    this.maxStoryCount=3;                   // maximum number of possible stories for a single room
    this.connectionPercentage=0.25;         // what % of the time a connection in a room spawns another room
    this.storyChangePercentage=0.8;         // what % of the time a room gains another story
    
    this.decorations=false;                 // set to false for no decorations in the map
    
    this.maxRoomSize=[35000,7000,35000];    // maximum size for a room [x,y,z]
    
        // lighting
    
    this.ambient=[0.0,0.0,0.0];             // all over ambient light
    
    this.generateLightmap=false;               // set to true to generate light maps

        // models
        
    this.modelMonsterCount=0;

        // entities
        
    this.monsterEntityCount=0;
    
        // timing
        
    this.physicsMilliseconds=16;
    this.drawMilliseconds=16;
    this.bailMilliseconds=5000;
    
        // draw testing
    
    this.debugDraw=true;
    
        // play testing
        
    this.clipWalls=false;
    this.fly=false;

        // random seeds
        // hard set these to generate the
        // the same map everytime
    
    var seed=Date.now();
    
    this.randomSeedMapBitmap=Math.floor((Math.random()*seed));
    this.randomSeedMap=Math.floor((Math.random()*seed));
    this.randomSeedModelBitmap=Math.floor((Math.random()*seed));
    this.randomSeedModel=Math.floor((Math.random()*seed));
    this.randomSeedEntity=Math.floor((Math.random()*seed));
}

var settings=new SettingsObject();
