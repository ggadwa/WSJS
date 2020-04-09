import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import MapPathNodeClass from '../map/map_path_node.js';

export default class DeveloperClass
{
    constructor(core)
    {
        this.core=core;
        
        this.MOVE_SPEED=100;
        this.SIDE_SPEED=50;
        this.MAX_TURN_SPEED=10;
        this.MAX_LOOK_SPEED=5;
        this.MAX_LOOK_ANGLE=90;
        this.MOVE_FAST_FACTOR=3.0;
        
        this.NEAR_PATH_NODE_DISTANCE=5000;
        this.CONTACT_MESH_RADIUS=100;
        
        this.on=false;
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.xBound=new BoundClass(0,0);
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        this.core.interface.addText('wsFPS','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,false);
        
        this.core.interface.addText('wsMeshCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsTrigCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":46},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsModelCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":69},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsEffectCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":92},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,true);
        
        this.core.interface.addText('wsPosition','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-72},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsAngle','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-49},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsNode','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-26},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsMesh','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-3},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);

        return(true);
    }
    
    release()
    {
    }
    
        //
        // position info
        //
        
    positionInfo()
    {
        let n,nodeIdx,str;
        let nMesh=this.core.map.meshList.meshes.length;
        let player=this.core.map.entityList.getPlayer();
        let xBound=new BoundClass(player.position.x-100,player.position.x+100);
        let yBound=new BoundClass(player.position.y+(player.eyeOffset+100),player.position.y+player.eyeOffset);
        let zBound=new BoundClass(player.position.z-100,player.position.z+100);

            // position and angle
            
        console.info('pos='+player.position);
        console.info('ang='+player.angle);

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
        
        if (str!=='') console.info('hit mesh='+str);
        
        if (player.standOnMeshIdx!==-1) console.info('stand mesh='+this.core.map.meshList.meshes[player.standOnMeshIdx].name);
    }
    
        //
        // paths
        //
        
    pathJSONReplacer(key,value)
    {
        if (key==='nodeIdx') return(undefined);
        if (key==='pathHints') return(new Array(...value));
        if (key==='pathHintCounts') return(undefined);
        if ((key==='key') && (value===null)) return(undefined);
        if ((key==='data') && (value===null)) return(undefined);
        return(value);
    }
    
    findNearestPathNode(maxDistance)
    {
        let n,d,dist;
        let nodeIdx;
        let nodes=this.core.map.path.nodes;
        let nNode=nodes.length;
        
        nodeIdx=-1;
        dist=maxDistance;
        
        for (n=0;n!==nNode;n++) {
            d=nodes[n].position.distance(this.position);
            if ((d<dist) || (dist===-1)) {
                dist=d;
                nodeIdx=n;
            }
        }

        return(nodeIdx);
    }
    
    pathEditor()
    {
        let n,k,nodeIdx;
        let node,links,str;
        let path=this.core.map.path;
        let input=this.core.input;
        let player=this.core.map.entityList.getPlayer();
        
            // i key picks a new parent from closest node
            
        if (input.isKeyDownAndClear('i')) {
            nodeIdx=this.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.info('Reset to parent node '+nodeIdx);
            return;
        }
        
            // o splits a path at two nodes,
            // hit o on each node, then o for new node
            
        if (input.isKeyDownAndClear('o')) {
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
            path.nodes.push(new MapPathNodeClass(nodeIdx,player.position.copy(),[path.editorSplitStartNodeIdx,path.editorSplitEndNodeIdx],null,null,null));
            
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
                
            nodeIdx=this.findNearestPathNode(this.NEAR_PATH_NODE_DISTANCE);
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
            
            path.nodes.push(new MapPathNodeClass(nodeIdx,player.position.copy(),links,null,null,null));
            
            path.editorParentNodeIdx=nodeIdx;
            
            console.info('Added node '+nodeIdx);
            return;
        }
        
            // u key adds a key to nearest node
            
        if (input.isKeyDownAndClear('u')) {
            nodeIdx=this.findNearestPathNode(this.NEAR_PATH_NODE_DISTANCE);
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
                path.nodes[path.editorParentNodeIdx].position.setFromPoint(player.position);
                console.info('Moved node '+path.editorParentNodeIdx);
            }
        }
        
            // \ key displays json of path
            
        if (input.isKeyDownAndClear('\\')) {
            this.core.setPauseState(true,false);
            
            console.info('Generating hints, wait ...');
            path.buildPathHints();
            
            str='    "paths":\n';
            str+='        [\n';
            
            for (n=0;n!==path.nodes.length;n++) {
                str+='            ';
                str+=JSON.stringify(path.nodes[n],this.pathJSONReplacer.bind(this));
                if (n!==(path.nodes.length-1)) str+=',';
                str+='\n';
            }
            
            str+='        ],\n';
            
            console.info(str);
        }
    }
    
        //
        // developer movement
        //
        
    move()
    {
        let moveForward,moveBackward,moveLeft,moveRight,moveFactor;
        let x,y,turnAdd,lookAdd;
        let input=this.core.input;
        let setup=this.core.setup;
        
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('W'));
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('S'));
        moveLeft=(input.isKeyDown('a')) || (input.isKeyDown('A'));
        moveRight=(input.isKeyDown('d')) || (input.isKeyDown('D'));
        
        moveFactor=input.isKeyDown('Shift')?this.MOVE_FAST_FACTOR:1.0;
        
            // turning
            
        turnAdd=0;
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.MAX_TURN_SPEED) turnAdd=this.MAX_TURN_SPEED*Math.sign(turnAdd);
            
            if (turnAdd!==0) {
                this.angle.y+=turnAdd;
                if (this.angle.y<0.0) this.angle.y+=360.0;
                if (this.angle.y>=360.00) this.angle.y-=360.0;
            }
        }
        
            // looking
            
        lookAdd=0;
            
        y=input.getMouseMoveY();
        if (y!==0) {
            lookAdd=y*setup.mouseYSensitivity;
            lookAdd+=(lookAdd*setup.mouseYAcceleration);
            if (setup.mouseYInvert) lookAdd=-lookAdd;
            if (Math.abs(lookAdd)>this.MAX_LOOK_SPEED) lookAdd=this.MAX_LOOK_SPEED*Math.sign(lookAdd);
            
            if (lookAdd!==0) {
                this.angle.x+=lookAdd;
                if (this.angle.x<-this.MAX_LOOK_ANGLE) this.angle.x=-this.MAX_LOOK_ANGLE;
                if (this.angle.x>=this.MAX_LOOK_ANGLE) this.angle.x=this.MAX_LOOK_ANGLE;
            }
        }

        this.movement.z=Math.trunc(((moveForward?this.MOVE_SPEED:0)+(moveBackward?-this.MOVE_SPEED:0))*moveFactor);
        this.movement.x=Math.trunc(((moveLeft?this.SIDE_SPEED:0)+(moveRight?-this.SIDE_SPEED:0))*moveFactor);
        this.movement.y=0;

        this.movement.rotateX(null,this.angle.x);     // if flying or swimming, add in the X rotation
        this.movement.rotateY(null,this.angle.y);

        this.position.addPoint(this.movement);
    }
    
        //
        // developer on/off
        //
    
    playerToDeveloper()
    {
        let player=this.core.map.entityList.getPlayer();
        
        this.position.setFromPoint(player.position);
        this.position.y+=player.eyeOffset;
        this.angle.setFromPoint(player.angle);
    }
    
    developerToPlayer()
    {
        let player=this.core.map.entityList.getPlayer();
        
        player.position.setFromPoint(this.position);
        player.position.y-=player.eyeOffset;
        player.angle.setFromPoint(this.angle);
    }
    
        //
        // interface output
        //
        
    clearInterfaceOutput()
    {
        this.core.interface.updateText('wsMeshCount','');
        this.core.interface.updateText('wsTrigCount','');
        this.core.interface.updateText('wsModelCount','');
        this.core.interface.updateText('wsEffectCount','');
        
        this.core.interface.updateText('wsPosition','');
        this.core.interface.updateText('wsAngle','');
        this.core.interface.updateText('wsNode','');
        this.core.interface.updateText('wsMesh','');
    }
    
    setInterfaceOutput()
    {
        let n,nodeIdx,str;
        
            // draw counts
            
        this.core.interface.updateText('wsMeshCount',('mesh:'+this.core.drawMeshCount));
        this.core.interface.updateText('wsTrigCount',('trig:'+this.core.drawTrigCount));
        this.core.interface.updateText('wsModelCount',('model:'+this.core.drawModelCount));
        this.core.interface.updateText('wsEffectCount',('effect:'+this.core.drawEffectCount));
        
            // world info
            
        this.core.interface.updateText('wsPosition',('pos:'+this.position.toDisplayString()));
        this.core.interface.updateText('wsAngle',('ang:'+this.angle.toDisplayString()));
        
        let xBound=new BoundClass((this.position.x-this.CONTACT_MESH_RADIUS),(this.position.x+this.CONTACT_MESH_RADIUS));
        let yBound=new BoundClass((this.position.y-this.CONTACT_MESH_RADIUS),(this.position.y+this.CONTACT_MESH_RADIUS));
        let zBound=new BoundClass((this.position.z-this.CONTACT_MESH_RADIUS),(this.position.z+this.CONTACT_MESH_RADIUS));
        
        nodeIdx=this.findNearestPathNode(this.NEAR_PATH_NODE_DISTANCE);
        if (nodeIdx===-1) {
            this.core.interface.updateText('wsNode','');
        }
        else {
            this.core.interface.updateText('wsNode',nodeIdx);
        }
            
        str='';

        for (n=0;n!==this.core.map.meshList.meshes.length;n++) {
            if (this.core.map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=this.core.map.meshList.meshes[n].name;
            }
        }
        
        if (str==='') {
            this.core.interface.updateText('wsMesh','');
        }
        else {
            this.core.interface.updateText('wsMesh',str);
        }
    }

        //
        // mainline
        //
        
    run()
    {
        let idx;
        let fpsStr=this.core.fps.toString();
        let input=this.core.input;
        
            // developer output
            // always do fps, only others if in developer mode
            
        idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }
        
        this.core.interface.updateText('wsFPS',fpsStr);
        if (this.on) this.setInterfaceOutput();
        
            // can run any developer mode is network game
            
        if ((this.core.isMultiplayer) && (!this.core.setup.localGame)) return;
        
            // turn on/off developer mode
            
            // if going into developer mode, put developer
            // mode position at player, and vice-versa, and
            // reset all the entities
            
        if (input.isKeyDownAndClear('PageUp')) {
            if (this.on) {
                this.on=false;
                this.developerToPlayer();
                this.clearInterfaceOutput();
                console.info('developer mode: off');
            }
            else {
                this.on=true;
                this.playerToDeveloper();
                console.info('developer mode: on');
            }
        }
        
            // if in developer mode, we can move
            // the player
            
        if (this.on) this.move();

        return;
        
            // backspace prints out position info
            
        if (input.isKeyDownAndClear('Backspace')) {
            this.positionInfo();
            return;
        }
        
        
            // delete turns on path editor
            
        if (input.isKeyDownAndClear('Delete')) {
            //this.paths=!this.paths;
            //console.info('path editor='+this.paths);
            
            if (this.paths) {
                console.info('u add key to nearest node');
                console.info('i select nearest node');
                console.info('o start path splitting');
                console.info('p adds new node to path');
                console.info('[ deleted selected node');
                console.info('] moves selected node to player');
                console.info('\\ output new path JSON');
            }
        }
        
        
        
        
            // path editing
            
        //if (this.paths) this.pathEditor();
    }
}
