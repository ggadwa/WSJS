import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BlockClass from '../project/block.js';
import MapPathNodeClass from '../map/map_path_node.js';

export default class BlockDeveloperClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
    }

    initialize(entity)
    {
            // some developer flags
                    
        this.developerPlayerFly=false;
        this.developerPlayerNoClip=false;
        this.developerNoDamage=false;
        
            // developer live output
            
        this.core.interface.addText('fps','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.core.interface.addText('meshCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":46},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.core.interface.addText('trigCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":69},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.core.interface.addText('modelCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":92},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.core.interface.addText('effectCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":115},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
    }
    
        //
        // developer tools
        //
        
    positionInfo(entity)
    {
        let n,nodeIdx,str;
        let nMesh=this.core.map.meshList.meshes.length;
        let xBound=new BoundClass(entity.position.x-100,entity.position.x+100);
        let yBound=new BoundClass(entity.position.y+(entity.eyeOffset+100),entity.position.y+entity.eyeOffset);
        let zBound=new BoundClass(entity.position.z-100,entity.position.z+100);

            // position and angle
            
        console.info('pos='+Math.trunc(entity.position.x)+','+Math.trunc(entity.position.y)+','+Math.trunc(entity.position.z));
        console.info('ang='+Math.trunc(entity.angle.x)+','+Math.trunc(entity.angle.y)+','+Math.trunc(entity.angle.z));

            // nodes
            
        nodeIdx=entity.findNearestPathNode(5000);
        if (nodeIdx!==-1) console.info('node='+this.core.map.path.nodes[nodeIdx].nodeIdx);
            
            // meshes
            
        str='';

        for (n=0;n!==nMesh;n++) {
            if (this.core.map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=this.core.map.meshList.meshes[n].name;
            }
        }
        
        if (str!=='') console.info('hit mesh='+str);
        
        if (entity.standOnMeshIdx!==-1) console.info('stand mesh='+this.core.map.meshList.meshes[entity.standOnMeshIdx].name);
    }
    
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
    
    pathEditor(entity)
    {
        let n,k,nodeIdx;
        let node,links,str;
        let path=this.core.map.path;
        let input=this.core.input;
        
            // i key picks a new parent from closest node
            
        if (input.isKeyDownAndClear('i')) {
            nodeIdx=entity.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.info('Reset to parent node '+nodeIdx);
            return;
        }
        
            // o splits a path at two nodes,
            // hit o on each node, then o for new node
            
        if (input.isKeyDownAndClear('o')) {
            nodeIdx=entity.findNearestPathNode(1000000);
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
            path.nodes.push(new MapPathNodeClass(nodeIdx,entity.position.copy(),null,[path.editorSplitStartNodeIdx,path.editorSplitEndNodeIdx],null,null));
            
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
            
        if (input.isKeyDownAndClear('p')) {
            
                // is there a close node?
                // if so connect to that
                
            nodeIdx=entity.findNearestPathNode(5000);
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
            
            path.nodes.push(new MapPathNodeClass(nodeIdx,entity.position.copy(),null,links,null,null));
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.info('Added node '+nodeIdx);
            return;
        }
        
            // u key adds a key to nearest node
            
        if (input.isKeyDownAndClear('u')) {
            nodeIdx=this.entity.findNearestPathNode(5000);
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
            
        if (input.isKeyDownAndClear('[')) {
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

        if (input.isKeyDownAndClear(']')) {
            if (path.editorParentNodeIdx!==-1) {
                path.nodes[path.editorParentNodeIdx].position.setFromPoint(entity.position);
                console.info('Moved node '+path.editorParentNodeIdx);
            }
        }
        
            // \ key displays json of path
            
        if (input.isKeyDownAndClear('\\')) {            
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
    
    run(entity)
    {
        let idx,flag;
        let fpsStr=this.core.fps.toString();
        let input=this.core.input;
        
            // debug output
            
        idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }
        
        this.core.interface.updateText('fps',fpsStr);
        this.core.interface.updateText('meshCount',('mesh:'+this.core.drawMeshCount));
        this.core.interface.updateText('trigCount',('trig:'+this.core.drawTrigCount));
        this.core.interface.updateText('modelCount',('model:'+this.core.drawModelCount));
        this.core.interface.updateText('effectCount',('effect:'+this.core.drawEffectCount));
        
            // backspace prints out position info
            
        if (input.isKeyDownAndClear('Backspace')) {
            this.positionInfo(entity);
            return;
        }
        
            // - for no clip
            
        if (input.isKeyDownAndClear('-')) {
            this.developerPlayerNoClip=!this.developerPlayerNoClip;
            this.sendMessageToBlock('fps_movement','developerPlayerNoClip',this.developerPlayerNoClip);
            console.info('player no clip='+this.developerPlayerNoClip);
        }
        
            // = for fly
        
        if (input.isKeyDownAndClear('=')) {
            this.developerPlayerFly=!this.developerPlayerFly;
            this.sendMessageToBlock('fps_movement','developerPlayerFly',this.developerPlayerFly);
            console.info('player fly='+this.developerPlayerFly);
        }
        
            // delete turns on path editor
            
        if (input.isKeyDownAndClear('Delete')) {
            this.core.debugPaths=!this.core.debugPaths;
            console.info('path editor='+this.core.debugPaths);
            
            if (this.core.debugPaths) {
                console.info('u add key to nearest node');
                console.info('i select nearest node');
                console.info('o start path splitting');
                console.info('p adds new node to path');
                console.info('[ deleted selected node');
                console.info('] moves selected node to player');
                console.info('\\ output new path JSON');
            }
        }
        
            // end turns on entity bounds
            
        if (input.isKeyDownAndClear('End')) {
            this.core.debugEntityBounds=!this.core.debugEntityBounds;
            console.info('draw entity bounds='+this.core.debugEntityBounds);
        }
        
            // page down turns on entity skeletons
        
        if (input.isKeyDownAndClear('PageDown')) {
            this.core.debugSkeletons=!this.core.debugSkeletons;
            console.info('draw entity skeletons='+this.core.debugSkeletons);
        }
        
            // page up turns on collision surfaces
            
        if (input.isKeyDownAndClear('PageUp')) {
            this.core.debugCollisionSurfaces=!this.core.debugCollisionSurfaces;
            console.info('draw collision surfaces='+this.core.debugCollisionSurfaces);
        }
        
            // home turns off damage
            
        if (input.isKeyDownAndClear('Home')) {
            this.developerNoDamage=!this.developerNoDamage;
            this.sendMessageToBlock('player','developerPlayerFly',this.developerNoDamage);
            console.info('no damage='+this.developerNoDamage);
        }
        
            // path editing
            
        if (this.core.debugPaths) this.pathEditor(entity);
    }

}
