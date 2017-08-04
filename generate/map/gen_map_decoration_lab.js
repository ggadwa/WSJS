/* global MeshPrimitivesClass, config, genRandom, map */

"use strict";

//
// generate room lab decoration class
//

class GenRoomDecorationLabClass
{
    constructor()
    {
        this.tubeBaseSize=genRandom.randomInt(map.ROOM_FLOOR_DEPTH,Math.trunc(map.ROOM_FLOOR_HEIGHT*0.25));
        
        Object.seal(this);
    }
    
        //
        // lab tubes
        //
        
    addTube(room,x,z)
    {
        let yBound,mesh;
        let yMid,centerPnt,radius;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top and bottom base

        x=(room.xBound.min+(x*map.ROOM_BLOCK_WIDTH))+Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
        z=(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH))+Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);
        centerPnt=new wsPoint(x,room.yBound.max,z);
      
        radius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.35);
        
        yMid=(room.yBound.max-this.tubeBaseSize);
        yBound=new wsBound(yMid,room.yBound.max);
        mesh=MeshPrimitivesClass.createMeshCylinderSimple(platformBitmap,centerPnt,yBound,radius,true,false,map.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        map.addMesh(mesh);

        yBound=new wsBound((room.yBound.max-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),(room.yBound.max-map.ROOM_FLOOR_HEIGHT));
        mesh=MeshPrimitivesClass.createMeshCylinderSimple(platformBitmap,centerPnt,yBound,radius,false,true,map.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        map.addMesh(mesh);

            // the tube
        
        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),yMid);
        
        radius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.3);

        mesh=MeshPrimitivesClass.createMeshCylinderSimple(metalBitmap,centerPnt,yBound,radius,false,false,map.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        map.addMesh(mesh);
    }
    
        //
        // lab pump
        //

    addPump(room,pnt)
    {
        let xBound,yBound,zBound;
        let wid,reduceSize;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top base
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.9);

        xBound=new wsBound(pnt.x,(pnt.x+wid));
        zBound=new wsBound(pnt.z,(pnt.z+wid));

        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        
            // the pump
        
        reduceSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        xBound.min+=reduceSize;
        xBound.max-=reduceSize;
        zBound.min+=reduceSize;
        zBound.max-=reduceSize;

        yBound=new wsBound((room.yBound.max-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.5)),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        map.addMesh(MeshPrimitivesClass.createMeshCube(metalBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
    }
        
        //
        // lab
        //
    
    create(room,rect)
    {
        let x,z;
        let pnt=new wsPoint(0,0);
        
        for (z=rect.top;z!==rect.bot;z++) {
            for (x=rect.lft;x!==rect.rgt;x++) {
                pnt.setFromValues((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),room.yBound.min,(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)));
                
                this.addTube(room,x,z);
                /*
                switch (genRandom.randomIndex(3)) {
                    case 0:
                        this.addTube(room,pnt,false);
                        break;
                    case 1:
                        this.addTube(room,pnt,true);
                        break;
                    case 2:
                        this.addPump(room,pnt);
                        break;
                }
                */

            }
        }
    }
    
}
