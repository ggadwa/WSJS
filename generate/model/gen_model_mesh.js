"use strict";

//
// gen model mesh class
//

function GenModelMeshObject(model,bitmap,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        //
        // counts for vertex/uvs/indexes
        //
        
    this.BOX_VERTEX_COUNT=24;
    this.BOX_UV_COUNT=16;
    this.BOX_INDEX_COUNT=24;
        
    this.CYLINDER_SIDE_COUNT=12;
    this.CYLINDER_VERTEX_COUNT=((this.CYLINDER_SIDE_COUNT*3)*2);
    this.CYLINDER_UV_COUNT=((this.CYLINDER_SIDE_COUNT*2)*2);
    this.CYLINDER_INDEX_COUNT=(this.CYLINDER_SIDE_COUNT*6);
    
        //
        // build a box around a bone
        //
        
    this.buildBoxAroundBone=function(view,bone,xBound,yBound,zBound,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var startVIdx=Math.floor(vIdx/3);

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
    };
    
        //
        // build cylinders around two bones
        //
        
    this.buildCylinderAroundBones=function(view,bone1,bone2,radius1,radius2,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var n,rd,v2Idx;
        var tx,tz,bx,bz;
        var uAng;
        
            // build the vertexes and uvs
            // around the two bones
            
        var ang=0.0;
        var angAdd=360.0/this.CYLINDER_SIDE_COUNT;
            
        var startVIdx=Math.floor(vIdx/3);

        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            rd=ang*DEGREE_TO_RAD;
            tx=bone1.position.x+((radius1*Math.sin(rd))+(radius1*Math.cos(rd)));
            tz=bone1.position.z+((radius1*Math.cos(rd))-(radius1*Math.sin(rd)));

            bx=bone2.position.x+((radius2*Math.sin(rd))+(radius2*Math.cos(rd)));
            bz=bone2.position.z+((radius2*Math.cos(rd))-(radius2*Math.sin(rd)));
            
            uAng=uOffset+((ang/360.0)*0.5);

            vertices[vIdx++]=tx;
            vertices[vIdx++]=bone1.position.y;
            vertices[vIdx++]=tz;
            vertices[vIdx++]=bx;
            vertices[vIdx++]=bone2.position.y;
            vertices[vIdx++]=bz;
            
            uvs[uvIdx++]=uAng;
            uvs[uvIdx++]=vOffset+0.0;
            uvs[uvIdx++]=uAng;
            uvs[uvIdx++]=vOffset+0.5;            

            ang+=angAdd;
        }
        
            // build the triangles to
            // complete the cylinder
            
        vIdx=startVIdx;
        
        for (n=0;n!==this.CYLINDER_SIDE_COUNT;n++) {
            v2Idx=vIdx+2;
            if (n===(this.CYLINDER_SIDE_COUNT-1)) v2Idx=startVIdx;
            
            indexes[iIdx++]=vIdx;
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=vIdx+1;
            
            indexes[iIdx++]=v2Idx;
            indexes[iIdx++]=v2Idx+1;
            indexes[iIdx++]=vIdx+1;
            
            vIdx+=2;
        }
    };
    
        //
        // specialized bone calculations
        //
        
    this.isBoneHorizontal=function(bone)
    {
        if (bone.parentBoneIdx===-1) return(false);
        
        var parentBone=this.model.skeleton.bones[bone.parentBoneIdx];
        var x=Math.abs(bone.position.x-parentBone.position.x);
        var y=Math.abs(bone.position.y-parentBone.position.y);
        var z=Math.abs(bone.position.z-parentBone.position.z);
        
        return((x>y) || (z>y));
    }
    
        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
        var n,bone,parentBone;
        var bones=this.model.skeleton.bones;
        
            // count primitives we will need
            
        var vIdx=0;
        var uvIdx=0;
        var iIdx=0;

        for (n=0;n!==bones.length;n++) {
            bone=bones[n];
            
                // skip the base bone
                
            if (bone.isBase()) continue;
            
                // box type bones
                
            if ((bone.isHead()) || (bone.isHand()) || (bone.isFoot())) {
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                continue;
            }
            
                // cylinder type bones
                // these are used for bones with parents
                // that aren't the base bone
                
            if (bone.hasParent()) {
                
                parentBone=bones[bone.parentBoneIdx];
                if (parentBone.isBase()) continue;
                if (this.isBoneHorizontal(bone)) continue;
                
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                continue;
            }
        }
        
            // supergumba -- temporary, boxing bones for now
            
        var vertices=new Float32Array(vIdx);
        var uvs=new Float32Array(uvIdx);
        var indexes=new Uint16Array(iIdx);

            // box all the bones
        
        var vIdx=0;
        var uvIdx=0;
        var iIdx=0;
        
        var xBound,yBound,zBound;

        for (n=0;n!==bones.length;n++) {
            bone=bones[n];
            
                // skip the base bone
                
            if (bone.isBase()) continue;
            
                // box type bones
            
            if (bone.isHead()) {
                xBound=new wsBound((bone.position.x-200),(bone.position.x+200));
                yBound=new wsBound((bone.position.y-500),(bone.position.y));
                zBound=new wsBound((bone.position.z-150),(bone.position.z+150));

                this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.5,0.0);
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                
                continue;
            }
            
            if (bone.isHand()) {
                xBound=new wsBound((bone.position.x-100),(bone.position.x+100));
                yBound=new wsBound((bone.position.y-100),(bone.position.y+150));
                zBound=new wsBound((bone.position.z-50),(bone.position.z+50));

                this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.5);
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                
                continue;
            }
            
            if (bone.isFoot()) {
                xBound=new wsBound((bone.position.x-100),(bone.position.x+100));
                yBound=new wsBound((bone.position.y-150),(bone.position.y));
                zBound=new wsBound((bone.position.z-50),(bone.position.z+450));

                this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.5);
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                
                continue;
            }
            
                // cylinder type bones
                
            if (bone.hasParent()) {
                parentBone=bones[bone.parentBoneIdx];
                if (parentBone.isBase()) continue;
                if (this.isBoneHorizontal(bone)) continue;
                
                this.buildCylinderAroundBones(view,bone,parentBone,100,100,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.0);
                
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                
                continue;
            }
            
       }
    
        var meshUVTangents=new MeshUVTangentsObject();
        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
