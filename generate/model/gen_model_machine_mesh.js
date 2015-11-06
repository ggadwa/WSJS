"use strict";

//
// gen machine (non-organic) mesh class
//

function GenModelMachineMeshObject(model,bitmap,genRandom)
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
    
    this.GLOBE_SURFACE_COUNT=8;
    this.GLOBE_VERTEX_COUNT=(((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2)*3);
    this.GLOBE_NORMAL_COUNT=this.GLOBE_VERTEX_COUNT;
    this.GLOBE_UV_COUNT=(((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2)*2);
    this.GLOBE_INDEX_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3))*6)+((this.GLOBE_SURFACE_COUNT*2)*3);
    
    this.CYLINDER_SIDE_COUNT=12;
    this.CYLINDER_VERTEX_COUNT=((this.CYLINDER_SIDE_COUNT*3)*2);
    this.CYLINDER_NORMAL_COUNT=this.CYLINDER_VERTEX_COUNT;
    this.CYLINDER_UV_COUNT=((this.CYLINDER_SIDE_COUNT*2)*2);
    this.CYLINDER_INDEX_COUNT=(this.CYLINDER_SIDE_COUNT*6);
    
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
        
        meshUtility.buildMeshNormalsFromChunk(vertices,nStartVIdx,this.BOX_VERTEX_COUNT,indexes,nStartIIdx,this.BOX_INDEX_COUNT,normals,false);
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
        
        meshUtility.buildMeshNormalsFromChunk(vertices,nStartVIdx,this.GLOBE_VERTEX_COUNT,indexes,nStartIIdx,this.GLOBE_INDEX_COUNT,normals,false);
    };
    
    this.buildGlobeAroundBone=function(view,bone,widRadius,highRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        this.buildGlobeAroundPoint(view,bone.position,widRadius,highRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset);
    };
    
        //
        // build cylinders around two bones
        //
        
    this.buildCylinderAroundTwoPoints=function(view,pt1,pt2,radius1,radius2,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        var n,rd,v2Idx;
        var tx,tz,bx,bz;
        var uAng;
            
        var startVIdx=Math.floor(vIdx/3);
        
        var nStartVIdx=vIdx;                    // remember these for building indexes and normals
        var nStartIIdx=iIdx;
         
            // build the vertexes and uvs
            // around the two bones
            
        var ang=0.0;
        var angAdd=360.0/this.CYLINDER_SIDE_COUNT;

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
        
        meshUtility.buildMeshNormalsFromChunk(vertices,nStartVIdx,this.CYLINDER_VERTEX_COUNT,indexes,nStartIIdx,this.CYLINDER_INDEX_COUNT,normals,false);
    };
    
    this.buildCylinderAroundTwoBones=function(view,bone1,bone2,radius1,radius2,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset)
    {
        this.buildCylinderAroundTwoPoints(view,bone1.position,bone2.position,radius1,radius2,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,uOffset,vOffset);
    };
    
        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
        var n,k,bone,parentBone;
        var bones=this.model.skeleton.bones;
        
            // some settings
            
        var eyeCount=2;
        
            // count primitives we will need
            
        var vIdx=0;
        var nIdx=0;
        var uvIdx=0;
        var iIdx=0;

        for (n=0;n!==bones.length;n++) {
            bone=bones[n];
            
                // skip the base bone
                
            if (bone.isBase()) continue;
            
                // box type bones
                
            if ((bone.isHand()) || (bone.isFoot())) {
                vIdx+=this.BOX_VERTEX_COUNT;
                nIdx+=this.BOX_NORMAL_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                continue;
            }
            
                // globe type bones
                
            if (bone.isHead()) {
                vIdx+=this.GLOBE_VERTEX_COUNT;
                nIdx+=this.GLOBE_NORMAL_COUNT;
                uvIdx+=this.GLOBE_UV_COUNT;
                iIdx+=this.GLOBE_INDEX_COUNT;
                continue;
            }
            
                // cylinder type bones
                
            if ((bone.isWrist()) || (bone.isElbow()) || (bone.isAnkle()) || (bone.isKnee()) || (bone.isNeck()) || (bone.isTorsoTop()) || (bone.isTorso()) || (bone.isWaist()) || (bone.isHip())) {
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                nIdx+=this.CYLINDER_NORMAL_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                continue;
            }
            
                // eyes
                
            vIdx+=(this.GLOBE_VERTEX_COUNT*eyeCount);
            nIdx+=(this.GLOBE_NORMAL_COUNT*eyeCount);
            uvIdx+=(this.GLOBE_UV_COUNT*eyeCount);
            iIdx+=(this.GLOBE_INDEX_COUNT*eyeCount);
        }
        
            // put primitives around bones
            
        var vertices=new Float32Array(vIdx);
        var normals=new Float32Array(nIdx);
        var uvs=new Float32Array(uvIdx);
        var indexes=new Uint16Array(iIdx);
        
            // box all the bones
        
        vIdx=0;         // normals are parallel to vertices
        uvIdx=0;
        iIdx=0;
        
        var xBound,yBound,zBound;

        for (n=0;n!==bones.length;n++) {
            bone=bones[n];
            parentBone=bones[bone.parentBoneIdx];
            
                // skip the base bone
                
            if (bone.isBase()) continue;
            
                // box type bones
            
            if (bone.isHand()) {
                xBound=new wsBound((bone.position.x-100),(bone.position.x+100));
                yBound=new wsBound((bone.position.y-100),(bone.position.y+150));
                zBound=new wsBound((bone.position.z-50),(bone.position.z+50));

                this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.0,0.5);
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                
                continue;
            }
            
            if (bone.isFoot()) {
                xBound=new wsBound((bone.position.x-100),(bone.position.x+100));
                yBound=new wsBound((bone.position.y-150),(bone.position.y));
                zBound=new wsBound((bone.position.z-50),(bone.position.z+450));

                this.buildBoxAroundBone(view,bone,xBound,yBound,zBound,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.0,0.5);
                vIdx+=this.BOX_VERTEX_COUNT;
                uvIdx+=this.BOX_UV_COUNT;
                iIdx+=this.BOX_INDEX_COUNT;
                
                continue;
            }
            
                // cylinder type bones
                
            if ((bone.isWrist()) || (bone.isElbow()) || (bone.isAnkle()) || (bone.isKnee())) {
                this.buildCylinderAroundTwoBones(view,bone,parentBone,100,100,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.0,0.0);
                
                vIdx+=this.CYLINDER_VERTEX_COUNT;
                uvIdx+=this.CYLINDER_UV_COUNT;
                iIdx+=this.CYLINDER_INDEX_COUNT;
                
                continue;
            }
            
        }
        
            // head
            
        var headBone=this.model.skeleton.findBone('Head');
        parentBone=bones[headBone.parentBoneIdx];
        var headRadiusHigh=headBone.position.distance(parentBone.position)+100;     // force into neck, will need to change this later
        var headRadiusWid=headRadiusHigh*(0.25+(this.genRandom.random()*0.5));
        
        this.buildGlobeAroundBone(view,headBone,headRadiusWid,headRadiusHigh,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.0,0.0);
        vIdx+=this.GLOBE_VERTEX_COUNT;
        uvIdx+=this.GLOBE_UV_COUNT;
        iIdx+=this.GLOBE_INDEX_COUNT;
             
            // eyes

        var eyePnt;
        
        for (k=0;k!==eyeCount;k++) {
            eyePnt=headBone.position.copy();
            eyePnt.z+=(headRadiusWid+200);
            eyePnt.x+=(150*k);
            this.buildGlobeAroundPoint(view,eyePnt,100,100,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.0);
            vIdx+=this.GLOBE_VERTEX_COUNT;
            uvIdx+=this.GLOBE_UV_COUNT;
            iIdx+=this.GLOBE_INDEX_COUNT;
            continue;
        }
       
            // build the body bones
            
        var shoulderDist=this.model.skeleton.getDistanceBetweenBones('Left Shoulder','Right Shoulder');
        
        var neckRadius=this.genRandom.randomInt(100,50);
        var torsoRadius=Math.floor(shoulderDist.x*0.5)+this.genRandom.randomInt(0,50);
        var waistRadius=torsoRadius-this.genRandom.randomInt(20,100);
        var hipRadius=waistRadius+this.genRandom.randomInt(20,100);
        
        var neckBone=this.model.skeleton.findBone("Neck");
        var torsoTopBone=this.model.skeleton.findBone("Torso Top");
        var torsoBone=this.model.skeleton.findBone("Torso");
        var waistBone=this.model.skeleton.findBone("Waist");
        var hipBone=this.model.skeleton.findBone("Hip");
        
        this.buildCylinderAroundTwoBones(view,neckBone,torsoTopBone,neckRadius,neckRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.5);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        this.buildCylinderAroundTwoBones(view,torsoTopBone,torsoBone,neckRadius,torsoRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.5);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        this.buildCylinderAroundTwoBones(view,torsoBone,waistBone,torsoRadius,waistRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.5);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        this.buildCylinderAroundTwoBones(view,waistBone,hipBone,waistRadius,hipRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.5);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
        var pt=hipBone.position.copy();
        pt.y+=300;
        
        this.buildCylinderAroundTwoPoints(view,hipBone.position,pt,hipRadius,hipRadius,vertices,vIdx,normals,uvs,uvIdx,indexes,iIdx,0.5,0.5);
        vIdx+=this.CYLINDER_VERTEX_COUNT;
        uvIdx+=this.CYLINDER_UV_COUNT;
        iIdx+=this.CYLINDER_INDEX_COUNT;
        
            // complete the tangent space vectors
    
        var tangents=meshUtility.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
