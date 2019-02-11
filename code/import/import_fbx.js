import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import MeshVertexClass from '../../code/mesh/mesh_vertex.js';
import MeshClass from '../../code/mesh/mesh.js';

class FBXNodeClass
{
    constructor(name)
    {
        this.name=name;
        
        this.properties=[];
        this.children=[];
    }
    
    addProperty(value)
    {
        this.properties.push(value);
    }
    
    addChild(name)
    {
        let child=new FBXNodeClass(name);
        this.children.push(child);
        
        return(child);
    }
}

export default class ImportFBXClass
{
    constructor(view,importSettings)
    {
        this.view=view;
        this.importSettings=importSettings;
        
        this.READ_NODE_LIST=['Objects','Model','Geometry','Vertices','PolygonVertexIndex','LayerElementUV','UV','UVIndex','LayerElementNormal','Normals','NormalsIndex','MappingInformationType','ReferenceInformationType'];        
       
        this.data=null;
        this.lines=null;
        
        this.meshes=[];
    }
    
        //
        // async FBX loader
        //
        
    async loadFBX()
    {
        let resp;
        let url='./data/fbx/'+this.importSettings.name+'.fbx';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.arrayBuffer());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
        //
        // node utilities
        //
        
    findNodeByName(startNode,name)
    {
        let n,node;
        
        for (n=0;n!==startNode.children.length;n++) {
            node=startNode.children[n];
            if (node.name===name) return(node);
        }
        
        return(null);
    }
    
        //
        // convert indexes into trigs
        //
        
    addTrigsForIndexes(trigIndexes,vertices,indexes,vertexList,uvList,uvIndexes,normalList,normalsIndexes)
    {
        let n,npt,v;
        let startTrigIdx;
        
            // is there at least 3 points?
	
        npt=trigIndexes.length;
        
	if (npt<3) return;
        
            // polys are tesselated into
            // triangles around 0 vertex
            
        startTrigIdx=vertexList.length;

            // add the polys
        
        for (n=0;n!==npt;n++) {
            v=new MeshVertexClass();
            v.position.setFromPoint(vertexList[trigIndexes[n]]);
            if (uvIndexes===null) {
                v.uv.setFromPoint(uvList[trigIndexes[n]]);
            }
            else {
                v.uv.setFromPoint(uvList[uvIndexes[n]]);
            }
            if (normalsIndexes===null) {
                v.normal.setFromPoint(normalList[trigIndexes[n]]);
            }
            else {
                v.normal.setFromPoint(normalList[normalsIndexes[n]]);
            }
            vertices.push(v);
        }
        
        for (n=0;n<(npt-2);n++) {
            indexes.push(startTrigIdx);
            indexes.push(startTrigIdx+(n+1));
            indexes.push(startTrigIdx+(n+2));
        }
    }
    
        //
        // rotations and Y zeroing
        //
        
    rotate(vertexList,normalList)
    {
        let n,nVertex;
        let centerPnt=new PointClass(0,0,0);
        let rotAng=this.importSettings.rotate;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=vertexList.length;
        if (nVertex<=1) return;
       
            // find the center

        centerPnt.setFromPoint(vertexList[0]);
            
        for (n=1;n!==nVertex;n++) {
            centerPnt.addPoint(vertexList[n]);
        }
        
        centerPnt.x=Math.trunc(centerPnt.x/nVertex);
        centerPnt.y=Math.trunc(centerPnt.y/nVertex);
        centerPnt.z=Math.trunc(centerPnt.z/nVertex);
        
            // now rotate
            
        for (n=0;n!==nVertex;n++) {
            vertexList[n].rotateAroundPoint(centerPnt,rotAng);
        }
        
        for (n=0;n!=normalList.length;n++) {
            normalList[n].rotate(rotAng);
        }
    }
    
    zeroTop()
    {
        let n,nVertex,by;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=this.vertexList.length;
        if (nVertex<=1) return;
       
            // find bottom Y
            
        by=0;
            
        for (n=0;n!==nVertex;n++) {
            if (this.vertexList[n].y<by) by=this.vertexList[n].y;
        }
        
        by=Math.trunc(Math.abs(by));
        
            // floor it
            
        for (n=0;n!==nVertex;n++) {
            this.vertexList[n].y+=by;
        }    
    }
    
    zeroBottom()
    {
        let n,nVertex,by;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=this.vertexList.length;
        if (nVertex<=1) return;
       
            // find bottom Y
            
        by=0;
            
        for (n=0;n!==nVertex;n++) {
            if (this.vertexList[n].y>by) by=this.vertexList[n].y;
        }
        
            // floor it
            
        for (n=0;n!==nVertex;n++) {
            this.vertexList[n].y-=by;
        }    
    }
    
        //
        // decode geometry nodes
        //
        
    decodeGeometry(geoNode)
    {
        let n,name,array,bitmap;
        let idx,x,y,z,normal;
        let trigIndexes,polygonIndexNode,polygonIndexes,vertices,indexes;
        let verticesNode,refTypeNode;
        let uvLayerNode,uvNode,uvIndexNode,uvIndexes;
        let normalLayerNode,normalsNode,normalsIndexNode,normalsIndexes;
        let vertexList=[];
        let uvList=[];
        let normalList=[];
        
            // find the name (has a null separator in it, then ?Model
        
        name=geoNode.properties[1];
        idx=geoNode.properties[1].indexOf(String.fromCharCode(0));
        if (idx!==-1) name=name.substring(0,idx);
        
            // load vertices
            
        verticesNode=this.findNodeByName(geoNode,'Vertices');
        if (verticesNode===null) {
            console.log('No vertices found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        idx=0;
        array=verticesNode.properties[0];

        for (n=0;n!==array.length;n++) {
            x=array[idx++]*this.importSettings.scale;
            y=array[idx++]*this.importSettings.scale;
            z=array[idx++]*this.importSettings.scale;
            vertexList.push(new PointClass(x,y,z));
        }
        
            // load the UVs
            
        uvLayerNode=this.findNodeByName(geoNode,'LayerElementUV');
        if (uvLayerNode===null) {
            console.log('No UV Layer found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        uvIndexes=null;
        
        refTypeNode=this.findNodeByName(uvLayerNode,'ReferenceInformationType');
        if (refTypeNode.properties[0]!=='Direct') {
            uvIndexNode=this.findNodeByName(uvLayerNode,'UVIndex');
            uvIndexes=uvIndexNode.properties[0];
        }
        
        uvNode=this.findNodeByName(uvLayerNode,'UV');
        
        idx=0;
        array=uvNode.properties[0];

        for (n=0;n!==array.length;n++) {
            x=array[idx++]*this.importSettings.uScale;
            y=array[idx++]*this.importSettings.vScale;
            uvList.push(new Point2DClass(x,y,z));
        }
        
            // load the normals
            
        normalLayerNode=this.findNodeByName(geoNode,'LayerElementNormal');
        if (normalLayerNode===null) {
            console.log('No Normals Layer found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        normalsIndexes=null;
        
        refTypeNode=this.findNodeByName(normalLayerNode,'ReferenceInformationType');
        if (refTypeNode.properties[0]!=='Direct') {
            normalsIndexNode=this.findNodeByName(normalLayerNode,'UVIndex');
            normalsIndexes=normalsIndexNode.properties[0];
        }
        
        normalsNode=this.findNodeByName(normalLayerNode,'Normals');
        
        idx=0;
        array=normalsNode.properties[0];

        for (n=0;n!==array.length;n++) {
            x=array[idx++]*this.importSettings.scale;
            y=array[idx++]*this.importSettings.scale;
            z=array[idx++]*this.importSettings.scale;
            normal=new PointClass(x,y,z);
            normal.normalize();
            normalList.push(normal);
        }
       
            // any user rotations
            
        this.rotate(vertexList,normalList);
        
            // get the polygons
            
        polygonIndexNode=this.findNodeByName(geoNode,'PolygonVertexIndex');
        if (polygonIndexNode===null) {
            console.log('No polygon indexes found in FBX model: '+this.importSettings.name);
            return(null);
        }
            
        polygonIndexes=polygonIndexNode.properties[0];
        
            // the temp list that gets turned into a mesh
            
        vertices=[];
        indexes=[];
        
            // take apart the polygons and turn them into trigs

        trigIndexes=[];
        
        for (n=0;n!=polygonIndexes.length;n++) {
            idx=polygonIndexes[n];
            if (idx>=0) {
                trigIndexes.push(idx);
            }
            else {
                trigIndexes.push((-idx)-1);     // was XOR, need to make positive and -1
                this.addTrigsForIndexes(trigIndexes,vertices,indexes,vertexList,uvList,uvIndexes,normalList,normalsIndexes);
            }
        }
                
            // decode successful
            
        bitmap=this.view.bitmapList.get(this.importSettings.name);
        if (bitmap===undefined) {
            console.log('missing material: '+this.importSettings.name);
            return(null);
        }

        console.log('DONE vertexList='+vertices.length);
        console.log('DONE indexes='+indexes.length);
        return(new MeshClass(this.view,name,bitmap,vertices,indexes,0));
    }
    
        //
        // compressed data utility
        //
        
    extractZipData(compressedBytes)
    {
        let bytes;
        let pako=window.pako;
        
        try {
            bytes=pako.inflate(compressedBytes);
            return(new DataView(bytes.buffer));
        }
        catch(err)
        {
            console.log('Error in compressed FBX data: '+err);
        }
        
        return(null);
    }
    
        //
        // decode binary tree nodes
        //
        
    decodeProperty(data,view,textDecoder,byteOffset,node)
    {
        let propType;
        let arrayLen,arrayEncode,arrayCompressLen,len;
        let n,array,arrayView;
        let str,idx;
        
        propType=String.fromCharCode(view.getUint8(byteOffset)).charAt(0);
        
            // get the item
            
        switch (propType) {
            
                // regular types
                
            case 'Y':
                node.addProperty(view.getInt16((byteOffset+1),true));
                return(2+1);
            case 'C':
                node.addProperty(view.getUint8((byteOffset+1))!==0);
                return(1+1);
            case 'I':
                node.addProperty(view.getInt32((byteOffset+1),true));
                return(4+1);
            case 'F':
                node.addProperty(view.getFloat32((byteOffset+1),true));
                return(4+1);
            case 'D':
                node.addProperty(view.getFloat64((byteOffset+1),true));
                return(8+1);
            case 'L':
                node.addProperty(view.getInt32((byteOffset+1),true)+((2**32)*view.getInt32((byteOffset+5),true)));
                return(8+1);
                
                // arrays
                
            case 'f':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, aren't used in decoding
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
                
            case 'd':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                
                if (arrayEncode===0) {
                    arrayView=new DataView(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                else {
                    arrayView=this.extractZipData(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                if (arrayView==null) return(-1);
                
                array=new Float64Array(arrayLen); 
                for (n=0;n!==arrayLen;n++) {
                    array[n]=arrayView.getFloat64((n*8),true);
                }
                
                node.addProperty(array);
                
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
                
            case 'l':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, arent't used in decoding
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
                
            case 'i':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                
                if (arrayEncode===0) {
                    arrayView=new DataView(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                else {
                    arrayView=this.extractZipData(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                if (arrayView==null) return(-1);
                
                array=new Int32Array(arrayLen);
                for (n=0;n!==arrayLen;n++) {
                    array[n]=arrayView.getInt32((n*4),true);
                }
                
                node.addProperty(array);
                
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
                
            case 'b':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, aren't used in decoding
                return((arrayEncode===0)?(arrayLen+13):(arrayCompressLen+13));
                
                // others
                
            case 'S':
                len=view.getUint32((byteOffset+1),true);
                str=textDecoder.decode(new Uint8Array(data.slice((byteOffset+5),((byteOffset+5)+len))));
                idx=str.indexOf(0);
                if (idx!==-1) str=str.substring(0,idx);     // strings can be null terminated
                node.addProperty(str);
                return(len+5);
                
            case 'R':
                len=view.getUint32((byteOffset+1),true);
                // ignore these, aren't used in decoding
                return(len+5);
        }

        console.log('Unknown property type in FBX: '+propType);
        return(-1);
    }
        
    decodeBinaryTree(data,view,textDecoder,is64bit,byteOffset,parentNode)
    {
        let n,ok;
        let nodeHeaderLen,propAdd;
        let nextNodeOffset,propertyOffset,propertyCount,propertyListSize,nameLen;
        let node,name;
        
        while (true) {
            
                // get node information

            if (!is64bit) {
                nextNodeOffset=view.getUint32(byteOffset,true);
                propertyCount=view.getUint32((byteOffset+4),true);
                propertyListSize=view.getUint32((byteOffset+8),true);
                nameLen=view.getUint8(byteOffset+12);
                nodeHeaderLen=13;
            }
            else {
                nextNodeOffset=view.getUint32(byteOffset,true)+(view.getUint32((byteOffset+4),true)*(2**32));
                propertyCount=view.getUint32((byteOffset+8),true)+(view.getUint32((byteOffset+12),true)*(2**32));
                propertyListSize=view.getUint32((byteOffset+16),true)+(view.getUint32((byteOffset+20),true)*(2**32));
                nameLen=view.getUint8(byteOffset+24);
                nodeHeaderLen=25;
                
            }
            
                // at the blank end node?
                
            if (nextNodeOffset===0) break;

                // get the name
                
            byteOffset+=nodeHeaderLen;
            name=textDecoder.decode(new Uint8Array(data.slice(byteOffset,(byteOffset+nameLen))));
            byteOffset+=nameLen;
            
                // we are only looking for specific nodes,
                // so knock out things we don't care about
 
            ok=false;
            
            for (n=0;n!==this.READ_NODE_LIST.length;n++) {
                if (name===this.READ_NODE_LIST[n]) {
                    ok=true;
                }
            }
                
            if (!ok) {
                byteOffset=nextNodeOffset;
                continue;
            }

                // create the node
            
            node=parentNode.addChild(name);
            
                // read the properties
            
            propertyOffset=byteOffset;
            
            for (n=0;n!==propertyCount;n++) {
                propAdd=this.decodeProperty(data,view,textDecoder,propertyOffset,node);
                if (propAdd===-1) return(false);
                
                propertyOffset+=propAdd;
            }
            
            byteOffset+=propertyListSize;
            
                // check for nested nodes
                // there is always a null node at the end so ignore that
            
            if (byteOffset<nextNodeOffset) {
                this.decodeBinaryTree(data,view,textDecoder,is64bit,byteOffset,node);
            }
            
                // move on to next child
                
            byteOffset=nextNodeOffset;
        }

        return(true);
    }
    
        //
        // main importer
        //
        
    async import(meshList)
    {
        let n,k,rootNode,objectsNode,geometryNode,node;
        let name,is64bit,view,textDecoder;
        let curBitmapName;
        let mesh,meshes;
        let data=null;
        
            // load the file
            
        await this.loadFBX()
            .then
                (
                        // resolved
                
                    value=>{
                        data=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
        
            // convert to a tree
            
        view=new DataView(data);
        textDecoder=new TextDecoder('utf-8');
        
            // make sure it's a proper file
            
        name=textDecoder.decode(new Uint8Array(data.slice(0,18)));
        if (name!=='Kaydara FBX Binary') {
            console.log('Not a proper binary FBX file: '+this.importSettings.name);
            return(false);
        }
        
            // get the version
            
        is64bit=view.getUint32(23,true)>=7500;
        
            // decode the tree
            // start at byte 27 to skip headers
        
        rootNode=new FBXNodeClass(null);
        if (!this.decodeBinaryTree(data,view,textDecoder,is64bit,27,rootNode)) return(false);
        
        this.test(rootNode,0);
        
        return(false);
        
            // find the objects>geometry node
            
        objectsNode=this.findNodeByName(rootNode,'Objects');
        if (objectsNode===null) {
            console.log('No objects node in FBX file '+this.importSettings.name);
            return(false);
        }
        
        geometryNode=this.findNodeByName(objectsNode,'Geometry');
        if (geometryNode===null) {
            console.log('No geometry node in FBX file '+this.importSettings.name);
            return(false);
        }
        
            // decode the mesh
            
        mesh=this.decodeGeometry(geometryNode);
        if (mesh===null) return(false);
        
        meshes.push(mesh);
        
            // now decode each model
        
        /*    
        meshes=[];
        
        for (n=0;n!==objectsNode.children.length;n++) {
            node=objectsNode.children[n];
            if (node.name!=='Model') continue;
                
                // decode for type
                // second property is mesh for geometry

            switch(node.properties[2]) {
                case 'Mesh':
                    mesh=this.decodeModel(node);
                    if (mesh===null) return(false);
                    meshes.push(mesh);
                    break;
            }
        }
*/
            // and sort meshes by bitmaps into mesh list
            
        for (n=0;n!==this.meshes.length;n++) {
            if (this.meshes[n]===null) continue;
            
            curBitmapName=this.meshes[n].bitmap.name;
            
            for (k=n;k<this.meshes.length;k++) {
                if (this.meshes[k]===null) continue;
                
                if (this.meshes[k].bitmap.name===curBitmapName) {
                    meshList.add(this.meshes[k]);
                    this.meshes[k]=null;
                }
            }
        }
        
        return(true);
    }

    test(node,spaceCount)
    {
        let n,k;
        let str;
        /*
        for (n=0;n!=node.properties.length;n++) {
            str='';
            for (k=0;k!==spaceCount;k++) { str+='.'; }
            str+='PROP:';
            str+=node.properties[n];
            console.log(str);
        }
        */
        for (n=0;n!=node.children.length;n++) {
            str='';
            for (k=0;k!==spaceCount;k++) { str+='.'; }
            str+=node.children[n].name;
            str+=" [";
            str+=node.children[n].properties.length;
            str+="]";
            if (node.children[n].properties.length!==0) {
                str+=" [";
                if (node.children[n].properties[0] instanceof Float64Array) {
                    str+='Float64Array->'+node.children[n].properties[0].length;
                }
                else {
                    if (node.children[n].properties[0] instanceof Int32Array) {
                        str+='Int32Array->'+node.children[n].properties[0].length;
                    }
                    else {
                        str+=typeof(node.children[n].properties[0]);
                    }
                }
                str+="]";
            }
            console.log(str);
            this.test(node.children[n],(spaceCount+1));
        }
    }
}
