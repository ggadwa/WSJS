"use strict";

//
// room floors and ceilings
//

function GenRoomFloorCeilingObject(view,map,piece,meshWallIdx,level,xBound,yBound,zBound,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.piece=piece;
    this.meshWallIdx=meshWallIdx;
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.genRandom=genRandom;

        //
        // floor and ceiling
        //

    this.addFloorCeiling=function()
    {
        var x,z,mask,mesh;
        var xMaskBound,zMaskBound;
        
        var sx=xBound.getSize();
        var sz=zBound.getSize();
        
            // find the masking for the
            // ceilings below floors, skip
            // if level 0 (bottom floor)
        
        mask=[
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ];
        
        if (level!==0) {
            for (z=0;z!==5;z++) {
                for (x=0;x!==5;x++) {
                    xMaskBound=new wsBound((sx*(x*0.2)),(sx*((x+1)*0.2)));
                    xMaskBound.add(xBound.min);

                    zMaskBound=new wsBound((sz*(z*0.2)),(sz*((z+1)*0.2)));
                    zMaskBound.add(zBound.min);

                    mask[z][x]=(this.map.boxBoundCollision(xMaskBound,null,zMaskBound,this.meshWallIdx,this.map.MESH_FLAG_ROOM_WALL)===-1)?1:0;
                }
            }
        }
        
            // add the floor
            
        mesh=piece.createMeshFloorOrCeiling(this.map.getBitmapById(BITMAP_MOSAIC),xBound,yBound,zBound,true,mask,this.map.MESH_FLAG_ROOM_FLOOR);
        if (mesh!==null) this.map.addMesh(mesh);
        
            // find the masking for the
            // floors above ceilings, skip
            // if level 1 (top floor)
        
        mask=[
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ];
        
        if (level!==1) {
            for (z=0;z!==5;z++) {
                for (x=0;x!==5;x++) {
                    xMaskBound=new wsBound((sx*(x*0.2)),(sx*((x+1)*0.2)));
                    xMaskBound.add(xBound.min);

                    zMaskBound=new wsBound((sz*(z*0.2)),(sz*((z+1)*0.2)));
                    zMaskBound.add(zBound.min);

                    mask[z][x]=(this.map.boxBoundCollision(xMaskBound,null,zMaskBound,this.meshWallIdx,this.map.MESH_FLAG_ROOM_WALL)===-1)?1:0;
                }
            }
        }
        
            // add the ceiling
            
        var yCeilingBound=new wsBound((yBound.min-settings.roomFloorDepth),yBound.max);
          
        mesh=piece.createMeshFloorOrCeiling(this.map.getBitmapById(BITMAP_METAL),xBound,yCeilingBound,zBound,false,mask,this.map.MESH_FLAG_ROOM_CEILING);
        if (mesh!==null) this.map.addMesh(mesh);
    };

}
