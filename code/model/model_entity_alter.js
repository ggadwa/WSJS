import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import ModelClass from '../model/model.js';
import ModelEntityAlterNodeClass from '../model/model_entity_alter_node.js';
import ModelEntityAlterSkinClass from '../model/model_entity_alter_skin.js';
import ModelAnimationChannelClass from '../model/model_animation_channel.js';

//
// model entity alter
// this class stores differences in models for each entity
//

export default class ModelEntityAlterClass
{
    static MAX_MESH_COUNT=64;           // max number of meshes we can keep show/hides for
    
    static DEGREE_TO_RAD=Math.PI/180.0;
    
    constructor(core,entity)
    {
        this.core=core;
        this.entity=entity;
        
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        this.scale=new PointClass(0,0,0);
        
        this.rotationOrder=ModelClass.MODEL_ROTATION_ORDER_XYZ;
        
        this.inCameraSpace=false;
        this.meshHideList=new Uint8Array(ModelEntityAlterClass.MAX_MESH_COUNT);
        
        this.modelMatrix=new Matrix4Class();
        this.cullModelMatrix=new Matrix4Class();
        this.rotMatrix=new Matrix4Class();
        this.scaleMatrix=new Matrix4Class();
        
        this.xBound=new BoundClass(0,0);
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        this.rotPoint=new PointClass(0,0,0);
        
            // the parallel nodes and skins
            // (which contain the joint matrixes)
            // for this entity's model pose
            
        this.nodes=[];
        this.skins=[];
        
            // animations
            
        this.currentAnimationIdx=-1;
        this.currentAnimationStartTimestamp=0;
        this.currentAnimationLoopStartTick=0;
        this.currentAnimationLoopEndTick=0;
        this.currentAnimationData=new Float32Array(4);
        
        this.queuedAnimationStop=false;
        
        this.queuedAnimationIdx=-1;
        this.queuedAnimationStartTimestamp=0;
        this.queuedAnimationLoopStartTick=0;
        this.queuedAnimationLoopEndTick=0;
        
            // globals to stop GC
            
        this.nodeMat=new Matrix4Class();

        Object.seal(this);
    }
    
        //
        // called after shared models are loaded to
        // finish setting up the alter to prepare for animations
        //
        
    finishSetup()
    {
        let node,skin;
        
            // parallel selection of nodes
            
        for (node of this.entity.model.skeleton.nodes) {
            this.nodes.push(new ModelEntityAlterNodeClass(node.name,node.parentNodeIdx,node.childNodeIdxs,node.translation,node.rotation,node.scale));
        }
        
            // parallel skin for joint matrixes
            
        for (skin of this.entity.model.skeleton.skins) {
            this.skins.push(new ModelEntityAlterSkinClass(skin.joints.length));
        }
    }
    
        //
        // show and hide meshes
        //
        
    show(name,show)
    {
        let meshIdx=this.entity.model.meshList.find(name);
        if ((meshIdx!==-1) && (meshIdx<ModelEntityAlterClass.MAX_MESH_COUNT)) this.meshHideList[meshIdx]=show?0:1;
    }
    
        //
        // drawing utilities
        //
        
    setupModelMatrix(includeScale)
    {
        this.modelMatrix.setTranslationFromPoint(this.position);
        
        switch (this.rotationOrder) {
            case ModelClass.MODEL_ROTATION_ORDER_XYZ:
                this.rotMatrix.setRotationFromZAngle(this.angle.z);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromYAngle(this.angle.y);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromXAngle(this.angle.x);
                this.modelMatrix.multiply(this.rotMatrix);
                break;
            case ModelClass.MODEL_ROTATION_ORDER_XZY:
                this.rotMatrix.setRotationFromYAngle(this.angle.y);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromZAngle(this.angle.z);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromXAngle(this.angle.x);
                this.modelMatrix.multiply(this.rotMatrix);
                break;
        }
        
        if (includeScale) {
            this.scaleMatrix.setScaleFromPoint(this.scale);
            this.modelMatrix.multiply(this.scaleMatrix);
        }
    }

    boundBoxInFrustum()
    {
            // can't cull anything in camera space
            // (like held weapons)
        
        if (this.inCameraSpace) return(true);
        
            // culling matrix can't have scale in it
            
        this.cullModelMatrix.setTranslationFromPoint(this.position);
        
        this.rotMatrix.setRotationFromYAngle(this.angle.z);
        this.cullModelMatrix.multiply(this.rotMatrix);
        this.rotMatrix.setRotationFromYAngle(this.angle.y);
        this.cullModelMatrix.multiply(this.rotMatrix);
        this.rotMatrix.setRotationFromXAngle(this.angle.x);
        this.cullModelMatrix.multiply(this.rotMatrix);
        
            // find the bounds by creating 8 corners
            // that enclose the cylinder of the entity
            
        this.rotPoint.setFromValues(-this.entity.radius,0,-this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);
        
        this.xBound.setFromValues(this.rotPoint.x,this.rotPoint.x);
        this.yBound.setFromValues(this.rotPoint.y,this.rotPoint.y);
        this.zBound.setFromValues(this.rotPoint.z,this.rotPoint.z);
        
        this.rotPoint.setFromValues(-this.entity.radius,0,this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);
            
        this.rotPoint.setFromValues(this.entity.radius,0,-this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);

        this.rotPoint.setFromValues(this.entity.radius,0,this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);
            
        this.rotPoint.setFromValues(-this.entity.radius,this.entity.height,-this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);
        
        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);
        
        this.rotPoint.setFromValues(-this.entity.radius,this.entity.height,this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);
            
        this.rotPoint.setFromValues(this.entity.radius,this.entity.height,-this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);

        this.rotPoint.setFromValues(this.entity.radius,this.entity.height,this.entity.radius);
        this.rotPoint.matrixMultiply(this.cullModelMatrix);

        this.xBound.adjust(this.rotPoint.x);
        this.yBound.adjust(this.rotPoint.y);
        this.zBound.adjust(this.rotPoint.z);

            // run the frustum
            
        return(this.core.boundBoxInFrustum(this.xBound,this.yBound,this.zBound));
    }
    
    getPoseJointMatrixArray(skinIdx)
    {
        let n,node,skeletonJoint;
        let localSkin=this.skins[skinIdx];
        let skeletonSkin=this.entity.model.skeleton.skins[skinIdx];
        
            // calculate the joint matrixes
            // based on the animated node pose matrixes
            
        for (n=0;n!==skeletonSkin.joints.length;n++) {
            skeletonJoint=skeletonSkin.joints[n];
            node=this.nodes[skeletonJoint.nodeIdx];
            
                // specs say this starts with inverse of global
                // changes to root node, but there are none,
                // so it's just current pose matrix * inverse bind matrix

            localSkin.jointMatrixes[n].setFromMultiply(node.curPoseMatrix,skeletonJoint.inverseBindMatrix);
        }
        
        return(localSkin.jointMatrixes);
    }
    
    getNodeCurrentPoseMatrix(nodeIdx)
    {
        return(this.nodes[nodeIdx].curPoseMatrix);
    }
    
        //
        // running animation
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
        
        animation=this.entity.model.skeleton.animations[this.currentAnimationIdx];
        channels=animation.channels;
        
            // the global animation tick
            
        tick=this.currentAnimationLoopStartTick+Math.trunc((this.core.timestamp-this.currentAnimationStartTimestamp)%(this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick));
        
        if (this.queuedAnimationStop) {
            if ((this.core.timestamp-this.currentAnimationStartTimestamp)>=(this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick)) tick=this.currentAnimationLoopEndTick;
        }
        
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
            // if we are running an animation, then
            // setup nodes to pose and check to see
            // if queue is being popped
            
        if (this.currentAnimationIdx!==-1) {
            if (this.queuedAnimationIdx!==-1) {
                if (this.core.timestamp>=this.queuedAnimationStartTimestamp) {
                    this.currentAnimationIdx=this.queuedAnimationIdx;
                    this.currentAnimationStartTimestamp=this.queuedAnimationStartTimestamp;
                    this.currentAnimationLoopStartTick=this.queuedAnimationLoopStartTick;
                    this.currentAnimationLoopEndTick=this.queuedAnimationLoopEndTick;
                }
            }
            
            this.setupNodesToPose();
        }
        
            // now cumulative all the nodes for
            // their matrixes
 
        this.runAnimationNode(this.nodes[0],null);
    }
    
        //
        // setting up animations
        //
    
    startAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        let fps=1000/framesPerSecond;
        
        this.currentAnimationIdx=(name===null)?0:this.entity.model.skeleton.findAnimationIndex(name);
        if (this.currentAnimationIdx===-1) return(false);
        
        this.currentAnimationStartTimestamp=this.core.timestamp;
        this.currentAnimationLoopStartTick=Math.trunc(loopStartFrame*fps);
        this.currentAnimationLoopEndTick=Math.trunc(loopEndFrame*fps);
        
        this.queuedAnimationIdx=-1;          // a start erased any queued animations
        this.queuedAnimationStop=false;
        
        return(true);
    }
    
    queueAnimationStop()
    {
        this.queuedAnimationStop=true;
    }
    
    queueAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame)
    {
        let len;
        let fps=1000/framesPerSecond;
        
            // if no animation, queue becomes a start
            
        if (this.currentAnatimationIdx===-1) return(this.startAnimationChunkInFrames(name,framesPerSecond,loopStartFrame,loopEndFrame));
        
            // find when this animation ends
            
        len=this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick;
        len-=Math.trunc((this.core.timestamp-this.currentAnimationStartTimestamp)%len);
        
            // queue up

        this.queuedAnimationIdx=(name===null)?0:this.entity.model.skeleton.findAnimationIndex(name);
        if (this.queuedAnimationIdx===-1) return(false);
        
        this.queuedAnimationStartTimestamp=this.core.timestamp+len;
        this.queuedAnimationLoopStartTick=Math.trunc(loopStartFrame*fps);
        this.queuedAnimationLoopEndTick=Math.trunc(loopEndFrame*fps);
        
        return(true);
    }
    
    isAnimationRunning()
    {
        return(this.currentAnimationIdx!==-1);
    }
    
        //
        // hard set bone changes, these can only be used when
        // an animation is not running
        //
        
    setBoneTranslationPoint(name,translation)
    {
        let node;
        
        for (node of this.nodes) {
            if (node.name===name) {
                node.poseTranslation.setFromPoint(translation);
                return;
            }
        }
    }
    
    setBoneRotationQuaternion(name,rotation)
    {
        let node;
        
        for (node of this.nodes) {
            if (node.name===name) {
                node.poseRotation.setFromQuaternion(rotation);
                return;
            }
        }
    }
    
    setBoneScalePoint(name,scale)
    {
        let node;
        
        for (node of this.nodes) {
            if (node.name===name) {
                node.poseScale.setFromPoint(scale);
                return;
            }
        }
    }
        
        //
        // draw the skeleton for debug purposes
        // note this is not optimal and slow!
        //
        
    debugDrawSkeleton()
    {
        let n,nNode,node,parentNode;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let lineCount,lineElementOffset,lineVertexStartIdx;
        let vertexBuffer,indexBuffer;
        let nodeSize=50;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        let scale=this.scale;
        let tempPoint=new PointClass(0,0,0);
        let posePoint=new PointClass(0,0,0);
        
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
            
                // get pose point in world coordinates
                
            posePoint.x=node.curPosePosition.x*scale.x;
            posePoint.y=node.curPosePosition.y*scale.y;
            posePoint.z=node.curPosePosition.z*scale.z;
            posePoint.matrixMultiply(this.modelMatrix);
            
                // now the billboarded quad points
            
            tempPoint.x=-nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

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
            
            posePoint.x=node.curPosePosition.x*scale.x;
            posePoint.y=node.curPosePosition.y*scale.y;
            posePoint.z=node.curPosePosition.z*scale.z;
            posePoint.matrixMultiply(this.modelMatrix);
            
            vertices[vIdx++]=posePoint.x;
            vertices[vIdx++]=posePoint.y;
            vertices[vIdx++]=posePoint.z;
            
            parentNode=this.nodes[node.parentNodeIdx];
            
            posePoint.x=parentNode.curPosePosition.x*scale.x;
            posePoint.y=parentNode.curPosePosition.y*scale.y;
            posePoint.z=parentNode.curPosePosition.z*scale.z;
            posePoint.matrixMultiply(this.modelMatrix);
            
            vertices[vIdx++]=posePoint.x;
            vertices[vIdx++]=posePoint.y;
            vertices[vIdx++]=posePoint.z;
            
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
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.DYNAMIC_DRAW);
        
            // always draw it, no matter what
            
        gl.disable(gl.DEPTH_TEST);

            // draw the skeleton
            
        shader.drawStart();
        
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
    
        //
        // draw the entity bounds for debug purposes
        // note this is not optimal and slow!
        //
        
    debugDrawBounds()
    {
        let n,rad;
        let vertices,indexes,vIdx,iIdx;
        let vertexBuffer,indexBuffer;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        let entity=this.entity;
        
            // bound lines
            
        vertices=new Float32Array(((3*36)*2)+((3*4)*2));        // 36 lines top, 36 lines bottom, and 4 lines side
        indexes=new Uint16Array(((2*36)*2)+(4*2));
        
        vIdx=0;
        iIdx=0;
        
            // top and bottom circle
            
        for (n=0;n!==36;n++) {
            rad=ModelEntityAlterClass.DEGREE_TO_RAD*(n*10)

            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y+entity.height;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));
            
            indexes[iIdx++]=n;
            indexes[iIdx++]=(n===35)?0:(n+1);
        }
        
        for (n=0;n!==36;n++) {
            rad=ModelEntityAlterClass.DEGREE_TO_RAD*(n*10)

            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));
            
            indexes[iIdx++]=n+36;
            indexes[iIdx++]=(n===35)?36:(n+37);
        }
        
            // a couple lines
        
        for (n=0;n!==4;n++) {
            rad=ModelEntityAlterClass.DEGREE_TO_RAD*(n*90);

            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y+entity.height;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));
            
            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));

            indexes[iIdx++]=72+(n*2);
            indexes[iIdx++]=73+(n*2);
        }
       
            // build the buffers
            
        vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.DYNAMIC_DRAW);
        
            // always draw it, no matter what
            
        gl.disable(gl.DEPTH_TEST);

            // draw the lines
            
        shader.drawStart();
        
            // the lines
            
        gl.uniform3f(shader.colorUniform,0.2,0.2,1.0);
        gl.drawElements(gl.LINES,(((36*2)*2)+(4*2)),gl.UNSIGNED_SHORT,0);
        
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
