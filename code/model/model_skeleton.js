import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import ModelNodeClass from '../model/model_node.js';
import ModelJointClass from '../model/model_joint.js';
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
    
    
    
    runAnimationRecursive(node,parentNode)
    {
        let childNodeIdx;
        
            // get node position (T*R*S)
         
        node.curPoseMatrix.setTranslationFromPoint(node.translation);
        this.nodeMat.setRotationFromQuaternion(node.rotation);
        node.curPoseMatrix.multiply(this.nodeMat);
        this.nodeMat.setScaleFromPoint(node.scale);
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
            this.runAnimationRecursive(this.nodes[childNodeIdx],node);
        }
    }
    
    runAnimation()
    {
        if (this.rootNodeIdx!==-1) this.runAnimationRecursive(this.nodes[this.rootNodeIdx],null);
    }
    
        //
        // get the skeleton joint matrixes
        //
        
    getPoseJointMatrixArray()
    {
        let n,node,joint;
        let matrixArray=[];
        
        for (n=0;n!==this.joints.length;n++) {
            joint=this.joints[n];
            node=this.nodes[joint.nodeIdx];
            
                
            //joint.jointMatrix.fromArray(joint.inverseBindMatrix.data);
            //joint.jointMatrix.multiply(node.curPoseMatrix);
            
            
            joint.jointMatrix.fromArray(node.curPoseMatrix.data);
            joint.jointMatrix.multiply(joint.inverseBindMatrix);
            
            joint.jointMatrix.setIdentity();
            
            matrixArray.push(joint.jointMatrix);
        }
        
        return(matrixArray);
    }
    
        //
        // debug stuff -- note this is not optimized and slow!
        //
        
    draw(modelMatrix)
    {
        let n,nNode,node,parentNode;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let lineCount,lineElementOffset,lineVertexStartIdx;
        let vertexBuffer,indexBuffer;
        let nodeSize=50;
        let gl=this.view.gl;
        let shader=this.view.shaderList.modelSkeletonShader;
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

            vertices[vIdx++]=tempPoint.x+node.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+node.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+node.curPosePosition.z;

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+node.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+node.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+node.curPosePosition.z;

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+node.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+node.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+node.curPosePosition.z;

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+node.curPosePosition.x;
            vertices[vIdx++]=tempPoint.y+node.curPosePosition.y;
            vertices[vIdx++]=tempPoint.z+node.curPosePosition.z;

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
            
            vertices[vIdx++]=node.curPosePosition.x;
            vertices[vIdx++]=node.curPosePosition.y;
            vertices[vIdx++]=node.curPosePosition.z;
            
            vertices[vIdx++]=parentNode.curPosePosition.x;
            vertices[vIdx++]=parentNode.curPosePosition.y;
            vertices[vIdx++]=parentNode.curPosePosition.z;
            
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
