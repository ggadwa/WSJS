"use strict";

//
// pillar
//

genMap.addDecorationPillar=function(map,xBound,yBound,zBound)
{
    var n,count;
    var x,z,boxBoundX,boxBoundZ;
    
    count=genRandom.randomInt(1,3);
    
    for (n=0;n!==count;n++) {
        x=genRandom.randomInBetween(xBound.min,xBound.max);
        z=genRandom.randomInBetween(zBound.min,zBound.max);

        boxBoundX=new wsBound(x-1000,x+1000);
        boxBoundZ=new wsBound(z-1000,z+1000);
        map.addMesh(meshPrimitives.createMeshCube(SHADER_MAP,BITMAP_CONCRETE,boxBoundX,yBound,boxBoundZ,false,true,true,true,true,false,false,0));
    }
}

//
// boxes
//

genMap.addDecorationBox=function(map,xBound,yBound,zBound)
{
    var n,count;
    var x,z,boxBoundX,boxBoundY,boxBoundZ;
    
    count=genRandom.randomInt(1,3);
    
    boxBoundY=new wsBound(yBound.max-2000,yBound.max);
    
    for (n=0;n!==count;n++) {
        x=genRandom.randomInBetween(xBound.min,xBound.max);
        z=genRandom.randomInBetween(zBound.min,zBound.max);

        boxBoundX=new wsBound(x-1000,x+1000);
        boxBoundZ=new wsBound(z-1000,z+1000);
        map.addMesh(meshPrimitives.createMeshCube(SHADER_MAP,BITMAP_WOOD_BOX,boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,0));
    }
};

//
// decoration main line
//

genMap.addDecoration=function(map,piece,xBound,yBound,zBound)
{
    this.addDecorationBox(map,xBound,yBound,zBound);
    return;
    
    switch (genRandom.randomInt(0,2)) {
        case 1:
            this.addDecorationPillar(map,xBound,yBound,zBound);
            break;
        case 2:
            this.addDecorationBox(map,xBound,yBound,zBound);
            break;
    }
};

