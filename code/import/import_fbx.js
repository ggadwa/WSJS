import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import MeshVertexClass from '../../code/mesh/mesh_vertex.js';
import MeshClass from '../../code/mesh/mesh.js';

class FBXNodeClass
{
    constructor(name,value)
    {
        this.name=name;
        this.value=value;
        
        this.properties=new Map();
        this.children=[];
    }
    
    addProperty(name,value)
    {
        this.properties.set(name,value);
    }
    
    getProperty(name)
    {
        return(this.properties.get(name));
    }
    
    addChild(name,value)
    {
        let child=new FBXNodeClass(name,value);
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
        // covert FBX to nodes
        //
        
    convertTextToNodeTree(data)
    {
        let idx,nextIdx,line;
        let colonIdx,name,value;
        let nodeStack,parentNode;
        
            // scan the nodes into a tree
            
        idx=0;
        
        nodeStack=[];
        nodeStack.push(new FBXNodeClass(null,null));    // the root node
        
        while (idx!==-1) {
            
                // get next line
                
            nextIdx=data.indexOf('\n',idx);
            if (nextIdx===-1) {
                line=data.substring(idx).trim();
                idx=-1;
            }
            else {
                line=data.substring(idx,nextIdx).trim();
                idx=nextIdx+1;
            }
            
                // skip comments ; and blank lines
                
            if (line==='') continue;
            if (line.charAt(0)===';') continue;
            
                // end of brace
                
            if (line==='}') {
                nodeStack.pop();
                continue;
            }
            
                // get name and value
                
            colonIdx=line.indexOf(':');
            if (colonIdx===-1) continue;
            
            name=line.substring(0,colonIdx).trim();
            value=line.substring(colonIdx+1).trim();
            
                // get parent node
                
            parentNode=nodeStack[nodeStack.length-1];
            
                // going into brace means
                // a subnode
                
            if (value.charAt(value.length-1)==='{') {
                nodeStack.push(parentNode.addChild(name,value.substring(0,(value.length-1)).trim()));
            }
            
                // otherwise a property
                
            else {
                parentNode.addProperty(name,value);
            }
        }
        
            // return root node
            
        return(nodeStack[0]);
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
        
            // find the name
            
        name='';
        tokens=this.tokenizeValue(modelNode.value);
        
        for (n=0;n!==tokens.length;n++) {
            if (tokens[n].startsWith('Model::')) {
                name=tokens[n].substring(7);
                break;
            }
        }
        
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
        // main importer
        //
        
    async import(meshList)
    {
        let n,k,rootNode,objectsNode,node;
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
        
            // make sure it's a proper file
            
            
            
            
        
            // convert to a tree
            
        let byteOffset;
        let nextNodeOffset,name,propertyCount,propertyListSize,nameLen;
        let view=new DataView(data);
        let textDecoder=new TextDecoder('utf-8');
        
            // make sure it's a proper file
            
        name=textDecoder.decode(new Uint8Array(data.slice(0,18)));
        if (name!=='Kaydara FBX Binary') {
            console.log('Not a proper binary FBX file: '+this.importSettings.name);
            return(false);
        }
        
            // run through each node
            
        byteOffset=27;      // skip the headers
        
        while (true) {
            
                // get node information

            nextNodeOffset=view.getUInt32(byteOffset);
            propertyCount=view.getUInt32(byteOffset+4);
            propertyListSize=view.getUInt32(byteOffset+8);
            nameLen=view.getUInt8(byteOffset+12);
            
            name=textDecoder.decode(new Uint8Array(data.slice((byteOffset+13),(byteOffset+(nameLen+13)))));
            
            console.log(name);
            
            byteOffset=nextNodeOffset;
            if (byteOffset>=data.length) break;
        }
        
        return(false);
        
            // scan the nodes into a tree
            
        rootNode=this.convertTextToNodeTree(data);
        
            // find the objects node
            
        objectsNode=this.findNodeByName(rootNode,'Objects');
        if (objectsNode===null) {
            console.log('No objects node in FBX file '+this.importSettings.name);
            return(false);
        }
        
            // now decode each model
            
        meshes=[];
        
        for (n=0;n!==objectsNode.children.length;n++) {
            node=objectsNode.children[n];
            if (node.name==='Model') {
                
                    // look for meshes
                    
                console.log('MODEL='+this.tokenizeValue(node.value)[1]);
                
                //mesh=this.decodeModel(node);
                //if (mesh===null) return(false);
                
                //meshes.push(mesh);
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
        
        for (var [key, value] of node.properties) {
            str='';
            for (k=0;k!==spaceCount;k++) { str+='.'; }
            str+='PROP:';
            str+=key;
            str+='=';
            str+=value;
            console.log(str);
        }
        
        for (n=0;n!=node.children.length;n++) {
            str='';
            for (k=0;k!==spaceCount;k++) { str+='.'; }
            str+=node.children[n].name;
            str+='=';
            str+=node.children[n].value;
            console.log(str);
            this.test(node.children[n],(spaceCount+2));
        }
    }
}
