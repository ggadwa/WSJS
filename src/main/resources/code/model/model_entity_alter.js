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
    constructor(core,entity)
    {
        this.MODEL_ROTATION_ORDER_XYZ=0;
        this.MODEL_ROTATION_ORDER_XZY=1;
        
        this.MAX_SHOW_HIDE_MESH_COUNT=32;           // max number of meshes we can keep show/hides for, set to 32 for network traffic
    
        this.core=core;
        this.entity=entity;
        
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        this.scale=new PointClass(0,0,0);
        
        this.frameRate=24;
        this.rotationOrder=this.MODEL_ROTATION_ORDER_XYZ;
        
        this.inCameraSpace=false;
        this.meshHideList=new Uint8Array(this.MAX_SHOW_HIDE_MESH_COUNT);
        
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
            
        this.currentAnimation=null;
        this.currentAnimationStartTimestamp=0;
        this.currentAnimationLoopStartTick=0;
        this.currentAnimationLoopEndTick=0;
        
        this.queuedAnimationStop=false;
        
        this.queuedAnimation=null;
        this.queuedAnimationStartTimestamp=0;
        
            // globals to stop GC
            
        this.nodeMat=new Matrix4Class();
        
        Object.seal(this);
    }
    
        //
        // called after shared models are loaded to
        // finish setting up the alter to prepare for animations
        //
        
    initialize()
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
    
    release()
    {
    }
    
        //
        // show and hide meshes
        //
        
    show(name,show)
    {
        let meshIdx=0;
        
        while (true) {
            meshIdx=this.entity.model.meshList.findNext(name,meshIdx);      // some meshes can have multiple ones with the same name, so find them all
            if ((meshIdx===-1) || (meshIdx>=this.MAX_SHOW_HIDE_MESH_COUNT)) break;
            this.meshHideList[meshIdx]=show?0:1;
            
            meshIdx++;
        }
    }
    
    getUpdateNetworkShowData()
    {
        let n;
        let mask=0;
        
        for (n=0;n!==this.MAX_SHOW_HIDE_MESH_COUNT;n++) {
            if (this.meshHideList[n]) mask=mask|(0x1<<n);
        }
    }
    
    putUpdateNetworkShowData(mask)
    {
        let n;
        
        for (n=0;n!==this.MAX_SHOW_HIDE_MESH_COUNT;n++) {
            this.meshHideList[n]=((mask&(0x1<<n))!==0);
        }
    }
    
        //
        // drawing utilities
        //
        
    setupModelMatrix(includeScale)
    {
        this.modelMatrix.setTranslationFromPoint(this.position);
        
        switch (this.rotationOrder) {
            case this.MODEL_ROTATION_ORDER_XYZ:
                this.rotMatrix.setRotationFromZAngle(this.angle.z);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromYAngle(this.angle.y);
                this.modelMatrix.multiply(this.rotMatrix);
                this.rotMatrix.setRotationFromXAngle(this.angle.x);
                this.modelMatrix.multiply(this.rotMatrix);
                break;
            case this.MODEL_ROTATION_ORDER_XZY:
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
            
        return(this.core.game.boundBoxInFrustum(this.xBound,this.yBound,this.zBound));
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
        let tick;
        let animation,channel,node;
        
        animation=this.entity.model.skeleton.animation;
        
            // the global animation tick
            
        tick=this.currentAnimationLoopStartTick+Math.trunc((this.core.game.timestamp-this.currentAnimationStartTimestamp)%(this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick));

        if (this.queuedAnimationStop) {
            if ((this.core.game.timestamp-this.currentAnimationStartTimestamp)>=(this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick)) tick=this.currentAnimationLoopEndTick;
        }
        
            // each channel changes one node over time
            
        for (channel of animation.channels) {
            node=this.nodes[channel.nodeIdx];
            
                // change the node
            
            switch (channel.trsType) {
                case channel.TRS_TYPE_TRANSLATION:
                    node.poseTranslation.setFromArray(channel.getPoseDataForTick(tick));
                    break;
                case channel.TRS_TYPE_ROTATION:
                    node.poseRotation.setFromArray(channel.getPoseDataForTick(tick));
                    break;
                case channel.TRS_TYPE_SCALE:
                    node.poseScale.setFromArray(channel.getPoseDataForTick(tick));
                    break;
            }
        }
    }
    
    setupNoPoseNodes()
    {
        let n;
        let channels,channel,node;
        
            // for no pose, just get the very first animation
            // and stick to that pose
            
        if (this.entity.model.skeleton.animation===null) return;
        channels=this.entity.model.skeleton.animation.channels;
        
            // each channel changes one node over time
            
        for (n=0;n!==channels.length;n++) {
            channel=channels[n];
            node=this.nodes[channel.nodeIdx];
            
                // change the node
            
            switch (channel.trsType) {
                case channel.TRS_TYPE_TRANSLATION:
                    node.poseTranslation.setFromArray(channel.getPoseDataForTick(0));
                    break;
                case channel.TRS_TYPE_ROTATION:
                    node.poseRotation.setFromArray(channel.getPoseDataForTick(0));
                    break;
                case channel.TRS_TYPE_SCALE:
                    node.poseScale.setFromArray(channel.getPoseDataForTick(0));
                    break;
            }
        }
    }
    
    runAnimation()
    {
        let fps;
        
            // running an animation
            
        if (this.currentAnimation!==null) {
            
                // check to see if it's time to
                // swap in a queued animation
                
            if (this.queuedAnimation!==null) {
                if (this.core.game.timestamp>=this.queuedAnimationStartTimestamp) {
                    this.currentAnimation=this.queuedAnimation;
                    this.currentAnimationStartTimestamp=this.queuedAnimationStartTimestamp;
                    fps=1000/this.frameRate;
                    this.currentAnimationLoopStartTick=Math.trunc(this.queuedAnimation.startFrame*fps);
                    this.currentAnimationLoopEndTick=Math.trunc(this.queuedAnimation.endFrame*fps);
                    this.queuedAnimation=null;
                }
            }
            
                // setup nodes to current pose
            
            this.setupNodesToPose();
        }
        
            // no animation, setup the no pose
            
        else {
            this.setupNoPoseNodes();
        }
        
            // callback for any custom bone setup
            
        this.entity.animatedBoneSetup();
        
            // now cumulative all the nodes for
            // their matrixes
 
        this.runAnimationNode(this.nodes[this.entity.model.skeleton.rootNodeIdx],null);
    }
    
    runAninimationDeveloper()
    {
        this.setupNoPoseNodes();
        this.runAnimationNode(this.nodes[this.entity.model.skeleton.rootNodeIdx],null);
    }
    
        //
        // animation show-hides
        //
        
    runAnimationMeshShowHide()
    {
        let mesh,hide,show;
        let tick,frame;
        let fps=1000/this.frameRate;
        
        if (this.currentAnimation===null) return;
        if (this.currentAnimation.meshes===null) return;
        
            // get the frame
            
        tick=Math.trunc((this.core.game.timestamp-this.currentAnimationStartTimestamp)%(this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick));
        frame=this.currentAnimation.startFrame+Math.trunc(tick/fps);
        
        for (mesh of this.currentAnimation.meshes) {
            
                // if there is a blank hide ([]) then
                // we consider the mesh always hidden
                
            if (mesh.hide.length===0) {
                show=false;
            }
            
                // otherwise it's hidden if we are
                // within the hiding frames
                
            else {
                show=true;

                for (hide of mesh.hide) {
                    if ((frame>=hide[0]) && (frame<hide[1])) {
                        show=false;
                        break;
                    }
                }
            }
            
            this.show(mesh.name,show);
        }
    }
    
        //
        // setting up animations
        //
    
    startAnimationChunkInFrames(animation)
    {
        let fps=1000/this.frameRate;
        
        this.currentAnimation=animation;
        this.currentAnimationStartTimestamp=this.core.game.timestamp;
        this.currentAnimationLoopStartTick=Math.trunc(animation.startFrame*fps);
        this.currentAnimationLoopEndTick=Math.trunc(animation.endFrame*fps);
        
        this.queuedAnimation=null;              // a start erases any queued animations
        this.queuedAnimationStop=false;
        
        return(true);
    }
    
    continueAnimationChunkInFrames(animation)
    {
            // if no animation, just start it
            
        if (this.currentAnimation===null) return(this.startAnimationChunkInFrames(animation));
        
            // if this animation is queued up then
            // we can count that as a continue, this allows
            // interupting animations to finish
            
        if (this.queuedAnimation!==null) {
            if ((animation.startFrame!==this.queuedAnimation.startFrame) || (animation.endFrame!==this.queuedAnimation.endFrame)) return(true);
        }
        
            // otherwise only start if animation
            // is not already playing
            
        if ((animation.startFrame!==this.currentAnimation.startFrame) || (animation.endFrame!==this.currentAnimation.endFrame)) return(this.startAnimationChunkInFrames(animation));
        
        return(true);
    }
    
    queueAnimationStop()
    {
        this.queuedAnimationStop=true;
    }
    
    queueAnimationChunkInFrames(animation)
    {
        let len;
        
            // if no animation, queue becomes a start
            
        if (this.currentAnimation===null) return(this.startAnimationChunkInFrames(animation));
        
            // find when this animation ends
            
        len=this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick;
        len-=Math.trunc((this.core.game.timestamp-this.currentAnimationStartTimestamp)%len);
        
            // queue up

        this.queuedAnimation=animation;
        this.queuedAnimationStartTimestamp=this.core.game.timestamp+len;
        
        return(true);
    }
    
    interuptAnimationChunkInFrames(animation)
    {
        let oldAnimation,len;
        
            // current animation comes back when this is finished
            
        oldAnimation=this.currentAnimation;
        
            // start new one
            
        this.startAnimationChunkInFrames(animation);
        
            // re-queue old one
            
        if (oldAnimation!==null) {
            len=this.currentAnimationLoopEndTick-this.currentAnimationLoopStartTick;
            len-=Math.trunc((this.core.game.timestamp-this.currentAnimationStartTimestamp)%len);
        
            this.queuedAnimation=oldAnimation;
            this.queuedAnimationStartTimestamp=this.core.game.timestamp+len;
        }
    }
    
    isAnimationRunning()
    {
        return(this.currentAnimation!==null);
    }
    
    isAnimationQueued()
    {
        return(this.queuedAnimation!==null);
    }
    
    getAnimationTickCount(animation)
    {
        return(Math.trunc((animation.endFrame-animation.startFrame)*(1000/this.frameRate)));
    }
    
    getAnimationFinishTimestampFromFrame(frameIdx,animation)
    {
        return(this.core.game.timestamp+Math.trunc(((frameIdx-animation.startFrame)/this.frameRate)*1000));
    }
    
    getCurrentAnimation()
    {
        return(this.currentAnimation);
    }
    
        //
        // hard set bone changes, only calls these after
        // the animation has been calculated
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
        // draw the skeleton for development
        // note this is not optimal and slow!
        //
        
    drawSkeleton()
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
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+posePoint.x;
            vertices[vIdx++]=tempPoint.y+posePoint.y;
            vertices[vIdx++]=tempPoint.z+posePoint.z;

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

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
        // draw the entity bounds for developer mode
        // note this is not optimal and slow!
        //
        
    drawBounds(selected)
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
            rad=(Math.PI/180.0)*(n*10)

            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y+entity.height;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));
            
            indexes[iIdx++]=n;
            indexes[iIdx++]=(n===35)?0:(n+1);
        }
        
        for (n=0;n!==36;n++) {
            rad=(Math.PI/180.0)*(n*10)

            vertices[vIdx++]=this.position.x+(entity.radius*Math.sin(rad));
            vertices[vIdx++]=this.position.y;
            vertices[vIdx++]=this.position.z-(entity.radius*Math.cos(rad));
            
            indexes[iIdx++]=n+36;
            indexes[iIdx++]=(n===35)?36:(n+37);
        }
        
            // a couple lines
        
        for (n=0;n!==4;n++) {
            rad=(Math.PI/180.0)*(n*90);

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
            
        //gl.disable(gl.DEPTH_TEST);

            // draw the lines
            
        shader.drawStart();
        
            // the lines
            
        if (selected) {
            gl.uniform3f(shader.colorUniform,1,1,0);
        }
        else
        {
            gl.uniform3f(shader.colorUniform,0.2,0.2,1.0);
        }
        
        gl.drawElements(gl.LINES,(((36*2)*2)+(4*2)),gl.UNSIGNED_SHORT,0);
        
            // the nodes
        
        shader.drawEnd();
        
            // re-enable depth
            
       // gl.enable(gl.DEPTH_TEST);
        
            // tear down the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
    }

}
