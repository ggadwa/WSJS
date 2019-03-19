import PointClass from '../utility/point.js';
import Matrix4Class from '../utility/matrix4.js';

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
    
        //
        // draw the path for debug purposes
        // note this is not optimal and slow!
        //
        
    debugDrawPath()
    {
        let n,k,nNode,nLine,node,linkNode;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let lineElementOffset,lineVertexStartIdx;
        let vertexBuffer,indexBuffer;
        let nodeSize=250;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        let tempPoint=new PointClass(0,0,0);
        
            // any nodes?
        
        nNode=this.nodes.length;
        if (nNode===0) return;
        
            // get total line count
            
        nLine=0;
        
        for (n=0;n!==nNode;n++) {
            nLine+=this.nodes[n].links.length;
        }
        
            // path nodes
            
        vertices=new Float32Array(((3*4)*nNode)+((3*2)*nLine));
        indexes=new Uint16Array((nNode*6)+(nLine*2));
        
        vIdx=0;
        iIdx=0;
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];
            
            tempPoint.x=-nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=tempPoint.y+node.position.y;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=tempPoint.y+node.position.y;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=tempPoint.y+node.position.y;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=tempPoint.y+node.position.y;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            elementIdx=n*4;
            
            indexes[iIdx++]=elementIdx;     // triangle 1
            indexes[iIdx++]=elementIdx+1;
            indexes[iIdx++]=elementIdx+2;

            indexes[iIdx++]=elementIdx;     // triangle 2
            indexes[iIdx++]=elementIdx+2;
            indexes[iIdx++]=elementIdx+3;
        }
        
        lineElementOffset=iIdx;
        lineVertexStartIdx=Math.trunc(vIdx/3);
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];

            for (k=0;k!==node.links.length;k++) {
                linkNode=this.nodes[node.links[k]];
            
                vertices[vIdx++]=node.position.x;
                vertices[vIdx++]=node.position.y;
                vertices[vIdx++]=node.position.z;

                vertices[vIdx++]=linkNode.position.x;
                vertices[vIdx++]=linkNode.position.y;
                vertices[vIdx++]=linkNode.position.z;

                indexes[iIdx++]=lineVertexStartIdx++;
                indexes[iIdx++]=lineVertexStartIdx++;
            }
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

        shader.drawStart();
        
            // the lines
            
        gl.uniform3f(shader.colorUniform,0.0,0.0,1.0);
        gl.drawElements(gl.LINES,(nLine*2),gl.UNSIGNED_SHORT,(lineElementOffset*2));
        
            // the nodes
            
        gl.uniform3f(shader.colorUniform,1.0,0.0,0.0);
        gl.drawElements(gl.TRIANGLES,(nNode*6),gl.UNSIGNED_SHORT,0);
        
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
