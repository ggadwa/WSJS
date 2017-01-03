/* global map, config, MeshPrimitivesClass, genRandom, DEGREE_TO_RAD, MeshUtilityClass, mapRoomConstants */

"use strict";

//
// generate room equipment decoration class
//

class GenRoomDecorationEquipmentClass
{
    constructor()
    {
        this.PIPE_SIDE_COUNT=12;
        this.PIPE_CURVE_SEGMENT_COUNT=5;
        
        Object.seal(this);
    }
    
        //
        // pieces of pipes
        //

    addPipeStraightChunk(bitmap,pnt,len,radius,pipeAng)
    {
        let n,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let u1,u2,vfact;
        let ang,ang2,angAdd;
        let mesh,vertexList,indexes,iCount,vIdx;
        let nextPnt=new wsPoint(0,0,0);
        let addPnt=new wsPoint(0,0,0);
        
            // get turn pieces
        
        vertexList=MeshUtilityClass.createMapVertexList(this.PIPE_SIDE_COUNT*6);
        indexes=new Uint16Array(this.PIPE_SIDE_COUNT*6);

        iCount=this.PIPE_SIDE_COUNT*6;
        
        vIdx=0;
        
            // the end points
            
        nextPnt.setFromPoint(pnt);

        addPnt.setFromValues(0,len,0);
        addPnt.rotate(pipeAng);
        nextPnt.addPoint(addPnt);
        
            // the v factor
            
        vfact=len/radius;
        
            // cyliner faces

        ang=0.0;
        angAdd=360.0/this.PIPE_SIDE_COUNT;

        for (n=0;n!==this.PIPE_SIDE_COUNT;n++) {
            ang2=ang+angAdd;

                // the two Us

            u1=(ang*this.PIPE_SIDE_COUNT)/360.0;
            u2=(ang2*this.PIPE_SIDE_COUNT)/360.0;

                // force last segment to wrap

            if (n===(this.PIPE_SIDE_COUNT-1)) ang2=0.0;

            rd=ang*DEGREE_TO_RAD;
            tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            rd=ang2*DEGREE_TO_RAD;
            tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                // the points

            v=vertexList[vIdx++];
            v.position.setFromValues(tx,nextPnt.y,tz);
            v.position.rotateAroundPoint(nextPnt,pipeAng);
            v.normal.setFromSubPoint(v.position,nextPnt);
            v.normal.normalize();
            v.uv.setFromValues(u1,0.0);

            v=vertexList[vIdx++];
            v.position.setFromValues(tx2,nextPnt.y,tz2);
            v.position.rotateAroundPoint(nextPnt,pipeAng);
            v.normal.setFromSubPoint(v.position,nextPnt);
            v.normal.normalize();
            v.uv.setFromValues(u2,0.0);

            v=vertexList[vIdx++];
            v.position.setFromValues(bx,pnt.y,bz);
            v.position.rotateAroundPoint(pnt,pipeAng);
            v.normal.setFromSubPoint(v.position,pnt);
            v.normal.normalize();
            v.uv.setFromValues(u1,vfact);

            v=vertexList[vIdx++];
            v.position.setFromValues(tx2,nextPnt.y,tz2);
            v.position.rotateAroundPoint(nextPnt,pipeAng);
            v.normal.setFromSubPoint(v.position,nextPnt);
            v.normal.normalize();
            v.uv.setFromValues(u2,0.0);

            v=vertexList[vIdx++];
            v.position.setFromValues(bx2,pnt.y,bz2);
            v.position.rotateAroundPoint(pnt,pipeAng);
            v.normal.setFromSubPoint(v.position,pnt);
            v.normal.normalize();
            v.uv.setFromValues(u2,vfact);

            v=vertexList[vIdx++];
            v.position.setFromValues(bx,pnt.y,bz);
            v.position.rotateAroundPoint(pnt,pipeAng);
            v.normal.setFromSubPoint(v.position,pnt);
            v.normal.normalize();
            v.uv.setFromValues(u1,vfact);

            ang=ang2;
        }

        for (n=0;n!==iCount;n++) {
            indexes[n]=n;
        }
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        mesh=new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_DECORATION);
        mesh.simpleCollisionGeometry=true;
        
        map.addMesh(mesh);
    }

    addPipeCornerChunk(bitmap,pnt,radius,xStart,zStart,xTurn,zTurn,yFlip)
    {
        let n,k,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let yAdd,xTurnAdd,zTurnAdd;
        let u1,u2;
        let ang,ang2,angAdd;
        let mesh,vertexList,indexes,iCount,vIdx,iIdx;
        let pipeAng=new wsPoint(xStart,0,zStart);
        let nextPipeAng=new wsPoint(0,0,0);
        let nextPnt=new wsPoint(0,0,0);
        let addPnt=new wsPoint(0,0,0);
        
            // get turn pieces
        
        vertexList=MeshUtilityClass.createMapVertexList(this.PIPE_CURVE_SEGMENT_COUNT*(this.PIPE_SIDE_COUNT*6));
        indexes=new Uint16Array(this.PIPE_CURVE_SEGMENT_COUNT*(this.PIPE_SIDE_COUNT*6));

        iCount=this.PIPE_SIDE_COUNT*6;
        
        vIdx=0;
        iIdx=0;
        
            // turn segments
            
        yAdd=Math.trunc((radius*2)/this.PIPE_CURVE_SEGMENT_COUNT);
        if (yFlip) yAdd=-yAdd;
        
        xTurnAdd=xTurn/this.PIPE_CURVE_SEGMENT_COUNT;
        zTurnAdd=zTurn/this.PIPE_CURVE_SEGMENT_COUNT;
        
        angAdd=360.0/this.PIPE_SIDE_COUNT;
        
        for (k=0;k!==this.PIPE_CURVE_SEGMENT_COUNT;k++) {
            
            nextPnt.setFromPoint(pnt);
            
            addPnt.setFromValues(0,-yAdd,0);
            addPnt.rotate(pipeAng);
            nextPnt.addPoint(addPnt);
            
            nextPipeAng.setFromPoint(pipeAng);
            nextPipeAng.x+=xTurnAdd;
            nextPipeAng.z+=zTurnAdd;
            

                // cyliner faces

            ang=0.0;

            for (n=0;n!==this.PIPE_SIDE_COUNT;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*this.PIPE_SIDE_COUNT)/360.0;
                u2=(ang2*this.PIPE_SIDE_COUNT)/360.0;

                    // force last segment to wrap
                    
                if (n===(this.PIPE_SIDE_COUNT-1)) ang2=0.0;

                rd=ang*DEGREE_TO_RAD;
                tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                rd=ang2*DEGREE_TO_RAD;
                tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                    // the points
                
                v=vertexList[vIdx++];
                v.position.setFromValues(tx,nextPnt.y,tz);
                v.position.rotateAroundPoint(nextPnt,nextPipeAng);
                v.normal.setFromSubPoint(v.position,nextPnt);
                v.normal.normalize();
                v.uv.setFromValues(u1,0.0);
                
                v=vertexList[vIdx++];
                v.position.setFromValues(tx2,nextPnt.y,tz2);
                v.position.rotateAroundPoint(nextPnt,nextPipeAng);
                v.normal.setFromSubPoint(v.position,nextPnt);
                v.normal.normalize();
                v.uv.setFromValues(u2,0.0);
                
                v=vertexList[vIdx++];
                v.position.setFromValues(bx,pnt.y,bz);
                v.position.rotateAroundPoint(pnt,pipeAng);
                v.normal.setFromSubPoint(v.position,pnt);
                v.normal.normalize();
                v.uv.setFromValues(u1,1.0);
                
                v=vertexList[vIdx++];
                v.position.setFromValues(tx2,nextPnt.y,tz2);
                v.position.rotateAroundPoint(nextPnt,nextPipeAng);
                v.normal.setFromSubPoint(v.position,nextPnt);
                v.normal.normalize();
                v.uv.setFromValues(u2,0.0);
                
                v=vertexList[vIdx++];
                v.position.setFromValues(bx2,pnt.y,bz2);
                v.position.rotateAroundPoint(pnt,pipeAng);
                v.normal.setFromSubPoint(v.position,pnt);
                v.normal.normalize();
                v.uv.setFromValues(u2,1.0);
                
                v=vertexList[vIdx++];
                v.position.setFromValues(bx,pnt.y,bz);
                v.position.rotateAroundPoint(pnt,pipeAng);
                v.normal.setFromSubPoint(v.position,pnt);
                v.normal.normalize();
                v.uv.setFromValues(u1,1.0);
                
                ang=ang2;
            }

            for (n=0;n!==iCount;n++) {
                indexes[iIdx+n]=iIdx+n;
            }
            
            iIdx+=iCount;
            
            pnt.setFromPoint(nextPnt);
            pipeAng.setFromPoint(nextPipeAng);
        }
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        mesh=new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_DECORATION);
        mesh.simpleCollisionGeometry=true;
        
        map.addMesh(mesh);
    }
    
        //
        // pipe types
        //
    
    addPipeSide(room,bitmap,dir,pnt,radius,dirLen,yBound)
    {
        let len,pipeAng;
        
            // pipes always start up
            // length of up has to be a multiple of story size
            
        pipeAng=new wsPoint(0,0,180.0);     // force len to point up
        
        len=genRandom.randomInt(1,(room.storyCount-1));
        len=(len*(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH))-((radius*2)+map.ROOM_FLOOR_DEPTH);
        
        this.addPipeStraightChunk(bitmap,pnt,len,radius,pipeAng);
        
        pnt.y-=len;
        
            // the turn and exit
            
        switch (dir) {
            
            case mapRoomConstants.ROOM_SIDE_LEFT:  
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,0.0,-90.0,false);

                pipeAng.setFromValues(0.0,0.0,90.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.x-=dirLen;
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,-90.0,0.0,90.0,false);
                break;
                
            case mapRoomConstants.ROOM_SIDE_RIGHT:
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,0.0,90.0,false);

                pipeAng.setFromValues(0.0,0.0,-90.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.x+=dirLen;
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,90.0,0.0,-90.0,false);
                break;
                
            case mapRoomConstants.ROOM_SIDE_TOP:
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,90.0,0.0,false);

                pipeAng.setFromValues(-90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.z-=dirLen;
                this.addPipeCornerChunk(bitmap,pnt,radius,90.0,0.0,-90.0,0.0,false);
                break;
                
            case mapRoomConstants.ROOM_SIDE_BOTTOM:
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,-90.0,0.0,false);

                pipeAng.setFromValues(90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.z+=dirLen;
                this.addPipeCornerChunk(bitmap,pnt,radius,-90.0,0.0,90.0,0.0,false);
                break;
        }
        
            // final up section of pipe
        
        len=(pnt.y-yBound.min)+map.ROOM_FLOOR_DEPTH;
        
        if (len>0) {
            pipeAng=new wsPoint(0,0,180.0);     // force len to point up
            this.addPipeStraightChunk(bitmap,pnt,len,radius,pipeAng);
        }
    }
    
    addPipeUp(room,bitmap,pnt,radius,yBound)
    {
        let pipeAng;
        
        pipeAng=new wsPoint(0,0,180.0);     // force len to point up
        this.addPipeStraightChunk(bitmap,pnt,(pnt.y-yBound.min),radius,pipeAng);
    }
        
    addPipeDown(room,bitmap,x,z,pnt,radius,yBound)
    {
        let pipeAng=new wsPoint(0,0,0);
        
        if (x===0) {
            
                // to left
                
            if (z===0) {
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,0.0,-90.0,false);
                
                pipeAng.setFromValues(0.0,0.0,90.0);
                this.addPipeStraightChunk(bitmap,pnt,radius,radius,pipeAng);
                
                pnt.x-=radius;
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,90.0,0.0,-90.0,true);
            }
            
                // to bottom
                
            else {
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,-90.0,0.0,false);
                
                pipeAng.setFromValues(90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,radius,radius,pipeAng);
                
                pnt.z+=radius;
                this.addPipeCornerChunk(bitmap,pnt,radius,90.0,0.0,-90.0,0.0,true);
            }
        }
        else {
            
                // to top
                
            if (z===0) {
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,90.0,0.0,false);
                
                pipeAng.setFromValues(-90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,radius,radius,pipeAng);
                
                pnt.z-=radius;
                this.addPipeCornerChunk(bitmap,pnt,radius,-90.0,0.0,90.0,0.0,true);
            }
            
                // to right
                
            else {
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,0.0,0.0,90.0,false);
                
                pipeAng.setFromValues(0.0,0.0,-90.0);
                this.addPipeStraightChunk(bitmap,pnt,radius,radius,pipeAng);
                
                pnt.x+=radius;
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,-90.0,0.0,90.0,true);
            }
        }
        
            // finally down to ground
            
        pipeAng.setFromValues(0.0,0.0,0.0);
        this.addPipeStraightChunk(bitmap,pnt,(yBound.max-pnt.y),radius,pipeAng);
    }
        
        //
        // pipes
        //
        
    addPipes(room)
    {
        let x,z,sx,sz,pos,yBound,platformBoundX,platformBoundY,platformBoundZ;
        let gridSize,radius,wid;
        let platformBitmap,pipeBitmap;
        let pnt,dir,dirLen;
        
            // the pipes location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // get # of pipes (on a grid so they can collide
            // properly) and their relative sizes
            
        gridSize=Math.trunc(map.ROOM_BLOCK_WIDTH/2);
        radius=Math.trunc(gridSize*0.3);
        
            // the pipe platform
        
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBoundByCoordinate(pos);
        
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));
        
        platformBoundY=new wsBound((yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        
            // determine direction
        
        dir=room.getDirectionTowardsNearestWall(pos);
        
        dirLen=dir.len-Math.trunc((map.ROOM_BLOCK_WIDTH*0.5)+(radius*2));
        if (dirLen<0) dirLen=100;
        
            // create the pipes
            
        sx=(pos.x-Math.trunc(map.ROOM_BLOCK_WIDTH*0.5))+Math.trunc(gridSize*0.5);
        sz=(pos.z-Math.trunc(map.ROOM_BLOCK_WIDTH*0.5))+Math.trunc(gridSize*0.5);
        
        pnt=new wsPoint(0,0,0);

        for (z=0;z!==2;z++) {
            for (x=0;x!==2;x++) {
                pnt.x=sx+(x*gridSize);
                pnt.y=yBound.max-map.ROOM_FLOOR_DEPTH;
                pnt.z=sz+(z*gridSize);
                
                switch (genRandom.randomIndex(4)) {
                    case 0:
                        this.addPipeSide(room,pipeBitmap,dir.direction,pnt,radius,dirLen,yBound);
                        break;
                    case 1:
                        this.addPipeUp(room,pipeBitmap,pnt,radius,yBound);
                        break;
                    case 2:
                        this.addPipeDown(room,pipeBitmap,x,z,pnt,radius,yBound);
                        break;
                }
            }
        }
    }
    
        //
        // machine decorations mainline
        //

    create(room)
    {
        let n,pieceCount;
        
        pieceCount=Math.trunc(room.getDecorationCount()*0.7);       // supergumba -- we need to calculate this better

        for (n=0;n!==pieceCount;n++) {
            this.addPipes(room);
        }
    }

}
