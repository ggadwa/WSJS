import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';

//
// generate pipe decorations
//

export default class GeneratePipeClass 
{
    constructor(core,room,name,genMesh,pipeBitmap,segmentSize)
    {
        this.PIPE_SIDE_COUNT=12;
        this.PIPE_CURVE_SEGMENT_COUNT=5;
        
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.pipeBitmap=pipeBitmap;
        this.segmentSize=segmentSize;

        Object.seal(this);
    }
    
        //
        // pieces of pipes
        //

    addPipeStraightChunk(pnt,len,radius,pipeAng)
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
        angAdd=360.0/this.PIPE_SIDE_COUNT;

        for (n=0;n!==this.PIPE_SIDE_COUNT;n++) {
            ang2=ang+angAdd;

                // the two Us

            u1=(ang*this.PIPE_SIDE_COUNT)/360.0;
            u2=(ang2*this.PIPE_SIDE_COUNT)/360.0;

                // force last segment to wrap

            if (n===(this.PIPE_SIDE_COUNT-1)) ang2=0.0;

            rd=ang*(Math.PI/180.0);
            tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            rd=ang2*(Math.PI/180.0);
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

        tangentArray=this.genMesh.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(this.core,this.name,this.pipeBitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        this.core.game.map.meshList.add(mesh);
    }

    addPipeCornerChunk(pnt,radius,xStart,zStart,xTurn,zTurn,yFlip)
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

                rd=ang*(Math.PI/180.0);
                tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                rd=ang2*(Math.PI/180.0);
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

        tangentArray=this.genMesh.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(this.core,this.name,this.pipeBitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        this.core.game.map.meshList.add(mesh);
    }
    
        //
        // pipe types
        //
        
    buildSingleVerticalPipe(x,z,xOff,zOff,pipeRadius)
    {
        let pnt,pipeAng;
        
        pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+(this.room.storyCount*this.segmentSize)),(zOff+(z*this.segmentSize)));
        pipeAng=new PointClass(0,0,180.0);
        this.addPipeStraightChunk(pnt,(this.room.storyCount*this.segmentSize),pipeRadius,pipeAng);
        
        this.room.setGrid(0,x,z,1);
    }
    
    buildSingleSplitPipe(lx,rx,tz,bz,x,z,xOff,zOff,pipeRadius)
    {
        let x2,z2;
        let my,high;
        let pnt,pipeAng;
        
            // split pipe

        high=this.room.storyCount*this.segmentSize;
        my=(high*this.core.randomFloat(0.6,0.2))+pipeRadius;

            // the top part

        pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+(this.room.storyCount*this.segmentSize)),(zOff+(z*this.segmentSize)));
        pipeAng=new PointClass(0,0,180.0);     // force len to point down
        this.addPipeStraightChunk(pnt,((high-my)-pipeRadius),pipeRadius,pipeAng);

            // the cross over

        x2=x;
        z2=z;

        switch (this.core.randomIndex(2)) {
            case 0:
                pnt=new PointClass((xOff+(x*this.segmentSize)),((this.room.offset.y+my)+Math.trunc(pipeRadius*1.5)),(zOff+(z*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,0.0,0.0,90.0,false);

                x2=x+this.core.randomInt(1,3);
                if (x2>=rx) x2=(rx-1);

                pnt=new PointClass((xOff+(x*this.segmentSize)+pipeRadius),(this.room.offset.y+my),(zOff+(z*this.segmentSize)));
                pipeAng=new PointClass(0,0,270.0);
                this.addPipeStraightChunk(pnt,((this.segmentSize*Math.abs(x2-x))-(pipeRadius*2)),pipeRadius,pipeAng);

                pnt=new PointClass((xOff+(x2*this.segmentSize)),((this.room.offset.y+my)-Math.trunc(pipeRadius*1.5)),(zOff+(z*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,0.0,0.0,90.0,true);
                break;

            case 1:
                pnt=new PointClass(((xOff+(x*this.segmentSize))-Math.trunc(pipeRadius*1.5)),(this.room.offset.y+my),(zOff+(z*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,90.0,0.0,90.0,false);

                x2=x-this.core.randomInt(1,3);
                if (x2<lx) x2=lx;

                pnt=new PointClass((xOff+(x*this.segmentSize)-pipeRadius),(this.room.offset.y+my),(zOff+(z*this.segmentSize)));
                pipeAng=new PointClass(0,0,90.0);
                this.addPipeStraightChunk(pnt,((this.segmentSize*Math.abs(x2-x))-(pipeRadius*2)),pipeRadius,pipeAng);

                pnt=new PointClass(((xOff+(x2*this.segmentSize))+Math.trunc(pipeRadius*1.5)),((this.room.offset.y+my)+Math.trunc(pipeRadius*0)),(zOff+(z*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,90.0,0.0,90.0,true);
                break;

            case 2:
                pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+my),((zOff+(z*this.segmentSize))+Math.trunc(pipeRadius*1.5)));
                this.addPipeCornerChunk(pnt,pipeRadius,90.0,0.0,90.0,0.0,false);

                z2=z+this.core.randomInt(1,3);
                if (z2>=bz) z2=(bz-1);

                pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+my),(zOff+(z*this.segmentSize)+pipeRadius));
                pipeAng=new PointClass(90.0,0,0.0);
                this.addPipeStraightChunk(pnt,((this.segmentSize*Math.abs(z2-z))-(pipeRadius*2)),pipeRadius,pipeAng);

                pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+my),((zOff+(z2*this.segmentSize))-Math.trunc(pipeRadius*1.5)));
                this.addPipeCornerChunk(pnt,pipeRadius,90.0,0.0,90.0,0.0,true);
                break;

            case 3:
                pnt=new PointClass((xOff+(x*this.segmentSize)),((this.room.offset.y+my)+Math.trunc(pipeRadius*1.5)),(zOff+(z*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,0.0,90.0,0.0,false);

                z2=x-this.core.randomInt(1,3);
                if (z2<tz) z2=tz;

                pnt=new PointClass((xOff+(x*this.segmentSize)),(this.room.offset.y+my),(zOff+(z*this.segmentSize)-pipeRadius));
                pipeAng=new PointClass(270.0,0,0.0);
                this.addPipeStraightChunk(pnt,((this.segmentSize*Math.abs(z2-z))-(pipeRadius*2)),pipeRadius,pipeAng);

                pnt=new PointClass((xOff+(x*this.segmentSize)),((this.room.offset.y+my)-Math.trunc(pipeRadius*1.5)),(zOff+(z2*this.segmentSize)));
                this.addPipeCornerChunk(pnt,pipeRadius,0.0,0.0,90.0,0.0,true);
                break;
        }


            // the bottom part

        pnt=new PointClass((xOff+(x2*this.segmentSize)),((this.room.offset.y+my)-pipeRadius),(zOff+(z2*this.segmentSize)));
        pipeAng=new PointClass(0,0,180.0);     // force len to point down
        this.addPipeStraightChunk(pnt,my,pipeRadius,pipeAng);
        
        this.room.setGrid(0,x2,z2,1);
    }
    
        //
        // build room pipe
        //

    build()
    {
        let n,sz,pipeCount,pipeRadius;
        let x,z,xOff,zOff,lx,rx,tz,bz;
        
            // bounds with margins
            
        lx=this.room.piece.margins[0];
        rx=this.room.piece.size.x-(this.room.piece.margins[2]);
        if (this.room.requiredStairs.length!==0) {
            if (lx<2) lx=2;
            if (rx>(this.room.piece.size.x-2)) rx=this.room.piece.size.x-2;
        }
        if (rx<=lx) return;
        
        tz=this.room.piece.margins[1];
        bz=this.room.piece.size.z-(this.room.piece.margins[3]);
        if (this.room.requiredStairs.length!==0) {
            if (tz<2) tz=2;
            if (bz>(this.room.piece.size.z-2)) bz=this.room.piece.size.z-2;
        }
        if (bz<=tz) return;
        
            // pipe sizes
            
        pipeRadius=this.core.randomInt(Math.trunc(this.segmentSize*0.15),Math.trunc(this.segmentSize*0.15));
        xOff=this.room.offset.x+Math.trunc((this.segmentSize-(pipeRadius*2))*0.5);
        zOff=this.room.offset.z+Math.trunc((this.segmentSize-(pipeRadius*2))*0.5);
        
            // pipe count
        
        sz=Math.trunc(Math.min(this.room.piece.size.x,this.room.piece.size.z)*0.5);    
        pipeCount=this.core.randomInt(sz,sz);
        
        for (n=0;n!==pipeCount;n++) {
            
                // start point
                
            x=this.core.randomInBetween((lx+1),(rx-1));
            z=this.core.randomInBetween((tz+1),(bz-1));
            
            if (this.room.getGrid(0,x,z)!==0) continue;      // already used
            
                // pipes
                
            switch (this.core.randomIndex(2)) {
                case 0:
                    this.buildSingleSplitPipe(lx,rx,tz,bz,x,z,xOff,zOff,pipeRadius);
                    break;
                case 1:
                    this.buildSingleVerticalPipe(x,z,xOff,zOff,pipeRadius);
                    break;
                    
            }
            
        }
    }

}
