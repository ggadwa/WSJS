import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import CoreClass from '../main/core.js';
import ProjectEntityClass from '../../code/project/project_entity.js';
import ModelClass from '../../code/model/model.js';
import ImportModelClass from '../../code/import/import_model.js';
import MapPathNodeClass from '../../code/map/map_path_node.js';

export default class ProjectEntityDeveloperClass extends ProjectEntityClass
{
    constructor(core,name,position,angle,data)
    {
        super(core,name,position,angle,data);
    }
    
        //
        // position information
        //
        
    positionInfo()
    {
        let n,nodeIdx,str;
        let nMesh=this.core.map.meshList.meshes.length;
        let xBound=new BoundClass(this.position.x-100,this.position.x+100);
        let yBound=new BoundClass(this.position.y+(this.eyeOffset+100),this.position.y+this.eyeOffset);
        let zBound=new BoundClass(this.position.z-100,this.position.z+100);

            // position and angle
            
        console.log('pos='+Math.trunc(this.position.x)+','+Math.trunc(this.position.y)+','+Math.trunc(this.position.z));
        console.log('ang='+Math.trunc(this.angle.x)+','+Math.trunc(this.angle.y)+','+Math.trunc(this.angle.z));

            // nodes
            
        nodeIdx=this.findNearestPathNode(5000);
        if (nodeIdx!==-1) console.log('node='+this.core.map.path.nodes[nodeIdx].nodeIdx);
            
            // meshes
            
        str='';

        for (n=0;n!==nMesh;n++) {
            if (this.core.map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=this.core.map.meshList.meshes[n].name;
            }
        }
        
        if (str!=='') console.log('mesh='+str);
    }
    
        //
        // path editing
        //
    
    pathJSONReplacer(key,value)
    {
        if (key==='nodeIdx') return(undefined);
        if (key==='pathHints') return(undefined);
        if (key==='pathHintCounts') return(undefined);
        if ((key==='key') && (value===null)) return(undefined);
        return(value);
    }
    
    pathEditor()
    {
        let n,k,nodeIdx;
        let node,links,str;
        let path=this.core.map.path;
        let input=this.core.input;
        
            // i key picks a new parent from closest node
            
        if (input.keyFlags[73]) {
            input.keyFlags[73]=false;
            
            nodeIdx=this.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.log('Reset to parent node '+nodeIdx);
            return;
        }
        
            // o splits a path at two nodes,
            // hit o on each node, then o for new node
            
        if (input.keyFlags[79]) {
            input.keyFlags[79]=false;
            
            nodeIdx=this.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            if (path.editorSplitStartNodeIdx===-1) {
                path.editorSplitStartNodeIdx=nodeIdx;
                console.log('starting split at '+nodeIdx+' > now select second node');
                return;
            }
            
            if (path.editorSplitEndNodeIdx===-1) {
                path.editorSplitEndNodeIdx=nodeIdx;
                console.log('second node selected '+nodeIdx+' > now add split node');
                return;
            }
            
            nodeIdx=path.nodes.length;
            path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),[path.editorSplitStartNodeIdx,path.editorSplitEndNodeIdx]));
            
            links=path.nodes[path.editorSplitStartNodeIdx].links;
            links[links.indexOf(path.editorSplitEndNodeIdx)]=nodeIdx;
            
            links=path.nodes[path.editorSplitEndNodeIdx].links;
            links[links.indexOf(path.editorSplitStartNodeIdx)]=nodeIdx;
            
            path.editorParentNodeIdx=nodeIdx;
            path.editorSplitStartNodeIdx=-1;
            path.editorSplitEndNodeIdx=-1;

            return;
        }
        
            // p key adds to path
            
        if (input.keyFlags[80]) {
            input.keyFlags[80]=false;
            
                // is there a close node?
                // if so connect to that
                
            nodeIdx=this.findNearestPathNode(5000);
            if (nodeIdx!==-1) {
                if (path.editorParentNodeIdx!==-1) {
                    path.nodes[nodeIdx].links.push(path.editorParentNodeIdx);
                    path.nodes[path.editorParentNodeIdx].links.push(nodeIdx);
                    
                    path.editorParentNodeIdx=nodeIdx;
                    
                    console.log('Connected node '+nodeIdx);
                }
                
                return;
            }
            
                // otherwise create a new node
                
            nodeIdx=path.nodes.length;
            
            links=[];
            if (path.editorParentNodeIdx!==-1) {
                links.push(path.editorParentNodeIdx);
                path.nodes[path.editorParentNodeIdx].links.push(nodeIdx);
            }
            
            path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),links));
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.log('Added node '+nodeIdx);
            return;
        }
        
            // u key adds a key to nearest node
            
        if (input.keyFlags[85]) {
            input.keyFlags[85]=false;
            
            nodeIdx=this.findNearestPathNode(5000);
            if (nodeIdx!==-1) {
                path.nodes[nodeIdx].key='KEY_'+nodeIdx;
                
                console.log('Added temp key '+nodeIdx);
                
                path.editorParentNodeIdx=nodeIdx;
                return;
            }
        }
        
            // [ key deletes selected node
            
        if (input.keyFlags[219]) {
            input.keyFlags[219]=false;
            
            if (path.editorParentNodeIdx!==-1) {
                
                    // fix any links
                    
                for (n=0;n!=path.nodes.length;n++) {
                    if (n===path.editorParentNodeIdx) continue;
                    node=path.nodes[n];
                    
                    k=0;
                    while (k<node.links.length) {
                        if (node.links[k]===path.editorParentNodeIdx) {
                            node.links.splice(k,1);
                            continue;
                        }
                        if (node.links[k]>path.editorParentNodeIdx) node.links[k]=node.links[k]-1;
                        k++;
                    }
                }
                
                    // and delete the node
                    
                path.nodes.splice(path.editorParentNodeIdx,1);
                
                console.log('Deleted node '+path.editorParentNodeIdx);
                
                path.editorParentNodeIdx=-1;
            }
        }
        
            // ] key moves selected node to player

        if (input.keyFlags[221]) {
            input.keyFlags[221]=false;
            
            if (path.editorParentNodeIdx!==-1) {
                path.nodes[path.editorParentNodeIdx].position.setFromPoint(this.position);
                console.log('Moved node '+path.editorParentNodeIdx);
            }
        }
        
            // \ key displays json of path
            
        if (input.keyFlags[220]) {
            input.keyFlags[220]=false;
            
            str='                "paths":\n';
            str+='                    [\n';
            
            for (n=0;n!==path.nodes.length;n++) {
                str+='                        ';
                str+=JSON.stringify(path.nodes[n],this.pathJSONReplacer.bind(this));
                if (n!==(path.nodes.length-1)) str+=',';
                str+='\n';
            }
            
            str+='                    ]\n';
            
            console.info(str);
        }
    }
    
        //
        // run editor
        //
    
    run()
    {
        let input=this.core.input;
        
            // backspace prints out position info
            
        if (input.keyFlags[8]) {
            input.keyFlags[8]=false;
            this.positionInfo();
            return;
        }
        
            // debug keys
            
        if (input.keyFlags[45]) {
            input.keyFlags[45]=false;
            this.debugPlayerNoClip=!this.debugPlayerNoClip;
            console.log('player no clip='+this.debugPlayerNoClip);
        }
        
        if (input.keyFlags[36]) {
            input.keyFlags[36]=false;
            this.debugPlayerFly=!this.debugPlayerFly;
            console.log('player fly='+this.debugPlayerFly);
        }
        
        if (input.keyFlags[33]) {
            input.keyFlags[33]=false;
            this.core.debugEntityBounds=!this.core.debugEntityBounds;
            console.log('draw entity bounds='+this.core.debugEntityBounds);
        }
        
        if (input.keyFlags[46]) {
            input.keyFlags[46]=false;
            this.core.debugPaths=!this.core.debugPaths;
            console.log('path editor='+this.core.debugPaths);
        }
        
        if (input.keyFlags[35]) {
            input.keyFlags[35]=false;
            this.core.debugSkeletons=!this.core.debugSkeletons;
            console.log('draw entity skeletons='+this.core.debugSkeletons);
        }
        
        if (input.keyFlags[34]) {
            input.keyFlags[34]=false;
            this.core.debugCollisionSurfaces=!this.core.debugCollisionSurfaces;
            console.log('draw collision surfaces='+this.core.debugCollisionSurfaces);
        }
        
        
            // path editing
            
        if (this.core.debugPaths) this.pathEditor();
    }
}
