/* global MeshUtilityClass, genRandom, DEGREE_TO_RAD */

"use strict";

//
// mesh primitives class (static)
//

class MeshPrimitivesClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // create cube
        //

    static createMeshCube(bitmap,xBound,yBound,zBound,rotAngle,wholeUV,left,right,front,back,top,bottom,normalsIn,flags)
    {
        let v,vertexList,count,idx,centerPt;
        let n,indexes,quadCount;
        
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

            // build whole UVs

        if (wholeUV) {
            
            idx=0;
            quadCount=Math.trunc(count/6);

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
        
            // rotate
            
        if (rotAngle!==null) {
            centerPt=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
            MeshUtilityClass.rotateVertexes(vertexList,centerPt,rotAngle);
        }
        
            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,normalsIn);
        if (!wholeUV) MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(bitmap,vertexList,indexes,flags));
    }
    
        //
        // create wedge
        //

    static createMeshWedge(bitmap,xBound,yBound,zBound,rotAngle,wholeUV,left,right,back,top,bottom,normalsIn,flags)
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
            centerPnt=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
            MeshUtilityClass.rotateVertexes(vertexList,centerPnt,rotAngle);
        }
        
            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,normalsIn);
        if (!wholeUV) MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(bitmap,vertexList,indexes,flags));
    }

        //
        // create pryamid
        //

    static createMeshPryamid(bitmap,xBound,yBound,zBound,flags)
    {
        let n,idx,vertexList,indexes;
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

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,false);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshClass(bitmap,vertexList,indexes,flags));
    }
    
        //
        // cylinders
        //
        
    static createMeshCylinderSegmentList(radius,extraRadius,segmentCount,segmentExtra)
    {
        let n;
        let segCount=genRandom.randomInt(segmentCount,segmentExtra);
        let segments=[];
        
        segments.push(radius+extraRadius);      // top always biggest
        
        for (n=0;n!==segCount;n++) {
            segments.push(genRandom.randomInt(radius,extraRadius));
        }
        
        segments.push(radius+extraRadius);      // and bottom
        
        return(segments);
    }
        
    static createMeshCylinder(bitmap,centerPt,yBound,segments,flags)
    {
        let n,k,t,v,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let topRad,botRad;
        let u1,u2;
        let vertexList,indexes,mesh,iCount,vIdx,iIdx;
        let yAdd,ySegBound,ang,ang2,angAdd;
        let sideCount=12;
        let segCount=segments.length-1;     // always one extra for top
        
            // get cylder size
        
        vertexList=MeshUtilityClass.createMapVertexList(segCount*(sideCount*6));
        indexes=new Uint16Array(segCount*(sideCount*6));

        iCount=sideCount*6;
        
        vIdx=0;
        iIdx=0;
        
            // cylinder segments
            
        yAdd=Math.trunc(yBound.getSize()/segCount);
            
        ySegBound=yBound.copy();
        ySegBound.min=ySegBound.max-yAdd;
        
        botRad=segments[0];
            
        for (k=0;k!==segCount;k++) {
            
                // new radius
                
            topRad=segments[k+1];

                // cyliner faces

            ang=0.0;
            angAdd=360.0/sideCount;

            for (n=0;n!==sideCount;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*segCount)/360.0;
                u2=(ang2*segCount)/360.0;

                    // force last segment to wrap
                    
                if (n===(sideCount-1)) ang2=0.0;

                rd=ang*DEGREE_TO_RAD;
                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));

                rd=ang2*DEGREE_TO_RAD;
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
        
            // calcualte the tangents

        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh
            // all cylinders are simple box collisions

        mesh=new MapMeshClass(bitmap,vertexList,indexes,flags);
        mesh.simpleCollisionGeometry=true;
        
        return(mesh);
    }
    
    static createMeshCylinderSimple(bitmap,centerPt,yBound,radius,flags)
    {
        let mesh;
        let segments=[];
        
        segments.push(radius);
        segments.push(radius);
        
        mesh=this.createMeshCylinder(bitmap,centerPt,yBound,segments,flags);
        mesh.simpleCollisionGeometry=true;
        
        return(mesh);
    }
    
        //
        // frames
        //
        
    static createFrameX(bitmap,xBound,yBound,zBound,flip,bars)
    {
        let xFrameBound=new wsBound(0,0);
        let yFrameBound=new wsBound(0,0);
        let zFrameBound=new wsBound(0,0);
        let sz=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        let halfSz=Math.trunc(sz*0.5);
        let y,z,mesh;
        
            // the outside frame
            
        xFrameBound.setFromValues(xBound.max,(xBound.max+sz));
        if (flip) xFrameBound.add(-(xBound.getSize()+sz));          // flip if window is on other side
        
        yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
        zFrameBound.setFromValues((zBound.min-halfSz),(zBound.min+halfSz));
        mesh=MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
        
        zFrameBound.setFromValues((zBound.max-halfSz),(zBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.min-halfSz),(yBound.min+halfSz));
        zFrameBound.setFromValues((zBound.min-halfSz),(zBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.max-halfSz),(yBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
            // the inner bars

        if (bars) {
            y=yBound.getMidPoint();
            yFrameBound.setFromValues((y-halfSz),(y+halfSz));
            zFrameBound.setFromValues((zBound.min+halfSz),(zBound.max-halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
            z=zBound.getMidPoint();
            yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
            zFrameBound.setFromValues((z-halfSz),(z+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        }
        
        return(mesh);
    }
    
    static createFrameZ(bitmap,xBound,yBound,zBound,flip,bars)
    {
        let xFrameBound=new wsBound(0,0);
        let yFrameBound=new wsBound(0,0);
        let zFrameBound=new wsBound(0,0);
        let sz=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        let halfSz=Math.trunc(sz*0.5);
        let x,y,mesh;
        
            // the outside frame
            
        zFrameBound.setFromValues(zBound.max,(zBound.max+sz));
        if (flip) zFrameBound.add(-(zBound.getSize()+sz));          // flip if window is on other side
        
        yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
        xFrameBound.setFromValues((xBound.min-halfSz),(xBound.min+halfSz));
        mesh=MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION);
        
        xFrameBound.setFromValues((xBound.max-halfSz),(xBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.min-halfSz),(yBound.min+halfSz));
        xFrameBound.setFromValues((xBound.min-halfSz),(xBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
        yFrameBound.setFromValues((yBound.max-halfSz),(yBound.max+halfSz));
        mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
            // the inner bars

        if (bars) {
            y=yBound.getMidPoint();
            yFrameBound.setFromValues((y-halfSz),(y+halfSz));
            xFrameBound.setFromValues((xBound.min+halfSz),(xBound.max-halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        
            x=xBound.getMidPoint();
            yFrameBound.setFromValues((yBound.min+halfSz),(yBound.max-halfSz));
            xFrameBound.setFromValues((x-halfSz),(x+halfSz));
            mesh.combineMesh(MeshPrimitivesClass.createMeshCube(bitmap,xFrameBound,yFrameBound,zFrameBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
        }
        
        return(mesh);
    }
    
}
