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
            
        console.info('pos='+Math.trunc(this.position.x)+','+Math.trunc(this.position.y)+','+Math.trunc(this.position.z));
        console.info('ang='+Math.trunc(this.angle.x)+','+Math.trunc(this.angle.y)+','+Math.trunc(this.angle.z));

            // nodes
            
        nodeIdx=this.findNearestPathNode(5000);
        if (nodeIdx!==-1) console.info('node='+this.core.map.path.nodes[nodeIdx].nodeIdx);
            
            // meshes
            
        str='';

        for (n=0;n!==nMesh;n++) {
            if (this.core.map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=this.core.map.meshList.meshes[n].name;
            }
        }
        
        if (str!=='') console.info('mesh='+str);
    }
    
        //
        // path editing
        //
    
    pathJSONReplacer(key,value)
    {
        if (key==='nodeIdx') return(undefined);
        if (key==='pathHints') return(undefined);
        if (key==='pathHintCounts') return(undefined);
        if ((key==='altPosition') && (value===null)) return(undefined);
        if ((key==='key') && (value===null)) return(undefined);
        if ((key==='data') && (value===null)) return(undefined);
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
            
            console.info('Reset to parent node '+nodeIdx);
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
                console.info('starting split at '+nodeIdx+' > now select second node');
                return;
            }
            
            if (path.editorSplitEndNodeIdx===-1) {
                path.editorSplitEndNodeIdx=nodeIdx;
                console.info('second node selected '+nodeIdx+' > now add split node');
                return;
            }
            
            nodeIdx=path.nodes.length;
            path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),null,[path.editorSplitStartNodeIdx,path.editorSplitEndNodeIdx],null,null));
            
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
                    
                    console.info('Connected node '+nodeIdx);
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
            
            path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),null,links,null,null));
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.info('Added node '+nodeIdx);
            return;
        }
        
            // u key adds a key to nearest node
            
        if (input.keyFlags[85]) {
            input.keyFlags[85]=false;
            
            nodeIdx=this.findNearestPathNode(5000);
            if (nodeIdx!==-1) {
                path.editorParentNodeIdx=nodeIdx;
                
                if (path.nodes[nodeIdx].key!==null) {
                    console.info('Node already has a key='+path.nodes[nodeIdx].key);
                    return;
                }
                
                path.nodes[nodeIdx].key='KEY_'+nodeIdx;
                
                console.info('Added temp key '+nodeIdx);
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
                
                console.info('Deleted node '+path.editorParentNodeIdx);
                
                path.editorParentNodeIdx=-1;
            }
        }
        
            // ] key moves selected node to player

        if (input.keyFlags[221]) {
            input.keyFlags[221]=false;
            
            if (path.editorParentNodeIdx!==-1) {
                path.nodes[path.editorParentNodeIdx].position.setFromPoint(this.position);
                console.info('Moved node '+path.editorParentNodeIdx);
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
        
            // - for no clip
            
        if (input.keyFlags[189]) {
            input.keyFlags[189]=false;
            this.debugPlayerNoClip=!this.debugPlayerNoClip;
            console.info('player no clip='+this.debugPlayerNoClip);
        }
        
            // = for fly
        
        if (input.keyFlags[187]) {
            input.keyFlags[187]=false;
            this.debugPlayerFly=!this.debugPlayerFly;
            console.info('player fly='+this.debugPlayerFly);
        }
        
            // delete turns on path editor
            
        if (input.keyFlags[46]) {
            input.keyFlags[46]=false;
            this.core.debugPaths=!this.core.debugPaths;
            console.info('path editor='+this.core.debugPaths);
            if (this.core.debugPaths) {
                console.info('u add key to nearest node');
                console.info('i select nearest node');
                console.info('o start path splitting');
                console.info('p adds new node to path');
                console.info('[ deleted selected node');
                console.info('] moves selected node to player');
                console.info('\ output new path JSON');
            }
        }
        
            // end turns on entity bounds
            
        if (input.keyFlags[35]) {
            input.keyFlags[35]=false;
            this.core.debugEntityBounds=!this.core.debugEntityBounds;
            console.info('draw entity bounds='+this.core.debugEntityBounds);
        }
        
            // page down turns on entity skeletons
        
        if (input.keyFlags[34]) {
            input.keyFlags[34]=false;
            this.core.debugSkeletons=!this.core.debugSkeletons;
            console.info('draw entity skeletons='+this.core.debugSkeletons);
        }
        
            // page up turns on collision surfaces
            
        if (input.keyFlags[33]) {
            input.keyFlags[33]=false;
            this.core.debugCollisionSurfaces=!this.core.debugCollisionSurfaces;
            console.info('draw collision surfaces='+this.core.debugCollisionSurfaces);
        }
        
            // path editing
            
        if (this.core.debugPaths) this.pathEditor();
    }
}
