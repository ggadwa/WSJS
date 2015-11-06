"use strict";

//
// gen organic mesh class
//

function GenModelOrganicMeshObject(model,bitmap,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        // globe counts
        
    this.GLOBE_SURFACE_COUNT=24;
    this.GLOBE_VERTEX_COUNT=(((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2)*3);
    this.GLOBE_NORMAL_COUNT=this.GLOBE_VERTEX_COUNT;
    this.GLOBE_UV_COUNT=(((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2)*2);
    this.GLOBE_INDEX_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3))*6)+((this.GLOBE_SURFACE_COUNT*2)*3);

        //
        // build a large global around
        // center of skeleton
        //
        
    this.buildGlobeAroundSkeleton=function(view,centerPnt,widRadius,highRadius,vertices,uvs,indexes)
    {
        var x,y,ang;
        var rd,radius,px,py,pz;
        var vAng;
         
            // create the globe without a top
            // or bottom and build that with trigs later
            
        var xzAngAdd=360.0/this.GLOBE_SURFACE_COUNT;
        var yAngAdd=180.0/this.GLOBE_SURFACE_COUNT;

        var xzAng;
        var yAng=yAngAdd;
        
        var vIdx=0;
        var uvIdx=0;
        
        for (y=1;y!==(this.GLOBE_SURFACE_COUNT-1);y++) {
            
                // get y position and radius
                // from angle
            
            rd=yAng*DEGREE_TO_RAD;
            radius=widRadius*Math.sin(rd);
            py=centerPnt.y-(highRadius*Math.cos(rd));
            
            vAng=yAng/180.0;
            
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
                
                uvs[uvIdx++]=1.0-(ang/360.0);
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
        
        uvs[uvIdx++]=0.5;
        uvs[uvIdx++]=0.0;
        
        var botIdx=Math.floor(vIdx/3);
       
        vertices[vIdx++]=centerPnt.x;
        vertices[vIdx++]=centerPnt.y+highRadius;
        vertices[vIdx++]=centerPnt.z;
        
        uvs[uvIdx++]=0.5;
        uvs[uvIdx++]=1.0;
        
            // build the triangles on
            // all the strips except the
            // top and bottom strip
            
        var nx,vNextIdx,v2Idx,v2NextIdx;
        var iIdx=0;
        
        for (y=0;y!==(this.GLOBE_SURFACE_COUNT-3);y++) {
            
            for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
                
                vIdx=(y*this.GLOBE_SURFACE_COUNT)+x;
                v2Idx=((y+1)*this.GLOBE_SURFACE_COUNT)+x;
                
                nx=(x<(this.GLOBE_SURFACE_COUNT-1))?(x+1):0;

                vNextIdx=(y*this.GLOBE_SURFACE_COUNT)+nx;
                v2NextIdx=((y+1)*this.GLOBE_SURFACE_COUNT)+nx;
                 
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
            
            indexes[iIdx++]=x;
            indexes[iIdx++]=topIdx;
            indexes[iIdx++]=nx;
        }
        
            // bottom triangles
            
        var botOff=this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3);
            
        for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
            nx=(x<(this.GLOBE_SURFACE_COUNT-1))?(x+1):0;
            
            indexes[iIdx++]=botOff+x;
            indexes[iIdx++]=botIdx;
            indexes[iIdx++]=botOff+nx;
        }
    };
    
        //
        // shrink wrap the globe
        //
        
    this.shrinkWrapGlobe=function(vertices)
    {
        var n,k,vIdx,bIdx;
        var bone,d,dist;
        var nVertex=Math.floor(vertices.length/3);
        var bones=this.model.skeleton.bones;
        var nBone=bones.length;
        
        var pt=new wsPoint(0,0,0);
        var vct=new wsPoint(0,0,0);
        
        for (n=0;n!==nVertex;n++) {
            
                // get the vertex
                
            vIdx=n*3;
            pt.set(vertices[vIdx],vertices[vIdx+1],vertices[vIdx+2]);
            
                // get closest bone
            
            bIdx=-1;
            dist=1000000;
            
            for (k=0;k!==nBone;k++) {
                bone=bones[k];
                if (bone.isBase()) continue;
                
                d=bone.position.distance(pt);
                if (d<dist) {
                    bIdx=k;
                    dist=d;
                }
            }
            
                // move towards bone
                
            if (bIdx!==-1) {
                bone=bones[bIdx];
                
                vct.setFromSubPoint(pt,bone.position);
                vct.normalize();
                vct.scale(300);
                
                pt.setFromAddPoint(bone.position,vct);
            }
            
                // save the vertex back
                
            vertices[vIdx]=pt.x;
            vertices[vIdx+1]=pt.y;
            vertices[vIdx+2]=pt.z;
        }
    };
    
        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
            // build a single large globe
            // around the skeleton
            
        var vertices=new Float32Array(this.GLOBE_VERTEX_COUNT);
        var uvs=new Float32Array(this.GLOBE_UV_COUNT);
        var indexes=new Uint16Array(this.GLOBE_INDEX_COUNT);
        
            // get skeleton center
            // and size
        
        var xBound=new wsBound(0,0);
        var yBound=new wsBound(0,0);
        var zBound=new wsBound(0,0);
        
        this.model.skeleton.getBounds(xBound,yBound,zBound);
        
        var widRadius=xBound.getSize();
        if (zBound.getSize()>widRadius) widRadius=zBound.getSize();
        widRadius=Math.floor(widRadius*0.5);
        
        var highRadius=Math.floor(yBound.getSize()*0.5);
        
        var centerPnt=this.model.skeleton.getCenter();
        
            // build the globe and shrink
            // wrap it to bones
        
        this.buildGlobeAroundSkeleton(view,centerPnt,widRadius,highRadius,vertices,uvs,indexes);
        this.shrinkWrapGlobe(vertices);
        
            // complete the tangent space vectors
    
        var normals=meshUtility.buildMeshNormals(vertices,indexes,false);
        var tangents=meshUtility.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
