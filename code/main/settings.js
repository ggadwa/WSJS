"use strict";

//
// settings class
//

function SettingsObject()
{
        // room construction
        
    this.roomMaxCount=20;                       // the maximum possible number of rooms in the map
    
    this.roomMaxRecursion=3;                    // how far down you will recurse to make rooms off a single room
    
    this.roomDimension=[35000,7000,35000];        // maximum size for a room [x,y,z]
    this.roomFloorDepth=700;
    
    this.roomConnectionPercentage=0.25;             // what % of the time a connection in a room spawns another room
    this.roomLevelChangePercentage=0.8;             // what % of the time a room gains another story
    
    this.roomPlatforms=true;                   // turns on or off platforms
    
        // lighting
    
    this.ambient=[0.0,0.0,0.0];                 // all over ambient light
    
    this.mapLightFactor=0.5;                    // lights are initially set to room radius, this factor is multipled in
    this.mapLightFactorExtra=0.3;               // random addition to light factor above
    this.mapTwoStoryLightBoost=1.3;             // multiply boost when a light is in a two story room
    
    this.mapLightExponentMin=0.2;               // minimum light exponent (0.0 is completely hard light with no fall off)
    this.mapLightExponentExtra=0.5;             // exponent add
    
    this.mapLightRGBMinimum=0.6;                // minimum r, g, or b value for map lights
    this.mapLightRGBExtra=0.4;                  // random r, g, b add for map lights
    
    this.generateLightmap=false;                 // set to true to generate light maps
    
        // decorations
        
    this.decorations=false;                     // set to false for no decorations in the map

        // models
        
    this.modelMonsterCount=5;

        // entities
        
    this.monsterEntityCount=20;
    
        // timing
        
    this.physicsMilliseconds=16;
    this.drawMilliseconds=16;
    this.bailMilliseconds=5000;
    
        // draw testing
    
    this.debugDrawMapTangentSpace=false;
    this.debugDrawMapMeshLines=false;
    
    this.debugDrawModelSkeleton=false;
    this.debugDrawModelTangentSpace=false;
    this.debugDrawModelMeshLines=false;
    
        // play testing
        
    this.clipWalls=false;
    this.fly=false;

        // random seeds
        // hard set these to generate the
        // the same map everytime
    
    var seed=Date.now();
    
    this.randomSeedMapBitmap=Math.floor((Math.random()*seed));
    this.randomSeedMap=2; // Math.floor((Math.random()*seed));
    this.randomSeedModelBitmap=1;//Math.floor((Math.random()*seed));
    this.randomSeedModel=5; //Math.floor((Math.random()*seed));
    this.randomSeedEntity=6; //Math.floor((Math.random()*seed));
    
    console.log('map seed='+this.randomSeedMap);
}

var settings=new SettingsObject();
