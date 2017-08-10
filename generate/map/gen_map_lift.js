import wsPoint from '../../code/utility/point.js';
import wsBound from '../../code/utility/bound.js';
import genRandom from '../../generate/utility/random.js';
import map from '../../code/map/map.js';

//
// map lifts
//

export default class GenRoomLiftClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // add lift chunk
        //
        
    addLiftChunk(room,x,yLiftBound,z)
    {
        let len,meshIdx,movement,moveMSec,waitMSec;
        let liftBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
        let xLiftBound=new wsBound((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*map.ROOM_BLOCK_WIDTH)));
        let zLiftBound=new wsBound((room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*map.ROOM_BLOCK_WIDTH)));

        meshIdx=map.addMesh(MeshPrimitivesClass.createMeshCube(liftBitmap,xLiftBound,yLiftBound,zLiftBound,true,true,true,true,true,false,false,map.MESH_FLAG_LIFT));
        
            // random wait
        
        moveMSec=genRandom.randomInt(1500,1000);
        waitMSec=genRandom.randomInt(1000,1500);

            // the movement
        
        movement=new MovementClass(meshIdx,true,0);
        
        len=yLiftBound.getSize()-map.ROOM_FLOOR_DEPTH;
        
        movement.addMove(new MoveClass(moveMSec,new wsPoint(0,len,0)));
        movement.addMove(new MoveClass(waitMSec,new wsPoint(0,len,0)));
        movement.addMove(new MoveClass(moveMSec,new wsPoint(0,0,0)));
        movement.addMove(new MoveClass(waitMSec,new wsPoint(0,0,0)));
        
        map.addMovement(movement); 

            // can't span on this
            
        room.setBlockGrid(0,x,z);

        map.addOverlayLift(xLiftBound,zLiftBound);
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

            case mapRoomConstants.ROOM_SIDE_LEFT:
                x=room.xBlockSize-1;
                break;

            case mapRoomConstants.ROOM_SIDE_TOP:
                z=room.zBlockSize-1;
                break;

            case mapRoomConstants.ROOM_SIDE_RIGHT:
                x=0;
                break;

            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                z=0;
                break;

        }
        
        if ((room.mainPathSide===mapRoomConstants.ROOM_SIDE_LEFT) || (room.mainPathSide===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            min=0;
            if (room.mainPathConnectedRoom.zBound.min>room.zBound.min) min=Math.trunc((room.mainPathConnectedRoom.zBound.min-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.zBlockSize;
            if (room.mainPathConnectedRoom.zBound.max<room.zBound.max) max=Math.trunc((room.mainPathConnectedRoom.zBound.max-room.zBound.min)/map.ROOM_BLOCK_WIDTH);
            
            z=genRandom.randomInBetween(min,(max-1));
        }
        else {
            min=0;
            if (room.mainPathConnectedRoom.xBound.min>room.xBound.min) min=Math.trunc((room.mainPathConnectedRoom.xBound.min-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            max=room.xBlockSize;
            if (room.mainPathConnectedRoom.xBound.max<room.xBound.max) max=Math.trunc((room.mainPathConnectedRoom.xBound.max-room.xBound.min)/map.ROOM_BLOCK_WIDTH);
            
            x=genRandom.randomInBetween(min,(max-1));
        }
        
            // create lift
            
        yBound=new wsBound(room.yBound.max,room.mainPathConnectedRoom.yBound.max);
        
        this.addLiftChunk(room,x,yBound,z);
    }
    
}

