"use strict";

//
// generate room pillar decoration class
//

class GenRoomDecorationPillarClass
{
    constructor()
    {
        var minRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.08);
        var maxRadius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.14);

        var radius=genRandom.randomInBetween(minRadius,maxRadius);
        this.segments=MeshPrimitivesClass.createMeshCylinderSegmentList(radius,radius,1,4);
        
        Object.seal(this);
    }
    
        //
        // pillar types
        //
        
    addPillarsCorners(room,bitmap,inside)
    {
        var mx,mz,pos,yBound;
        
        pos=room.checkSpawnAndBlock(1,1);
        yBound=room.getSpawnToFirstPlatformOrTopBound(1,1);
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkSpawnAndBlock((room.xBlockSize-2),1);
        yBound=room.getSpawnToFirstPlatformOrTopBound((room.xBlockSize-2),1);
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkSpawnAndBlock((room.xBlockSize-2),(room.zBlockSize-2));
        yBound=room.getSpawnToFirstPlatformOrTopBound((room.xBlockSize-2),(room.zBlockSize-2));
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        pos=room.checkSpawnAndBlock(1,(room.zBlockSize-2));
        yBound=room.getSpawnToFirstPlatformOrTopBound(1,(room.zBlockSize-2));
        if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        
        if (inside) {
            mx=Math.trunc(room.xBlockSize/2);
            mz=Math.trunc(room.zBlockSize/2);
            
            pos=room.checkSpawnAndBlock((mx-2),(mz-2));
            yBound=room.getSpawnToFirstPlatformOrTopBound((mx-2),(mz-2));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));

            pos=room.checkSpawnAndBlock((mx+1),(mz-2));
            yBound=room.getSpawnToFirstPlatformOrTopBound((mx+1),(mz-2));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));

            pos=room.checkSpawnAndBlock((mx+1),(mz+1));
            yBound=room.getSpawnToFirstPlatformOrTopBound((mx+1),(mz+1));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));

            pos=room.checkSpawnAndBlock((mx-2),(mz+1));
            yBound=room.getSpawnToFirstPlatformOrTopBound((mx-2),(mz+1));
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION)); 
        }
    }
    
    addPillarsLineX(room,bitmap)
    {
        var x,mx,mz,pos,yBound;
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (x=1;x<=(room.xBlockSize-2);x+=2) {
            if (x===mx) continue;           // never block light
            
            pos=room.checkSpawnAndBlock(x,mz);
            yBound=room.getSpawnToFirstPlatformOrTopBound(x,mz);
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    }
    
    addPillarsLineZ(room,bitmap)
    {
        var z,mx,mz,pos,yBound;
        
        mx=Math.trunc(room.xBlockSize/2);
        mz=Math.trunc(room.zBlockSize/2);
        
        for (z=1;z<=(room.zBlockSize-2);z+=2) {
            if (z===mz) continue;           // never block light
            
            pos=room.checkSpawnAndBlock(mx,z);
            yBound=room.getSpawnToFirstPlatformOrTopBound(mx,z);
            if (pos!==null) map.addMesh(MeshPrimitivesClass.createMeshCylinder(bitmap,pos,yBound,this.segments,MESH_FLAG_DECORATION));
        }
    }
    
        //
        // pillars
        //
    
    create(room)
    {
            // texture
            
        var bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
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
