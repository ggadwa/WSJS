/* global map, config, MeshPrimitivesClass, MESH_FLAG_DECORATION, genRandom, DEGREE_TO_RAD, MeshUtilityClass, ROOM_SIDE_LEFT, ROOM_SIDE_RIGHT, ROOM_SIDE_TOP, ROOM_SIDE_BOTTOM */

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
        // single pipe
        //

    addPipeStraightChunk(bitmap,pnt,len,radius,pipeAng)
    {
        let n,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let u1,u2;
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
            v.uv.setFromValues(u1,1.0);

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
            indexes[n]=n;
        }
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        mesh=new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_DECORATION);
        mesh.simpleCollisionGeometry=true;
        
        map.addMesh(mesh);
    }

    addPipeCornerChunk(bitmap,pnt,radius,xTurn,zTurn)
    {
        let n,k,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let yAdd,xTurnAdd,zTurnAdd;
        let u1,u2;
        let ang,ang2,angAdd;
        let mesh,vertexList,indexes,iCount,vIdx,iIdx;
        let pipeAng=new wsPoint(0,0,0);
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

        mesh=new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_DECORATION);
        mesh.simpleCollisionGeometry=true;
        
        map.addMesh(mesh);
    }
        
    addPipe(bitmap,dir,pnt,radius,dirLen,yBound)
    {
        let len,pipeAng;
        
            // pipes always start up
            
        pipeAng=new wsPoint(0,0,180.0);     // force len to point up
        len=genRandom.randomInt(config.ROOM_FLOOR_DEPTH,(yBound.getSize()-(config.ROOM_FLOOR_DEPTH+(radius*2))));
        this.addPipeStraightChunk(bitmap,pnt,len,radius,pipeAng);
        
        pnt.y-=len;
        
            // the turn and exit
            
        switch (dir) {
            
            case ROOM_SIDE_LEFT:  
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,-90.0);

                pipeAng.setFromValues(0.0,0.0,90.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.x-=dirLen;
                //this.addPipeCornerChunk(bitmap,pnt,radius,0.0,90.0);
                break;
                
            case ROOM_SIDE_RIGHT:
                this.addPipeCornerChunk(bitmap,pnt,radius,0.0,90.0);

                pipeAng.setFromValues(0.0,0.0,-90.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.x+=dirLen;
                //this.addPipeCornerChunk(bitmap,pnt,radius,0.0,-90.0);
                break;
                
            case ROOM_SIDE_TOP:
                this.addPipeCornerChunk(bitmap,pnt,radius,90.0,0.0);

                pipeAng.setFromValues(-90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.z-=dirLen;
                //this.addPipeCornerChunk(bitmap,pnt,radius,-90.0,0.0);
                break;
                
            case ROOM_SIDE_BOTTOM:
                this.addPipeCornerChunk(bitmap,pnt,radius,-90.0,0.0);

                pipeAng.setFromValues(90.0,0.0,0.0);
                this.addPipeStraightChunk(bitmap,pnt,dirLen,radius,pipeAng);
                
                pnt.z+=dirLen;
                //this.addPipeCornerChunk(bitmap,pnt,radius,90.0,0.0);
                break;
        }
        
    }
        
        //
        // pipes
        //
        
    addPipes(room)
    {
        let n,pos,yBound,platformBoundX,platformBoundY,platformBoundZ,pipeBoundY;
        let nPipe,pipeWid,radius,wid;
        let ang,angAdd,rd;
        let platformBitmap,pipeBitmap;
        let centerPt,dir,dirLen,distLft,distRgt,distTop,distBot;
        
            // the pipes location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        pipeWid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.25);
        radius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the pipe platform
        
        yBound=room.getGruondFloorSpawnToFirstPlatformOrTopBoundByCoordinate(pos);
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));
        
        platformBoundY=new wsBound((yBound.max-config.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

        pipeBoundY=new wsBound((yBound.min+config.ROOM_FLOOR_DEPTH),(yBound.max-config.ROOM_FLOOR_DEPTH));
        
            // determine direction
            
        distLft=pos.x-room.xBound.min;
        distRgt=room.xBound.max-pos.x;
        distTop=pos.z-room.zBound.min;
        distBot=room.zBound.max-pos.z;
        
        if ((distLft<distRgt) && (distLft<distTop) && (distLft<distBot)) {
            dir=ROOM_SIDE_LEFT;
            dirLen=distLft;
        }
        else {
            if ((distRgt<distTop) && (distRgt<distBot)) {
                dir=ROOM_SIDE_RIGHT;
                dirLen=distRgt;
            }
            else {
                if (distTop<distBot) {
                    dir=ROOM_SIDE_TOP;
                    dirLen=distTop;
                }
                else {
                    dir=ROOM_SIDE_BOTTOM;
                    dirLen=distBot;
                }
            }
        }
        
        dirLen-=Math.trunc((config.ROOM_BLOCK_WIDTH*0.5)+radius);
        if (dirLen<0) dirLen=100;
        
            // create the pipes
            
        nPipe=genRandom.randomInt(2,5);

        centerPt=new wsPoint(0,0,0);

        ang=0.0;
        angAdd=360.0/nPipe;

        for (n=0;n!==nPipe;n++) {
            rd=ang*DEGREE_TO_RAD;
            centerPt.x=pos.x+((pipeWid*Math.sin(rd))+(pipeWid*Math.cos(rd)));
            centerPt.y=pipeBoundY.max;
            centerPt.z=pos.z+((pipeWid*Math.cos(rd))-(pipeWid*Math.sin(rd)));

            this.addPipe(pipeBitmap,dir,centerPt,radius,dirLen,pipeBoundY);

            ang+=angAdd;
        }
    }
    
        //
        // machine decorations mainline
        //

    create(room)
    {
        let n,pieceCount;
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            this.addPipes(room);
        }
    }

}
