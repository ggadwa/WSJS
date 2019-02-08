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
        
        this.LOOKUP_DIRECT=0;
        this.LOOKUP_INDEX=1;
        
        this.READ_NODE_LIST=['Objects','Model','Geometry','Vertices','PolygonVertexIndex','LayerElementUV','UV','UVIndex','LayerElementNormal','Normals','NormalsIndex','MappingInformationType','ReferenceInformationType'];        
       
        this.data=null;
        this.lines=null;
        
        this.vertexList=[];
        this.uvList=[];
        this.normalList=[];
        
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
    
    tokenizeValue(value)
    {
        let n,ch,inQuote,str;
        let tokens=[];
        
        str='';
        inQuote=false;
        
        for (n=0;n!==value.length;n++) {
            ch=value.charAt(n);
            
            if (ch==='"') {
                inQuote=!inQuote;
                continue;
            }
            
            if (ch===',') {
                if (inQuote) {
                    str+=ch;
                    continue;
                }
                
                tokens.push(str.trim());
                
                str='';
                continue;
            }
            
            str+=ch;
        }
        
        tokens.push(str.trim());
        
        return(tokens);
    }
    
    tokenizeValueAsInt(value)
    {
        let n;
        let tokens=value.split(',');
        let intTokens=[];
        
        for (n=0;n!==tokens.length;n++) {
            intTokens.push(parseInt(tokens[n]));
        }
        
        return(intTokens);
    }
    
        //
        // convert indexes into trigs
        //
        
    addTrigsForIndexes(trigIndexes,vertexList,indexes,uvLookupType,uvIndexes,normalLookupType,normalIndexes)
    {
        let n,npt,v;
        let startTrigIdx;
        
        console.log('uvlookup='+uvLookupType);
        console.log('uvIndexes='+uvIndexes);
        console.log('normallookup='+normalLookupType);
        console.log('normalIndexes='+normalIndexes);
        
            // is there at least 3 points?
	
        npt=trigIndexes.length;
        
	if (npt<3) return;
        
            // polys are tesselated into
            // triangles around 0 vertex
            
        startTrigIdx=vertexList.length;

            // add the polys
        
        for (n=0;n!==npt;n++) {
            v=new MeshVertexClass();
            v.position.setFromPoint(this.vertexList[trigIndexes[n]]);
            if (uvLookupType===this.LOOKUP_DIRECT) {
                v.uv.setFromPoint(this.uvList[trigIndexes[n]]);
            }
            else {
                v.uv.setFromPoint(this.uvList[uvIndexes[n]]);
            }
            if (normalLookupType===this.LOOKUP_DIRECT) {
                v.normal.setFromPoint(this.normalList[trigIndexes[n]]);
            }
            else {
                v.normal.setFromPoint(this.normalList[normalIndexes[n]]);
            }
            vertexList.push(v);
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
        
    rotate()
    {
        let n,nVertex;
        let centerPnt=new PointClass(0,0,0);
        let rotAng=this.importSettings.rotate;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=this.vertexList.length;
        if (nVertex<=1) return;
       
            // find the center

        centerPnt.setFromPoint(this.vertexList[0]);
            
        for (n=1;n!==nVertex;n++) {
            centerPnt.addPoint(this.vertexList[n]);
        }
        
        centerPnt.x=Math.trunc(centerPnt.x/nVertex);
        centerPnt.y=Math.trunc(centerPnt.y/nVertex);
        centerPnt.z=Math.trunc(centerPnt.z/nVertex);
        
            // now rotate
            
        for (n=0;n!==nVertex;n++) {
            this.vertexList[n].rotateAroundPoint(centerPnt,rotAng);
        }
        
        for (n=0;n!=this.normalList.length;n++) {
            this.normalList[n].rotate(rotAng);
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
        // decode model nodes
        //
        
    decodeModel(modelNode)
    {
        let n,name,bitmap;
        let x,y,z,normal;
        let uvNode,normalNode;
        let value,tokens;
        let idx,trigIndexes;
        let uvLookupType,normalLookupType,uvIndexes,normalIndexes;
        let vertexList,indexes;
        
            // find the name (has a null separator in it, then ?Model
        
        name=modelNode.properties[0];
        idx=modelNode.properties[0].indexOf(String.fromCharCode(0));
        if (idx!==-1) name=name.substring(0,idx);
        
        console.log('mesh='+name);
        return(null);
        
            // get the vertices
            
        value=modelNode.getProperty('Vertices');
        if (value===undefined) {
            console.log('FBX file missing Vertices node in model '+this.importSettings.name);
            return(null);
        }
        
        tokens=value.split(',');
        
        for (n=0;n<tokens.length;n+=3) {
            x=Math.trunc(parseFloat(tokens[n])*this.importSettings.scale);
            y=Math.trunc(parseFloat(tokens[n+1])*this.importSettings.scale);
            z=Math.trunc(parseFloat(tokens[n+2])*this.importSettings.scale);
            console.log('vertex='+x+','+y+','+z);
            this.vertexList.push(new PointClass(x,y,z));
        }
        
            // get the uvs
            
        uvNode=this.findNodeByName(modelNode,'LayerElementUV');
        if (uvNode===null) {
            console.log('FBX file missing LayerElementUV node in model '+this.importSettings.name);
            return(null);
        }
        
        uvIndexes=null;
        uvLookupType=(this.tokenizeValue(uvNode.getProperty('ReferenceInformationType'))[0]==='Direct')?this.LOOKUP_DIRECT:this.LOOKUP_INDEX;
        if (uvLookupType===this.LOOKUP_INDEX) {
            uvIndexes=this.tokenizeValueAsInt(uvNode.getProperty('UVIndex'));
        }
        
        value=uvNode.getProperty('UV');
        if (value===undefined) {
            console.log('FBX file missing LayerElementUV->UV node in model '+this.importSettings.name);
            return(null);
        }
        
        tokens=value.split(',');

        for (n=0;n<tokens.length;n+=2) {
            x=parseFloat(tokens[n])*this.importSettings.uScale;
            y=parseFloat(tokens[n+1])*this.importSettings.vScale;
            console.log('uv='+x+','+y);
            this.uvList.push(new Point2DClass(x,y));
        }
        
            // get the normals
            
        normalNode=this.findNodeByName(modelNode,'LayerElementNormal');
        if (normalNode===null) {
            console.log('FBX file missing LayerElementNormal node in model '+this.importSettings.name);
            return(null);
        }
        
        normalIndexes=null;
        normalLookupType=(this.tokenizeValue(normalNode.getProperty('ReferenceInformationType'))[0]==='Direct')?this.LOOKUP_DIRECT:this.LOOKUP_INDEX;
        if (normalLookupType===this.LOOKUP_INDEX) {
            normalIndexes=this.tokenizeValueAsInt(normalNode.getProperty('NormalsIndex'));
        }
        
        value=normalNode.getProperty('Normals');
        if (value===undefined) {
            console.log('FBX file missing LayerElementNormal->Normals node in model '+this.importSettings.name);
            return(null);
        }
           
        tokens=value.split(',');

        for (n=0;n<tokens.length;n+=3) {
            x=parseFloat(tokens[n]);
            y=parseFloat(tokens[n+1]);
            z=parseFloat(tokens[n+2]);
            normal=new PointClass(x,y,z);
            normal.normalize();
            console.log('normal='+x+','+y+','+z);
            this.normalList.push(normal);
        }
        
            // any user rotations
            
        this.rotate();
        
            // get the polygons
            
        value=modelNode.getProperty('PolygonVertexIndex');
        if (value===undefined) {
            console.log('FBX file missing PolygonVertexIndex node in model '+this.importSettings.name);
            return(null);
        }
        
            // the temp list that gets turned into a mesh
            
        vertexList=[];
        indexes=[];
        
            // take apart the tokens and turn them into trigs

        tokens=value.split(',');

        trigIndexes=[];
        
        for (n=0;n<tokens.length;n++) {
            idx=parseInt(tokens[n]);
            if (idx>=0) {
                trigIndexes.push(idx);
            }
            else {
                trigIndexes.push((-idx)-1);     // was XOR, need to make positive and -1
                this.addTrigsForIndexes(trigIndexes,vertexList,indexes,uvLookupType,uvIndexes,normalLookupType,normalIndexes);
            }
        }
                
            // decode successful
            
        bitmap=null; // this.view.bitmapList.get(bitmapName);
        console.log('DONE vertexList='+vertexList.length);
        console.log('DONE indexes='+indexes.length);
        return(new MeshClass(this.view,name,bitmap,vertexList,indexes,0));
    }
    
        //
        // decode binary tree nodes
        //
        
    decodeProperty(data,view,textDecoder,byteOffset,node)
    {
        let propType;
        let arrayLen,arrayEncode,arrayCompressLen,len;
        let str,idx;
        
        propType=String.fromCharCode(view.getUint8(byteOffset)).charAt(0);
        console.log(node.name+'='+propType);
        
            // get the item
            
        switch (propType) {
            case 'Y':
                return(2+1);
            case 'C':
                return(1+1);
            case 'I':
                return(4+1);
            case 'F':
                node.addProperty(view.getFloat32((byteOffset+1),true));
                return(4+1);
            case 'D':
                return(8+1);
            case 'L':
                return(8+1);
            case 'f':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
            case 'd':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                console.log('compressed='+arrayEncode);
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
            case 'l':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
            case 'i':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                console.log('compressed='+arrayEncode);
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
            case 'b':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                return((arrayEncode===0)?(arrayLen+13):(arrayCompressLen+13));
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

        return(0);
    }
        
    decodeBinaryTree(data,view,textDecoder,is64bit,byteOffset,parentNode)
    {
        let n,ok;
        let nodeHeaderLen;
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
                propertyOffset+=this.decodeProperty(data,view,textDecoder,propertyOffset,node);
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

    }
    
        //
        // main importer
        //
        
    async import(meshList)
    {
        let n,k,rootNode,objectsNode,node;
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
        this.decodeBinaryTree(data,view,textDecoder,is64bit,27,rootNode);
        
            // find the objects node
            
        objectsNode=this.findNodeByName(rootNode,'Objects');
        if (objectsNode===null) {
            console.log('No objects node in FBX file '+this.importSettings.name);
            return(false);
        }
        
        this.test(rootNode,0);
        console.log('done');
        return(true);
        
            // now decode each model
            
        meshes=[];
        
        for (n=0;n!==objectsNode.children.length;n++) {
            node=objectsNode.children[n];
            if (node.name!=='Model') continue;
                
                // decode for type

            switch(node.properties[1]) {
                case 'Mesh':
                    mesh=this.decodeModel(node);
                    if (mesh===null) return(false);
                    meshes.push(mesh);
                    break;
            }
        }

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
            console.log(str);
            this.test(node.children[n],(spaceCount+1));
        }
    }
}
