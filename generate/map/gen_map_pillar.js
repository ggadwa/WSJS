"use strict";

//
// generate room pillar class
//

function GenRoomPillarObject(view,map,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    
    var radius=this.genRandom.randomInBetween(ROOM_PILLAR_MIN_RADIUS,ROOM_PILLAR_MAX_RADIUS);
    this.segments=meshPrimitives.createMeshCylinderSegmentList(this.genRandom,radius,radius,1,ROOM_PILLAR_EXTRA_SEGMENTS);
    
        //
        // pillar types
        //
        
    this.addPillarsCorners=function(room,yBound)
    {
        var pos;
        
        pos=room.checkLocationFreeAndBlock(1,1);
        if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock((room.xBlockSize-2),1);
        if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock((room.xBlockSize-2),(room.zBlockSize-2));
        if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock(1,(room.zBlockSize-2));
        if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
    };
    
    this.addPillarsLineX=function(room,yBound)
    {
        var x,mx,mz,pos;
        
        mx=Math.floor(room.xBlockSize/2);
        mz=Math.floor(room.zBlockSize/2);
        
        for (x=1;x<=(room.xBlockSize-2);x+=2) {
            if (x===mx) continue;           // never block light
            
            pos=room.checkLocationFreeAndBlock(x,mz);
            if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    };
    
    this.addPillarsLineZ=function(room,yBound)
    {
        var z,mx,mz,pos;
        
        mx=Math.floor(room.xBlockSize/2);
        mz=Math.floor(room.zBlockSize/2);
        
        for (z=1;z<=(room.zBlockSize-2);z+=2) {
            if (z===mz) continue;           // never block light
            
            pos=room.checkLocationFreeAndBlock(mx,z);
            if (pos!==null) map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    };
    
        //
        // pillars
        //
    
    this.addPillars=function(room)
    {
        var yBound;
        
            // this room have pillars?
            
        //if (!this.genRandom.randomPercentage(ROOM_MAX_PILLAR_PERCENTAGE)) return;
        
            // ybound
            
        yBound=new wsBound((room.yBound.min-ROOM_FLOOR_DEPTH),room.yBound.max);
        if (room.hasStories) yBound.min-=(room.yBound.getSize()+ROOM_FLOOR_DEPTH);
        
            // room size creates the pillar types
            
        if (Math.abs(room.xBlockSize-room.zBlockSize)<3) {
            this.addPillarsCorners(room,yBound);
            return;
        }
        
        if (room.xBlockSize>room.zBlockSize) {
            this.addPillarsLineX(room,yBound);
        }
        else {
            this.addPillarsLineZ(room,yBound);
        }
    };
    
}
