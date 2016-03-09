//
// helper class for globe shrinking
//

class GenModelOrganicBoneClass
{
    constructor()
    {
        this.idx=-1;
        this.position=null;
        this.gravityLockDistance=0;
    }
}

//
// gen organic mesh class
//

class GenModelOrganicMeshClass
{
    constructor(model,bitmap,genRandom)
    {
        this.model=model;
        this.bitmap=bitmap;
        this.genRandom=genRandom;
    }
    
        //
        // find bounds for a collection of bones
        // and find the width and heigth of a globe
        // that will circle them and be within the min
        // gravity distance
        //
        
    findBoundsForBoneList(boneList,xBound,yBound,zBound)
    {
        var n,pos;
        var nBone=boneList.length;
        
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
    
    findWidthForEnclosingGlobe(boneList,xBound,zBound)
    {
        var n,widRadius;
        var nBone=boneList.length;
        var minGravityDist=0;
        
            // find the min gravity distance
            
        for (n=0;n!==nBone;n++) {
            if (boneList[n].gravityLockDistance>minGravityDist) minGravityDist=boneList[n].gravityLockDistance;
        }

            // build the width
            
        widRadius=xBound.getSize();
        if (zBound.getSize()>widRadius) widRadius=zBound.getSize();
        return(Math.trunc(widRadius*0.5)+minGravityDist);
    }
    
    findHeightForEnclosingGlobe(boneList,yBound)
    {
        var n;
        var nBone=boneList.length;
        var minGravityDist=0;
        
            // find the min gravity distance
            
        for (n=0;n!==nBone;n++) {
            if (boneList[n].gravityLockDistance>minGravityDist) minGravityDist=boneList[n].gravityLockDistance;
        }

            // build the height
        
        return(Math.trunc(yBound.getSize()*0.5)+minGravityDist);
    }

        //
        // build a large global around
        // center point
        //
        
    buildGlobeAroundSkeleton(view,globeSurfaceCount,centerPnt,widRadius,highRadius,vertexList,indexes)
    {
        var x,y;
        var rd,radius,py;
        var vAng;
        var v;
        
            // create the globe without a top
            // or bottom and build that with trigs later
            
        var xzAngAdd=360.0/globeSurfaceCount;
        var yAngAdd=180.0/globeSurfaceCount;

        var xzAng;
        var yAng=yAngAdd;
        
        var vIdx=0;
        
        for (y=1;y!==(globeSurfaceCount-1);y++) {
            
                // get y position and radius
                // from angle
            
            rd=yAng*DEGREE_TO_RAD;
            radius=widRadius*Math.sin(rd);
            py=centerPnt.y-(highRadius*Math.cos(rd));
            
            vAng=yAng/180.0;
            
                // the band of vertexes
            
            xzAng=0.0;
            
            for (x=0;x!==globeSurfaceCount;x++) {
                v=vertexList[vIdx++];
                
                rd=xzAng*DEGREE_TO_RAD;
                
                v.position.x=centerPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                v.position.y=py;
                v.position.z=centerPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                v.uv.x=xzAng/360.0;
                v.uv.y=vAng;

                xzAng+=xzAngAdd;
            }
            
            yAng+=yAngAdd;
        }
        
            // top and bottom points
        
        var topIdx=Math.trunc(vIdx);
        
        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,(centerPnt.y-highRadius),centerPnt.z);
        v.uv.setFromValues(0.5,0.0);
        
        var botIdx=Math.trunc(vIdx);
       
        v=vertexList[vIdx++];
        v.position.setFromValues(centerPnt.x,(centerPnt.y+highRadius),centerPnt.z);
        v.uv.setFromValues(0.5,1.0);
        
            // build the triangles on
            // all the strips except the
            // top and bottom strip
            
        var nx,vNextIdx,v2Idx,v2NextIdx;
        var iIdx=0;
        
        for (y=0;y!==(globeSurfaceCount-3);y++) {
            
            for (x=0;x!==globeSurfaceCount;x++) {
                
                vIdx=(y*globeSurfaceCount)+x;
                v2Idx=((y+1)*globeSurfaceCount)+x;
                
                nx=(x<(globeSurfaceCount-1))?(x+1):0;

                vNextIdx=(y*globeSurfaceCount)+nx;
                v2NextIdx=((y+1)*globeSurfaceCount)+nx;
                 
                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vIdx;
                indexes[iIdx++]=vNextIdx;

                indexes[iIdx++]=v2Idx;
                indexes[iIdx++]=vNextIdx;
                indexes[iIdx++]=v2NextIdx;
            }
        }
        
            // top triangles
            
        for (x=0;x!==globeSurfaceCount;x++) {
            nx=(x<(globeSurfaceCount-1))?(x+1):0;
            
            indexes[iIdx++]=x;
            indexes[iIdx++]=topIdx;
            indexes[iIdx++]=nx;
        }
        
            // bottom triangles
            
        var botOff=globeSurfaceCount*(globeSurfaceCount-3);
            
        for (x=0;x!==globeSurfaceCount;x++) {
            nx=(x<(globeSurfaceCount-1))?(x+1):0;
            
            indexes[iIdx++]=botOff+x;
            indexes[iIdx++]=botIdx;
            indexes[iIdx++]=botOff+nx;
        }
    }
    
        //
        // shrink wrap the globe around a
        // collection of points
        //
        
    shrinkWrapGlobe(vertexList,boneList,centerPnt)
    {
        var n,k;
        var v,bone,dist;
        var nVertex=vertexList.length;
        var nBone=boneList.length;
        
            // move distance for shrinking bones
            
        var shrinkDist=10.0;
        var gravityMaxDistance=5000;
        
            // keep a parallel list of
            // what bones are moving (bones
            // stop when they get within the
            // gravity min distance of all gravity bones)
        
        var moving=[];
        
        for (n=0;n!==nVertex;n++) {
            moving.push(true);
        }
        
            // loop the moves
            
        var anyMove;
        var moveVector=new wsPoint(0,0,0);
        var gravityVector=new wsPoint(0,0,0);
        var moveCount=0;
        var boneHit;
        
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
        var n,k,v;
        var bone,boneIdx,d,dist;
        var nVertex=vertexList.length;
        var nBone=boneList.length;
        
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
        // each bone has a gravity scale factor that
        // squishes the shrunk globe in a direction
        //
        
    scaleVertexToBones(vertexList)
    {
        var n,v;
        var bone;
        var nVertex=vertexList.length;
        var bones=this.model.skeleton.bones;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            if (v.boneIdx===-1) continue;
            
            bone=bones[v.boneIdx];
            v.position.scaleFromPoint(bone.gravityScale);
        }
    }
    
        //
        // builds the normals based on bones
        //
        
    buildNormalsToBones(vertexList,boneList,centerPnt)
    {
        var n,k,v,bone,bonePos,dist,curDist;
        var nVertex=vertexList.length;
        var nBone=boneList.length;
        
            // find the closest bone in the bone list,
            // even though we have attachments, we need to
            // use the enlarged bone list because it
            // gives up better normals
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            
            curDist=-1;
            bonePos=null;
            
            for (k=0;k!==nBone;k++) {
                bone=boneList[k];
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
    
        //
        // build around bone list
        //
        
    buildAroundBoneList(view,globeSurfaceCount,skeletonBoneIndexes,vertexList,indexes)
    {
        var n,k,f,boneIdx,bone,parentBone,listBone;
        var extraBoneCount;
        var parentListIdx;
        
            // create list of bones
            
        var boneList=[];
        var boneCount=skeletonBoneIndexes.length;
        
        for (n=0;n!==boneCount;n++) {
            boneIdx=skeletonBoneIndexes[n];
            bone=this.model.skeleton.bones[boneIdx];
            
            listBone=new GenModelOrganicBoneClass();
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
                
                listBone=new GenModelOrganicBoneClass();
                listBone.idx=-1;
                
                listBone.position=new wsPoint(0,0,0);
                
                listBone.position.x=bone.position.x+((parentBone.position.x-bone.position.x)*f);
                listBone.position.y=bone.position.y+((parentBone.position.y-bone.position.y)*f);
                listBone.position.z=bone.position.z+((parentBone.position.z-bone.position.z)*f);
                
                listBone.gravityLockDistance=bone.gravityLockDistance+((parentBone.gravityLockDistance-bone.gravityLockDistance)*f);
                
                boneList.push(listBone);
            }
        }

            // find the bounds for this list of bones
            
        var xBound=new wsBound(0,0);
        var yBound=new wsBound(0,0);
        var zBound=new wsBound(0,0);
        
        this.findBoundsForBoneList(boneList,xBound,yBound,zBound);
        var widRadius=this.findWidthForEnclosingGlobe(boneList,xBound,zBound);
        var highRadius=this.findHeightForEnclosingGlobe(boneList,yBound);
        var centerPnt=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // build the globe and shrink
            // wrap it to bones
        
        this.buildGlobeAroundSkeleton(view,globeSurfaceCount,centerPnt,widRadius,highRadius,vertexList,indexes);
        this.shrinkWrapGlobe(vertexList,boneList,centerPnt);
        this.attachVertexToBones(vertexList,boneList,centerPnt);
        this.scaleVertexToBones(vertexList);
        this.buildNormalsToBones(vertexList,boneList,centerPnt);
        
            // complete the tangent space vectors
        
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
    }
    
        //
        // build mesh around skeleton
        //

    build(view)
    {
        var n,limb;
        var indexOffset;
        
        var skeleton=this.model.skeleton;

        var vertexList,indexes;
        var modelVertexList=null;
        var modelIndexes=null;
        
            // wrap all the limbs
            
        for (n=0;n!==skeleton.limbs.length;n++) {
            limb=skeleton.limbs[n];
            
                        // counts
            
            vertexList=MeshUtilityClass.createModelVertexList((limb.globeSurfaceCount*(limb.globeSurfaceCount-2))+2);
            indexes=new Uint16Array(((limb.globeSurfaceCount*(limb.globeSurfaceCount-3))*6)+((limb.globeSurfaceCount*2)*3));

            this.buildAroundBoneList(view,limb.globeSurfaceCount,limb.boneIndexes,vertexList,indexes);

            if (modelVertexList===null) {
                modelVertexList=vertexList;
                modelIndexes=indexes;
            }
            else {
                modelVertexList=MeshUtilityClass.combineVertexLists(modelVertexList,vertexList);
                modelIndexes=MeshUtilityClass.combineIndexes(modelIndexes,indexes,indexOffset);
            }
            
            indexOffset=modelVertexList.length;
        }
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshClass(this.bitmap,modelVertexList,modelIndexes,0);
        this.model.mesh.setupBuffers(view);
        this.model.mesh.precalcAnimationValues(this.model.skeleton);
    }
    
}
