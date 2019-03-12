//
// map path class
//

export default class MapPathClass
{
    constructor(core)
    {
        this.core=core;
        
        this.nodes=[];
    }
    
    /*
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
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
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
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardYMatrix);

            vertices[vIdx++]=tempPoint.x+(node.curPosePosition.x*scale.x);
            vertices[vIdx++]=tempPoint.y+(node.curPosePosition.y*scale.y);
            vertices[vIdx++]=tempPoint.z+(node.curPosePosition.z*scale.z);

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardXMatrix);
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardYMatrix);

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
    */
}
