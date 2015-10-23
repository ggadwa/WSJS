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
    
    this.GLOBE_SURFACE_COUNT=8;
    this.GLOBE_VERTEX_COUNT=((this.GLOBE_SURFACE_COUNT*this.GLOBE_SURFACE_COUNT)*3);
    this.GLOBE_UV_COUNT=((this.GLOBE_SURFACE_COUNT*this.GLOBE_SURFACE_COUNT)*2);
    this.GLOBE_INDEX_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-1))*6);
    
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
        // build globe around bone
        //
        
    this.buildGlobeAroundBone=function(view,bone,widRadius,highRadius,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var x,y;
        var rd,radius,px,py,pz;
        var vAng;
        
        var startVIdx=Math.floor(vIdx/3);
        
        var xzAng,yAng;
        var angAdd=360.0/this.GLOBE_SURFACE_COUNT;
        
        yAng=0.0;
        py=bone.position.y-600;
        
        for (y=0;y!==this.GLOBE_SURFACE_COUNT;y++) {
            
                // get y position and radius
                // from angle
                
            radius=widRadius;
            vAng=vOffset+((yAng/360.0)*0.5);
            
                // the band of vertexes
            
            xzAng=0.0;
            
            for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
                rd=xzAng*DEGREE_TO_RAD;
                px=bone.position.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                pz=bone.position.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                vertices[vIdx++]=px;
                vertices[vIdx++]=py;
                vertices[vIdx++]=pz;

                uvs[uvIdx++]=uOffset+((xzAng/360.0)*0.5);
                uvs[uvIdx++]=vAng;

                xzAng+=angAdd;
            }
            
            py+=100;
            yAng+=angAdd;
        }
        
            // build the triangles to
            // complete the globe
            
        vIdx=startVIdx;
        var vNextIdx,v2Idx,v2NextIdx;
        var vStartIdx,v2StartIdx;
        
        for (y=0;y!==(this.GLOBE_SURFACE_COUNT-1);y++) {
            
            vStartIdx=vIdx;
            
            v2Idx=vIdx+this.GLOBE_SURFACE_COUNT;
            v2StartIdx=v2Idx;
            
            for (x=0;x!==this.GLOBE_SURFACE_COUNT;x++) {
                
                vNextIdx=vIdx+1;
                if (vNextIdx===this.GLOBE_SURFACE_COUNT) vNextIdx=vStartIdx;
                
                v2NextIdx=v2Idx+1;
                if (v2NextIdx===this.GLOBE_SURFACE_COUNT) v2NextIdx=v2StartIdx;
            
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            
                vIdx++;
                v2Idx++;
            }
        }
    };
    
        //
        // build cylinders around two bones
        //
        
    this.buildCylinderAroundTwoPoints=function(view,pt1,pt2,radius1,radius2,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
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
            tx=pt1.x+((radius1*Math.sin(rd))+(radius1*Math.cos(rd)));
            tz=pt1.z+((radius1*Math.cos(rd))-(radius1*Math.sin(rd)));

            bx=pt2.x+((radius2*Math.sin(rd))+(radius2*Math.cos(rd)));
            bz=pt2.z+((radius2*Math.cos(rd))-(radius2*Math.sin(rd)));
            
            uAng=uOffset+((ang/360.0)*0.5);

            vertices[vIdx++]=tx;
            vertices[vIdx++]=pt1.y;
            vertices[vIdx++]=tz;
            vertices[vIdx++]=bx;
            vertices[vIdx++]=pt2.y;
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
    
    this.buildCylinderAroundTwoBones=function(view,bone1,bone2,radius1,radius2,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        this.buildCylinderAroundTwoPoints(view,bone1.position,bone2.position,radius1,radius2,vertices,vIdx,uvs,uvIdx,indexes,iIdx,uOffset,vOffset);
    };
    
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
                
            if ((bone.isHand()) || (bone.isFoot())) {
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                continue;
            }
            
                // globe type bones
                
            if (bone.isHead()) {
                vIdx+=this.GLOBE_VERTEX_COUNT;
                uvIdx+=this.GLOBE_UV_COUNT;
                iIdx+=this.GLOBE_INDEX_COUNT;
                continue;
            }
            
                // cylinder type bones
                
            if ((bone.isWrist()) || (bone.isElbow()) || (bone.isAnkle()) || (bone.isKnee()) || (bone.isNeck()) || (bone.isTorso()) || (bone.isWaist()) || (bone.isHip())) {
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                continue;
            }
        }
        
            // put primitives around bones
            
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
                this.buildGlobeAroundBone(view,bone,500,500,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.5,0.0);
                vIdx+=this.GLOBE_VERTEX_COUNT;
                uvIdx+=this.GLOBE_UV_COUNT;
                iIdx+=this.GLOBE_INDEX_COUNT;
                
                
                //xBound=new wsBound((bone.position.x-200),(bone.position.x+200));
                //yBound=new wsBound((bone.position.y-400),(bone.position.y+100));
                //zBound=new wsBound((bone.position.z-150),(bone.position.z+150));

                //this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.5,0.0);
                //vIdx+=this.BOX_VERTEX_COUNT;
                //uvIdx+=this.BOX_UV_COUNT;
                //iIdx+=this.BOX_INDEX_COUNT;
                
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
                
            if ((bone.isWrist()) || (bone.isElbow()) || (bone.isAnkle()) || (bone.isKnee()) || (bone.isNeck())) {
                parentBone=bones[bone.parentBoneIdx];
                this.buildCylinderAroundTwoBones(view,bone,parentBone,100,100,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.0);
                
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                
                continue;
            }
            
        }
       
            // build the body bones
            
        var torsoRadius=this.genRandom.randomInt(200,150);
        var waistRadius=this.genRandom.randomInt(200,150);
        var hipRadius=this.genRandom.randomInt(200,150);
        
        var torsoBone=this.model.skeleton.findBone("Torso");
        var waistBone=this.model.skeleton.findBone("Waist");
        var hipBone=this.model.skeleton.findBone("Hip");
        
        this.buildCylinderAroundTwoBones(view,torsoBone,waistBone,torsoRadius,waistRadius,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.0);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        this.buildCylinderAroundTwoBones(view,waistBone,hipBone,waistRadius,hipRadius,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.0);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        var pt=hipBone.position.copy();
        pt.y+=300;
        
        this.buildCylinderAroundTwoPoints(view,hipBone.position,pt,hipRadius,hipRadius,vertices,vIdx,uvs,uvIdx,indexes,iIdx,0.0,0.0);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
            
            // complete the tangent space vectors
    
        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
