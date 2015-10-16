"use strict";

//
// settings class
//

function SettingsObject()
{
        // map construction
        
    this.maxRoomCount=10;                   // the maximum possible number of rooms in the map
    
    this.maxRoomRecursion=3;                // how far down you will recurse to make rooms off a single room
    this.maxStoryCount=3;                   // maximum number of possible stories for a single room
    
    this.connectionPercentage=0.25;             // what % of the time a connection in a room spawns another room
    this.levelChangePercentage=0.8;             // what % of the time a room gains another story
    this.storyPlatformSidePercentage=0.6;       // what % of the time a second story platform has a side piece
    this.storyPlatformOppositePercentage=0.4;   // what % of the time a second story platform has an opposite piece
    
    this.decorations=false;                     // set to false for no decorations in the map
    
    this.maxRoomSize=[35000,7000,35000];        // maximum size for a room [x,y,z]
    this.roomFloorDepth=700;
    
        // lighting
    
    this.ambient=[0.0,0.0,0.0];                 // all over ambient light
    
    this.mapLightBoost=0.5;                     // factors for randomized lighting intensities past room radius
    this.mapLightBoostExtra=0.4;
    
    this.generateLightmap=false;                // set to true to generate light maps

        // models
        
    this.modelMonsterCount=0;

        // entities
        
    this.monsterEntityCount=0;
    
        // timing
        
    this.physicsMilliseconds=16;
    this.drawMilliseconds=16;
    this.bailMilliseconds=5000;
    
        // draw testing
    
    this.debugDrawTangentSpace=false;
    this.debugDrawMeshLines=false;
    this.debugDrawSkeleton=false;
    
        // play testing
        
    this.clipWalls=false;
    this.fly=false;

        // random seeds
        // hard set these to generate the
        // the same map everytime
    
    var seed=Date.now();
    
    this.randomSeedMapBitmap=Math.floor((Math.random()*seed));
    this.randomSeedMap=2000; //Math.floor((Math.random()*seed));
    this.randomSeedModelBitmap=Math.floor((Math.random()*seed));
    this.randomSeedModel=Math.floor((Math.random()*seed));
    this.randomSeedEntity=Math.floor((Math.random()*seed));
}

var settings=new SettingsObject();
