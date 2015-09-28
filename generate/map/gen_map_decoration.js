"use strict";

//
// generate mesh decoration class
//

function GenRoomDecorationObject(view,map,piece,xBound,yBound,zBound,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.piece=piece;
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.genRandom=genRandom;

        //
        // random boxes
        //

    this.addBoxes=function()
    {
        var n,count;
        var x,z,high,boxBoundX,boxBoundY,boxBoundZ;
        
        x=xBound.getMidPoint()-8000;
        z=zBound.getMidPoint();
        
        boxBoundX=new wsBound((x-1000),(x+1000));
        boxBoundY=new wsBound((yBound.max-2000),yBound.max);
        boxBoundZ=new wsBound((z-1000),(z+1000));
        
        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_WOOD_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));

        x=xBound.getMidPoint()+8000;
        z=zBound.getMidPoint();
        
        boxBoundX=new wsBound((x-1000),(x+1000));
        boxBoundY=new wsBound((yBound.max-2000),yBound.max);
        boxBoundZ=new wsBound((z-1000),(z+1000));
        
        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_WOOD_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));

        x=xBound.getMidPoint();
        z=zBound.getMidPoint()-8000;
        
        boxBoundX=new wsBound((x-1000),(x+1000));
        boxBoundY=new wsBound((yBound.max-2000),yBound.max);
        boxBoundZ=new wsBound((z-1000),(z+1000));
        
        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_WOOD_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));

        x=xBound.getMidPoint();
        z=zBound.getMidPoint()+8000;
        
        boxBoundX=new wsBound((x-1000),(x+1000));
        boxBoundY=new wsBound((yBound.max-2000),yBound.max);
        boxBoundZ=new wsBound((z-1000),(z+1000));
        
        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_WOOD_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));

/*
        count=this.genRandom.randomInt(1,3);

        for (n=0;n!==count;n++) {
            x=this.genRandom.randomInBetween((xBound.min+1000),(xBound.max-1000));
            z=this.genRandom.randomInBetween((zBound.min+1000),(zBound.max-1000));
            
            high=2000;
            if (this.genRandom.random()>0.5) high=3500;

            boxBoundX=new wsBound((x-1000),(x+1000));
            boxBoundY=new wsBound((yBound.max-high),yBound.max);
            boxBoundZ=new wsBound((z-1000),(z+1000));
            
            if (this.map.boxBoundCollision(boxBoundX,boxBoundY,boxBoundZ,this.map.MESH_FLAG_STAIR)!==-1) continue;
            
            map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_WOOD_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));
        }
        */
    };
    
        //
        // pillars
        //
    
    this.addPillars=function()
    {
        var n,rd;
        var boxBoundX,boxBoundZ;
        var pt=new wsPoint(0,yBound.max,0);
        
            // setup cylinder segments
            
        var segments=meshPrimitives.createMeshCylinderSegmentList(this.genRandom,500,500,1,2);
        
            // get count and radius from center

        var count=4+(this.genRandom.randomInt(0,2)*4);  // pillars are in groups of 4
        var centerPt=new wsPoint(xBound.getMidPoint(),yBound.max,zBound.getMidPoint());
        
        var radiusReduce=(0.8+(this.genRandom.random()*0.2));
        var radiusX=(xBound.getSize()*0.3)*radiusReduce;
        var radiusZ=(zBound.getSize()*0.3)*radiusReduce;
        
            // make the pillars
            
        var ang=0.0;
        var angAdd=360.0/count;

        for (n=0;n!==count;n++) {
            rd=ang*DEGREE_TO_RAD;
            
            pt.x=centerPt.x+((radiusX*Math.sin(rd))+(radiusX*Math.cos(rd)));
            pt.z=centerPt.z+((radiusZ*Math.cos(rd))-(radiusZ*Math.sin(rd)));
            
                // check for collisions with stairs
                
            boxBoundX=new wsBound((centerPt.x-1000),(centerPt.x+1000));
            boxBoundZ=new wsBound((centerPt.z-1000),(centerPt.z+1000));
            
                // put in the pillar
            
            if (this.map.boxBoundCollision(boxBoundX,yBound,boxBoundZ,this.map.MESH_FLAG_STAIR)===-1) {
                map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(BITMAP_STAIR_TILE),pt,yBound,segments,this.map.MESH_FLAG_DECORATION));
            }
            
            ang+=angAdd;
            if (ang>=360.0) ang-=360.0;
        }
    };
    
        //
        // machines
        //
        
    this.addMachine=function()
    {
            // the machine size
            
        var centerPt=new wsPoint(xBound.getMidPoint(),yBound.max,zBound.getMidPoint());
            
        var sizeX=this.genRandom.randomInt(2000,1000);
        var sizeY=yBound.getSize()*0.7;
        var sizeZ=this.genRandom.randomInt(2000,1000);
        
        var machineBoundX=new wsBound((centerPt.x-sizeX),(centerPt.x+sizeX));
        var machineBoundY=new wsBound((yBound.max-sizeY),yBound.max);
        var machineBoundZ=new wsBound((centerPt.z-sizeZ),(centerPt.z+sizeZ));

        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(BITMAP_METAL),machineBoundX,machineBoundY,machineBoundZ,true,true,true,true,true,true,false,this.map.MESH_FLAG_DECORATION));
    };

    this.addDecoration=function()
    {
        this.addBoxes();
        return;
        
            // this map have decorations?
            
        if (!settings.decorations) return;
        
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
