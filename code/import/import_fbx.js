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
            return(await resp.text());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
        //
        // main importer
        //
        
    async import(meshList)
    {
        let idx,nextIdx,colonIdx;
        let line,name,value;
        let nodeStack,node,parentNode;
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
        
            // scan the nodes into a tree
            
            console.log('decoding');
            
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
        
        
        this.test(nodeStack[0],0);
        
        
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
