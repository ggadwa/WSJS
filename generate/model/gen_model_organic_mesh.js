"use strict";

//
// helper class for globe shrinking
//

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
        
    this.GLOBE_SURFACE_COUNT=24;
    this.GLOBE_VERTEX_LIST_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-2))+2);
    this.GLOBE_INDEX_COUNT=((this.GLOBE_SURFACE_COUNT*(this.GLOBE_SURFACE_COUNT-3))*6)+((this.GLOBE_SURFACE_COUNT*2)*3);

        //
        // build a large global around
        // center of skeleton
        //
        
    this.buildGlobeAroundSkeleton=function(view,centerPnt,widRadius,highRadius,vertexList,indexes)
    {
        var x,y,ang;
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

                ang=xzAng+225.0;
                if (ang>=360.0) ang-=360.0;
                
                v.uv.x=1.0-(ang/360.0);
                v.uv.y=vAng;

                xzAng+=xzAngAdd;
            }
            
            yAng+=yAngAdd;
        }
        
            // top and bottom points
        
        var topIdx=Math.floor(vIdx);
        
        v=vertexList[vIdx++];
        v.position.x=centerPnt.x;
        v.position.y=centerPnt.y-highRadius;
        v.position.z=centerPnt.z;
        
        v.uv.x=0.5;
        v.uv.y=0.0;
        
        var botIdx=Math.floor(vIdx);
       
        v=vertexList[vIdx++];
        v.position.x=centerPnt.x;
        v.position.y=centerPnt.y+highRadius;
        v.position.z=centerPnt.z;
        
        v.uv.x=0.5;
        v.uv.y=1.0;
        
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
        
    this.shrinkWrapGlobe=function(vertexList,centerPnt)
    {
        var n,k;
        var v,bone,dist;
        var nVertex=vertexList.length;
        var bones=this.model.skeleton.bones;
        var nBone=bones.length;
        
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
        var vct;
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
                    bone=bones[k];
                    if (bone.isBase()) continue;

                    dist=bone.position.distance(v.position);
                    
                        // if too close, then all movement stops
                        
                    if (dist<500) {
                        move.moving=false;
                        break;
                    }
                    
                        // outside of gravity
                        
                    if (dist>4000) continue;
                    
                        // otherwise add in gravity
                        
                    vct=new wsPoint((bone.position.x-v.position.x),(bone.position.y-v.position.y),(bone.position.z-v.position.z));
                    vct.normalize();
                    vct.scale((1.0-(dist/4000.0))*10.0);
                    
                    moveVector.addPoint(vct);
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
        //
        
    this.attachVertexToBones=function(vertexList)
    {
        var n,k,v;
        var bone,boneIdx,d,dist;
        var nVertex=vertexList.length;
        var bones=this.model.skeleton.bones;
        var nBone=bones.length;
        
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            
            boneIdx=-1;
            
            for (k=0;k!==nBone;k++) {
                bone=bones[k];
                if (bone.isBase()) continue;

                d=bone.position.distance(v.position);
                if (boneIdx===-1) {
                    boneIdx=k;
                    dist=d;
                }
                else {
                    if (d<dist) {
                        boneIdx=k;
                        dist=d;
                    }
                }
            }
            
            v.boneIdx=boneIdx;
        }
    };
    
        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
        var n;

            // build the vertex list for the model vertexes
        
        var vertexList=[];
        
        for (n=0;n!==this.GLOBE_VERTEX_LIST_COUNT;n++) {
            vertexList.push(new ModelMeshVertexObject());
        }
        
            // the indexes for the triangles
            
        var indexes=new Uint16Array(this.GLOBE_INDEX_COUNT);
        
            // get skeleton center
            // and size, leave the size a bit
            // bigger than the entire skeleton
            // so globe gets wraps properly around
            // outer bones
        
        var xBound=new wsBound(0,0);
        var yBound=new wsBound(0,0);
        var zBound=new wsBound(0,0);
        
        this.model.skeleton.getBounds(xBound,yBound,zBound);
        
        var widRadius=xBound.getSize();
        if (zBound.getSize()>widRadius) widRadius=zBound.getSize();
        widRadius=Math.floor(widRadius*0.75);
        
        var highRadius=Math.floor(yBound.getSize()*0.75);
        
        var centerPnt=this.model.skeleton.getCenter();
        
            // build the globe and shrink
            // wrap it to bones
        
        this.buildGlobeAroundSkeleton(view,centerPnt,widRadius,highRadius,vertexList,indexes);
        this.shrinkWrapGlobe(vertexList,centerPnt);
        this.attachVertexToBones(vertexList);
        
            // complete the tangent space vectors
        
        meshUtility.buildModelMeshNormals(vertexList,indexes,false);
        meshUtility.buildModelMeshTangents(vertexList,indexes);
        
            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertexList,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
