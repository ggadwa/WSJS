import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ModelMeshClass from '../../code/model/model_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import genRandom from '../../generate/utility/random.js';

//
// helper class for globe shrinking
//

class GenMeshBaseBoneClass
{
    constructor()
    {
        this.idx=-1;
        this.position=null;
        this.gravityLockDistance=0;
        
        Object.seal(this);
    }
}

//
// gen human mesh class
//

export default class GenMeshBaseClass
{
    constructor(view,model,bitmap)
    {
        this.view=view;
        this.model=model;
        this.bitmap=bitmap;
    }
    
        //
        // find bounds for a collection of bones
        // and find the width and heigth of a globe
        // that will circle them and be within the min
        // gravity distance
        //
        
    findBoundsForBoneList(boneList,xBound,yBound,zBound)
    {
        let n,pos;
        let nBone=boneList.length;
        
        pos=boneList[0].position;
        xBound.min=xBound.max=pos.x;
        yBound.min=yBound.max=pos.y;
        zBound.min=zBound.max=pos.z;
        
        for (n=1;n<nBone;n++) {
            pos=boneList[n].position;
            xBound.adjust(pos.x);
            yBound.adjust(pos.y);
            zBound.adjust(pos.z);
        }
    }
    
    findMaxGravityForBoneList(boneList)
    {
        let n;
        let nBone=boneList.length;
        let maxGravityDist=0;
        
        for (n=0;n!==nBone;n++) {
            if (boneList[n].gravityLockDistance>maxGravityDist) maxGravityDist=boneList[n].gravityLockDistance;
        }
            
        return(maxGravityDist);
    }

        //
        // build a large global around
        // center point
        //
        
    buildGlobeAroundSkeletonX(acrossSurfaceCount,aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes)
    {
        let x,yz,v,vIdx,iIdx;
        let vNextIdx,v2Idx,v2NextIdx;
        let minIdx,maxIdx,maxOff;
        let rd,radius,px;
        let vAng,xAng,yzAng,yzAngAdd,xAngAdd;
        
            // create the globe without a top
            // or bottom and build that with trigs later
            
        yzAngAdd=360.0/aroundSurfaceCount;
        xAngAdd=180.0/(acrossSurfaceCount-1);
        xAng=xAngAdd;
        
        vIdx=0;
        
        for (x=1;x!==(acrossSurfaceCount-1);x++) {
            
                // get x position and radius
                // from angle
            
            rd=xAng*constants.DEGREE_TO_RAD;
            radius=aroundRadius*Math.sin(rd);
            px=centerPnt.x-(acrossRadius*Math.cos(rd));
            
            vAng=xAng/180.0;
            
                // the band of vertexes
            
            yzAng=0.0;
            
            for (yz=0;yz<=aroundSurfaceCount;yz++) {
                v=vertexList[vIdx++];
                
                rd=(yz!==aroundSurfaceCount)?(yzAng*constants.DEGREE_TO_RAD):0.0;
                
                v.position.x=px;
                v.position.y=centerPnt.y+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                v.position.z=centerPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                v.uv.x=(yz!==aroundSurfaceCount)?(yzAng/360.0):0.9999;
                v.uv.y=vAng;

                yzAng+=yzAngAdd;
            }
            
            xAng+=xAngAdd;
        }
        
            // end points
       
        minIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues((centerPnt.x-acrossRadius),centerPnt.y,centerPnt.z);
        v.uv.setFromValues(0.5,0.0);

        maxIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues((centerPnt.x+acrossRadius),centerPnt.y,centerPnt.z);
        v.uv.setFromValues(0.5,1.0);
        
            // build the triangles on
            // all the strips except the
            // end points
            
        iIdx=0;
        
        for (x=0;x!==(acrossSurfaceCount-3);x++) {
            
            for (yz=0;yz!==aroundSurfaceCount;yz++) {
                
                vIdx=(x*(aroundSurfaceCount+1))+yz;
                v2Idx=((x+1)*(aroundSurfaceCount+1))+yz;
                
                vNextIdx=(x*(aroundSurfaceCount+1))+(yz+1);
                v2NextIdx=((x+1)*(aroundSurfaceCount+1))+(yz+1);
                 
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            }
        }
        
            // min end point
        
        for (yz=0;yz!==aroundSurfaceCount;yz++) {
            indexes[iIdx++]=yz;
            indexes[iIdx++]=minIdx;
            indexes[iIdx++]=yz+1;
        }
        
            // max end point
            
        maxOff=(aroundSurfaceCount+1)*(acrossSurfaceCount-3);

        for (yz=0;yz!==aroundSurfaceCount;yz++) {
            indexes[iIdx++]=maxOff+yz;
            indexes[iIdx++]=maxIdx;
            indexes[iIdx++]=maxOff+(yz+1);
        }
    }
    
    buildGlobeAroundSkeletonY(acrossSurfaceCount,aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes)
    {
        let xz,y,v,vIdx,iIdx;
        let vNextIdx,v2Idx,v2NextIdx;
        let minIdx,maxIdx,maxOff;
        let rd,radius,py;
        let vAng,xzAng,yAng,xzAngAdd,yAngAdd;

            // create the globe without a top
            // or bottom and build that with trigs later
            
        xzAngAdd=360.0/aroundSurfaceCount;
        yAngAdd=180.0/(acrossSurfaceCount-1);
        yAng=yAngAdd;
        
        vIdx=0;
        
        for (y=1;y!==(acrossSurfaceCount-1);y++) {
            
                // get y position and radius
                // from angle
            
            rd=yAng*constants.DEGREE_TO_RAD;
            radius=aroundRadius*Math.sin(rd);
            py=centerPnt.y-(acrossRadius*Math.cos(rd));
            
            vAng=yAng/180.0;
            
                // the band of vertexes
            
            xzAng=0.0;
            
            for (xz=0;xz<=aroundSurfaceCount;xz++) {
                v=vertexList[vIdx++];
                
                rd=(xz!==aroundSurfaceCount)?(xzAng*constants.DEGREE_TO_RAD):0.0;
                
                v.position.x=centerPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                v.position.y=py;
                v.position.z=centerPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                v.uv.x=(xz!==aroundSurfaceCount)?(xzAng/360.0):0.9999;
                v.uv.y=vAng;
                
                xzAng+=xzAngAdd;
            }
            
            yAng+=yAngAdd;
        }
        
            // end points
        
        minIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,(centerPnt.y-acrossRadius),centerPnt.z);
        v.uv.setFromValues(0.5,0.0);
    
        maxIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,(centerPnt.y+acrossRadius),centerPnt.z);
        v.uv.setFromValues(0.5,1.0);
    
            // build the triangles on
            // all the strips except the
            // end points
            
        iIdx=0;
        
        for (y=0;y!==(acrossSurfaceCount-3);y++) {
            
            for (xz=0;xz!==aroundSurfaceCount;xz++) {
                
                vIdx=(y*(aroundSurfaceCount+1))+xz;
                v2Idx=((y+1)*(aroundSurfaceCount+1))+xz;
                
                vNextIdx=(y*(aroundSurfaceCount+1))+(xz+1);
                v2NextIdx=((y+1)*(aroundSurfaceCount+1))+(xz+1);
                 
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            }
        }
        
            // min end point
        
        for (xz=0;xz!==aroundSurfaceCount;xz++) {
            indexes[iIdx++]=xz;
            indexes[iIdx++]=minIdx;
            indexes[iIdx++]=xz+1;
        }
        
            // max end point
        
        maxOff=(aroundSurfaceCount+1)*(acrossSurfaceCount-3);

        for (xz=0;xz!==aroundSurfaceCount;xz++) {
            indexes[iIdx++]=maxOff+xz;
            indexes[iIdx++]=maxIdx;
            indexes[iIdx++]=maxOff+(xz+1);
        }
    }
    
    buildGlobeAroundSkeletonZ(acrossSurfaceCount,aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes)
    {
        let xy,z,v,vIdx,iIdx;
        let vNextIdx,v2Idx,v2NextIdx;
        let minIdx,maxIdx,maxOff;
        let rd,radius,pz;
        let vAng,xyAng,zAng,xyAngAdd,zAngAdd;
        
            // create the globe without a top
            // or bottom and build that with trigs later
            
        xyAngAdd=360.0/aroundSurfaceCount;
        zAngAdd=180.0/(acrossSurfaceCount-1);
        zAng=zAngAdd;
        
        vIdx=0;
        
        for (z=1;z!==(acrossSurfaceCount-1);z++) {
            
                // get y position and radius
                // from angle
            
            rd=zAng*constants.DEGREE_TO_RAD;
            radius=aroundRadius*Math.sin(rd);
            pz=centerPnt.z-(acrossRadius*Math.cos(rd));
            
            vAng=zAng/180.0;
            
                // the band of vertexes
            
            xyAng=0.0;
            
            for (xy=0;xy<=aroundSurfaceCount;xy++) {
                v=vertexList[vIdx++];
                
                rd=(xy!==aroundSurfaceCount)?(xyAng*constants.DEGREE_TO_RAD):0.0;
                
                v.position.x=centerPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                v.position.y=centerPnt.y+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                v.position.z=pz;

                v.uv.x=(xy!==aroundSurfaceCount)?(xyAng/360.0):0.9999;
                v.uv.y=vAng;

                xyAng+=xyAngAdd;
            }
            
            zAng+=zAngAdd;
        }
        
            // end points
        
        minIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,centerPnt.y,(centerPnt.z-acrossRadius));
        v.uv.setFromValues(0.5,0.0);
    
        maxIdx=vIdx;

        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,centerPnt.y,(centerPnt.z+acrossRadius));
        v.uv.setFromValues(0.5,1.0);
        
            // build the triangles on
            // all the strips except the
            // end points
            
        iIdx=0;
        
        for (z=0;z!==(acrossSurfaceCount-3);z++) {
            
            for (xy=0;xy!==aroundSurfaceCount;xy++) {
                
                vIdx=(z*(aroundSurfaceCount+1))+xy;
                v2Idx=((z+1)*(aroundSurfaceCount+1))+xy;
                
                vNextIdx=(z*(aroundSurfaceCount+1))+(xy+1);
                v2NextIdx=((z+1)*(aroundSurfaceCount+1))+(xy+1);
                 
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            }
        }
        
            // min end point
        
        for (xy=0;xy!==aroundSurfaceCount;xy++) {
            indexes[iIdx++]=xy;
            indexes[iIdx++]=minIdx;
            indexes[iIdx++]=xy+1;
        }
        
            // max end point
        
        maxOff=(aroundSurfaceCount+1)*(acrossSurfaceCount-3);

        for (xy=0;xy!==aroundSurfaceCount;xy++) {
            indexes[iIdx++]=maxOff+xy;
            indexes[iIdx++]=maxIdx;
            indexes[iIdx++]=maxOff+(xy+1);
        }
    }

        //
        // shrink wrap the globe around a
        // collection of points
        //
        
    shrinkWrapGlobe(vertexList,boneList,centerPnt)
    {
        let n,k;
        let v,bone,dist,shrinkDist,gravityMaxDistance;
        let nVertex=vertexList.length;
        let nBone=boneList.length;
        let moving=[];
        let anyMove;
        let moveVector=new PointClass(0,0,0);
        let gravityVector=new PointClass(0,0,0);
        let moveCount=0;
        let boneHit;
        
            // move distance for shrinking bones
            
        shrinkDist=10.0;
        gravityMaxDistance=5000;
        
            // keep a parallel list of
            // what bones are moving (bones
            // stop when they get within the
            // gravity min distance of all gravity bones)
        
        for (n=0;n!==nVertex;n++) {
            moving.push(true);
        }
        
            // loop the moves
            
        while (moveCount<1000) {
            
            moveCount++;
            anyMove=false;
        
                // run through the vertices

            for (n=0;n!==nVertex;n++) {

                    // is this one moving?

                if (!moving[n]) continue;

                    // get the vertex

                v=vertexList[n];
                               
                    // get the gravity to each bone

                boneHit=false;
                moveVector.setFromValues(0,0,0);
                
                for (k=0;k!==nBone;k++) {
                    bone=boneList[k];
                    dist=bone.position.distance(v.position);
                    
                        // if too close, then all movement stops
                        
                    if (dist<bone.gravityLockDistance) {
                        moving[n]=false;
                        break;
                    }
                    
                        // outside of max gravity well
                        
                    if (dist>gravityMaxDistance) continue;
                    
                        // otherwise add in gravity
                        
                    gravityVector.setFromSubPoint(bone.position,v.position);
                    gravityVector.normalize();
                    gravityVector.scale((1.0-(dist/gravityMaxDistance))*shrinkDist);
                    
                    moveVector.addPoint(gravityVector);
                    
                    boneHit=true;
                }
                
                    // are we done moving?
                    
                if (!moving[n]) continue;
                
                    // if we didn't hit any bones, then we
                    // always move towards center, otherwise do
                    // the gravity move
                    
                if (!boneHit) {
                    moveVector.setFromSubPoint(centerPnt,v.position);
                    moveVector.normalize();
                    moveVector.scale(shrinkDist);
                }

                v.position.addPoint(moveVector);
                
                    // we did a move so we go
                    // around again
                    
                anyMove=true;
            }
            
                // no moves?  Then done
                
            if (!anyMove) break;
        }
    }
    
        //
        // attach vertices to nearest bone
        //
        
    attachVertexToBones(vertexList,boneList,centerPnt)
    {
        let n,k,v;
        let bone,boneIdx,d,dist;
        let nVertex=vertexList.length;
        let nBone=boneList.length;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            
                // attach a bone
                
            boneIdx=-1;
            
            for (k=0;k!==nBone;k++) {
                bone=boneList[k];
                if (bone.idx===-1) continue;        // this is a temp bone, skip it

                d=bone.position.distance(v.position);
                if (boneIdx===-1) {
                    boneIdx=boneList[k].idx;
                    dist=d;
                }
                else {
                    if (d<dist) {
                        boneIdx=boneList[k].idx;
                        dist=d;
                    }
                }
            }
            
            v.boneIdx=boneIdx;
        }
    }
    
        //
        // scale all the vertexes along
        // the line to the bone, use this to
        // squish a model in a certain direction
        //
        
    scaleVertexToBones(vertexList,scaleMin,scaleMax)
    {
        let n,v;
        let nVertex=vertexList.length;
        let bones=this.model.skeleton.bones;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            if (v.boneIdx!==-1) v.position.scaleFromMinMaxPoint(bones[v.boneIdx].position,scaleMin,scaleMax);
        }
    }
    
        //
        // random vertex moves along
        // the line to the attached bone
        //
        
    randomScaleVertexToBones(vertexList)
    {
        let n,k,v,v2,f;
        let bone,pos;
        let nVertex=vertexList.length;
        let bones=this.model.skeleton.bones;
        
        let prevMove=new Uint8Array(nVertex);
        
        pos=new PointClass(0,0,0);

        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            if (v.boneIdx===-1) continue;
            
                // some vertexes are in the same place,
                // we don't want to move them separately or
                // the mesh breaks up
                
            if (prevMove[n]!==0) continue;
            
                // get original position
                
            pos.setFromPoint(v.position);
            
                // move the vertex
                // and any similar vertex
            
            bone=bones[v.boneIdx];
            f=0.9+(genRandom.random()*0.2);
            
            for (k=0;k!==nVertex;k++) {
                if (prevMove[k]!==0) continue;
                v2=vertexList[k];
                if ((k===n) || (v2.position.truncEquals(pos))) {
                    v2.position.subPoint(bone.position);
                    v2.position.scale(f);
                    v2.position.addPoint(bone.position);
                    prevMove[k]=1;
                }
            }
        }
    }
        
        //
        // build mesh around limb
        //
        
    buildAroundBoneLimb(limb,vertexList,indexes)
    {
        let n,k,f,boneIdx,bone,parentBone,listBone;
        let acrossRadius,aroundRadius;
        let extraBoneCount;
        let parentListIdx,maxGravity;
        let xBound,yBound,zBound,centerPnt;
        
            // create list of bones
            
        let boneList=[];
        let boneCount=limb.boneIndexes.length;
        
        for (n=0;n!==boneCount;n++) {
            boneIdx=limb.boneIndexes[n];
            bone=this.model.skeleton.bones[boneIdx];
            
            listBone=new GenMeshBaseBoneClass();
            listBone.idx=boneIdx;
            listBone.position=bone.position.copy();
            listBone.gravityLockDistance=bone.gravityLockDistance;
            
            boneList.push(listBone);
        }
        
            // if any bone in the list is a parent of
            // another bone in the list, then add some
            // temp bones to smooth out the shrink wrapping
   
        for (n=0;n!==boneCount;n++) {
            bone=this.model.skeleton.bones[boneList[n].idx];
            
                // parented in this list?
                
            parentListIdx=-1;
            
            for (k=0;k!==boneCount;k++) {
                if (bone.parentBoneIdx===boneList[k].idx) {
                    parentListIdx=k;
                    break;
                }
            }
            
            if (parentListIdx===-1) continue;
            
                // create temp bones
                // based on the distance, we insert extra
                // bones inbetween to smooth out shrink wrap
             
            parentBone=this.model.skeleton.bones[bone.parentBoneIdx];
            
            extraBoneCount=Math.trunc(parentBone.position.distance(bone.position)/300);
            if (extraBoneCount<3) extraBoneCount=3;
            
            for (k=1;k!==extraBoneCount;k++) {
                f=k/extraBoneCount;
                
                listBone=new GenMeshBaseBoneClass();
                listBone.idx=-1;
                
                listBone.position=new PointClass(0,0,0);
                
                listBone.position.x=bone.position.x+((parentBone.position.x-bone.position.x)*f);
                listBone.position.y=bone.position.y+((parentBone.position.y-bone.position.y)*f);
                listBone.position.z=bone.position.z+((parentBone.position.z-bone.position.z)*f);
                
                listBone.gravityLockDistance=bone.gravityLockDistance+((parentBone.gravityLockDistance-bone.gravityLockDistance)*f);
                
                boneList.push(listBone);
            }
        }
        
            // find the bounds for this list of bones
            
        xBound=new BoundClass(0,0);
        yBound=new BoundClass(0,0);
        zBound=new BoundClass(0,0);
        
        this.findBoundsForBoneList(boneList,xBound,yBound,zBound);
        centerPnt=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // build the globe around the bones
            
        maxGravity=this.findMaxGravityForBoneList(boneList);
        
        switch (limb.axis) {
            case constants.LIMB_AXIS_X:
                acrossRadius=(xBound.getSize()*0.5)+maxGravity;
                aroundRadius=(yBound.getSize()>zBound.getSize())?((yBound.getSize()*0.5)+maxGravity):((zBound.getSize()*0.5)+maxGravity);
                this.buildGlobeAroundSkeletonX(limb.acrossSurfaceCount,limb.aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes);
                break;
            case constants.LIMB_AXIS_Y:
                acrossRadius=(yBound.getSize()*0.5)+maxGravity;
                aroundRadius=(xBound.getSize()>zBound.getSize())?((xBound.getSize()*0.5)+maxGravity):((zBound.getSize()*0.5)+maxGravity);
                this.buildGlobeAroundSkeletonY(limb.acrossSurfaceCount,limb.aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes);
                break;
            case constants.LIMB_AXIS_Z:
                acrossRadius=(zBound.getSize()*0.5)+maxGravity;
                aroundRadius=(xBound.getSize()>yBound.getSize())?((xBound.getSize()*0.5)+maxGravity):((yBound.getSize()*0.5)+maxGravity);
                this.buildGlobeAroundSkeletonZ(limb.acrossSurfaceCount,limb.aroundSurfaceCount,centerPnt,acrossRadius,aroundRadius,vertexList,indexes);
                break;
        }
        
            // reset the UVs to work within the
            // texture chunks
        
        switch (limb.limbType) {
            case constants.LIMB_TYPE_BODY:
                MeshUtilityClass.transformUVs(vertexList,0.0,0.5,0.5,0.5);
                break;
            case constants.LIMB_TYPE_HEAD:
            case constants.LIMB_TYPE_HEAD_SNOUT:
                MeshUtilityClass.transformUVs(vertexList,0.5,0.0,0.5,0.5);
                break;
            default:
                MeshUtilityClass.transformUVs(vertexList,0.0,0.0,0.5,0.5);
                break;
        }
            
            // shrink wrap the globe and rebuild
            // any normals, etc
            
        this.shrinkWrapGlobe(vertexList,boneList,centerPnt);
        this.attachVertexToBones(vertexList,boneList,centerPnt);
        this.scaleVertexToBones(vertexList,limb.scaleMin,limb.scaleMax);
    }
    
        //
        // builds the normals based on bones
        //
        
    buildNormalsToBones(vertexList)
    {
        let n,k,v,bone,bonePos,dist,curDist;
        let xBound,yBound,zBound,centerPnt;
        let nVertex=vertexList.length;
        let bones=this.model.skeleton.bones;
        let nBone=bones.length;
        
            // get the center in case there's a no-attachment
            // bone (this shouldn't happen right now)
            
        xBound=new BoundClass(0,0);
        yBound=new BoundClass(0,0);
        zBound=new BoundClass(0,0);
        
        this.findBoundsForBoneList(bones,xBound,yBound,zBound);
        centerPnt=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // find the closest bone in the bone list,
            // even though we have attachments, we need to
            // use the enlarged bone list because it
            // gives up better normals
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            
            curDist=-1;
            bonePos=null;
            
            for (k=0;k!==nBone;k++) {
                bone=bones[k];
                dist=bone.position.distance(v.position);
                
                if ((dist<curDist) || (curDist===-1)) {
                    curDist=dist;
                    bonePos=bone.position;
                }
            }
            
                // rebuild the normals
                
            if (bonePos===null) {
                v.normal.setFromSubPoint(v.position,centerPnt);
            }
            else {
                v.normal.setFromSubPoint(v.position,bonePos);
            }
            
            v.normal.normalize();
        }
    }
}
