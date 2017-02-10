/* global config, genRandom, map, MeshPrimitivesClass, mapRoomConstants */

"use strict";

//
// generate room cubical decoration class
//

class GenRoomDecorationCubicalClass
{
    constructor()
    {
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
            
        if ((skipWall===mapRoomConstants.ROOM_SIDE_LEFT) || (skipWall===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            skipIdx=rect.top+genRandom.randomIndex(rect.bot-rect.top);
        }
        else {
            skipIdx=rect.lft+genRandom.randomIndex(rect.rgt-rect.lft);
        }
        
            // left and right walls
            
        for (n=rect.top;n<rect.bot;n++) {
            dz=room.zBound.min+(n*map.ROOM_BLOCK_WIDTH);
            zBound=new wsBound(dz,(dz+map.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_LEFT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.lft*map.ROOM_BLOCK_WIDTH);
                xBound=new wsBound(dx,(dx+wid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,dx,(dz+map.ROOM_BLOCK_WIDTH));
            }
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_RIGHT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.rgt*map.ROOM_BLOCK_WIDTH);
                xBound=new wsBound((dx-wid),dx);
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,dx,(dz+map.ROOM_BLOCK_WIDTH));
            }
        }
            
            // top and bottom walls
            
        for (n=rect.lft;n<rect.rgt;n++) {
            dx=room.xBound.min+(n*map.ROOM_BLOCK_WIDTH);
            xBound=new wsBound(dx,(dx+map.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_TOP) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.top*map.ROOM_BLOCK_WIDTH);
                zBound=new wsBound(dz,(dz+wid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,(dx+map.ROOM_BLOCK_WIDTH),dz);
            }
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_BOTTOM) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.bot*map.ROOM_BLOCK_WIDTH);
                zBound=new wsBound((dz-wid),dz);
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,(dx+map.ROOM_BLOCK_WIDTH),dz);
            }
        }
            
    }
    
        //
        // build array of random cubicals
        //
        
    createRandomCubicals(room)
    {
        let x,z,x2,z2,hit;
        let wid,high,startWid,startHigh;
        let xBlockStart,xBlockEnd,zBlockStart,zBlockEnd;
        let xSize=room.xBlockSize-2;
        let zSize=room.zBlockSize-2;
        let cubes=[];

            // create a grid to
            // build cubicals in
            // typed arrays initialize to 0

        let grid=new Uint16Array(xSize*zSize);

            // start making the cubicals

        while (true) {

                // find first open spot

            x=z=0;
            hit=false;

            while (true) {
                if (grid[(z*xSize)+x]===0) {
                    hit=true;
                    break;
                }
                x++;
                if (x===xSize) {
                    x=0;
                    z++;
                    if (z===zSize) break;
                }
            }

                // no more open spots!

            if (!hit) break;

                // random size

            startWid=genRandom.randomIndex(xSize-x);
            startHigh=genRandom.randomIndex(zSize-z);

                // determine what can fit

            wid=1;

            while (wid<startWid) {
                if (grid[(z*xSize)+(x+wid)]!==0) break;
                wid++;
            }

            high=1;

            while (high<startHigh) {
                if (grid[((z+high)*xSize)+x]!==0) break;
                high++;
            }

                // create the cubical which is always
                // 1 over because we are leaving a gutter
                // for the doors

            cubes.push(new wsRect((x+1),(z+1),((x+1)+wid),((z+1)+high)));
            
                // always block off +1 so there's a corridor
                // in between
            
            xBlockStart=(x===0)?0:(x-1);
            
            xBlockEnd=(x+1)+wid;
            if (xBlockEnd>xSize) xBlockEnd=xSize;
            
            zBlockStart=(z===0)?0:(z-1);
            
            zBlockEnd=(z+1)+high;
            if (zBlockEnd>zSize) zBlockEnd=zSize;
                
            for (z2=zBlockStart;z2<zBlockEnd;z2++) {
                for (x2=xBlockStart;x2<xBlockEnd;x2++) {
                    grid[(z2*xSize)+x2]=1;
                }
            }
        }

        return(cubes);
    }

    
        //
        // cubical decorations mainline
        //

    create(room)
    {
        let wid,yBound;
        let bitmap;
        let n,cubes;
        
            // the cubes
            
        cubes=this.createRandomCubicals(room);
        
            // get width and height
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),room.yBound.max);
        
            // wall bitmap
            
        bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
            // create cubical walls
        
        for (n=0;n!==cubes.length;n++) {
                        
            if (genRandom.randomPercentage(0.5)) {
                yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),room.yBound.max);
            }
            else {
                yBound=new wsBound((room.yBound.max-((room.storyCount-1)*map.ROOM_FLOOR_HEIGHT)),room.yBound.max);
            }
            
            this.addCubicalWall(room,bitmap,cubes[n],wid,yBound);
        }
    }

}
