import PointClass from '../../code/utility/point.js';
import Point2DClass from '../../code/utility/2D_point.js';
import LineClass from '../../code/utility/line.js';
import BoundClass from '../../code/utility/bound.js';
import MeshVertexClass from '../../code/mesh/mesh_vertex.js';
import CollisionTrigClass from '../../code/utility/collision_trig.js';

//
// special class used to pre-calc some
// shared triangle elimination calculations
//

class MapMeshSharedTrigCacheClass
{
    constructor()
    {
        this.isWall=false;
        this.xBound=null;
        this.yBound=null;
        this.zBound=null;
        
        Object.seal(this);
    }
}

//
// map mesh class
//

export default class MeshClass
{
    constructor(view,bitmap,vertexList,indexes,flag)
    {
        this.view=view;
        this.bitmap=bitmap;
        this.vertexList=vertexList;
        this.indexes=indexes;
        this.flag=flag;

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);
        
            // center and bounds
            
        this.center=new PointClass(0,0,0);
        this.xBound=new BoundClass(0,0);
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);

            // non-culled index list

        this.nonCulledIndexCount=0;
        this.nonCulledIndexes=null;

            // drawing arrays

        this.drawVertices=null;
        this.drawNormals=null;
        this.drawTangents=null;
        this.drawUVs=null;

            // null buffers

        this.vertexPosBuffer=null;
        this.vertexNormalBuffer=null;
        this.vertexTangentBuffer=null;
        this.vertexUVBuffer=null;
        this.indexBuffer=null;

            // cache for eliminating triangles
            // that share the same space

        this.trigSharedTrigCache=null;

            // collision lists

        this.simpleCollisionGeometry=false;
        
        this.collisionLines=[];
        this.collisionFloorTrigs=[];
        this.collisionCeilingTrigs=[];
        
            // marks if the vertices have changed
            // and a buffer update is required
            
        this.requiresBufferUpdate=false;
        
            // setup the bounds
        
        this.setupBounds();
        
            // cache the radius and height calcs
            
        this.cacheRadius=-1;
        this.cacheHigh=-1;
        
        Object.seal(this);
    }
    
        //
        // close mesh
        //

    close()
    {
        let gl=this.view.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexUVBuffer!==null) gl.deleteBuffer(this.vertexUVBuffer);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // combine two meshes
        //

    combineMesh(mesh)
    {
        let n;
        let iAdd,indexes2;
        
            // add the vertexes

        for (n=0;n!==mesh.vertexCount;n++) {
            this.vertexList.push(mesh.vertexList[n]);
        }

            // indexes need to be moved

        indexes2=new Uint16Array(this.indexes.length+mesh.indexes.length);
        indexes2.set(this.indexes,0);

        iAdd=this.indexes.length;

        for (n=0;n!==mesh.indexes.length;n++) {
            indexes2[n+iAdd]=mesh.indexes[n]+iAdd;
        }

        this.indexes=indexes2;

            // reset counts

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);

            // setup bounds

        this.setupBounds();
    }

        //
        // mesh box collision
        //

    boxBoundCollision(xBound,yBound,zBound)
    {
        if (xBound!==null) {
            if (this.xBound.min>=xBound.max) return(false);
            if (this.xBound.max<=xBound.min) return(false);
        }
        if (yBound!==null) {
            if (this.yBound.min>=yBound.max) return(false);
            if (this.yBound.max<=yBound.min) return(false);
        }
        if (zBound!==null) {
            if (this.zBound.min>=zBound.max) return(false);
            if (this.zBound.max<=zBound.min) return(false);
        }
        return(true);
    }

    boxMeshCollision(checkMesh)
    {
        if (this.xBound.min>=checkMesh.xBound.max) return(false);
        if (this.xBound.max<=checkMesh.xBound.min) return(false);
        if (this.yBound.min>=checkMesh.yBound.max) return(false);
        if (this.yBound.max<=checkMesh.yBound.min) return(false);
        if (this.zBound.min>=checkMesh.zBound.max) return(false);
        return(!(this.zBound.max<=checkMesh.zBound.min));
    }
    
    boxTouchOtherMeshInside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.min) || (this.xBound.max===checkMesh.xBound.max)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.min) || (this.zBound.max===checkMesh.zBound.max)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }
    
    boxTouchOtherMeshOutside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.max) || (this.xBound.max===checkMesh.xBound.min)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.max) || (this.zBound.max===checkMesh.zBound.min)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }

        //
        // triangles
        //

    buildSharedTriangleCache()
    {
        let n,v0,v1,v2;
        let cacheItem;
        
        this.trigSharedTrigCache=[];
        
        for (n=0;n!==this.trigCount;n++) {
            
            cacheItem=new MapMeshSharedTrigCacheClass();
            
            v0=this.vertexList[this.indexes[(n*3)]];
            v1=this.vertexList[this.indexes[(n*3)+1]];
            v2=this.vertexList[this.indexes[(n*3)+2]];

                // if all the Xs of Zs are equal,
                // consider it a straight wall

            cacheItem.isWall=((v0.position.x===v1.position.x) && (v0.position.x===v2.position.x)) || ((v0.position.z===v1.position.z) && (v0.position.z===v2.position.z));
            
                // the bounds
            
            cacheItem.xBound=new BoundClass(v0.position.x,v0.position.x);
            cacheItem.xBound.adjust(v1.position.x);
            cacheItem.xBound.adjust(v2.position.x);
            
            cacheItem.yBound=new BoundClass(v0.position.y,v0.position.y);
            cacheItem.yBound.adjust(v1.position.y);
            cacheItem.yBound.adjust(v2.position.y);
            
            cacheItem.zBound=new BoundClass(v0.position.z,v0.position.z);
            cacheItem.zBound.adjust(v1.position.z);
            cacheItem.zBound.adjust(v2.position.z);
            
                // store in cache
                
            this.trigSharedTrigCache.push(cacheItem);
        }
    }
    
    getSharedTriangleCacheItem(trigIdx)
    {
        return(this.trigSharedTrigCache[trigIdx]);
    }
    
    clearSharedTriangleCache()
    {
        this.trigSharedTrigCache=null;
    }

    removeTriangle(trigIdx)
    {
        let n,idx,cutIdx;
        let newIndexes;
        
        if (this.indexCount===0) return;
        if ((trigIdx<0) || (trigIdx>=this.trigCount)) return;

            // rebuild the array

        newIndexes=new Uint16Array(this.indexCount-3);

        idx=0;
        cutIdx=trigIdx*3;

        for (n=0;n<cutIdx;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        for (n=(cutIdx+3);n<this.indexCount;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        this.indexes=newIndexes;

            // fix a couple counts

        this.indexCount-=3;
        this.trigCount--;
    }

        //
        // setup mesh boxes and bounds
        //

    setupBounds()
    {
        let n;
        let v=this.vertexList[0];
        
        this.center.setFromValues(v.position.x,v.position.y,v.position.z);
        this.xBound.setFromValues(v.position.x,v.position.x);
        this.yBound.setFromValues(v.position.y,v.position.y);
        this.zBound.setFromValues(v.position.z,v.position.z);

        for (n=1;n<this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.center.addPoint(v.position);

            this.xBound.adjust(v.position.x);
            this.yBound.adjust(v.position.y);
            this.zBound.adjust(v.position.z);
        }

        this.center.x/=this.vertexCount;
        this.center.y/=this.vertexCount;
        this.center.z/=this.vertexCount;
    }
    
        //
        // information
        //
        
    calculateRadius(skeleton)
    {
        let n,v,limbType;
        let xBound,zBound;
        
        if (this.cacheRadius===-1) {
            xBound=new BoundClass(0,0);
            zBound=new BoundClass(0,0);
            
                // no skeleton, do all vertexes
                
            if (skeleton===null) {
                for (n=0;n!==this.vertexCount;n++) {
                    v=this.vertexList[n];
                    xBound.adjust(v.position.x);
                    zBound.adjust(v.position.z);
                }
            }

                // has a skeleton, eliminate some
                // limbs that bulk up the collision radius
                
            else {
                for (n=0;n!==this.vertexCount;n++) {
                    v=this.vertexList[n];
                    limbType=skeleton.getBoneLimbType(v.boneIdx);

                    if ((limbType===constants.LIMB_TYPE_BODY) || (limbType===constants.LIMB_TYPE_HEAD) || (limbType===constants.LIMB_TYPE_LEG)) {
                        xBound.adjust(v.position.x);
                        zBound.adjust(v.position.z);
                    }
                }
            }
            
            this.cacheRadius=Math.trunc((xBound.getSize()+zBound.getSize())*0.25);       // average, then /2 for half (radius)
        }
        
        return(this.cacheRadius);
    }
    
    calculateHeight()
    {
        let n,v;
        let high;
        
        if (this.cacheHigh===-1) {
            high=0;

            for (n=0;n!==this.vertexCount;n++) {
                v=this.vertexList[n];
                if (v.position.y<high) high=v.position.y;
            }

            this.cacheHigh=-high;
        }
        
        return(this.cacheHigh);
    }
    
        //
        // precalcs the vector from the bone animations
        //
        
    precalcAnimationValues(skeleton)
    {
        let n,v,bone,parentBone;

        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            bone=skeleton.bones[v.boneIdx];
            v.vectorFromBone.setFromSubPoint(v.position,bone.position);
            
            if (bone.parentBoneIdx!==-1) {
                parentBone=skeleton.bones[bone.parentBoneIdx];
                
                v.parentBoneIdx=bone.parentBoneIdx;
                v.vectorFromParentBone.setFromSubPoint(v.position,parentBone.position);
            }
        }
    }

        //
        // collision geometry
        //

    buildCollisionGeometryLine(v0,v1,v2)
    {
        let n,nLine,line;
        
            // create the line

        if (v0.y===v1.y) {
            line=new LineClass(v0.position.copy(),v2.position.copy());
        }
        else {
            line=new LineClass(v0.position.copy(),v1.position.copy());
        }

            // is line already in list?
            // usually, two triangles make
            // a single line

        nLine=this.collisionLines.length;

        for (n=0;n!==nLine;n++) {
            if (this.collisionLines[n].equals(line)) return;
        }

        this.collisionLines.push(line);
    }
        
    buildCollisionGeometry()
    {
        let n,ny;
        let tIdx;
        let v0,v1,v2;
        
            // some meshes have simple collision
            // geometery -- these are assumed to be
            // hitting against the bound box
            
        if (this.simpleCollisionGeometry) {
            this.collisionLines.push(new LineClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.min)));
            this.collisionLines.push(new LineClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.max),new PointClass(this.xBound.max,this.yBound.max,this.zBound.max)));
            this.collisionLines.push(new LineClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.min,this.yBound.max,this.zBound.max)));
            this.collisionLines.push(new LineClass(new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.max)));
            
            this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max)));
            this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.max),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max)));
            this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max)));
            this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.max,this.zBound.max)));
            return;
        }

            // run through the triangles
            // and find any that make a wall to
            // create collision lines and floors
            // to create collision boxes
            
        tIdx=0;
            
        for (n=0;n!==this.trigCount;n++) {
            
                // get trig vertices

            v0=this.vertexList[this.indexes[tIdx++]];
            v1=this.vertexList[this.indexes[tIdx++]];
            v2=this.vertexList[this.indexes[tIdx++]];
            
            ny=v0.normal.y;
            
                // detect if triangle is a floor
                
            if (ny<=-0.7) {
                this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(v0.position.x,v0.position.y,v0.position.z),new PointClass(v1.position.x,v1.position.y,v1.position.z),new PointClass(v2.position.x,v2.position.y,v2.position.z)));
            }
            
                // detect if triangle is a ceiling
                
            else {
                if (ny>=0.7) {
                    this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(v0.position.x,v0.position.y,v0.position.z),new PointClass(v1.position.x,v1.position.y,v1.position.z),new PointClass(v2.position.x,v2.position.y,v2.position.z)));
                }

                    // detect if triangle is wall like

                else {
                    if (Math.abs(ny)<=0.3) {
                        this.buildCollisionGeometryLine(v0,v1,v2);
                    }
                }
            }
        }
    }
    
        //
        // move mesh
        //
        
    move(movePnt)
    {
        let n;
        let nCollide;
        
            // move the vertexes
            
        for (n=0;n!==this.vertexCount;n++) {
            this.vertexList[n].position.addPoint(movePnt);
        }
        
            // update the collision boxes
            
        nCollide=this.collisionLines.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionLines[n].addPoint(movePnt);
        }
        
        nCollide=this.collisionFloorTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionFloorTrigs[n].addPoint(movePnt);
        }
        
        nCollide=this.collisionCeilingTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionCeilingTrigs[n].addPoint(movePnt);
        }
            
            // and finally the bounds
            
        this.center.addPoint(movePnt);
        this.xBound.add(movePnt.x);
        this.yBound.add(movePnt.y);
        this.zBound.add(movePnt.z);
        
            // and mark as requiring a
            // gl buffer update when drawing
            
        this.requiresBufferUpdate=true;
    }
    
        //
        // transparency flags
        //
        
    isTransparent()
    {
        return(this.bitmap.alpha!==1.0);
    }

        //
        // mesh binding
        //

    setupBuffers()
    {
        let n,v;
        let vIdx,uIdx,nIdx,tIdx;
        let gl=this.view.gl;
        
            // build the default data
            // from the vertex list
        
        this.drawVertices=new Float32Array(this.vertexCount*3);
        this.drawNormals=new Float32Array(this.vertexCount*3);
        this.drawTangents=new Float32Array(this.vertexCount*3);
        this.drawUVs=new Float32Array(this.vertexCount*2);
        
        vIdx=0;
        uIdx=0;
        nIdx=0;
        tIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.drawVertices[vIdx++]=v.position.x;
            this.drawVertices[vIdx++]=v.position.y;
            this.drawVertices[vIdx++]=v.position.z;
            
            this.drawNormals[nIdx++]=v.normal.x;
            this.drawNormals[nIdx++]=v.normal.y;
            this.drawNormals[nIdx++]=v.normal.z;
            
            this.drawTangents[tIdx++]=v.tangent.x;
            this.drawTangents[tIdx++]=v.tangent.y;
            this.drawTangents[tIdx++]=v.tangent.z;
            
            this.drawUVs[uIdx++]=v.uv.x;
            this.drawUVs[uIdx++]=v.uv.y;
        }

            // create all the buffers
            // expects buffers to already be Float32Array
            // or Uint16Array

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.STATIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawTangents,gl.STATIC_DRAW);

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawUVs,gl.STATIC_DRAW);

            // opaque meshes have dynamic indexes,
            // transparent meshes always draw all trigs
            
        this.indexBuffer=gl.createBuffer();
        
        if (this.isTransparent()) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STATIC_DRAW);
        }
    }

    bindBuffers(shader)
    {
        let gl=this.view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.vertexAttribPointer(shader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.vertexAttribPointer(shader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

            // opaque meshes have dynamic indexes,
            // transparent meshes always draw all trigs
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        if (!this.isTransparent()) gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.nonCulledIndexes,gl.DYNAMIC_DRAW);
    }
    
        //
        // update buffers
        // this happens when a mesh is moved, and flagged to get
        // updated.  We only do this when the mesh is drawn so we don't
        // update uncessarly
        //
        
    updateBuffers()
    {
        let n,v,vIdx;
        let gl=this.view.gl;
        
        if (!this.requiresBufferUpdate) return;
        
            // update buffer
        
        vIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.drawVertices[vIdx++]=v.position.x;
            this.drawVertices[vIdx++]=v.position.y;
            this.drawVertices[vIdx++]=v.position.z;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);       // supergumba -- seems right, will require testing

            // mark as updated

        this.requiresBufferUpdate=false;
    }
    
        //
        // build an index list of triangles that aren't
        // culled
        //
        
    buildNonCulledTriangleIndexes()
    {
        let n,v,x,y,z,f,idx;

            // if it's the first time, we'll need
            // to create the index array
            
        this.nonCulledIndexCount=0;
        if (this.nonCulledIndexes===null) this.nonCulledIndexes=new Uint16Array(this.indexCount);
        
            // build it out of triangles
            // that aren't normal culled, i.e.,
            // have normals facing away from the eye
            // which is the dot product between the normal
            // and the vector from trig to eye point
            
            // all this is unwrapped (instead of using classes)
            // for speed reasons
        
        idx=0;
        
        for (n=0;n!==this.trigCount;n++) {
            
                // vector from trig to eye point
                
            v=this.vertexList[this.indexes[idx]];
            
            x=v.position.x-this.view.camera.position.x;      // cullTrigToEyeVector.setFromSubPoint(v.position,this.view.camera.position)
            y=v.position.y-this.view.camera.position.y;
            z=v.position.z-this.view.camera.position.z;
            
            f=Math.sqrt((x*x)+(y*y)+(z*z));   // cullTrigToEyeVector.normalize();
            if (f!==0.0) f=1.0/f;
        
            x=x*f;
            y=y*f;
            z=z*f;
            
                // dot product
                
            if (((x*v.normal.x)+(y*v.normal.y)+(z*v.normal.z))<=this.view.VIEW_NORMAL_CULL_LIMIT) {      // this.cullTrigToEyeVector.dot(v.normal)
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+1];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+2];
            }    
        
            idx=idx+3;      // supergumba -- chrome complains about idx+=3, so we do this for now
        }
    }
    
        //
        // mesh drawing
        //

    drawOpaque()
    {
        let gl=this.view.gl;
        
        gl.drawElements(gl.TRIANGLES,this.nonCulledIndexCount,gl.UNSIGNED_SHORT,0);
            
        this.view.drawMeshCount++;
        this.view.drawMeshTrigCount+=Math.trunc(this.nonCulledIndexCount/3);
    }
    
    drawTransparent()
    {
        let gl=this.view.gl;
        
        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);

        this.view.drawMeshCount++;
        this.view.drawMeshTrigCount+=Math.trunc(this.indexCount/3);
    }
}
