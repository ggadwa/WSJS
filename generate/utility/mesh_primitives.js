import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import genRandom from '../../generate/utility/random.js';

//
// mesh primitives class (static)
//

export default class MeshPrimitivesClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // create cube
        //

    static createMeshRotatedCube(view,bitmap,xBound,yBound,zBound,rotAngle,left,right,front,back,top,bottom,normalsIn,flags)
    {
        let vertexList,count,idx,centerPt;
        let n,indexes;
        
            // get cube size
            // note: why duplicated vertexes?  Because light map UVs

        count=0;
        if (left) count+=6;
        if (right) count+=6;
        if (front) count+=6;
        if (back) count+=6;
        if (top) count+=6;
        if (bottom) count+=6;
        if (count===0) return(null);

        vertexList=MeshUtilityClass.createMapVertexList(count);

            // left

        idx=0;

        if (left) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }

             // right

        if (right) {
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        }

            // front

        if (front) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        }

            // back

        if (back) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        }

            // top

        if (top) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        }

            // bottom

        if (bottom) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        }

        indexes=new Uint16Array(count);

        for (n=0;n!==count;n++) {
            indexes[n]=n;
        }

            // rotate
            
        if (rotAngle!==null) {
            centerPt=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
            MeshUtilityClass.rotateVertexes(vertexList,centerPt,rotAngle);
        }
        
            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,normalsIn);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(view,bitmap,vertexList,indexes,flags));
    }
    
    static createMeshCube(view,bitmap,xBound,yBound,zBound,left,right,front,back,top,bottom,normalsIn,flags)
    {
        return(this.createMeshRotatedCube(view,bitmap,xBound,yBound,zBound,null,left,right,front,back,top,bottom,normalsIn,flags));
    }
    
    static meshCubeSetWholeUV(mesh)
    {
        let n,v,idx,quadCount;
        let vertexList=mesh.vertexList;
        
        idx=0;
        quadCount=Math.trunc(vertexList.length/6);

        for (n=0;n!==quadCount;n++) {
            v=vertexList[idx++];
            v.uv.x=0.0;
            v.uv.y=0.0;

            v=vertexList[idx++];
            v.uv.x=1.0;
            v.uv.y=0.0;

            v=vertexList[idx++];
            v.uv.x=1.0;
            v.uv.y=1.0;

            v=vertexList[idx++];
            v.uv.x=0.0;
            v.uv.y=0.0;

            v=vertexList[idx++];
            v.uv.x=1.0;
            v.uv.y=1.0;

            v=vertexList[idx++];
            v.uv.x=0.0;
            v.uv.y=1.0;
        }
    }
    
    static meshCubeScaleUV(mesh,quadIndex,xOffset,xScale,yOffset,yScale)
    {
        let v;
        let idx=quadIndex*6;
        let vertexList=mesh.vertexList;
        
        v=vertexList[idx++];
        v.uv.x+=xOffset;
        v.uv.y+=yOffset;

        v=vertexList[idx++];
        v.uv.x=(v.uv.x*xScale)+xOffset;
        v.uv.y+=yOffset;

        v=vertexList[idx++];
        v.uv.x=(v.uv.x*xScale)+xOffset;
        v.uv.y=(v.uv.y*yScale)+yOffset;

        v=vertexList[idx++];
        v.uv.x+=xOffset;
        v.uv.y+=yOffset;

        v=vertexList[idx++];
        v.uv.x=(v.uv.x*xScale)+xOffset;
        v.uv.y=(v.uv.y*yScale)+yOffset;

        v=vertexList[idx++];
        v.uv.x+=xOffset;
        v.uv.y=(v.uv.y*yScale)+yOffset;
    }
    
        //
        // create wedge
        //

    static createMeshWedge(view,bitmap,xBound,yBound,zBound,rotAngle,wholeUV,left,right,back,top,bottom,normalsIn,flags)
    {
        let n,v,idx,count,centerPnt,topIdx,botIdx;
        let vertexList,indexes;
        
            // get wedge size

        count=0;
        if (left) count+=3;
        if (right) count+=3;
        if (back) count+=6;
        if (top) count+=6;
        if (bottom) count+=6;
        if (count===0) return(null);

        vertexList=MeshUtilityClass.createMapVertexList(count);
        
            // remember these for wholeUVs, right
            // now we can only do this for top/bottom
            
        topIdx=-1;
        botIdx=-1;

            // left

        idx=0;

        if (left) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min); 
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
        }
        
             // right

        if (right) {
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        }
        
            // back

        if (back) {
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        }
        
            // top

        if (top) {
            topIdx=idx;
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        }
        
            // bottom

        if (bottom) {
            botIdx=idx;
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
            vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
            vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);
        }
        
        indexes=new Uint16Array(count);

        for (n=0;n!==count;n++) {
            indexes[n]=n;
        }
        
            // build whole UVs

        if (wholeUV) {
            if (topIdx!==-1) {
                v=vertexList[topIdx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[topIdx++];
                v.uv.x=1.0;
                v.uv.y=0.0;
                
                v=vertexList[topIdx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[topIdx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[topIdx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[topIdx++];
                v.uv.x=0.0;
                v.uv.y=1.0;
            }  
            if (botIdx!==-1) {
                v=vertexList[botIdx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[botIdx++];
                v.uv.x=1.0;
                v.uv.y=0.0;
                
                v=vertexList[botIdx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[botIdx++];
                v.uv.x=0.0;
                v.uv.y=0.0;
                
                v=vertexList[botIdx++];
                v.uv.x=1.0;
                v.uv.y=1.0;
                
                v=vertexList[botIdx++];
                v.uv.x=0.0;
                v.uv.y=1.0;
            }  
        }

            // rotate
            
        if (rotAngle!==null) {
            centerPnt=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
            MeshUtilityClass.rotateVertexes(vertexList,centerPnt,rotAngle);
        }
        
            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,normalsIn);
        if (!wholeUV) MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(view,bitmap,vertexList,indexes,flags));
    }

        //
        // create pryamid
        //

    static createMeshPryamid(view,bitmap,xBound,yBound,zBound,rotAngle,flags)
    {
        let n,idx,centerPnt,vertexList,indexes;
        let x=xBound.getMidPoint();
        let z=zBound.getMidPoint();

        vertexList=MeshUtilityClass.createMapVertexList(12);
        
        idx=0;

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(x,yBound.max,z);

        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBound.max,z);

        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(x,yBound.max,z);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(x,yBound.max,z);

        indexes=new Uint16Array(12);

        for (n=0;n!==12;n++) {
            indexes[n]=n;
        }
        
            // rotate
            
        if (rotAngle!==null) {
            centerPnt=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
            MeshUtilityClass.rotateVertexes(vertexList,centerPnt,rotAngle);
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,false);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(view,bitmap,vertexList,indexes,flags));
    }
    
        //
        // cylinders
        //
        
    static createMeshCylinderSegmentList(segmentCount,segmentExtra)
    {
        let n;
        let segCount=genRandom.randomInt(segmentCount,segmentExtra);
        let segments=[];
        
        segments.push(1.0);      // top always biggest
        
        for (n=0;n!==segCount;n++) {
            segments.push(genRandom.randomFloat(0.5,0.5));
        }
        
        segments.push(1.0);      // and bottom
        
        return(segments);
    }
        
    static createMeshCylinder(view,bitmap,centerPt,yBound,segments,radius,top,bot,flags)
    {
        let n,k,t,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let topRad,botRad;
        let u1,u2;
        let vertexList,indexes,mesh,vertexSize,indexSize,iCount,vIdx,iIdx,vStartIdx;
        let yAdd,ySegBound,ang,ang2,angAdd;
        let sideCount=12;
        let segCount=segments.length-1;     // always one extra for top
        
            // get cylder size
        
        vertexSize=segCount*(sideCount*6);
        if (top) vertexSize+=sideCount;
        if (bot) vertexSize+=sideCount;
        vertexList=MeshUtilityClass.createMapVertexList(vertexSize);
        
        indexSize=segCount*(sideCount*6);
        if (top) indexSize+=((sideCount-2)*3);
        if (bot) indexSize+=((sideCount-2)*3);
        indexes=new Uint16Array(indexSize);

        iCount=sideCount*6;
        
        vIdx=0;
        iIdx=0;
        
        angAdd=360.0/sideCount;
        
            // cylinder side triangles
            
        yAdd=Math.trunc(yBound.getSize()/segCount);
            
        ySegBound=yBound.copy();
        ySegBound.min=ySegBound.max-yAdd;
        
        botRad=segments[0]*radius;
            
        for (k=0;k!==segCount;k++) {
            
                // new radius
                
            topRad=segments[k+1]*radius;

                // cyliner faces

            ang=0.0;

            for (n=0;n!==sideCount;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*segCount)/360.0;
                u2=(ang2*segCount)/360.0;

                    // force last segment to wrap
                    
                if (n===(sideCount-1)) ang2=0.0;

                rd=ang*constants.DEGREE_TO_RAD;
                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));

                rd=ang2*constants.DEGREE_TO_RAD;
                tx2=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz2=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx2=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz2=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));
                
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
                    v.normal.setFromSubPoint(v.position,centerPt);
                    v.normal.y=0.0;
                    v.normal.normalize();
                }
                
                ang=ang2;
            }

            for (n=0;n!==iCount;n++) {
                indexes[iIdx+n]=iIdx+n;
            }
            
            iIdx+=iCount;
            botRad=topRad;
            
            ySegBound.max=ySegBound.min;
            ySegBound.min-=yAdd;
        }
        
            // top and bottom triangles
            
        if (top) {
            vStartIdx=vIdx;
            
            ang=0.0;
            topRad=segments[0]*radius;

            for (n=0;n!==sideCount;n++) {
                rd=ang*constants.DEGREE_TO_RAD;
                
                u1=(Math.sin(rd)*0.5)+0.5;
                u2=(Math.cos(rd)*0.5)+0.5;

                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                    // the points
                
                v=vertexList[vIdx++];
                v.position.setFromValues(tx,yBound.min,tz);
                v.uv.setFromValues(u1,u2);
                v.normal.setFromValues(0.0,-1.0,0.0);
                
                ang+=angAdd;
            }

            for (n=0;n!==(sideCount-2);n++) {
                indexes[iIdx++]=vStartIdx;
                indexes[iIdx++]=vStartIdx+(n+1);
                indexes[iIdx++]=vStartIdx+(n+2);
            }
        }
        
        if (bot) {
            vStartIdx=vIdx;
            
            ang=0.0;
            botRad=segments[segments.length-1]*radius;

            for (n=0;n!==sideCount;n++) {
                rd=ang*constants.DEGREE_TO_RAD;
                
                u1=(Math.sin(rd)*0.5)+0.5;
                u2=(Math.cos(rd)*0.5)+0.5;

                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));
                
                    // the points
                
                v=vertexList[vIdx++];
                v.position.setFromValues(bx,yBound.max,bz);
                v.uv.setFromValues(u1,u2);
                v.normal.setFromValues(0.0,1.0,0.0);
                
                ang+=angAdd;
            }

            for (n=0;n!==(sideCount-2);n++) {
                indexes[iIdx++]=vStartIdx;
                indexes[iIdx++]=vStartIdx+(n+1);
                indexes[iIdx++]=vStartIdx+(n+2);
            }
        }
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        mesh=new MapMeshClass(view,bitmap,vertexList,indexes,flags);
        mesh.simpleCollisionGeometry=true;
        
        return(mesh);
    }
    
    static createMeshCylinderSimple(view,bitmap,centerPt,yBound,radius,top,bot,flags)
    {
        let mesh;
        let segments=[1.0,1.0];
        
        mesh=this.createMeshCylinder(view,bitmap,centerPt,yBound,segments,radius,top,bot,flags);
        mesh.simpleCollisionGeometry=true;
        
        return(mesh);
    }
    
    static meshCylinderScaleU(mesh,uScale)
    {
        MeshUtilityClass.transformUVs(mesh.vertexList,0.0,0.0,uScale,1.0);
    }
    
        //
        // frames
        //
        
    static createFrameX(view,bitmap,xBound,yBound,zBound,flip,bars,skipBottom)
    {
        let xFrameBound=new BoundClass(0,0);
        let yFrameBound=new BoundClass(0,0);
        let zFrameBound=new BoundClass(0,0);
        let sz=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        let halfSz=Math.trunc(sz*0.5);
        let y,z,mesh;
        
            // if skip bottom, enlarge the frame
            
        if (skipBottom) yBound.max+=halfSz;
        
            // the outside frame
            
        xFrameBound.setFromValues(xBound.max,(xBound.max+sz));
        if (flip) xFrameBound.add(-(xBound.getSize()+sz));          // flip if window is on other side
        
        yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
        zFrameBound.setFromValues((zBound.min-halfSz),(zBound.min+halfSz));
        mesh=MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
        
        zFrameBound.setFromValues((zBound.max-halfSz),(zBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.min-halfSz),(yBound.min+halfSz));
        zFrameBound.setFromValues((zBound.min-halfSz),(zBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
        if (!skipBottom) {
            yFrameBound.setFromValues((yBound.max-halfSz),(yBound.max+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        }
        
            // the inner bars

        if (bars) {
            y=yBound.getMidPoint();
            yFrameBound.setFromValues((y-halfSz),(y+halfSz));
            zFrameBound.setFromValues((zBound.min+halfSz),(zBound.max-halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
            z=zBound.getMidPoint();
            yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
            zFrameBound.setFromValues((z-halfSz),(z+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        }
        
        return(mesh);
    }
    
    static createFrameZ(view,bitmap,xBound,yBound,zBound,flip,bars,skipBottom)
    {
        let xFrameBound=new BoundClass(0,0);
        let yFrameBound=new BoundClass(0,0);
        let zFrameBound=new BoundClass(0,0);
        let sz=Math.trunc(constants.ROOM_BLOCK_WIDTH*0.1);
        let halfSz=Math.trunc(sz*0.5);
        let x,y,mesh;
        
            // if skip bottom, enlarge the frame
            
        if (skipBottom) yBound.max+=halfSz;
        
            // the outside frame
            
        zFrameBound.setFromValues(zBound.max,(zBound.max+sz));
        if (flip) zFrameBound.add(-(zBound.getSize()+sz));          // flip if window is on other side
        
        yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
        xFrameBound.setFromValues((xBound.min-halfSz),(xBound.min+halfSz));
        mesh=MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION);
        
        xFrameBound.setFromValues((xBound.max-halfSz),(xBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.min-halfSz),(yBound.min+halfSz));
        xFrameBound.setFromValues((xBound.min-halfSz),(xBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
        if (!skipBottom) {
            yFrameBound.setFromValues((yBound.max-halfSz),(yBound.max+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        }
        
            // the inner bars

        if (bars) {
            y=yBound.getMidPoint();
            yFrameBound.setFromValues((y-halfSz),(y+halfSz));
            xFrameBound.setFromValues((xBound.min+halfSz),(xBound.max-halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        
            x=xBound.getMidPoint();
            yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
            xFrameBound.setFromValues((x-halfSz),(x+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(view,bitmap,xFrameBound,yFrameBound,zFrameBound,true,true,true,true,true,true,false,constants.MESH_FLAG_DECORATION));
        }
        
        return(mesh);
    }
    
}
