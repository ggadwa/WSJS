/* global MeshPrimitivesClass, config, genRandom, map */

"use strict";

//
// generate room pillar decoration class
//

class GenRoomDecorationPillarClass
{
    constructor()
    {
        this.segments=MeshPrimitivesClass.createMeshCylinderSegmentList(1,4);         // all pilars in this map use same setup
        this.hasPlatform=genRandom.randomPercentage(0.5);
        
        Object.seal(this);
    }
    
        //
        // pillar types
        //
        
    addPillarSingle(room,rect,pillarBitmap,platformBitmap)
    {
        let x,z,yBound,pos,radius;
        let platformXBound,platformYBound,platformZBound;

            // position
            
        x=room.xBound.min+Math.trunc(((rect.lft+rect.rgt)*map.ROOM_BLOCK_WIDTH)*0.5);
        z=room.zBound.min+Math.trunc(((rect.top+rect.bot)*map.ROOM_BLOCK_WIDTH)*0.5);
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(rect.lft,rect.top);
        
            // possible platforms
            
        if (this.hasPlatform) {
            platformXBound=new wsBound((room.xBound.min+(rect.lft*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*map.ROOM_BLOCK_WIDTH)));
            platformZBound=new wsBound((room.zBound.min+(rect.top*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*map.ROOM_BLOCK_WIDTH)));
            
            platformYBound=new wsBound(yBound.min,(yBound.min+map.ROOM_FLOOR_DEPTH));
            map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,false,true,false,map.MESH_FLAG_DECORATION));

            platformYBound=new wsBound((yBound.max-map.ROOM_FLOOR_DEPTH),yBound.max);
            map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));

            yBound.min+=map.ROOM_FLOOR_DEPTH;
            yBound.max-=map.ROOM_FLOOR_DEPTH;
        }
        
            // the pillar itself
            
        pos=new wsPoint(x,yBound.max,z);
        radius=Math.trunc(((rect.rgt-rect.lft)*map.ROOM_BLOCK_WIDTH)*0.3);
        
        map.addMesh(MeshPrimitivesClass.createMeshCylinder(pillarBitmap,pos,yBound,this.segments,radius,map.MESH_FLAG_DECORATION));
    }
    
    addPillarLineX(room,rect,pillarBitmap,platformBitmap)
    {
        let x,z;
        let pillarRect=new wsRect(0,0,0,0);
        
        z=Math.trunc((rect.top+rect.bot)*0.5);
        
        for (x=rect.lft;x!==rect.rgt;x++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect,pillarBitmap,platformBitmap);
        }
    }
    
    addPillarLineZ(room,rect,pillarBitmap,platformBitmap)
    {
        let x,z;
        let pillarRect=new wsRect(0,0,0,0);
        
        x=Math.trunc((rect.lft+rect.rgt)*0.5);
        
        for (z=rect.top;z!==rect.bot;z++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect,pillarBitmap,platformBitmap);
        }
    }
    
        //
        // pillars
        //
    
    create(room,rect)
    {
            // texture
            
        let pillarBitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        let platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        
            // determine if this is a square rect
            // if so, one big pillar
            
        if (rect.isSquare()) {
            this.addPillarSingle(room,rect,pillarBitmap,platformBitmap);
            return;
        }
        
            // otherwise a line across the rect
        
        if (rect.isXLarger()) {
            this.addPillarLineX(room,rect,pillarBitmap,platformBitmap);
        }
        else {
            this.addPillarLineZ(room,rect,pillarBitmap,platformBitmap);
        }
    }
    
}
