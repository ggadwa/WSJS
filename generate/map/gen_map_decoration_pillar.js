/* global MeshPrimitivesClass, config, genRandom, map */

"use strict";

//
// generate room pillar decoration class
//

class GenRoomDecorationPillarClass
{
    constructor()
    {
        let minRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.08);
        let maxRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.14);

        let radius=genRandom.randomInBetween(minRadius,maxRadius);
        this.segments=MeshPrimitivesClass.createMeshCylinderSegmentList(radius,radius,1,4);
        
        Object.seal(this);
    }
    
        //
        // pillar types
        //
        
    addPillarsCorners(room,bitmap,inside)
    {
        let mx,mz,pos,yBound;
        
        pos=room.checkGroundFloorSpawnAndBlock(1,1);
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(1,1);
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        
        pos=room.checkGroundFloorSpawnAndBlock((room.xBlockSize-2),1);
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((room.xBlockSize-2),1);
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        
        pos=room.checkGroundFloorSpawnAndBlock((room.xBlockSize-2),(room.zBlockSize-2));
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((room.xBlockSize-2),(room.zBlockSize-2));
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        
        pos=room.checkGroundFloorSpawnAndBlock(1,(room.zBlockSize-2));
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(1,(room.zBlockSize-2));
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        
        if (inside) {
            mx=Math.trunc(room.xBlockSize/2);
            mz=Math.trunc(room.zBlockSize/2);
            
            pos=room.checkGroundFloorSpawnAndBlock((mx-2),(mz-2));
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((mx-2),(mz-2));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));

            pos=room.checkGroundFloorSpawnAndBlock((mx+1),(mz-2));
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((mx+1),(mz-2));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));

            pos=room.checkGroundFloorSpawnAndBlock((mx+1),(mz+1));
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((mx+1),(mz+1));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));

            pos=room.checkGroundFloorSpawnAndBlock((mx-2),(mz+1));
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound((mx-2),(mz+1));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION)); 
        }
    }
    
    addPillarsLineX(room,bitmap)
    {
        let x,mx,mz,pos,yBound;
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (x=1;x<=(room.xBlockSize-2);x+=2) {
            if (x===mx) continue;           // never block light
            
            pos=room.checkGroundFloorSpawnAndBlock(x,mz);
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(x,mz);
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        }
    }
    
    addPillarsLineZ(room,bitmap)
    {
        let z,mx,mz,pos,yBound;
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (z=1;z<=(room.zBlockSize-2);z+=2) {
            if (z===mz) continue;           // never block light
            
            pos=room.checkGroundFloorSpawnAndBlock(mx,z);
            yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(mx,z);
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,map.MESH_FLAG_DECORATION));
        }
    }
    
        //
        // pillars
        //
    
    create(room)
    {
            // texture
            
        let bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
            // random pillar types
            
        switch (genRandom.randomIndex(5)) {
            case 0:
                this.addPillarsCorners(room,bitmap,false);
                return;
            case 1:
                this.addPillarsCorners(room,bitmap,true);
                return;
            case 2:
                this.addPillarsLineX(room,bitmap);
                return;
            case 3:
                this.addPillarsLineZ(room,bitmap);
                return;
            case 4:
                this.addPillarsLineX(room,bitmap);
                this.addPillarsLineZ(room,bitmap);
                return;
        }
    }
    
}
