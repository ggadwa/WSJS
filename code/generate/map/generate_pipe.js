import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate pipe decorations
//

export default class GeneratePipeClass 
{
    static PIPE_SIDE_COUNT=12;
    static PIPE_CURVE_SEGMENT_COUNT=5;
    
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // pieces of pipes
        //

    static addPipeStraightChunk(core,room,name,bitmap,pnt,len,radius,pipeAng)
    {
        let n,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let u1,u2,vfact;
        let ang,ang2,angAdd;
        let mesh,iIdx;
        let vPnt=new PointClass(0,0,0);
        let nextPnt=new PointClass(0,0,0);
        let addPnt=new PointClass(0,0,0);
        let normal=new PointClass(0,0,0);
        let vertexArray=[];
        let normalArray=[];
        let uvArray=[];
        let tangentArray;
        let indexArray=[];
        
            // the end points
            
        nextPnt.setFromPoint(pnt);

        addPnt.setFromValues(0,len,0);
        addPnt.rotate(pipeAng);
        nextPnt.addPoint(addPnt);
        
            // the v factor
            
        vfact=len/radius;
        
            // cyliner faces

        iIdx=0;
        
        ang=0.0;
        angAdd=360.0/GeneratePipeClass.PIPE_SIDE_COUNT;

        for (n=0;n!==GeneratePipeClass.PIPE_SIDE_COUNT;n++) {
            ang2=ang+angAdd;

                // the two Us

            u1=(ang*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;
            u2=(ang2*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;

                // force last segment to wrap

            if (n===(GeneratePipeClass.PIPE_SIDE_COUNT-1)) ang2=0.0;

            rd=ang*PointClass.DEGREE_TO_RAD;
            tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            rd=ang2*PointClass.DEGREE_TO_RAD;
            tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                // the points

            vPnt.setFromValues(tx,nextPnt.y,tz);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(tx2,nextPnt.y,tz2);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx,pnt.y,bz);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,vfact);
            indexArray.push(iIdx++);

            vPnt.setFromValues(tx2,nextPnt.y,tz2);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx2,pnt.y,bz2);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,vfact);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx,pnt.y,bz);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,vfact);
            indexArray.push(iIdx++);

            ang=ang2;
        }
        
            // finally create the mesh

        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        mesh.simpleCollisions=true;
        core.map.meshList.add(mesh);
    }

    static addPipeCornerChunk(core,room,name,bitmap,pnt,radius,xStart,zStart,xTurn,zTurn,yFlip)
    {
        let n,k,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let yAdd,xTurnAdd,zTurnAdd;
        let u1,u2;
        let ang,ang2,angAdd;
        let mesh,iIdx;
        let pipeAng=new PointClass(xStart,0,zStart);
        let nextPipeAng=new PointClass(0,0,0);
        let vPnt=new PointClass(0,0,0);
        let nextPnt=new PointClass(0,0,0);
        let addPnt=new PointClass(0,0,0);
        let normal=new PointClass(0,0,0);
        let vertexArray=[];
        let normalArray=[];
        let uvArray=[];
        let tangentArray;
        let indexArray=[];
        
        iIdx=0;
        
            // turn segments
            
        yAdd=Math.trunc((radius*2)/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT);
        if (yFlip) yAdd=-yAdd;
        
        xTurnAdd=xTurn/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;
        zTurnAdd=zTurn/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;
        
        angAdd=360.0/GeneratePipeClass.PIPE_SIDE_COUNT;
        
        for (k=0;k!==GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;k++) {
            
            nextPnt.setFromPoint(pnt);
            
            addPnt.setFromValues(0,-yAdd,0);
            addPnt.rotate(pipeAng);
            nextPnt.addPoint(addPnt);
            
            nextPipeAng.setFromPoint(pipeAng);
            nextPipeAng.x+=xTurnAdd;
            nextPipeAng.z+=zTurnAdd;
            

                // cyliner faces

            ang=0.0;

            for (n=0;n!==GeneratePipeClass.PIPE_SIDE_COUNT;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;
                u2=(ang2*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;

                    // force last segment to wrap
                    
                if (n===(GeneratePipeClass.PIPE_SIDE_COUNT-1)) ang2=0.0;

                rd=ang*PointClass.DEGREE_TO_RAD;
                tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                rd=ang2*PointClass.DEGREE_TO_RAD;
                tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                    // the points
                
                vPnt.setFromValues(tx,nextPnt.y,tz);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(tx2,nextPnt.y,tz2);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx,pnt.y,bz);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(tx2,nextPnt.y,tz2);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx2,pnt.y,bz2);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,1.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx,pnt.y,bz);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                ang=ang2;
            }
            
            pnt.setFromPoint(nextPnt);
            pipeAng.setFromPoint(nextPipeAng);
        }
        
            // finally create the mesh

        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        mesh.simpleCollisions=true;
        core.map.meshList.add(mesh);
    }
/*    
        //
        // pipe types
        //
    
    addPipeSide(room,dir,pnt,radius,dirLen,yBound)
    {
        let len,pipeAng;
        
            // pipes always start up
            // length of up has to be a multiple of story size
            
        pipeAng=new PointClass(0,0,180.0);     // force len to point up
        
        len=genRandom.randomInt(1,(room.storyCount-1));
        len=(len*(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH))-((radius*2)+constants.ROOM_FLOOR_DEPTH);
        
        this.addPipeStraightChunk(pnt,len,radius,pipeAng);
        
        pnt.y-=len;
        
            // the turn and exit
            
        switch (dir) {
            
            case constants.ROOM_SIDE_LEFT:  
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,0.0,-90.0,false);

                pipeAng.setFromValues(0.0,0.0,90.0);
                this.addPipeStraightChunk(pnt,dirLen,radius,pipeAng);
                
                pnt.x-=dirLen;
                this.addPipeCornerChunk(pnt,radius,0.0,-90.0,0.0,90.0,false);
                break;
                
            case constants.ROOM_SIDE_RIGHT:
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,0.0,90.0,false);

                pipeAng.setFromValues(0.0,0.0,-90.0);
                this.addPipeStraightChunk(pnt,dirLen,radius,pipeAng);
                
                pnt.x+=dirLen;
                this.addPipeCornerChunk(pnt,radius,0.0,90.0,0.0,-90.0,false);
                break;
                
            case constants.ROOM_SIDE_TOP:
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,90.0,0.0,false);

                pipeAng.setFromValues(-90.0,0.0,0.0);
                this.addPipeStraightChunk(pnt,dirLen,radius,pipeAng);
                
                pnt.z-=dirLen;
                this.addPipeCornerChunk(pnt,radius,90.0,0.0,-90.0,0.0,false);
                break;
                
            case constants.ROOM_SIDE_BOTTOM:
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,-90.0,0.0,false);

                pipeAng.setFromValues(90.0,0.0,0.0);
                this.addPipeStraightChunk(pnt,dirLen,radius,pipeAng);
                
                pnt.z+=dirLen;
                this.addPipeCornerChunk(pnt,radius,-90.0,0.0,90.0,0.0,false);
                break;
        }
        
            // final up section of pipe
        
        len=(pnt.y-yBound.min)+constants.ROOM_FLOOR_DEPTH;
        
        if (len>0) {
            pipeAng=new PointClass(0,0,180.0);     // force len to point up
            this.addPipeStraightChunk(pnt,len,radius,pipeAng);
        }
    }
    
    addPipeUp(room,pnt,radius,yBound)
    {
        let pipeAng;
        
        pipeAng=new PointClass(0,0,180.0);     // force len to point up
        this.addPipeStraightChunk(pnt,(pnt.y-yBound.min),radius,pipeAng);
    }
        
    addPipeDown(room,x,z,pnt,radius,yBound)
    {
        let pipeAng=new PointClass(0,0,0);
        
        if (x===0) {
            
                // to left
                
            if (z===0) {
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,0.0,-90.0,false);
                
                pipeAng.setFromValues(0.0,0.0,90.0);
                this.addPipeStraightChunk(pnt,radius,radius,pipeAng);
                
                pnt.x-=radius;
                this.addPipeCornerChunk(pnt,radius,0.0,90.0,0.0,-90.0,true);
            }
            
                // to bottom
                
            else {
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,-90.0,0.0,false);
                
                pipeAng.setFromValues(90.0,0.0,0.0);
                this.addPipeStraightChunk(pnt,radius,radius,pipeAng);
                
                pnt.z+=radius;
                this.addPipeCornerChunk(pnt,radius,90.0,0.0,-90.0,0.0,true);
            }
        }
        else {
            
                // to top
                
            if (z===0) {
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,90.0,0.0,false);
                
                pipeAng.setFromValues(-90.0,0.0,0.0);
                this.addPipeStraightChunk(pnt,radius,radius,pipeAng);
                
                pnt.z-=radius;
                this.addPipeCornerChunk(pnt,radius,-90.0,0.0,90.0,0.0,true);
            }
            
                // to right
                
            else {
                this.addPipeCornerChunk(pnt,radius,0.0,0.0,0.0,90.0,false);
                
                pipeAng.setFromValues(0.0,0.0,-90.0);
                this.addPipeStraightChunk(pnt,radius,radius,pipeAng);
                
                pnt.x+=radius;
                this.addPipeCornerChunk(pnt,radius,0.0,-90.0,0.0,90.0,true);
            }
        }
        
            // finally down to ground
            
        pipeAng.setFromValues(0.0,0.0,0.0);
        this.addPipeStraightChunk(pnt,(yBound.max-pnt.y),radius,pipeAng);
    }
        
        //
        // pipes
        //
        
    addPipeSet(room,x,z)
    {
        let px,pz,sx,sz,yBound,platformBoundX,platformBoundY,platformBoundZ;
        let gridSize,radius;
        let pnt,dir,dirLen;
        
            // get # of pipes (on a grid so they can collide
            // properly) and their relative sizes
            
        gridSize=Math.trunc(constants.ROOM_BLOCK_WIDTH/2);
        radius=Math.trunc(gridSize*0.3);
        
            // the pipe platform
        
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBoundByCoordinate(x,z);
        
        x=room.xBound.min+(x*constants.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(z*constants.ROOM_BLOCK_WIDTH);
        
        platformBoundX=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
        platformBoundZ=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));
        
        platformBoundY=new BoundClass((yBound.max-constants.ROOM_FLOOR_DEPTH),room.yBound.max);
        this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,platformBoundX,platformBoundY,platformBoundZ,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));
        
            // determine direction
        
        dir=room.getDirectionTowardsNearestWall(x,z);
        
        dirLen=dir.len-Math.trunc((constants.ROOM_BLOCK_WIDTH*0.5)+(radius*2));
        if (dirLen<0) dirLen=100;
        
            // create the pipes
            
        sx=x+Math.trunc(gridSize*0.5);
        sz=z+Math.trunc(gridSize*0.5);
        
        pnt=new PointClass(0,0,0);

        for (pz=0;pz!==2;pz++) {
            for (px=0;px!==2;px++) {
                pnt.x=sx+(px*gridSize);
                pnt.y=yBound.max-constants.ROOM_FLOOR_DEPTH;
                pnt.z=sz+(pz*gridSize);
                
                switch (genRandom.randomIndex(4)) {
                    case 0:
                        this.addPipeSide(room,dir.direction,pnt,radius,dirLen,yBound);
                        break;
                    case 1:
                        this.addPipeUp(room,pnt,radius,yBound);
                        break;
                    case 2:
                        this.addPipeDown(room,px,pz,pnt,radius,yBound);
                        break;
                }
            }
        }
    }
*/    
        //
        // build room pipe
        //

    static buildRoomPipes(core,room,name,pipeBitmap,segmentSize)
    {
        let n,pipeCount,pipeRadius;
        let x,z,xOff,zOff,lx,rx,tz,bz;
        let pnt,pipeAng,my,high;
        
            // available places for pipes
            
        lx=room.piece.margins[0];
        rx=room.piece.size.x-room.piece.margins[2];
        tz=room.piece.margins[1];
        bz=room.piece.size.z-room.piece.margins[3];
        
        pipeRadius=GenerateUtilityClass.randomInt(Math.trunc(segmentSize*0.15),Math.trunc(segmentSize*0.15));
        xOff=room.offset.x+Math.trunc((segmentSize-(pipeRadius*2))*0.5);
        zOff=room.offset.z+Math.trunc((segmentSize-(pipeRadius*2))*0.5);
        
            // pipe count
            
        pipeCount=GenerateUtilityClass.randomInt(1,3);
        
        for (n=0;n!==pipeCount;n++) {
            
                // start point
                
            x=GenerateUtilityClass.randomInBetween(lx,rx);
            z=GenerateUtilityClass.randomInBetween(tz,bz);
            
                // the split
                
            high=room.storyCount*segmentSize;
            my=(high*GenerateUtilityClass.randomFloat(0.2,0.6))+pipeRadius;
           
                // the top part
                
            pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+(room.storyCount*segmentSize)),(zOff+(z*segmentSize)));
            pipeAng=new PointClass(0,0,180.0);     // force len to point down
            this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((high-my)-pipeRadius),pipeRadius,pipeAng);
            
                // the cross over
                
            
            
            pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)+Math.trunc(pipeRadius*1.5)),(zOff+(z*segmentSize)));
            this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,0.0,90.0,false);
            
            pnt=new PointClass((xOff+(x*segmentSize)+pipeRadius),(room.offset.y+my),(zOff+(z*segmentSize)));
            pipeAng=new PointClass(0,0,270.0);
            this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((segmentSize*5)-(pipeRadius*2)),pipeRadius,pipeAng);
            
                // finish
                
            x+=5;

            pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)-Math.trunc(pipeRadius*1.5)),(zOff+(z*segmentSize)));
            this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,0.0,90.0,true);
            
            pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)-pipeRadius),(zOff+(z*segmentSize)));
            pipeAng=new PointClass(0,0,180.0);     // force len to point down
            this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,my,pipeRadius,pipeAng);
            

        }
    }

}
