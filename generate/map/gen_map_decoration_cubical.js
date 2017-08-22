import * as constants from '../../code/main/constants.js';
import BoundClass from '../../code/utility/bound.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room cubical decoration class
//

export default class GenRoomDecorationCubicalClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        Object.seal(this);
    }
        
        //
        // cubical wall
        //
        
    addCubicalWall(room,bitmap,rect,wid,yBound)
    {
        let n,dx,dz;
        let xBound,zBound;
        let skipIdx;
        let skipWall=genRandom.randomIndex(4);
        
            // skip index
            
        if ((skipWall===constants.ROOM_SIDE_LEFT) || (skipWall===constants.ROOM_SIDE_RIGHT)) {
            skipIdx=rect.top+genRandom.randomIndex(rect.bot-rect.top);
        }
        else {
            skipIdx=rect.lft+genRandom.randomIndex(rect.rgt-rect.lft);
        }
        
            // left and right walls
            
        for (n=rect.top;n<rect.bot;n++) {
            dz=room.zBound.min+(n*constants.ROOM_BLOCK_WIDTH);
            zBound=new BoundClass(dz,(dz+constants.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===constants.ROOM_SIDE_LEFT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.lft*constants.ROOM_BLOCK_WIDTH);
                xBound=new BoundClass(dx,(dx+wid));
                this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.view,bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
                this.map.addOverlayDecorationWall(dx,dz,dx,(dz+constants.ROOM_BLOCK_WIDTH));
            }
            
            if (!((skipWall===constants.ROOM_SIDE_RIGHT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.rgt*constants.ROOM_BLOCK_WIDTH);
                xBound=new BoundClass((dx-wid),dx);
                this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.view,bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
                this.map.addOverlayDecorationWall(dx,dz,dx,(dz+constants.ROOM_BLOCK_WIDTH));
            }
        }
            
            // top and bottom walls
            
        for (n=rect.lft;n<rect.rgt;n++) {
            dx=room.xBound.min+(n*constants.ROOM_BLOCK_WIDTH);
            xBound=new BoundClass(dx,(dx+constants.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===constants.ROOM_SIDE_TOP) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.top*constants.ROOM_BLOCK_WIDTH);
                zBound=new BoundClass(dz,(dz+wid));
                this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.view,bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
                this.map.addOverlayDecorationWall(dx,dz,(dx+constants.ROOM_BLOCK_WIDTH),dz);
            }
            
            if (!((skipWall===constants.ROOM_SIDE_BOTTOM) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.bot*constants.ROOM_BLOCK_WIDTH);
                zBound=new BoundClass((dz-wid),dz);
                this.map.addMesh(MeshPrimitivesClass.createMeshCube(this.view,bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
                this.map.addOverlayDecorationWall(dx,dz,(dx+constants.ROOM_BLOCK_WIDTH),dz);
            }
        }
            
    }
    
        //
        // cubical decorations mainline
        //

    create(room,rect)
    {
        let wid,yBound;
        let bitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_FRAME);
        
            // get width
            
        wid=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        
            // create cubical walls
        
        if (genRandom.randomPercentage(0.5)) {
            yBound=new BoundClass((room.yBound.max-constants.ROOM_FLOOR_HEIGHT),room.yBound.max);
        }
        else {
            yBound=new BoundClass((room.yBound.max-((room.storyCount-1)*constants.ROOM_FLOOR_HEIGHT)),room.yBound.max);
        }
            
        this.addCubicalWall(room,bitmap,rect,wid,yBound);
    }

}
