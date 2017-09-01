import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import MoveClass from '../../code/map/move.js';
import MovementClass from '../../code/map/movement.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room lab decoration class
//

export default class GenRoomDecorationLabClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        this.tubeBaseSize=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.25));
        
        Object.seal(this);
    }
    
        //
        // lab tubes
        //
        
    addTube(room,x,z)
    {
        let yBound,mesh,meshIdx;
        let yCapTop,yCapBottom,yBaseTop,yBaseBottom,yLiqHigh,centerPnt,radius;
        let moveY,movement,msec;
        let platformBitmap,glassBitmap,gooBitmap;

        platformBitmap=this.map.getTexture(constants.BITMAP_TYPE_PLATFORM);
        glassBitmap=this.map.getTexture(constants.BITMAP_TYPE_GLASS);
        gooBitmap=this.map.getTexture(constants.BITMAP_TYPE_GOO);
        
            // the top and bottom base

        x=(room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH))+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5);
        z=(room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH))+Math.trunc(constants.ROOM_BLOCK_WIDTH*0.5);
        centerPnt=new PointClass(x,room.yBound.max,z);
      
        radius=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.35);
        
        yCapTop=(room.yBound.max-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
        yCapBottom=(room.yBound.max-constants.ROOM_FLOOR_HEIGHT);
        
        yBaseTop=(room.yBound.max-this.tubeBaseSize);
        yBaseBottom=room.yBound.max;
        
        yBound=new BoundClass(yBaseTop,yBaseBottom);
        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,platformBitmap,centerPnt,yBound,radius,true,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        this.map.meshList.add(mesh);

        yBound=new BoundClass(yCapTop,yCapBottom);
        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,platformBitmap,centerPnt,yBound,radius,true,true,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        this.map.meshList.add(mesh);

            // the tube
        
        yBound=new BoundClass(yCapBottom,yBaseTop); 
        radius=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.3);

        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,glassBitmap,centerPnt,yBound,radius,false,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        this.map.meshList.add(mesh);
        
            // the liquid in the tube
        
        yLiqHigh=genRandom.randomInt(constants.ROOM_FLOOR_DEPTH,(yBound.getSize()-constants.ROOM_FLOOR_DEPTH));    
        yBound=new BoundClass((yBaseTop-yLiqHigh),yBaseTop);
        
        radius=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.28);

        mesh=MeshPrimitivesClass.createMeshCylinderSimple(this.view,gooBitmap,centerPnt,yBound,radius,true,false,constants.MESH_FLAG_DECORATION);
        MeshPrimitivesClass.meshCylinderScaleU(mesh,5.0);
        meshIdx=this.map.meshList.add(mesh);
        
            // liquid movement
        
        moveY=Math.trunc(yLiqHigh*genRandom.randomFloat(0.1,0.7));
        msec=genRandom.randomInt(500,2000);
        
        movement=new MovementClass(meshIdx,true,0);
        movement.addMove(new MoveClass(msec,new PointClass(0,0,0)));
        movement.addMove(new MoveClass(msec,new PointClass(0,moveY,0)));
        
        this.map.movementList.add(movement);
    }
    
        //
        // lab pump
        //

    addPump(room,x,z)
    {
        let xBound,yBound,zBound;
        let reduceSize;
        let platformBitmap,metalBitmap;

        platformBitmap=this.map.getTexture(constants.BITMAP_TYPE_PLATFORM);
        metalBitmap=this.map.getTexture(constants.BITMAP_TYPE_METAL);
        
            // the top base
            
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);

        xBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
        zBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));

        yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_DEPTH),room.yBound.max);
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
        
            // the pump
        
        reduceSize=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        xBound.min+=reduceSize;
        xBound.max-=reduceSize;
        zBound.min+=reduceSize;
        zBound.max-=reduceSize;

        yBound=new BoundClass((room.yBound.max-Math.trunc(constants.ROOM_FLOOR_HEIGHT*0.5)),(room.yBound.max-constants.ROOM_FLOOR_DEPTH));
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,metalBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
    }
        
        //
        // lab
        //
    
    create(room,rect)
    {
        let x,z;
        
        for (z=rect.top;z!==rect.bot;z++) {
            for (x=rect.lft;x!==rect.rgt;x++) {
                switch (genRandom.randomIndex(2)) {
                    case 0:
                        this.addTube(room,x,z);
                        break;
                    case 1:
                        this.addPump(room,x,z);
                        break;
                }
            }
        }
    }
    
}
