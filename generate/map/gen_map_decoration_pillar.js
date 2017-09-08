import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import RectClass from '../../code/utility/rect.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import GenBitmapBrickClass from '../../generate/bitmap/gen_bitmap_brick.js';
import GenBitmapStoneClass from '../../generate/bitmap/gen_bitmap_stone.js';
import GenBitmapBlockClass from '../../generate/bitmap/gen_bitmap_block.js';
import GenBitmapPlasterClass from '../../generate/bitmap/gen_bitmap_plaster.js';
import GenBitmapTileClass from '../../generate/bitmap/gen_bitmap_tile.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room pillar decoration class
//

export default class GenRoomDecorationPillarClass
{
    constructor(view,map,platformBitmap)
    {
        let genBitmap;
        
        this.view=view;
        this.map=map;
        this.platformBitmap=platformBitmap;
        
            // bitmaps
            
        switch(genRandom.randomIndex(5)) {
            case 0:
                genBitmap=new GenBitmapBrickClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapStoneClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapBlockClass(this.view);
                break;
            case 3:
                genBitmap=new GenBitmapPlasterClass(this.view);
                break;
            case 4:
                genBitmap=new GenBitmapTileClass(this.view);
                break;
        }
        
        this.pillarBitmap=genBitmap.generate(false);
        
            // pillar segments
        
        this.segments=MeshPrimitivesClass.createMeshCylinderSegmentList(1,4);         // all pilars in this map use same setup
        this.hasPlatform=genRandom.randomPercentage(0.5);
        
        Object.seal(this);
    }
    
        //
        // pillar types
        //
        
    addPillarSingle(room,rect)
    {
        let x,z,yBound,pos,radius;
        let platformXBound,platformYBound,platformZBound;
        
            // check the grid to avoid blocking stairs
            
        if (room.checkBlockGrid(0,rect.lft,rect.top)) return;

            // position
            
        x=room.xBound.min+Math.trunc(((rect.lft+rect.rgt)*constants.ROOM_BLOCK_WIDTH)*0.5);
        z=room.zBound.min+Math.trunc(((rect.top+rect.bot)*constants.ROOM_BLOCK_WIDTH)*0.5);
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(rect.lft,rect.top);
        
            // possible platforms
            
        if (this.hasPlatform) {
            platformXBound=new BoundClass((room.xBound.min+(rect.lft*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*constants.ROOM_BLOCK_WIDTH)));
            platformZBound=new BoundClass((room.zBound.min+(rect.top*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*constants.ROOM_BLOCK_WIDTH)));
            
            platformYBound=new BoundClass(yBound.min,(yBound.min+constants.ROOM_FLOOR_DEPTH));
            this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,false,true,false,constants.MESH_FLAG_DECORATION));

            platformYBound=new BoundClass((yBound.max-constants.ROOM_FLOOR_DEPTH),yBound.max);
            this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));

            yBound.min+=constants.ROOM_FLOOR_DEPTH;
            yBound.max-=constants.ROOM_FLOOR_DEPTH;
        }
        
            // the pillar itself
            
        pos=new PointClass(x,yBound.max,z);
        radius=Math.trunc(((rect.rgt-rect.lft)*constants.ROOM_BLOCK_WIDTH)*0.3);
        
        this.map.meshList.add(MeshPrimitivesClass.createMeshCylinder(this.view,this.pillarBitmap,pos,yBound,this.segments,radius,false,false,constants.MESH_FLAG_DECORATION));
    }
    
    addPillarLineX(room,rect)
    {
        let x,z;
        let pillarRect=new RectClass(0,0,0,0);
        
        z=Math.trunc((rect.top+rect.bot)*0.5);
        
        for (x=rect.lft;x!==rect.rgt;x++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect);
        }
    }
    
    addPillarLineZ(room,rect)
    {
        let x,z;
        let pillarRect=new RectClass(0,0,0,0);
        
        x=Math.trunc((rect.lft+rect.rgt)*0.5);
        
        for (z=rect.top;z!==rect.bot;z++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect);
        }
    }
    
        //
        // pillars
        //
    
    create(room,rect)
    {
            // determine if this is a square rect
            // if so, one big pillar
            
        if (rect.isSquare()) {
            this.addPillarSingle(room,rect);
            return;
        }
        
            // otherwise a line across the rect
        
        if (rect.isXLarger()) {
            this.addPillarLineX(room,rect);
        }
        else {
            this.addPillarLineZ(room,rect);
        }
    }
    
}
