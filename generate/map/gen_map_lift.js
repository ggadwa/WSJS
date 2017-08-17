import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import genRandom from '../../generate/utility/random.js';

//
// map lifts
//

export default class GenRoomLiftClass
{
    constructor(map)
    {
        this.map=map;
        
        Object.seal(this);
    }
    
        //
        // add lift chunk
        //
        
    addLiftChunk(room,x,yLiftBound,z)
    {
        let len,meshIdx,movement,moveMSec,waitMSec;
        let liftBitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_METAL);
        
        let xLiftBound=new BoundClass((room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*constants.ROOM_BLOCK_WIDTH)));
        let zLiftBound=new BoundClass((room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*constants.ROOM_BLOCK_WIDTH)));

        meshIdx=this.map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,true,true,true,true,true,false,false,constants.MESH_FLAG_LIFT));
        
            // random wait
        
        moveMSec=genRandom.randomInt(1500,1000);
        waitMSec=genRandom.randomInt(1000,1500);

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        
        len=yLiftBound.getSize()-constants.ROOM_FLOOR_DEPTH;
        
        movement.addMove(new MoveClass(moveMSec,new PointClass(0,len,0)));
        movement.addMove(new MoveClass(waitMSec,new PointClass(0,len,0)));
        movement.addMove(new MoveClass(moveMSec,new PointClass(0,0,0)));
        movement.addMove(new MoveClass(waitMSec,new PointClass(0,0,0)));
        
        this.map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(0,x,z);

        this.map.addOverlayLift(xLiftBound,zLiftBound);
    }
    
        //
        // create lifts
        // 
    
    create(room,yBase)
    {
        let x,z,min,max,yBound;
        
            // no need for an elevator
            
        if (yBase===room.yBound.max) return;
        
            // create elevator based on side
            
        switch (room.mainPathSide) {

            case constants.ROOM_SIDE_LEFT:
                x=room.xBlockSize-1;
                break;

            case constants.ROOM_SIDE_TOP:
                z=room.zBlockSize-1;
                break;

            case constants.ROOM_SIDE_RIGHT:
                x=0;
                break;

            case constants.ROOM_SIDE_BOTTOM:
                z=0;
                break;

        }
        
        if ((room.mainPathSide===constants.ROOM_SIDE_LEFT) || (room.mainPathSide===constants.ROOM_SIDE_RIGHT)) {
            min=0;
            if (room.mainPathConnectedRoom.zBound.min>room.zBound.min) min=Math.trunc((room.mainPathConnectedRoom.zBound.min-room.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            max=room.zBlockSize;
            if (room.mainPathConnectedRoom.zBound.max<room.zBound.max) max=Math.trunc((room.mainPathConnectedRoom.zBound.max-room.zBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            z=genRandom.randomInBetween(min,(max-1));
        }
        else {
            min=0;
            if (room.mainPathConnectedRoom.xBound.min>room.xBound.min) min=Math.trunc((room.mainPathConnectedRoom.xBound.min-room.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            max=room.xBlockSize;
            if (room.mainPathConnectedRoom.xBound.max<room.xBound.max) max=Math.trunc((room.mainPathConnectedRoom.xBound.max-room.xBound.min)/constants.ROOM_BLOCK_WIDTH);
            
            x=genRandom.randomInBetween(min,(max-1));
        }
        
            // create lift
            
        yBound=new BoundClass(room.yBound.max,room.mainPathConnectedRoom.yBound.max);
        
        this.addLiftChunk(room,x,yBound,z);
    }
    
}

