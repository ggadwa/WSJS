import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import genRandom from '../../generate/utility/random.js';
import MoveClass from '../../code/map/move.js';
import MovementClass from '../../code/map/movement.js';
import GenRoomDecorationBaseClass from '../../generate/map/gen_map_decoration_base.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';

//
// generate room block decoration class
//

export default class GenRoomDecorationBlockClass extends GenRoomDecorationBaseClass
{
    constructor(view,map,platformBitmap)
    {
        let genBitmap;
        
        super(view,map,platformBitmap);
        
        genBitmap=new GenBitmapMetalClass(this.view);
        this.liftBitmap=genBitmap.generate(false);
        
        Object.seal(this);
    }
        
        //
        // blocks
        //
    
    addBlockLift(room,x,z)
    {
        let len,meshIdx,movement,moveMSec,waitMSec;
        
        let xLiftBound=new BoundClass((room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*constants.ROOM_BLOCK_WIDTH)));
        let yLiftBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_HEIGHT),room.yBound.max);
        let zLiftBound=new BoundClass((room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*constants.ROOM_BLOCK_WIDTH)));

        meshIdx=this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.liftBitmap,xLiftBound,yLiftBound,zLiftBound,true,true,true,true,true,false,false,constants.MESH_FLAG_LIFT));
        
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
        
        this.map.movementList.add(movement); 

            // can't span on this
            
        room.setBlockGrid(0,x,z);

        this.map.overlay.addLift(xLiftBound,zLiftBound);
    }
    
    addBlockChunk(room,x,z)
    {
        let xBound=new BoundClass((room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+((x+1)*constants.ROOM_BLOCK_WIDTH)));
        let yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_HEIGHT),room.yBound.max);
        let zBound=new BoundClass((room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+((z+1)*constants.ROOM_BLOCK_WIDTH)));
        
            // some random height changes
            
        if (genRandom.randomPercentage(0.1)) {
            yBound.min-=constants.ROOM_FLOOR_DEPTH;
        }
        else {
            if (genRandom.randomPercentage(0.1)) {
                yBound.min+=constants.ROOM_FLOOR_DEPTH;
            }  
        }
        
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_PLATFORM));
    }
    
        //
        // cubical decorations mainline
        //

    create(room,rect)
    {
        let xBound,zBound;

        let x,z;
        let hadLift,isLift;

            // create the block pieces
            
        hadLift=false;
            
        for (x=rect.lft;x!==rect.rgt;x++) {
            for (z=rect.top;z!==rect.bot;z++) {
                
                isLift=false;
                
                    // is this a possible place for a lift?
                    
                if ((x===rect.lft) || (x===(rect.rgt-1)) || (z===rect.top) || (z===(rect.bot-1))) {
                    if (!hadLift) {
                        isLift=genRandom.randomPercentage(0.1);
                    }
                }
                
                    // if we've reached the end without a lift,
                    // than make one
                    
                if ((x===(rect.rgt-1)) && (z===(rect.bot-1)) && (!hadLift)) isLift=true;
                
                    // do any lifts
                    
                if (isLift) {
                    this.addBlockLift(room,x,z);
                    hadLift=true;
                }
                else {
                    this.addBlockChunk(room,x,z);
                }
            
            }
        }

            // and finally the overlay
            
        xBound=new BoundClass((room.xBound.min+(rect.lft*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*constants.ROOM_BLOCK_WIDTH)));
        zBound=new BoundClass((room.zBound.min+(rect.top*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*constants.ROOM_BLOCK_WIDTH)));
        this.map.overlay.addPlatform(xBound,zBound);
    }

}
