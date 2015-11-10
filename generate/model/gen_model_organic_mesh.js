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
        
    this.shrinkWrapGlobe=function(vertices,centerPnt)
    {
        var n,k,vIdx;
        var bone,hitBone,dist;
        var nVertex=Math.floor(vertices.length/3);
        var bones=this.model.skeleton.bones;
        var nBone=bones.length;
        
        var pnt=new wsPoint(0,0,0);
        
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
            vIdx=n*3;
            
            moveVct=new wsPoint((centerPnt.x-vertices[vIdx]),(centerPnt.y-vertices[vIdx+1]),(centerPnt.z-vertices[vIdx+2]));
            moveVct.normalize();
            moveVct.scale(10);      // move 10 units at a time
            
            moves.push(new GenModelOrganicMeshVertexShrinkObject(moveVct));
        }
        
            // loop the moves
            
        var anyMove;
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

                vIdx=n*3;
                pnt.set(vertices[vIdx],vertices[vIdx+1],vertices[vIdx+2]);

                    // close to any bone?

                hitBone=false;
                
                for (k=0;k!==nBone;k++) {
                    bone=bones[k];
                    if (bone.isBase()) continue;

                    dist=bone.position.distance(pnt);
                    if (dist<250) {
                        hitBone=true;
                        break;
                    }
                }
                
                    // hit a bone radius, so
                    // no longer move this vertex
                    
                if (hitBone) {
                    move.moving=false;
                    continue;
                }
                
                    // move the vertex
                    
                pnt.addPoint(move.moveVector);

                vertices[vIdx]=pnt.x;
                vertices[vIdx+1]=pnt.y;
                vertices[vIdx+2]=pnt.z;
                
                    // we did a move so we go
                    // around again
                    
                anyMove=true;
            }
            
                // no moves?  Then done
                
            if (!anyMove) break;
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
            // and size, leave the size a bit
            // bigger than the entire skeleton
            // so it wraps properly around outer
            // bones
        
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
        
        this.buildGlobeAroundSkeleton(view,centerPnt,widRadius,highRadius,vertices,uvs,indexes);
        this.shrinkWrapGlobe(vertices,centerPnt);
        
            // complete the tangent space vectors
    
        var normals=meshUtility.buildMeshNormals(vertices,indexes,false);
        var tangents=meshUtility.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
