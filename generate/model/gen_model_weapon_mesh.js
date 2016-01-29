"use strict";

//
// gen weapon mesh class
//

function GenModelWeaponMeshObject(model,bitmap,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        //
        // counts for vertex/uvs/indexes
        //
        
    this.BOX_VERTEX_COUNT=24;
    this.BOX_NORMAL_COUNT=this.BOX_VERTEX_COUNT;
    this.BOX_UV_COUNT=16;
    this.BOX_INDEX_COUNT=24;
    
    this.CYLINDER_SIDE_COUNT=12;
    this.CYLINDER_VERTEX_COUNT=((this.CYLINDER_SIDE_COUNT*3)*2);
    this.CYLINDER_INDEX_COUNT=(this.CYLINDER_SIDE_COUNT*6);
    
    /*
        //
        // build a box around a bone
        //
        
    this.buildBoxAroundBone=function(view,bone,xBound,yBound,zBound,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var startVIdx=Math.floor(vIdx/3);       // remember this for building indexes
        
        var nStartVIdx=vIdx;                    // remember these for building indexes and normals
        var nStartIIdx=iIdx;
        
        vertices[vIdx++]=xBound.min;
        vertices[vIdx++]=yBound.min;
        vertices[vIdx++]=zBound.min;        
        vertices[vIdx++]=xBound.max;
        vertices[vIdx++]=yBound.min;
        vertices[vIdx++]=zBound.min;
        vertices[vIdx++]=xBound.max;
        vertices[vIdx++]=yBound.max;
        vertices[vIdx++]=zBound.min;
        vertices[vIdx++]=xBound.min;
        vertices[vIdx++]=yBound.max;
        vertices[vIdx++]=zBound.min;
        
        vertices[vIdx++]=xBound.min;
        vertices[vIdx++]=yBound.min;
        vertices[vIdx++]=zBound.max;        
        vertices[vIdx++]=xBound.max;
        vertices[vIdx++]=yBound.min;
        vertices[vIdx++]=zBound.max;
        vertices[vIdx++]=xBound.max;
        vertices[vIdx++]=yBound.max;
        vertices[vIdx++]=zBound.max;
        vertices[vIdx++]=xBound.min;
        vertices[vIdx++]=yBound.max;
        vertices[vIdx++]=zBound.max;
        
        uvs[uvIdx++]=uOffset+0.0;
        uvs[uvIdx++]=vOffset+0.0;
        uvs[uvIdx++]=uOffset+0.5;
        uvs[uvIdx++]=vOffset+0.0;
        uvs[uvIdx++]=uOffset+0.5;
        uvs[uvIdx++]=vOffset+0.5;
        uvs[uvIdx++]=uOffset+0.0;
        uvs[uvIdx++]=vOffset+0.5;
        
        uvs[uvIdx++]=uOffset+0.5;
        uvs[uvIdx++]=vOffset+0.0;
        uvs[uvIdx++]=uOffset+0.0;
        uvs[uvIdx++]=vOffset+0.0;
        uvs[uvIdx++]=uOffset+0.0;
        uvs[uvIdx++]=vOffset+0.5;
        uvs[uvIdx++]=uOffset+0.5;
        uvs[uvIdx++]=vOffset+0.5;
        
        indexes[iIdx++]=startVIdx+0;        // front
        indexes[iIdx++]=startVIdx+1;
        indexes[iIdx++]=startVIdx+3;
        indexes[iIdx++]=startVIdx+1;
        indexes[iIdx++]=startVIdx+2;
        indexes[iIdx++]=startVIdx+3;
        
        indexes[iIdx++]=startVIdx+5;        // back
        indexes[iIdx++]=startVIdx+4;
        indexes[iIdx++]=startVIdx+6;
        indexes[iIdx++]=startVIdx+4;
        indexes[iIdx++]=startVIdx+7;
        indexes[iIdx++]=startVIdx+6;

        indexes[iIdx++]=startVIdx+0;        // left
        indexes[iIdx++]=startVIdx+4;
        indexes[iIdx++]=startVIdx+3;
        indexes[iIdx++]=startVIdx+4;
        indexes[iIdx++]=startVIdx+7;
        indexes[iIdx++]=startVIdx+3;
        
        indexes[iIdx++]=startVIdx+1;        // right
        indexes[iIdx++]=startVIdx+5;
        indexes[iIdx++]=startVIdx+2;
        indexes[iIdx++]=startVIdx+5;
        indexes[iIdx++]=startVIdx+6;
        indexes[iIdx++]=startVIdx+2;
        
        meshUtility.buildMapMeshNormalsFromChunk(vertices,nStartVIdx,this.BOX_VERTEX_COUNT,indexes,nStartIIdx,this.BOX_INDEX_COUNT,normals,false);
    };
    
        //
        // build globe around bone
        //
        
    this.buildGlobeAroundPoint=function(view,centerPnt,widRadius,highRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var x,y,ang;
        var rd,radius,px,py,pz;
        var vAng;
        
        var startVIdx=Math.floor(vIdx/3);
        
        var nStartVIdx=vIdx;                    // remember these for building indexes and normals
        var nStartIIdx=iIdx;
         
            // create the globe without a top
            // or bottom and build that with trigs later
            
        var xzAngAdd=360.0/this.GLOBE_SURFACE_COUNT;
        var yAngAdd=180.0/this.GLOBE_SURFACE_COUNT;

        var xzAng;
        var yAng=yAngAdd;
        
        for (y=1;y!==(this.GLOBE_SURFACE_COUNT-1);y++) {
            
                // get y position and radius
                // from angle
            
            rd=yAng*DEGREE_TO_RAD;
            radius=widRadius*Math.sin(rd);
            py=centerPnt.y-(highRadius*Math.cos(rd));
            
            vAng=vOffset+((yAng/180.0)*0.5);
            
                // the band of vertexes
            
            xzAng=0.0;
            
            for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
                rd=xzAng*DEGREE_TO_RAD;
                px=centerPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                pz=centerPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                vertices[vIdx++]=px;
                vertices[vIdx++]=py;
                vertices[vIdx++]=pz;

                ang=xzAng+225.0;
                if (ang>=360.0) ang-=360.0;
                
                uvs[uvIdx++]=(uOffset+0.5)-((ang/360.0)*0.5);
                uvs[uvIdx++]=vAng;

                xzAng+=xzAngAdd;
            }
            
            yAng+=yAngAdd;
        }
        
            // top and bottom points
        
        var topIdx=Math.floor(vIdx/3);
        
        vertices[vIdx++]=centerPnt.x;
        vertices[vIdx++]=centerPnt.y-highRadius;
        vertices[vIdx++]=centerPnt.z;
        
        uvs[uvIdx++]=uOffset+0.25;
        uvs[uvIdx++]=vOffset;
        
        var botIdx=Math.floor(vIdx/3);
       
        vertices[vIdx++]=centerPnt.x;
        vertices[vIdx++]=centerPnt.y+highRadius;
        vertices[vIdx++]=centerPnt.z;
        
        uvs[uvIdx++]=uOffset+0.25;
        uvs[uvIdx++]=vOffset+0.5;
        
            // build the triangles on
            // all the strips except the
            // top and bottom strip
            
        var nx,vNextIdx,v2Idx,v2NextIdx;
        
        for (y=0;y!==(this.GLOBE_SURFACE_COUNT-3);y++) {
            
            for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
                
                vIdx=startVIdx+((y*this.GLOBE_SURFACE_COUNT)+x);
                v2Idx=startVIdx+(((y+1)*this.GLOBE_SURFACE_COUNT)+x);
                
                nx=(x<(this.GLOBE_SURFACE_COUNT-1))?(x+1):0;

                vNextIdx=startVIdx+((y*this.GLOBE_SURFACE_COUNT)+nx);
                v2NextIdx=startVIdx+(((y+1)*this.GLOBE_SURFACE_COUNT)+nx);
                 
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            }
        }
        
            // top triangles
            
        for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
            nx=(x<(this.GLOBE_SURFACE_COUNT-1))?(x+1):0;
            
            vIdx=startVIdx+x;
            vNextIdx=startVIdx+nx;
            
            indexes[iIdx++]=vIdx;
            indexes[iIdx++]=topIdx;
            indexes[iIdx++]=vNextIdx;
        }
        
            // bottom triangles
            
        var botOff=startVIdx+(this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3));
            
        for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
            nx=(x<(this.GLOBE_SURFACE_COUNT-1))?(x+1):0;
            
            vIdx=botOff+x;
            vNextIdx=botOff+nx;
            
            indexes[iIdx++]=vIdx;
            indexes[iIdx++]=botIdx;
            indexes[iIdx++]=vNextIdx;
        }
        
        meshUtility.buildMapMeshNormalsFromChunk(vertices,nStartVIdx,this.GLOBE_VERTEX_COUNT,indexes,nStartIIdx,this.GLOBE_INDEX_COUNT,normals,false);
    };
    
    this.buildGlobeAroundBone=function(view,bone,widRadius,highRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        this.buildGlobeAroundPoint(view,bone.position,widRadius,highRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset);
    };
    */
   
        //
        // build cylinders around two points
        //
        
    this.buildCylinderAroundTwoPoints=function(view,pt1,pt2,radius1,radius2,vertexList,indexes)
    {
        var n,v,rd,v2Idx;
        var tx,ty,bx,by;
        var uAng;
        
            // build the vertexes and uvs
            // around the two points
            
        var vIdx=0;
            
        var ang=0.0;
        var angAdd=360.0/this.CYLINDER_SIDE_COUNT;

        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            rd=ang*DEGREE_TO_RAD;
            tx=pt1.x+((radius1*Math.sin(rd))+(radius1*Math.cos(rd)));
            ty=pt1.y+((radius1*Math.cos(rd))-(radius1*Math.sin(rd)));

            bx=pt2.x+((radius2*Math.sin(rd))+(radius2*Math.cos(rd)));
            by=pt2.y+((radius2*Math.cos(rd))-(radius2*Math.sin(rd)));
            
            uAng=ang/360.0;
            
            v=vertexList[vIdx++];
            v.position.set(tx,ty,pt1.z);
            v.uv.set(uAng,0.0);
            v.normal.setFromSubPoint(v.position,pt1);
            v.normal.normalize();
            
            v=vertexList[vIdx++];
            v.position.set(bx,by,pt2.z);
            v.uv.set(uAng,1.0);
            v.normal.setFromSubPoint(v.position,pt2);
            v.normal.normalize();

            ang+=angAdd;
        }
        
            // build the triangles to
            // complete the cylinder
            
        vIdx=0;
        var iIdx=0;
        
        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            v2Idx=vIdx+2;
            if (n===(this.CYLINDER_SIDE_COUNT-1)) v2Idx=0;
            
            indexes[iIdx++]=vIdx;
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=vIdx+1;
            
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=v2Idx+1;
            indexes[iIdx++]=vIdx+1;
            
            vIdx+=2;
        }
        
            // finish with the tagents
            
        meshUtility.buildVertexListTangents(vertexList,indexes);
    };
    
   
        //
        // build weapon mesh
        //

    this.build=function(view)
    {
        var vertexList=meshUtility.createModelVertexList(this.CYLINDER_VERTEX_COUNT);
        var indexes=new Uint16Array(this.CYLINDER_INDEX_COUNT);
        
        var pos1=new wsPoint(0,0,1500);
        var pos2=new wsPoint(0,0,-1500);
        
        this.buildCylinderAroundTwoPoints(view,pos1,pos2,500,500,vertexList,indexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertexList,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
