import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import LineClass from '../utility/line.js';
import BoundClass from '../utility/bound.js';
import MeshVertexClass from '../mesh/mesh_vertex.js';
import CollisionTrigClass from '../utility/collision_trig.js';

//
// map mesh class
//

export default class MeshClass
{
    constructor(view,name,bitmap,vertexList,indexes,flag)
    {
        this.view=view;
        this.name=name;
        this.bitmap=bitmap;
        this.vertexList=vertexList;
        this.indexes=indexes;
        this.flag=flag;

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);
        
            // need 16 or 32 bit indexes?
            
        this.need32BitIndexes=(this.vertexCount>0xFFFF);
        
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

            // collision lists

        this.collisionLines=[];
        this.collisionFloorTrigs=[];
        this.collisionCeilingTrigs=[];
        
            // marks if the vertices have changed
            // and a buffer update is required
            
        this.requiresVertexBufferUpdate=false;
        this.requiresNormalBufferUpdate=false;
        
            // setup the bounds
        
        this.setupBounds();
        
            // global variables to stop GCd

        this.rotVector=new PointClass(0.0,0.0,0.0);
        this.rotNormal=new PointClass(0.0,0.0,0.0);
        this.parentRotVector=new PointClass(0.0,0.0,0.0);
        this.parentRotNormal=new PointClass(0.0,0.0,0.0);
        
        this.rotCenterPnt=new PointClass(0.0,0.0,0.0);
        
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
        // precalcs the vector from the bone animations
        // it relies on the skeleton having the pose setup
        // as the neutral pose
        //
        
    precalcAnimationValues(skeleton)
    {
        let n,k,v,bone,connect;

        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            for (k=0;k!==v.boneConnects.length;k++) {
                connect=v.boneConnects[k];

                bone=skeleton.bones[connect.boneIdx];
                connect.vectorFromBone.setFromSubPoint(v.position,bone.curPosePosition);
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
        // move or rotate mesh
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
            
        this.requiresVertexBufferUpdate=true;
    }
    
    rotate(rotateAngle,offsetPnt)
    {
        let n,v;
        
            // have to rebuild the bounds during rotate
            // note: for now we don't move the center
            // as it'll mess up the rotation
            
        v=this.vertexList[0];
        
        this.xBound.setFromValues(v.position.x,v.position.x);
        this.yBound.setFromValues(v.position.y,v.position.y);
        this.zBound.setFromValues(v.position.z,v.position.z);
        
            // rotate the vertexes
            
        this.rotCenterPnt.setFromAddPoint(this.center,offsetPnt);
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
                // the point
                
            this.rotVector.setFromSubPoint(v.position,this.rotCenterPnt);
            this.rotVector.rotate(rotateAngle);
            v.position.setFromAddPoint(this.rotCenterPnt,this.rotVector);
            
                // the normal
                
            v.normal.rotate(rotateAngle);
            
                // rebuild the bounds while here
                
            this.xBound.adjust(v.position.x);
            this.yBound.adjust(v.position.y);
            this.zBound.adjust(v.position.z);
        }
        
            // and mark as requiring a
            // gl buffer update when drawing
            
        this.requiresVertexBufferUpdate=true;
        this.requiresNormalBufferUpdate=true;
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
            // or Uint32Array

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
        // this happens when a map mesh is moved, and flagged to get
        // updated.  We only do this when the mesh is drawn so we don't
        // update uncessarly
        //
        
    updateBuffers()
    {
        let n,v,vIdx;
        let gl=this.view.gl;
        
            // vertex buffer updates
            
        if (this.requiresVertexBufferUpdate) {
        
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

            this.requiresVertexBufferUpdate=false;
        }
        
             // normal buffer updates
            
        if (this.requiresNormalBufferUpdate) {
        
            vIdx=0;

            for (n=0;n!==this.vertexCount;n++) {
                v=this.vertexList[n];

                this.drawNormals[vIdx++]=v.normal.x;
                this.drawNormals[vIdx++]=v.normal.y;
                this.drawNormals[vIdx++]=v.normal.z;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.DYNAMIC_DRAW);       // supergumba -- seems right, will require testing

                // mark as updated

            this.requiresNormalBufferUpdate=false;
        }
    }
    
        //
        // set vertices to pose and offset position
        //
        
    updateVertexesToPoseAndPosition(skeleton,angle,position)
    {
        let n,v,x,y,z,vIdx,nIdx;
        let bone,parentBone;
        let gl=this.view.gl;
        
            // we recalc the bounds while
            // we move model around
        
        v=this.vertexList[0];
        
        this.center.setFromValues(0,0,0);
        this.xBound.setFromValues(v.position.x,v.position.x);
        this.yBound.setFromValues(v.position.y,v.position.y);
        this.zBound.setFromValues(v.position.z,v.position.z);
        
            // move all the vertexes
            
        vIdx=0;
        nIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
                // bone movement
                
            bone=skeleton.bones[v.boneIdx];
                
            this.rotVector.setFromPoint(v.vectorFromBone);
            this.rotVector.rotate(bone.curPoseAngle);
            
            this.rotVector.x=bone.curPosePosition.x+this.rotVector.x;
            this.rotVector.y=bone.curPosePosition.y+this.rotVector.y;
            this.rotVector.z=bone.curPosePosition.z+this.rotVector.z;
            
            this.rotNormal.setFromPoint(v.normal);
            this.rotNormal.rotate(bone.curPoseAngle);
            
                // average in any parent movement
                
            if (v.parentBoneIdx!==-1) {
                parentBone=skeleton.bones[v.parentBoneIdx];
                
                this.parentRotVector.setFromPoint(v.vectorFromParentBone);
                this.parentRotVector.rotate(parentBone.curPoseAngle);

                this.parentRotVector.x=parentBone.curPosePosition.x+this.parentRotVector.x;
                this.parentRotVector.y=parentBone.curPosePosition.y+this.parentRotVector.y;
                this.parentRotVector.z=parentBone.curPosePosition.z+this.parentRotVector.z;

                this.parentRotNormal.setFromPoint(v.normal);
                this.parentRotNormal.rotate(parentBone.curPoseAngle);
                
                this.rotVector.average(this.parentRotVector);
                this.rotNormal.average(this.parentRotNormal);
            }    
            
                // whole model movement
   
            this.rotVector.rotate(angle);
            
            x=this.rotVector.x+position.x;
            y=this.rotVector.y+position.y;
            z=this.rotVector.z+position.z;
            
            this.drawVertices[vIdx++]=x;
            this.drawVertices[vIdx++]=y;
            this.drawVertices[vIdx++]=z;
            
            this.rotNormal.rotate(angle);
            
            this.drawNormals[nIdx++]=this.rotNormal.x;
            this.drawNormals[nIdx++]=this.rotNormal.y;
            this.drawNormals[nIdx++]=this.rotNormal.z;
             
                // adjust bounding
                
            this.center.addValues(x,y,z);
            this.xBound.adjust(x);
            this.yBound.adjust(y);
            this.zBound.adjust(z);
        }
        
            // set the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.DYNAMIC_DRAW);
        
            // finish with the center
            
        this.center.x/=this.vertexCount;
        this.center.y/=this.vertexCount;
        this.center.z/=this.vertexCount;
    }
    
        //
        // set vertices to ang and offset position
        //
        
    updateVertexesToAngleAndPosition(angle,position)
    {
        let n,v,x,y,z,vIdx,nIdx;
        let gl=this.view.gl;
        
            // we recalc the bounds while
            // we move model around
            
        v=this.vertexList[0];
        
        this.center.setFromValues(0,0,0);
        this.xBound.setFromValues(v.position.x,v.position.x);
        this.yBound.setFromValues(v.position.y,v.position.y);
        this.zBound.setFromValues(v.position.z,v.position.z);
        
            // move all the vertexes
            
        vIdx=0;
        nIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
                // animate vertexes
                
            this.rotVector.setFromPoint(v.position);
            this.rotVector.rotate(angle);
            
            x=this.rotVector.x+position.x;
            y=this.rotVector.y+position.y;
            z=this.rotVector.z+position.z;
            
            this.drawVertices[vIdx++]=x;
            this.drawVertices[vIdx++]=y;
            this.drawVertices[vIdx++]=z;
            
            this.rotNormal.setFromPoint(v.normal);
            this.rotNormal.rotate(angle);
            
            this.drawNormals[nIdx++]=this.rotNormal.x;
            this.drawNormals[nIdx++]=this.rotNormal.y;
            this.drawNormals[nIdx++]=this.rotNormal.z;
            
                // adjust bounding
                
            this.center.addValues(x,y,z);
            this.xBound.adjust(x);
            this.yBound.adjust(y);
            this.zBound.adjust(z);
        }
        
            // set the buffers
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.DYNAMIC_DRAW);
        
            // finish with the center
            
        this.center.x/=this.vertexCount;
        this.center.y/=this.vertexCount;
        this.center.z/=this.vertexCount;
    }
    
        //
        // build an index list of triangles that aren't
        // culled
        //
        
    buildNonCulledTriangleIndexes()
    {
        let n,x,y,z,nx,ny,nz;
        let f,idx,drawIdx;

            // if it's the first time, we'll need
            // to create the index array
            
        this.nonCulledIndexCount=0;
        if (this.nonCulledIndexes===null) {
            if (this.need32BitIndexes) {
                this.nonCulledIndexes=new Uint32Array(this.indexCount);
            }
            else {
                this.nonCulledIndexes=new Uint16Array(this.indexCount);
            }
        } 
        
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
            
            drawIdx=this.indexes[idx]*3;
            x=this.drawVertices[drawIdx]-this.view.camera.position.x;     // cullTrigToEyeVector.setFromSubPoint(draw.position,this.view.camera.position)
            nx=this.drawNormals[drawIdx++];
            y=this.drawVertices[drawIdx]-this.view.camera.position.y;
            ny=this.drawNormals[drawIdx++];
            z=this.drawVertices[drawIdx]-this.view.camera.position.z;
            nz=this.drawNormals[drawIdx++];
            
            f=Math.sqrt((x*x)+(y*y)+(z*z));   // cullTrigToEyeVector.normalize();
            if (f!==0.0) f=1.0/f;
        
            x=x*f;
            y=y*f;
            z=z*f;
            
                // dot product
                
            if (((x*nx)+(y*ny)+(z*nz))<=this.view.VIEW_NORMAL_CULL_LIMIT) {      // this.cullTrigToEyeVector.dot(draw.normal)
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+1];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+2];
            }    
        
            idx+=3;
        }
    }
    
        //
        // mesh drawing
        //

    drawOpaque()
    {
        let gl=this.view.gl;
        
        gl.drawElements(gl.TRIANGLES,this.nonCulledIndexCount,(this.need32BitIndexes?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT),0);
            
        this.view.drawMeshCount++;
        this.view.drawMeshTrigCount+=Math.trunc(this.nonCulledIndexCount/3);
    }
    
    drawTransparent()
    {
        let gl=this.view.gl;
        
        gl.drawElements(gl.TRIANGLES,this.indexCount,(this.need32BitIndexes?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT),0);

        this.view.drawMeshCount++;
        this.view.drawMeshTrigCount+=Math.trunc(this.indexCount/3);
    }
}
