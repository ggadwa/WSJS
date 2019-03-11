import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import ModelNodeClass from '../model/model_node.js';
import ModelJointClass from '../model/model_joint.js';
import ModelAnimationChannelClass from '../model/model_animation_channel.js';
import genRandom from '../utility/random.js';

//
// model skeleton class
//

export default class ModelSkeletonClass
{
    static MAX_SKELETON_JOINT=128;
    
    constructor(view)
    {
        this.view=view;
        
            // nodes
            // we need all nodes, as certain non-joint modes
            // also effect the children joints
            
        this.rootNodeIdx=-1;
        this.nodes=[];
        
            // joints
            // all nodes needed for animation

        this.joints=[];
        
            // animations
            
        this.animations=[];
        
        this.currentAnimationIdx=-1;
        this.currentAnimationStartTick=-1;
        this.currentAnimationEndTick=-1;
        this.currentAnimationData=new Float32Array(4);
        
            // globals to stop GC
            
        this.nodeMat=new Matrix4Class();
        
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
        this.nodes=[];
    }
    
        //
        // find nodes
        //
        
    findNodeIndex(name)
    {
        let n;
        let nNode=this.nodes.length;
        
        for (n=0;n!==nNode;n++) {
            if (this.nodes[n].name===name) return(n);
        }
        
        return(-1);
    }
    
        //
        // animation
        //
    
    runAnimationNode(node,parentNode)
    {
        let childNodeIdx;
        
            // get node pose position (T*R*S)
         
        node.curPoseMatrix.setTranslationFromPoint(node.poseTranslation);
        this.nodeMat.setRotationFromQuaternion(node.poseRotation);
        node.curPoseMatrix.multiply(this.nodeMat);
        this.nodeMat.setScaleFromPoint(node.poseScale);
        node.curPoseMatrix.multiply(this.nodeMat);

            // multiply in the parent
            // the global transform is the product of
            // all previous transforms
            
        if (parentNode!==null) {
            this.nodeMat.setFromMultiply(parentNode.curPoseMatrix,node.curPoseMatrix);
            node.curPoseMatrix.fromArray(this.nodeMat.data);
        }
        
            // finally make the global pose
            
        node.curPosePosition.setFromValues(0,0,0);
        node.curPosePosition.matrixMultiply(node.curPoseMatrix);
        
            // move children nodes
            
        for (childNodeIdx of node.childNodeIdxs) {
            this.runAnimationNode(this.nodes[childNodeIdx],node);
        }
    }
    
    setupNodesToPose()
    {
        let n,tick;
        let animation,channels,channel,node;
        
        animation=this.animations[this.currentAnimationIdx];
        channels=animation.channels;
        
            // the global animation tick
            
        tick=animation.loopStartTick+Math.trunc((this.view.timestamp-animation.startTimestamp)%(animation.loopEndTick-animation.loopStartTick));
        
            // each channel changes one node over time
            
        for (n=0;n!==channels.length;n++) {
            channel=channels[n];
            node=this.nodes[channel.nodeIdx];
            
                // calculate the pose
                
            channel.getPoseDataForTick(tick,this.currentAnimationData);
            
                // change the node
            
            switch (channel.trsType) {
                case ModelAnimationChannelClass.TRS_TYPE_TRANSLATION:
                    node.poseTranslation.setFromValues(this.currentAnimationData[0],this.currentAnimationData[1],this.currentAnimationData[2]);
                    break;
                case ModelAnimationChannelClass.TRS_TYPE_ROTATION:
                    node.poseRotation.setFromValues(this.currentAnimationData[0],this.currentAnimationData[1],this.currentAnimationData[2],this.currentAnimationData[3]);
                    break;
                case ModelAnimationChannelClass.TRS_TYPE_SCALE:
                    node.poseScale.setFromValues(this.currentAnimationData[0],this.currentAnimationData[1],this.currentAnimationData[2]);
                    break;
            }
        }
    }
    
    runAnimation()
    {
        if (this.rootNodeIdx===-1) return;      // this model has no rigging
        
        if (this.currentAnimationIdx!==-1) this.setupNodesToPose();
        this.runAnimationNode(this.nodes[this.rootNodeIdx],null);
    }
    
    findAnimationIndex(name)
    {
        let n;
        
        for (n=0;n!==this.animations.length;n++) {
            if (this.animations[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    startAnimationChunk(name,loopStartTick,loopEndTick)
    {
        let animation;
        
        this.currentAnimationIdx=this.findAnimationIndex(name);
        if (this.currentAnimationIdx===-1) return(false);
        
        animation=this.animations[this.currentAnimationIdx];
        animation.startTimestamp=this.view.timestamp;
        animation.loopStartTick=loopStartTick;
        animation.loopEndTick=loopEndTick;
        
        return(true);
    }
    
    startAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        let animation;
        let fps=1000/framesPerSecond;
        
        this.currentAnimationIdx=this.findAnimationIndex(name);
        if (this.currentAnimationIdx===-1) return(false);
        
        animation=this.animations[this.currentAnimationIdx];
        animation.startTimestamp=this.view.timestamp;
        animation.loopStartTick=Math.trunc(loopStartFrame*fps);
        animation.loopEndTick=Math.trunc(loopEndFrame*fps);
        
        return(true);
    }
    
    startAnimation(name)
    {
        let animation;
        
        this.currentAnimationIdx=this.findAnimationIndex(name);
        if (this.currentAnimationIdx===-1) return(false);
        
        animation=this.animations[this.currentAnimationIdx];
        animation.startTimestamp=this.view.timestamp;
        animation.loopStartTick=0;
        animation.loopEndTick=animation.tickLength;
        
        return(true);
    }
    
    isAnimationRunning()
    {
        return(this.currentAnimationIdx!==-1);
    }
    
        //
        // get the skeleton joint matrixes
        //
        
    getPoseJointMatrixArray()
    {
        let n,node,joint;
        let matrixArray=[];
        
            // if there is no rigging, everything is
            // the identity matrix
            
        if (this.rootNodeIdx===-1) {
            
            for (n=0;n!==this.joints.length;n++) {
                this.joints[n].setIdentity();
                matrixArray.push(joint.jointMatrix);
            }
            
            return(matrixArray);
        }
        
            // otherwise calculate the joint matrixes
            // based on the animation pose matrix
            
        for (n=0;n!==this.joints.length;n++) {
            joint=this.joints[n];
            node=this.nodes[joint.nodeIdx];
            
                // specs say this starts with inverse of global
                // changes to root node, but there are none

            joint.jointMatrix.setFromMultiply(node.curPoseMatrix,joint.inverseBindMatrix);
            
            matrixArray.push(joint.jointMatrix);
        }
        
        return(matrixArray);
    }
    
        //
        // draw the skeleton for debug purposes
        // note this is not optimal and slow!
        //
        
    debugDraw(modelMatrix,scale)
    {
        let n,nNode,node,parentNode;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let lineCount,lineElementOffset,lineVertexStartIdx;
        let vertexBuffer,indexBuffer;
        let nodeSize=50;
        let gl=this.view.gl;
        let shader=this.view.shaderList.debugShader;
        let tempPoint=new PointClass(0,0,0);
        
            // any skeleton?
        
        nNode=this.nodes.length;    
        if (nNode===0) return;
        
            // skeleton nodes
            
        vertices=new Float32Array(((3*4)*nNode)+((3*2)*nNode));
        indexes=new Uint16Array((nNode*6)+(nNode*2));           // count for node billboard quads and node lines
        
        vIdx=0;
        iIdx=0;
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];
            
            tempPoint.x=-nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

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
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];
            if (node.parentNodeIdx===-1) continue;
            
            parentNode=this.nodes[node.parentNodeIdx];
            
            vertices[vIdx++]=node.curPosePosition.x*scale.x;
            vertices[vIdx++]=node.curPosePosition.y*scale.y;
            vertices[vIdx++]=node.curPosePosition.z*scale.z;
            
            vertices[vIdx++]=parentNode.curPosePosition.x*scale.x;
            vertices[vIdx++]=parentNode.curPosePosition.y*scale.y;
            vertices[vIdx++]=parentNode.curPosePosition.z*scale.z;
            
            indexes[iIdx++]=lineVertexStartIdx++;
            indexes[iIdx++]=lineVertexStartIdx++;
            
            lineCount++;
        }
       
            // build the buffers
            
        vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
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
        
            // the nodes
            
        gl.uniform3f(shader.colorUniform,1.0,0.0,1.0);
        gl.drawElements(gl.TRIANGLES,(nNode*6),gl.UNSIGNED_SHORT,0);
        
            // the nodes
        
        shader.drawEnd();
        
            // re-enable depth
            
        gl.enable(gl.DEPTH_TEST);
        
            // tear down the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
    }
}
