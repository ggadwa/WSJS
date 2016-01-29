"use strict";

//
// helper class for globe shrinking
//

function GenModelOrganicBoneObject()
{
    this.idx=-1;
    this.position=null;
    this.gravityLockDistance=0;
    this.gravityPullDistance=0;
}

function GenModelOrganicMeshVertexShrinkObject(moveVector)
{
    this.moving=true;
    this.moveVector=moveVector;
}

//
// gen organic mesh class
//

function GenModelOrganicMeshObject(model,bitmap,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;
    
        // globe counts
        
    this.GLOBE_SURFACE_COUNT=16;
    this.GLOBE_VERTEX_LIST_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2);
    this.GLOBE_INDEX_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3))*6)+((this.GLOBE_SURFACE_COUNT*2)*3);
    
        //
        // find bounds for collection
        // collection of bones
        //
        
    this.findBoundsForBoneList=function(boneList,xBound,yBound,zBound)
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
        
        xBound.forceMinSize(1000);
        yBound.forceMinSize(1000);
        zBound.forceMinSize(1000);
    };

        //
        // build a large global around
        // center point
        //
        
    this.buildGlobeAroundSkeleton=function(view,centerPnt,widRadius,highRadius,vertexList,indexes)
    {
        var x,y;
        var rd,radius,py;
        var vAng;
        var v;
         
            // create the globe without a top
            // or bottom and build that with trigs later
            
        var xzAngAdd=360.0/this.GLOBE_SURFACE_COUNT;
        var yAngAdd=180.0/this.GLOBE_SURFACE_COUNT;

        var xzAng;
        var yAng=yAngAdd;
        
        var vIdx=0;
        
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
        
        var topIdx=Math.floor(vIdx);
        
        v=vertexList[vIdx++];
        v.position.set(centerPnt.x,(centerPnt.y-highRadius),centerPnt.z);
        v.uv.set(0.5,0.0);
        
        var botIdx=Math.floor(vIdx);
       
        v=vertexList[vIdx++];
        v.position.set(centerPnt.x,(centerPnt.y+highRadius),centerPnt.z);
        v.uv.set(0.5,1.0);
        
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
        // shrink wrap the globe around a
        // collection of points
        //
        
    this.shrinkWrapGlobe=function(vertexList,boneList,centerPnt)
    {
        var n,k;
        var v,bone,dist;
        var nVertex=vertexList.length;
        var nBone=boneList.length;
        
            // we move each vertex inwards
            // toward the center point
            // each vertex stops when it reaches
            // the radius of a bone
            
            // build the parallel list of
            // vertex movement
        
        var move;
        var moves=[];
        var moveVct;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            
            moveVct=new wsPoint((centerPnt.x-v.position.x),(centerPnt.y-v.position.y),(centerPnt.z-v.position.z));
            moveVct.normalize();
            moveVct.scale(10);      // move 10 units at a time
            
            moves.push(new GenModelOrganicMeshVertexShrinkObject(moveVct));
        }
        
            // loop the moves
            
        var anyMove;
        var moveVector=new wsPoint(0,0,0);
        var gravityVector=new wsPoint(0,0,0);
        var moveCount=0;
        
        while (moveCount<1000) {
            
            moveCount++;
            anyMove=false;
        
                // run through the vertices

            for (n=0;n!==nVertex;n++) {

                    // is this one moving?

                move=moves[n];
                if (!move.moving) continue;

                    // get the vertex

                v=vertexList[n];
                               
                    // get the gravity to each bone

                moveVector.set(0,0,0);
                
                for (k=0;k!==nBone;k++) {
                    bone=boneList[k];
                    dist=bone.position.distance(v.position);
                    
                        // if too close, then all movement stops
                        
                    if (dist<bone.gravityLockDistance) {
                        move.moving=false;
                        break;
                    }
                    
                        // outside of gravity
                        
                    if (dist>bone.gravityPullDistance) continue;
                    
                        // otherwise add in gravity
                        
                    gravityVector.setFromSubPoint(bone.position,v.position);
                    gravityVector.normalize();
                    gravityVector.scale((1.0-(dist/bone.gravityPullDistance))*10.0);
                    
                    moveVector.addPoint(gravityVector);
                }
                
                    // are we done moving?
                    
                if (!move.moving) continue;
                
                    // move the vertex
                    
                v.position.addPoint(moveVector);
                
                    // we did a move so we go
                    // around again
                    
                anyMove=true;
            }
            
                // no moves?  Then done
                
            if (!anyMove) break;
        }
    };
    
        //
        // attach vertices to nearest bone
        // this function also rebuilds the normals as
        // vertexes are attached to bones
        //
        
    this.attachVertexToBones=function(vertexList,boneList,centerPnt)
    {
        var n,k,v;
        var bone,boneIdx,d,dist;
        var nVertex=vertexList.length;
        var bones=this.model.skeleton.bones;
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
            
                // rebuild the normals
                
            if (boneIdx===-1) {
                v.normal.setFromSubPoint(v.position,centerPnt);
            }
            else {
                v.normal.setFromSubPoint(v.position,bones[boneIdx].position);
            }
            v.normal.normalize();
        }
    };
    
        //
        // build around bone list
        //
        
    this.buildAroundBoneList=function(view,skeletonBoneIndexes,vertexList,indexes)
    {
        var n,k,f,boneIdx,bone,parentBone,listBone;
        var parentListIdx;
        
            // create list of bones
            
        var boneList=[];
        var boneCount=skeletonBoneIndexes.length;
        
        for (n=0;n!==boneCount;n++) {
            boneIdx=skeletonBoneIndexes[n];
            bone=this.model.skeleton.bones[boneIdx];
            
            listBone=new GenModelOrganicBoneObject();
            listBone.idx=boneIdx;
            listBone.position=bone.position.copy();
            listBone.gravityLockDistance=bone.gravityLockDistance;
            listBone.gravityPullDistance=bone.gravityPullDistance;
            
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
             
            parentBone=this.model.skeleton.bones[bone.parentBoneIdx];
            
            for (k=1;k!==3;k++) {
                f=k/3;
                
                listBone=new GenModelOrganicBoneObject();
                listBone.idx=-1;
                
                listBone.position=new wsPoint(0,0,0);
                
                listBone.position.x=bone.position.x+((parentBone.position.x-bone.position.x)*f);
                listBone.position.y=bone.position.y+((parentBone.position.y-bone.position.y)*f);
                listBone.position.z=bone.position.z+((parentBone.position.z-bone.position.z)*f);
                
                listBone.gravityLockDistance=bone.gravityLockDistance+((parentBone.gravityLockDistance-bone.gravityLockDistance)*f);
                listBone.gravityPullDistance=bone.gravityPullDistance+((parentBone.gravityPullDistance-bone.gravityPullDistance)*f);
                
                boneList.push(listBone);
            }
        }
        
            // find the bounds for this list of bones
            
        var xBound=new wsBound(0,0);
        var yBound=new wsBound(0,0);
        var zBound=new wsBound(0,0);
        
        this.findBoundsForBoneList(boneList,xBound,yBound,zBound);
        
        var widRadius=xBound.getSize();
        if (zBound.getSize()>widRadius) widRadius=zBound.getSize();
        widRadius=Math.floor(widRadius*0.75);
        
        var highRadius=Math.floor(yBound.getSize()*0.75);
        
        var centerPnt=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // build the globe and shrink
            // wrap it to bones
        
        this.buildGlobeAroundSkeleton(view,centerPnt,widRadius,highRadius,vertexList,indexes);
        this.shrinkWrapGlobe(vertexList,boneList,centerPnt);
        this.attachVertexToBones(vertexList,boneList,centerPnt);
        
            // complete the tangent space vectors
        
        meshUtility.buildVertexListTangents(vertexList,indexes);
    };
    
        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
        var n;
        var indexOffset;
        
        var skeleton=this.model.skeleton;

        var vertexList,indexes;
        var modelVertexList=null;
        var modelIndexes=null;
        
            // wrap all the limbs
            
        for (n=0;n!==skeleton.limbs.length;n++) {
            vertexList=meshUtility.createModelVertexList(this.GLOBE_VERTEX_LIST_COUNT);
            indexes=new Uint16Array(this.GLOBE_INDEX_COUNT);

            this.buildAroundBoneList(view,skeleton.limbs[n].boneIndexes,vertexList,indexes);

            if (modelVertexList===null) {
                modelVertexList=vertexList;
                modelIndexes=indexes;
            }
            else {
                modelVertexList=meshUtility.combineVertexLists(modelVertexList,vertexList);
                modelIndexes=meshUtility.combineIndexes(modelIndexes,indexes,indexOffset);
            }
            
            indexOffset=modelVertexList.length;
        }
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,modelVertexList,modelIndexes,0);
        this.model.mesh.setupBuffers(view);
        this.model.mesh.precalcAnimationValues(this.model.skeleton);
    };
    
}
