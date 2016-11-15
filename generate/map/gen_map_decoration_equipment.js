/* global map, config, MeshPrimitivesClass, MESH_FLAG_DECORATION, genRandom, DEGREE_TO_RAD */

"use strict";

//
// generate room equipment decoration class
//

class GenRoomDecorationEquipmentClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // single pipe
        //
        
    addPipe(room,bitmap,pnt,radius,yBound)
    {
        var n,k,t,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        var u1,u2;
        var pipeAng=new wsPoint(0,0,0);
        var nextPnt=new wsPoint(0,0,0);
        
            // get cylinder pieces
        
        var sideCount=12;
        var segCount=5;
        
        var vertexList=MeshUtilityClass.createMapVertexList(segCount*(sideCount*6));
        var indexes=new Uint16Array(segCount*(sideCount*6));

        var iCount=sideCount*6;
        
        var vIdx=0;
        var iIdx=0;
        
            // cylinder segments
            
        var yAdd=Math.trunc(yBound.getSize()/segCount);
            
        var ySegBound=yBound.copy();
        ySegBound.min=ySegBound.max-yAdd;
        
        for (k=0;k!==segCount;k++) {
            
            nextPnt.setFromPoint(pnt);
            pnt.y-=1000;
            nextPnt.rotateAroundPoint(pnt,pipeAng);
            
            pipeAng.x=genRandom.randomInt(0,50);
            pipeAng.z=genRandom.randomInt(0,50);

                // cyliner faces

            var ang=0.0;
            var ang2;
            var angAdd=360.0/sideCount;

            for (n=0;n!==sideCount;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*segCount)/360.0;
                u2=(ang2*segCount)/360.0;

                    // force last segment to wrap
                    
                if (n===(sideCount-1)) ang2=0.0;

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
                
                v=vertexList[vIdx];
                v.position.setFromValues(tx,ySegBound.min,tz);
                v.uv.setFromValues(u1,0.0);
                
                v=vertexList[vIdx+1];
                v.position.setFromValues(tx2,ySegBound.min,tz2);
                v.uv.setFromValues(u2,0.0);
                
                v=vertexList[vIdx+2];
                v.position.setFromValues(bx,ySegBound.max,bz);
                v.uv.setFromValues(u1,1.0);
                
                v=vertexList[vIdx+3];
                v.position.setFromValues(tx2,ySegBound.min,tz2);
                v.uv.setFromValues(u2,0.0);
                
                v=vertexList[vIdx+4];
                v.position.setFromValues(bx2,ySegBound.max,bz2);
                v.uv.setFromValues(u2,1.0);
                
                v=vertexList[vIdx+5];
                v.position.setFromValues(bx,ySegBound.max,bz);
                v.uv.setFromValues(u1,1.0);
                
                    // the normals
                    
                for (t=0;t!==6;t++) {
                    v=vertexList[vIdx++];
                    v.normal.setFromSubPoint(v.position,pnt);       // supergumba -- this needs to be rewritten
                    v.normal.y=0.0;
                    v.normal.normalize();
                }
                
                ang=ang2;
            }

            for (n=0;n!==iCount;n++) {
                indexes[iIdx+n]=iIdx+n;
            }
            
            iIdx+=iCount;
            
            ySegBound.max=ySegBound.min;
            ySegBound.min-=yAdd;
            
            pnt.setFromPoint(nextPnt);
        }
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        var mesh=new MapMeshClass(bitmap,vertexList,indexes,MESH_FLAG_DECORATION);
        //mesh.simpleCollisionGeometry=true;
        
        return(mesh);
    }
        
        //
        // pipes
        //
        
    addPipes(room)
    {
        var n,pos,yBound,platformBoundX,platformBoundY,platformBoundZ,pipeBoundY;
        var nPipe,pipeWid,radius,wid;
        var ang,angAdd,rd;
        var platformBitmap,pipeBitmap;
        var centerPt;
        
            // the pipes location

        pos=room.findAndBlockSpawnPosition(true);
        if (pos===null) return;
        
        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        pipeBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the pipe platforms
        
        yBound=room.getGruondFloorSpawnToFirstPlatformOrTopBoundByCoordinate(pos);
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.5);

        platformBoundX=new wsBound((pos.x-wid),(pos.x+wid));
        platformBoundZ=new wsBound((pos.z-wid),(pos.z+wid));

        //platformBoundY=new wsBound(yBound.min,(yBound.min+config.ROOM_FLOOR_DEPTH));
        //map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,false,true,false,MESH_FLAG_DECORATION));
        
        platformBoundY=new wsBound((yBound.max-config.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,platformBoundX,platformBoundY,platformBoundZ,null,false,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));

        pipeBoundY=new wsBound((yBound.min+config.ROOM_FLOOR_DEPTH),(yBound.max-config.ROOM_FLOOR_DEPTH));
        
            // create the pipes
            
        nPipe=genRandom.randomInt(2,5);

        centerPt=new wsPoint(0,0,0);

        ang=0.0;
        angAdd=360.0/nPipe;

        pipeWid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.25);
        radius=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);

        for (n=0;n!==nPipe;n++) {
            rd=ang*DEGREE_TO_RAD;
            centerPt.x=pos.x+((pipeWid*Math.sin(rd))+(pipeWid*Math.cos(rd)));
            centerPt.z=pos.z+((pipeWid*Math.cos(rd))-(pipeWid*Math.sin(rd)));

            map.addMesh(this.addPipe(room,pipeBitmap,centerPt,radius,pipeBoundY));
            //map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(pipeBitmap,centerPt,pipeBoundY,radius,MESH_FLAG_DECORATION));

            ang+=angAdd;
        }
    }
    
        //
        // machine decorations mainline
        //

    create(room)
    {
        var n,pieceCount;
        
        pieceCount=room.getDecorationCount();

        for (n=0;n!==pieceCount;n++) {
            this.addPipes(room);
        }
    }

}
