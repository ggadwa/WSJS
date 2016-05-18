"use strict";

//
// generate room pillar class
//

class GenRoomPillarClass
{
    constructor(map,genRandom)
    {    
        this.map=map;
        this.genRandom=genRandom;
        
        var minRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.08);
        var maxRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.14);

        var radius=this.genRandom.randomInBetween(minRadius,maxRadius);
        this.segments=MeshPrimitivesClass.createMeshCylinderSegmentList(this.genRandom,radius,radius,1,4);
        
        Object.seal(this);
    }
    
        //
        // pillar types
        //
        
    addPillarsCorners(room,yBound)
    {
        var pos;
        var bitmap=bitmapList.getBitmap('Map Pillar');
        
        pos=room.checkLocationFreeAndBlock(1,1);
        if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock((room.xBlockSize-2),1);
        if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock((room.xBlockSize-2),(room.zBlockSize-2));
        if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkLocationFreeAndBlock(1,(room.zBlockSize-2));
        if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
    }
    
    addPillarsLineX(room,yBound)
    {
        var x,mx,mz,pos;
        var bitmap=bitmapList.getBitmap('Map Pillar');
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (x=1;x<=(room.xBlockSize-2);x+=2) {
            if (x===mx) continue;           // never block light
            
            pos=room.checkLocationFreeAndBlock(x,mz);
            if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    }
    
    addPillarsLineZ(room,yBound)
    {
        var z,mx,mz,pos;
        var bitmap=bitmapList.getBitmap('Map Pillar');
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (z=1;z<=(room.zBlockSize-2);z+=2) {
            if (z===mz) continue;           // never block light
            
            pos=room.checkLocationFreeAndBlock(mx,z);
            if (pos!==null) this.map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    }
    
        //
        // pillars
        //
    
    addPillars(room)
    {
        var yBound;
        
            // this room have pillars?
            
        if (!this.genRandom.randomPercentage(config.ROOM_MAX_PILLAR_PERCENTAGE)) return;
        
            // ybound
            
        yBound=room.yStoryBound;
        
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
    }
    
}
