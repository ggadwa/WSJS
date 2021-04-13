import PointClass from '../utility/point.js';
import LineClass from '../utility/line.js';
import Matrix4Class from '../utility/matrix4.js';
import MapPathNodeClass from '../map/map_path_node.js';

//
// map path class
//

export default class MapPathClass
{
    constructor(core)
    {
        this.core=core;
        
        this.nodes=[];
        this.keyNodes=[];
        this.spawnNodes=[];
        
            // some path editor values

        this.editorSplitStartNodeIdx=-1;
        this.editorSplitEndNodeIdx=-1;
        this.editorParentNodeIdx=-1;
        
        Object.seal(this);
    }
    
        //
        // build the key nodes into a separate
        // quick to look list
        //
            
    preparePaths()
    {
        let n,node;

            // and build a list of key and
            // spawn nodes
        
        this.keyNodes=[];
        this.spawnNodes=[];
        
        for (n=0;n!==this.nodes.length;n++) {
            node=this.nodes[n];
            if (node.key!==null) this.keyNodes.push(n);
            if (node.spawn) this.spawnNodes.push(n);
        }
    }
    
        //
        // builds a perpendicular line of a certain length
        // that follows the nodes by index, creating a series
        // of lines that follow the a loop of nodes
        //
        
    buildPerpendicularLineForLoop(startNodeKey,endNodeKey,lineLen)
    {
        let n,startNodeIdx,endNodeIdx,angY,node,prevNode;
        let rotPoint=new PointClass(0,0,0);
        let p1=new PointClass(0,0,0);
        let p2=new PointClass(0,0,0);
        
            // get start and end node
            
        startNodeIdx=this.findKeyNodeIndex(startNodeKey);
        if (startNodeIdx===-1) {
            console.log(`Unknown node key: ${startNodeKey}`);
            return;
        }
        
        endNodeIdx=this.findKeyNodeIndex(endNodeKey);
        if (endNodeIdx===-1) {
            console.log(`Unknown node key: ${endNodeKey}`);
            return;
        }

            // build the loop perpendiculars
            
        for (n=startNodeIdx;n<=endNodeIdx;n++) {
            node=this.nodes[n];
            prevNode=this.nodes[(n===startNodeIdx)?endNodeIdx:(n-1)];
            
            angY=prevNode.position.angleYTo(node.position);

            angY+=90.0;
            if (angY>360.0) angY-=360.0;

            rotPoint.setFromValues(0,0,lineLen);
            rotPoint.rotateY(null,angY);
            p1.setFromAddPoint(node.position,rotPoint);
            p2.setFromSubPoint(node.position,rotPoint);

            node.perpendicularLine=new LineClass(p1.copy(),p2.copy());
        }
    }
    
        //
        // perpendicular line collision
        // if collide, return distance, or -1
        // for no collision
        //
        
    checkPerpendicularXZCollision(nodeIdx,checkLine,hitPnt)
    {
        let sx1,sx2,sz1,sz2;
        let f,s,t;
        let line=this.nodes[nodeIdx].perpendicularLine;
            
        sx1=line.p2.x-line.p1.x;
        sz1=line.p2.z-line.p1.z;
        sx2=checkLine.p2.x-checkLine.p1.x;
        sz2=checkLine.p2.z-checkLine.p1.z;

        f=((-sx2*sz1)+(sx1*sz2));
        if (f===0) return(false);
        
        s=((-sz1*(line.p1.x-checkLine.p1.x))+(sx1*(line.p1.z-checkLine.p1.z)))/f;
        t=((sx2*(line.p1.z-checkLine.p1.z))-(sz2*(line.p1.x-checkLine.p1.x)))/f;

        if ((s>=0)&&(s<=1)&&(t>=0)&&(t<=1)) {
            if (hitPnt!==null) {
                hitPnt.x=line.p1.x+(t*sx1);
                hitPnt.z=line.p1.z+(t*sz1);
            }
            return(true);
        }
        
        return(false);
    }
    
    translatePerpendicularXZHitToOtherPerpendicularXZHit(hitNodeIdx,hitPnt,otherNodeIdx,otherHitPnt)
    {
        let line=this.nodes[hitNodeIdx].perpendicularLine;
        let otherLine=this.nodes[otherNodeIdx].perpendicularLine;
        let f;
        
            // get the line factor
            
        f=line.getFactorForXZPointOnLine(hitPnt);
        otherLine.getXZPointOnLineForFactor(f,otherHitPnt);
    }
    
        //
        // utilities
        //
        
    getRandomKeyNodeIndex()
    {
        return(this.keyNodes[Math.trunc(this.keyNodes.length*Math.random())]);
    }
    
    findKeyNodeIndex(key)
    {
        let n;
        
        for (n=0;n!==this.keyNodes.length;n++) {
            if (this.nodes[this.keyNodes[n]].key===key) return(this.keyNodes[n]);
        }
        
        return(-1);
    }
    
    getNodeKey(nodeIdx)
    {
        if (this.nodes[nodeIdx].key===undefined) return(null);
        return(this.nodes[nodeIdx].key);
    }
    
    getNodeData(nodeIdx)
    {
        if (this.nodes[nodeIdx].data===undefined) return(null);
        return(this.nodes[nodeIdx].data);
    }
    
    getNodePosition(nodeIdx)
    {
        return(this.nodes[nodeIdx].position);
    }
    
    getYAngleBetweenNodes(fromNodeIdx,toNodeIdx)
    {
        return(this.nodes[fromNodeIdx].position.angleYTo(this.nodes[toNodeIdx].position));
    }
    
        //
        // load paths
        //
        
    async loadPathJson()
    {
        let resp;
        let url='../paths/'+this.core.game.map.name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }

    async load()
    {
        let n,paths;
        let pathDef,pathNode;
        let map=this.core.game.map;
        
            // paths aren't required, so just
            // skip out if missing
            
        paths=null;
        
        await this.loadPathJson()
            .then
                (
                    value=>{
                        paths=value;
                    },
                    value=>{}
                );

        if (paths===null) return(true);
        
            // decode it
            
        for (n=0;n!==paths.length;n++) {
            pathDef=paths[n];

            pathNode=new MapPathNodeClass(map.path.nodes.length,new PointClass(pathDef.position.x,pathDef.position.y,pathDef.position.z),pathDef.links,pathDef.key,pathDef.spawn,new Int16Array(pathDef.pathHints),pathDef.data);
            map.path.nodes.push(pathNode);
        }

            // fix any broken links and build
            // a key list
            
        this.preparePaths();
    }
    
        //
        // draw the path for development purposes
        // note this is not optimal and slow!
        //
        
    drawPath()
    {
        let n,k,nNode,nLinkLine,nPerpendicularLine,node,linkNode,selNodeIdx;
        let vertices,indexes,vIdx,iIdx,elementIdx;
        let linkLineElementOffset,linkLineVertexStartIdx;
        let perpendicularLineElementOffset,perpendicularLineVertexStartIdx;
        let vertexBuffer,indexBuffer;
        let nodeSize=350;
        let drawSlop=50;
        let gl=this.core.gl;
        let shader=this.core.shaderList.debugShader;
        let tempPoint=new PointClass(0,0,0);
        
            // any nodes?
        
        nNode=this.nodes.length;
        if (nNode===0) return;
        
            // get total link line count
            
        nLinkLine=0;
        
        for (n=0;n!==nNode;n++) {
            nLinkLine+=this.nodes[n].links.length;
        }
        
            // get perpendicular line count
            
        nPerpendicularLine=0;
        
        for (n=0;n!==nNode;n++) {
            if (this.nodes[n].perpendicularLine!==null) nPerpendicularLine++;
        }
        
            // path nodes
            
        vertices=new Float32Array(((3*4)*nNode)+((3*2)*(nLinkLine+nPerpendicularLine)));
        indexes=new Uint16Array((nNode*6)+((nLinkLine+nPerpendicularLine)*2));
        
            // nodes
        
        vIdx=0;
        iIdx=0;
            
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];
            
            tempPoint.x=-nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=(tempPoint.y+node.position.y)+drawSlop;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=nodeSize;
            tempPoint.y=-nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=(tempPoint.y+node.position.y)+drawSlop;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=(tempPoint.y+node.position.y)+drawSlop;
            vertices[vIdx++]=tempPoint.z+node.position.z;

            tempPoint.x=-nodeSize;
            tempPoint.y=nodeSize;
            tempPoint.z=0.0;
            tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

            vertices[vIdx++]=tempPoint.x+node.position.x;
            vertices[vIdx++]=(tempPoint.y+node.position.y)+drawSlop;
            vertices[vIdx++]=tempPoint.z+node.position.z;
            
            elementIdx=n*4;
            
            indexes[iIdx++]=elementIdx;     // triangle 1
            indexes[iIdx++]=elementIdx+1;
            indexes[iIdx++]=elementIdx+2;

            indexes[iIdx++]=elementIdx;     // triangle 2
            indexes[iIdx++]=elementIdx+2;
            indexes[iIdx++]=elementIdx+3;
        }
        
            // link lines
            
        linkLineElementOffset=iIdx;
        linkLineVertexStartIdx=Math.trunc(vIdx/3);
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];

            for (k=0;k!==node.links.length;k++) {
                linkNode=this.nodes[node.links[k]];
            
                vertices[vIdx++]=node.position.x;
                vertices[vIdx++]=node.position.y+drawSlop;
                vertices[vIdx++]=node.position.z;

                vertices[vIdx++]=linkNode.position.x;
                vertices[vIdx++]=linkNode.position.y+drawSlop;
                vertices[vIdx++]=linkNode.position.z;

                indexes[iIdx++]=linkLineVertexStartIdx++;
                indexes[iIdx++]=linkLineVertexStartIdx++;
            }
        }
        
            // perpendicular lines
            
        perpendicularLineElementOffset=iIdx;
        perpendicularLineVertexStartIdx=Math.trunc(vIdx/3);
        
        for (n=0;n!==nNode;n++) {
            node=this.nodes[n];
            if (node.perpendicularLine===null) continue;

            vertices[vIdx++]=node.perpendicularLine.p1.x;
            vertices[vIdx++]=node.perpendicularLine.p1.y+drawSlop;
            vertices[vIdx++]=node.perpendicularLine.p1.z;

            vertices[vIdx++]=node.perpendicularLine.p2.x;
            vertices[vIdx++]=node.perpendicularLine.p2.y+drawSlop;
            vertices[vIdx++]=node.perpendicularLine.p2.z;

            indexes[iIdx++]=perpendicularLineVertexStartIdx++;
            indexes[iIdx++]=perpendicularLineVertexStartIdx++;
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
            
        shader.drawStart();
        
            // the link lines
            
        gl.uniform3f(shader.colorUniform,0.0,0.0,1.0);
        gl.drawElements(gl.LINES,(nLinkLine*2),gl.UNSIGNED_SHORT,(linkLineElementOffset*2));
        
            // the perpendicular lines
            
        gl.uniform3f(shader.colorUniform,0.3,0.3,1.0);
        gl.drawElements(gl.LINES,(nPerpendicularLine*2),gl.UNSIGNED_SHORT,(perpendicularLineElementOffset*2));
        
            // the nodes
            
        gl.uniform3f(shader.colorUniform,1.0,0.0,0.0);
        gl.drawElements(gl.TRIANGLES,(nNode*6),gl.UNSIGNED_SHORT,0);
            
        gl.depthFunc(gl.LEQUAL);
        
            // overdraw for spawn nodes
            
        gl.uniform3f(shader.colorUniform,0.9,0.0,1.0);
        
        for (n=0;n!==nNode;n++) {
            if (this.nodes[n].spawn) gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,((n*6)*2));
        }
        
            // overdraw for key nodes
            
        gl.uniform3f(shader.colorUniform,0.0,1.0,0.0);
        
        for (n=0;n!==nNode;n++) {
            if (this.nodes[n].key!==null) gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,((n*6)*2));
        }
        
            // and overdraw for selected nodes
            
        selNodeIdx=this.core.developer.getSelectNode();
        
        if (selNodeIdx!==-1) {
            gl.uniform3f(shader.colorUniform,1.0,1.0,0.0);
            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,((selNodeIdx*6)*2));
        }
        
        if (this.editorSplitStartNodeIdx!==-1) {
            gl.uniform3f(shader.colorUniform,0.0,1.0,1.0);
            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,((this.editorSplitStartNodeIdx*6)*2));
        }
        
        if (this.editorSplitEndNodeIdx!==-1) {
            gl.uniform3f(shader.colorUniform,0.0,1.0,1.0);
            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,((this.editorSplitEndNodeIdx*6)*2));
        }
        
        gl.depthFunc(gl.LESS);
        
        shader.drawEnd();
        
            // re-enable depth
            
            // tear down the buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
    }

}
