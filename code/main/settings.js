"use strict";

//
// settings class
//

function SettingsObject()
{
        // room construction
        
    this.roomMaxCount=30;                       // the maximum possible number of rooms in the map
    
    this.roomMaxRecursion=3;                    // how far down you will recurse to make rooms off a single room
    
    this.roomDimension=[35000,7000,35000];        // maximum size for a room [x,y,z]
    this.roomFloorDepth=700;
    
    this.roomConnectionPercentage=0.25;             // what % of the time a connection in a room spawns another room
    this.roomLevelChangePercentage=0.8;             // what % of the time a room gains another story
    
        // platforms
        
    this.platformStairLength=3000;
    
    this.platformSidePercentage=0.6;            // what % of the time a second story platform has a side piece
    this.platformOppositePercentage=0.4;        // what % of the time a second story platform has an opposite piece
    
        // lighting
    
    this.ambient=[0.0,0.0,0.0];                 // all over ambient light
    
    this.mapLightFactor=0.5;                    // lights are initially set to room radius, this factor is multipled in
    this.mapLightFactorExtra=0.3;               // random addition to light factor above
    this.mapTwoStoryLightBoost=1.3;             // multiply boost when a light is in a two story room
    
    this.mapLightExponentMin=0.2;               // minimum light exponent (0.0 is completely hard light with no fall off)
    this.mapLightExponentExtra=0.5;             // exponent add
    
    this.generateLightmap=false;                // set to true to generate light maps
    
        // decorations
        
    this.decorations=false;                     // set to false for no decorations in the map

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
