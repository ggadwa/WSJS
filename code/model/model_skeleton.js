import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import ModelBoneClass from '../model/model_bone.js';
import genRandom from '../utility/random.js';

//
// model skeleton class
//

export default class ModelSkeletonClass
{
    constructor(view)
    {
        this.view=view;
        
            // bones
            
        this.rootBoneIdx=-1;
        this.bones=[];
        
            // animations

        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;          // supergumba -- temporary for random animations
        
            // globals to stop GC
            
        this.boneMat=new Matrix4Class();
        this.boneMat2=new Matrix4Class();
        
        this.rootPosition=new PointClass(0,0,0);
        this.rootRotation=new QuaternionClass();
        this.rootScale=new PointClass(1,1,1);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }

    release()
    {
        this.bones=[];
    }
    
        //
        // find bone
        //
        
    findBoneIndex(name)
    {
        let n;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    findBone(name)
    {
        let idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    }
    
        //
        // functions to handle clear, moving
        // and tweening the prev, next, and current
        // pose
        //
        
    moveNextPoseToPrevPose()
    {
        let bone;
        
        for (bone of this.bones) {
            bone.prevPoseAngle.setFromPoint(bone.nextPoseAngle);
        }
    }
    
    clearNextPose()
    {
        let bone;
        
        for (bone of this.bones) {
            bone.nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
        //
        // animate bones
        //
    
    rotatePoseBoneRecursive(boneIdx,ang)
    {
        let idx,bone,bone,parentBone;
        let rotVector;
        
            // get the bone
        
        bone=this.skeleton.bones[boneIdx];    
        bone=this.bones[boneIdx];
        
            // if it has a parent, then rotate around
            // the parent, otherwise, the bone remains
            // at it's neutral position
            
        if (bone.parentBoneIdx!==-1) {
            parentBone=this.bones[bone.parentBoneIdx];
            
            rotVector=new PointClass(bone.translate.x,bone.translate.y,bone.translate.z);
            rotVector.rotate(ang);
            
            bone.curPosePosition.setFromAddPoint(parentBone.curPosePosition,rotVector);
        }
        else {
            //bone.curPosePosition.setFromPoint(bone.position);
        }
        
            // need to pass this bone's rotation on
            // to it's children
            
        bone.curPoseAngle.addPoint(ang);
        
            // now move all children
        
        for (idx of bone.childBoneIdxs) {
            this.rotatePoseBoneRecursive(idx,bone.curPoseAngle);
        }
    }
    
    animate()
    {
        let bone;
        
            // the current factor
            
        let factor=1.0-((this.lastAnimationTick-this.view.timestamp)/this.lastAnimationMillisec);

            // tween the current angles
            
        for (bone of this.bones) {
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
        }
        
            // now move all the bones, starting at
            // the base
            
        //this.rotatePoseBoneRecursive(this.skeleton.baseBoneIdx,new PointClass(0.0,0.0,0.0));
    }
    
    resetAnimation()
    {
        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;
    }
    
    runAnimationRecursive(boneIdx,pnt,rotQuat,scale)
    {
        let bone,childBoneIdx;
        
        bone=this.bones[boneIdx];
        
            // get bone position
            
        bone.curPosePosition.setFromPoint(bone.translation);
        this.boneMat.setRotationFromQuaternion(rotQuat);        // rotation of parent bone
        this.boneMat2.setScaleFromPoint(scale);
        this.boneMat.multiply(this.boneMat2);
        
        bone.curPosePosition.matrixMultiply(this.boneMat);
        bone.curPosePosition.addPoint(pnt);
        
            // create the next cumulative quaternion and
            // scale for children bones children bones
        
        bone.curPoseChildBoneQuat.setFromMultiply(rotQuat,bone.rotation);
        bone.curPoseChildBoneScale.setFromMultiply(scale,bone.scale);
        
            // move children bones
            
        for (childBoneIdx of bone.childBoneIdxs) {
            this.runAnimationRecursive(childBoneIdx,bone.curPosePosition,bone.curPoseChildBoneQuat,bone.curPoseChildBoneScale);
        }
    }
    
    runAnimation()
    {
        this.rootPosition.setFromValues(0,0,0);
        this.rootRotation.setIdentity();
        this.rootScale.setFromValues(1,1,1);

        if (this.rootBoneIdx!==-1) this.runAnimationRecursive(this.rootBoneIdx,this.rootPosition,this.rootRotation,this.rootScale);
    }
    
        //
        // debug stuff -- note this is not optimized and slow!
        //
        
    draw(modelMatrix)
    {
        let n,nBone,bone,parentBone;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let lineCount,lineElementOffset,lineVertexStartIdx;
        let vertexPosBuffer,indexBuffer;
        let boneSize=50;
        let gl=this.view.gl;
        let shader=this.view.shaderList.modelSkeletonShader;
        let tempPoint=new PointClass(0,0,0);
        
            // any skeleton?
        
        nBone=this.bones.length;    
        if (nBone===0) return;
        
            // skeleton bones
            
        vertices=new Float32Array(((3*4)*nBone)+((3*2)*nBone));
        indexes=new Uint16Array((nBone*6)+(nBone*2));           // count for bone billboard quads and bone lines
        
        vIdx=0;
        iIdx=0;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
            tempPoint.x=-boneSize;
            tempPoint.y=-boneSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+bone.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+bone.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+bone.curPosePosition.z;

            tempPoint.x=boneSize;
            tempPoint.y=-boneSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+bone.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+bone.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+bone.curPosePosition.z;

            tempPoint.x=boneSize;
            tempPoint.y=boneSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+bone.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+bone.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+bone.curPosePosition.z;

            tempPoint.x=-boneSize;
            tempPoint.y=boneSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+bone.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+bone.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+bone.curPosePosition.z;

            elementIdx=n*4;
            
            indexes[iIdx++]=elementIdx;     // triangle 1
            indexes[iIdx++]=elementIdx+1;
            indexes[iIdx++]=elementIdx+2;

            indexes[iIdx++]=elementIdx;     // triangle 2
            indexes[iIdx++]=elementIdx+2;
            indexes[iIdx++]=elementIdx+3;
        }
        
        lineCount=0;
        lineElementOffset=iIdx;
        lineVertexStartIdx=Math.trunc(vIdx/3);
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            if (bone.parentBoneIdx===-1) continue;
            
            parentBone=this.bones[bone.parentBoneIdx];
            
            vertices[vIdx++]=bone.curPosePosition.x;
            vertices[vIdx++]=bone.curPosePosition.y;
            vertices[vIdx++]=bone.curPosePosition.z;
            
            vertices[vIdx++]=parentBone.curPosePosition.x;
            vertices[vIdx++]=parentBone.curPosePosition.y;
            vertices[vIdx++]=parentBone.curPosePosition.z;
            
            indexes[iIdx++]=lineVertexStartIdx++;
            indexes[iIdx++]=lineVertexStartIdx++;
            
            lineCount++;
        }
       
            // build the buffers
            
        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STATIC_DRAW);
        
            // always draw it, no matter what
            
        gl.disable(gl.DEPTH_TEST);

            // draw the skeleton
            
        shader.drawStart(0,1,0);
            
        gl.uniformMatrix4fv(shader.modelMatrixUniform,false,modelMatrix.data);
        
            // the lines
            
        gl.uniform3f(shader.colorUniform,0.0,1.0,0.0);
        gl.drawElements(gl.LINES,(lineCount*2),gl.UNSIGNED_SHORT,(lineElementOffset*2));
        
            // the bones
            
        gl.uniform3f(shader.colorUniform,1.0,0.0,1.0);
        gl.drawElements(gl.TRIANGLES,(nBone*6),gl.UNSIGNED_SHORT,0);
        
            // the bones
        
        shader.drawEnd();
        
            // re-enable depth
            
        gl.enable(gl.DEPTH_TEST);
        
            // tear down the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);
    }
}
