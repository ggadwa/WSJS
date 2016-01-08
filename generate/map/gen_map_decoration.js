"use strict";

//
// generate room decoration class
//

function GenRoomDecorationObject(view,map,room,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;

        //
        // random boxes
        //

    this.addBoxes=function()
    {
        var n,count;
        var x,z,high,boxBoundX,boxBoundY,boxBoundZ;

        count=this.genRandom.randomInt(1,ROOM_DECORATIONS_BOX_EXTRA_COUNT);

        for (n=0;n!==count;n++) {
            x=this.genRandom.randomInBetween((this.room.xBound.min+1000),(this.room.xBound.max-1000));
            z=this.genRandom.randomInBetween((this.room.zBound.min+1000),(this.room.zBound.max-1000));
            
            high=2000;
            if (this.genRandom.random()>0.5) high=3500;

            boxBoundX=new wsBound((x-1000),(x+1000));
            boxBoundY=new wsBound((this.room.yBound.max-high),this.room.yBound.max);
            boxBoundZ=new wsBound((z-1000),(z+1000));
            
            map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
        }

    };
    
        //
        // pillars
        //
    
    this.addPillars=function()
    {
        var n,x,z;
        var pillarYBound;
        
        var room=this.room;
        
            // ybound
            
        pillarYBound=new wsBound((room.yBound.min-ROOM_FLOOR_DEPTH),room.yBound.max);
        if (room.hasStories) pillarYBound.min-=(room.yBound.getSize()+ROOM_FLOOR_DEPTH);
        
            // pillar default size
        
        var pillarRadius;
        
        if (room.xBound.getSize()>room.zBound.getSize()) {
            pillarRadius=room.xBound.getSize()*(this.genRandom.random()*ROOM_DECORATIONS_PILLAR_FACTOR);
        }
        else {
            pillarRadius=room.zBound.getSize()*(this.genRandom.random()*ROOM_DECORATIONS_PILLAR_FACTOR);
        }
        
        if (pillarRadius<ROOM_DECORATIONS_PILLAR_MIN_RADIUS) pillarRadius=ROOM_DECORATIONS_PILLAR_MIN_RADIUS;
        
            // pilar locations
            
        var pillarLocs=[];
            
        switch (this.genRandom.randomInt(0,2)) {
            
                // four corners
                
            case 0:
                x=room.xBound.getSize()*0.2;
                z=room.zBound.getSize()*0.2;
                pillarLocs.push(new wsPoint((room.xBound.min+x),room.yBound.max,(room.zBound.min+z)));
                pillarLocs.push(new wsPoint((room.xBound.max-x),room.yBound.max,(room.zBound.min+z)));
                pillarLocs.push(new wsPoint((room.xBound.max-x),room.yBound.max,(room.zBound.max-z)));
                pillarLocs.push(new wsPoint((room.xBound.min+x),room.yBound.max,(room.zBound.max-z)));
                break;
                
                // x line
                
            case 1:
                x=room.xBound.getMidPoint();
                z=room.zBound.getSize()/8;
                pillarLocs.push(new wsPoint(x,room.yBound.max,(room.zBound.min+(z*2))));
                pillarLocs.push(new wsPoint(x,room.yBound.max,(room.zBound.max-(z*2))));
                break;
                
                // z line
                
            case 2:
                x=room.xBound.getSize()/8;
                z=room.zBound.getMidPoint();
                pillarLocs.push(new wsPoint((room.xBound.min+(x*2)),room.yBound.max,z));
                pillarLocs.push(new wsPoint((room.xBound.max-(x*2)),room.yBound.max,z));
                break;
            
        }
        
            // setup cylinder segments
            
        var segments=meshPrimitives.createMeshCylinderSegmentList(this.genRandom,pillarRadius,pillarRadius,1,ROOM_DECORATIONS_PILLAR_EXTRA_SEGMENTS);
        
            // make the pillars
            
        for (n=0;n!==pillarLocs.length;n++) {
            map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pillarLocs[n],pillarYBound,segments,MESH_FLAG_DECORATION));
        }
    };
    
        //
        // machines
        //
        
    this.addMachine=function()
    {
            // the machine size
            
        var centerPt=new wsPoint(this.room.xBound.getMidPoint(),this.room.yBound.max,this.room.zBound.getMidPoint());
            
        var sizeX=this.genRandom.randomInt(2000,1000);
        var sizeY=this.room.yBound.getSize()*0.7;
        var sizeZ=this.genRandom.randomInt(2000,1000);
        
        var machineBoundX=new wsBound((centerPt.x-sizeX),(centerPt.x+sizeX));
        var machineBoundY=new wsBound((this.room.yBound.max-sizeY),this.room.yBound.max);
        var machineBoundZ=new wsBound((centerPt.z-sizeZ),(centerPt.z+sizeZ));

        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),machineBoundX,machineBoundY,machineBoundZ,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
    };

    this.addDecoration=function()
    {
            // this map have decorations?
            
        if ((!ROOM_DECORATIONS) || (this.room.level===0)) return;
        
            // randomly pick a decoration
            
        switch (this.genRandom.randomInt(0,2)) {
            case 0:
                this.addBoxes();
                break;
            case 1:
                this.addPillars();
                break;
            //case 2:
            //    this.addMachine();
            //    break;
        }
    };

}
