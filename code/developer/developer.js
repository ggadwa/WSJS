import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import QuaternionClass from '../utility/quaternion.js';
import DeveloperSpriteClass from '../developer/developer_sprite.js';
import DeveloperRayClass from '../developer/developer_ray.js';
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
        this.MOVE_FAST_FACTOR=10.0;
        
        this.NEAR_PATH_NODE_DISTANCE=5000;
        this.CONTACT_MESH_RADIUS=100;
        
        this.SELECT_ITEM_NONE=-1;
        this.SELECT_ITEM_ENTITY=0;
        this.SELECT_ITEM_EFFECT=1;
        this.SELECT_ITEM_LIGHT=2;
        this.SELECT_ITEM_NODE=3;
        this.SELECT_ITEM_MESH=4;
        
        this.DRAW_MODE_NORMAL=0;
        this.DRAW_MODE_SHADOW=1;
        this.DRAW_MODE_COLLISION=2;
        
        this.on=false;
        this.lookDownLock=false;
        this.drawMode=this.DRAW_MODE_NORMAL;
        
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        this.fpsAngle=new PointClass(0,0,0);
        
        this.selectItemType=this.SELECT_ITEM_NONE;
        this.selectItemIndex=0;
        this.selectVector=new PointClass(0,0,0);
        
            // misc drawing class
            
        this.developerSprite=new DeveloperSpriteClass(core);
        this.developerRay=new DeveloperRayClass(core);
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.xBound=new BoundClass(0,0);
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        this.lightMinBackup=new ColorClass();
        this.lightMaxBackup=new ColorClass();
        
        Object.seal(this);
    }
    
    initialize()
    {
        this.core.interface.addText('wsFPS','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,false);
        
        this.core.interface.addText('wsPosition','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-95},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsAngle','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-72},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsMesh','',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-49},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsTarget','target:',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-26},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        this.core.interface.addText('wsSelect','select:',this.core.interface.POSITION_MODE_BOTTOM_LEFT,{"x":5,"y":-3},20,this.core.interface.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1,true);
        
        if (!this.developerSprite.initialize()) return(false);
        if (!this.developerRay.initialize()) return(false);

        return(true);
    }
    
    release()
    {
        this.developerRay.release();
        this.developerSprite.release();
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
        let nodes=this.core.game.map.path.nodes;
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
        let n,k,nodeIdx,selNodeIdx;
        let node,links,rtn;
        let rayEndPoint=this.developerRay.lookEndPoint;
        let path=this.core.game.map.path;
        let input=this.core.input;
        
            // o splits a path at two nodes,
            // hit o on each node, then o for new node
            
        if (input.isKeyDownAndClear('o')) {
            selNodeIdx=this.getSelectNode();
            if (selNodeIdx===-1) return;
            
            if (path.editorSplitStartNodeIdx===-1) {
                path.editorSplitStartNodeIdx=selNodeIdx;
                console.info('starting split at '+selNodeIdx+' > now select second node');
                return;
            }
            
            if (path.editorSplitEndNodeIdx===-1) {
                path.editorSplitEndNodeIdx=selNodeIdx;
                console.info('second node selected '+selNodeIdx+' > now add split node');
                return;
            }
            
            nodeIdx=path.nodes.length;
            path.nodes.push(new MapPathNodeClass(nodeIdx,rayEndPoint.copy(),[path.editorSplitStartNodeIdx,path.editorSplitEndNodeIdx],null,null,null));
            
            links=path.nodes[path.editorSplitStartNodeIdx].links;
            links[links.indexOf(path.editorSplitEndNodeIdx)]=selNodeIdx;
            
            links=path.nodes[path.editorSplitEndNodeIdx].links;
            links[links.indexOf(path.editorSplitStartNodeIdx)]=selNodeIdx;
            
            this.selectItemType=this.SELECT_ITEM_NODE;
            this.selectItemIndex=selNodeIdx;
            
            path.editorSplitStartNodeIdx=-1;
            path.editorSplitEndNodeIdx=-1;

            return;
        }
        
            // p key adds to path
            
        if (input.isKeyDownAndClear('p')) {
            
                // is there a close node?
                // if so connect to that
                
            if ((this.selectItemType===this.SELECT_ITEM_NODE) && (this.developerRay.targetItemType===this.SELECT_ITEM_NODE)) {
                if (this.developerRay.targetItemIndex!==this.selectItemIndex) {
                    path.nodes[this.selectItemIndex].links.push(this.developerRay.targetItemIndex);
                    path.nodes[this.developerRay.targetItemIndex].links.push(this.selectItemIndex);
                    
                    this.selectItemIndex=this.developerRay.targetItemIndex;
                    
                    console.info('Connected node '+this.developerRay.targetItemIndex);
                }
                
                return;
            }
            
                // otherwise create a new node
                // if the ray has hit something
                
            if (this.developerRay.targetItemType===this.SELECT_ITEM_NONE) return;
                
            nodeIdx=path.nodes.length;
            
            links=[];
            selNodeIdx=this.getSelectNode();
            if (selNodeIdx!==-1) {
                links.push(selNodeIdx);
                path.nodes[selNodeIdx].links.push(nodeIdx);
            }
            
            path.nodes.push(new MapPathNodeClass(nodeIdx,rayEndPoint.copy(),links,null,null,null));
            
            this.selectItemType=this.SELECT_ITEM_NODE;
            this.selectItemIndex=nodeIdx;
            
            console.info('Added node '+nodeIdx);
            return;
        }
        
            // u key adds a key to selected node
            // leave blank to delete
            
        if (input.isKeyDownAndClear('u')) {
            selNodeIdx=this.getSelectNode();
            if (selNodeIdx===-1) return;
            
            node=path.nodes[selNodeIdx];
            
            rtn=prompt('Enter the key name',((node.key===null)?'':node.key));
            if (rtn===null) return;
            
            if (rtn==='') {
                node.key=null;
                console.info('Removed key from '+selNodeIdx);
                return;
            }

            node.key=rtn;
            console.info('Added key '+node.key+' to '+selNodeIdx);
            return;
        }
        
            // \ key deletes selected node
            
        if (input.isKeyDownAndClear('\\')) {
            selNodeIdx=this.getSelectNode();
            if (selNodeIdx===-1) return;
                
                // fix any links

            for (n=0;n!=path.nodes.length;n++) {
                if (n===selNodeIdx) continue;
                node=path.nodes[n];

                k=0;
                while (k<node.links.length) {
                    if (node.links[k]===selNodeIdx) {
                        node.links.splice(k,1);
                        continue;
                    }
                    if (node.links[k]>selNodeIdx) node.links[k]=node.links[k]-1;
                    k++;
                }
            }

                // and delete the node

            path.nodes.splice(selNodeIdx,1);

            console.info('Deleted node '+selNodeIdx);

            this.selectItemType=this.SELECT_ITEM_NONE;
            
            return;
        }
        
            // i key moves selected node to ray end

        if (input.isKeyDownAndClear('i')) {
            selNodeIdx=this.getSelectNode();
            if (selNodeIdx===-1) return;
            
            path.nodes[selNodeIdx].position.setFromPoint(rayEndPoint);
            console.info('Moved node '+selNodeIdx);
           
           return;
        }
    }
    
        //
        // selection getters
        //
        
    getSelectPosition(itemType,itemIndex)
    {
        let entity;
        let position=new PointClass(0,0,0);
        let map=this.core.game.map;
        
        switch (itemType) {
            case this.SELECT_ITEM_ENTITY:
                entity=map.entityList.entities[itemIndex];
                position.setFromValues(entity.originalPosition.x,(entity.originalPosition.y-Math.trunc(entity.height*0.5)),entity.originalPosition.z);
                break;
            case this.SELECT_ITEM_EFFECT:
                position.setFromPoint(map.effectList.effects[itemIndex].position);
                break;
            case this.SELECT_ITEM_LIGHT:
                position.setFromPoint(map.lightList.lights[itemIndex].position);
                break;
            case this.SELECT_ITEM_NODE:
                position.setFromPoint(map.path.nodes[itemIndex].position);
                break;
            case this.SELECT_ITEM_MESH:
                position.setFromPoint(map.meshList.meshes[itemIndex].center);
                break;
        }
        
        return(position);
    }
    
    getSelectLastIndex(itemType)
    {
        let map=this.core.game.map;
        
        switch (itemType) {
            case this.SELECT_ITEM_ENTITY:
                return(map.entityList.entities.length);
            case this.SELECT_ITEM_EFFECT:
                return(map.effectList.effects.length);
            case this.SELECT_ITEM_LIGHT:
                return(map.lightList.lights.length);
            case this.SELECT_ITEM_NODE:
                return(map.path.nodes.length);
            case this.SELECT_ITEM_MESH:
                return(map.meshList.meshes.length);
        }
        
        return(0);
    }
    
    isSelectVisible(itemType,itemIndex)
    {
        if (itemType!==this.SELECT_ITEM_ENTITY) return(true);
        return(this.core.game.map.entityList.entities[itemIndex].mapSpawn);
    }
    
    getSelectName(itemType,itemIndex)
    {
        let key;
        let map=this.core.game.map;
        
        switch (itemType) {
            case this.SELECT_ITEM_ENTITY:
                return('[entity '+itemIndex+'] '+map.entityList.entities[itemIndex].name);
            case this.SELECT_ITEM_EFFECT:
                return('[effect '+itemIndex+'] '+map.effectList.effects[itemIndex].jsonName);
            case this.SELECT_ITEM_LIGHT:
                return('[light '+itemIndex+']');
            case this.SELECT_ITEM_NODE:
                key=map.path.nodes[itemIndex].key;
                if (key===null) key='';
                return('[node '+itemIndex+'] '+key);
            case this.SELECT_ITEM_MESH:
                return('[mesh '+map.meshList.meshes[itemIndex].name+']');
        }
        
        return('');
    }
    
    getSelectNode()
    {
        if (this.selectItemType===this.SELECT_ITEM_NODE) return(this.selectItemIndex);
        return(-1);
    }
    
        //
        // developer movement
        //
        
    fpsMove()
    {
        let moveForward,moveBackward,moveLeft,moveRight,moveFactor;
        let x,y,turnAdd,lookAdd,yAdd;
        let input=this.core.input;
        let setup=this.core.setup;
        
        moveForward=(input.isKeyDown('w'));
        moveBackward=(input.isKeyDown('s'));
        moveLeft=(input.isKeyDown('a'));
        moveRight=(input.isKeyDown('d'));
        
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
        
            // up-down movement
            
        yAdd=0;
        
        if (input.isKeyDown('q')) yAdd=-(this.MOVE_SPEED*moveFactor);
        if (input.isKeyDown('e')) yAdd=this.MOVE_SPEED*moveFactor;
        
            // movement

        this.movement.z=Math.trunc(((moveForward?this.MOVE_SPEED:0)+(moveBackward?-this.MOVE_SPEED:0))*moveFactor);
        this.movement.x=Math.trunc(((moveLeft?this.SIDE_SPEED:0)+(moveRight?-this.SIDE_SPEED:0))*moveFactor);
        this.movement.y=0;
        
        this.movement.rotateX(null,this.angle.x);
        this.movement.rotateY(null,this.angle.y);
        
        this.movement.y+=yAdd;

        this.position.addPoint(this.movement);
    }
    
    lookDownMove()
    {
        let movePosZ,moveNegZ,moveNegX,movePosX;
        let moveFactor,yAdd;
        let input=this.core.input;
        
        movePosZ=(input.isKeyDown('w'));
        moveNegZ=(input.isKeyDown('s'));
        movePosX=(input.isKeyDown('a'));
        moveNegX=(input.isKeyDown('d'));
        
        moveFactor=input.isKeyDown('Shift')?this.MOVE_FAST_FACTOR:1.0;
        
            // up-down keys
            
        yAdd=0;
        
        if (input.isKeyDown('q')) yAdd=-(this.MOVE_SPEED*moveFactor);
        if (input.isKeyDown('e')) yAdd=this.MOVE_SPEED*moveFactor;
        
            // movement

        this.movement.z=Math.trunc(((movePosZ?this.MOVE_SPEED:0)+(moveNegZ?-this.MOVE_SPEED:0))*moveFactor);
        this.movement.x=Math.trunc(((movePosX?this.SIDE_SPEED:0)+(moveNegX?-this.SIDE_SPEED:0))*moveFactor);
        this.movement.y=yAdd;

        this.position.addPoint(this.movement);
    }
    
    moveSwitch()
    {
        let input=this.core.input;
        
        if (input.isKeyDownAndClear('home')) {
            this.fpsAngle.setFromPoint(this.angle);
            this.angle.setFromValues(89,0,0);
            this.lookDownLock=true;
            return;
        }
        
        if (input.isKeyDownAndClear('delete')) {
            this.angle.setFromPoint(this.fpsAngle);
            this.lookDownLock=false;
            return;
        }        
    }
    
    select()
    {
        let prev,next;
        let input=this.core.input;
        
            // click to select
            
        if (input.mouseButtonFlags[0]) {
            if (this.developerRay.targetItemType!==this.SELECT_ITEM_NONE) {
                this.selectItemType=this.developerRay.targetItemType;
                this.selectItemIndex=this.developerRay.targetItemIndex;
                this.core.interface.updateText('wsSelect',('select:'+this.getSelectName(this.selectItemType,this.selectItemIndex)));
            }
        }
        
            // [ and ] to change selection
            
        prev=input.isKeyDownAndClear('[');
        next=input.isKeyDownAndClear(']');
        
        if ((this.selectItemType!==this.SELECT_ITEM_NONE) && (prev||next)) {
            this.selectVector.setFromSubPoint(this.position,this.getSelectPosition(this.selectItemType,this.selectItemIndex));

            if (prev) {
                while (true) {
                    this.selectItemIndex--;
                    if (this.selectItemIndex<0) this.selectItemIndex=this.getSelectLastIndex(this.selectItemType)-1;
                    if (this.isSelectVisible(this.selectItemType,this.selectItemIndex)) break;
                }
            }
            if (next) {
                while (true) {
                    this.selectItemIndex++;
                    if (this.selectItemIndex>=this.getSelectLastIndex(this.selectItemType)) this.selectItemIndex=0;
                    if (this.isSelectVisible(this.selectItemType,this.selectItemIndex)) break;
                }
            }

            this.position.setFromAddPoint(this.getSelectPosition(this.selectItemType,this.selectItemIndex),this.selectVector);
            this.core.interface.updateText('wsSelect',('select:'+this.getSelectName(this.selectItemType,this.selectItemIndex)));
        }
        
            // push selected node to path editor
            
        if (this.selectItemType===this.SELECT_ITEM_NODE) {
            this.core.game.map.path.editorParentNodeIdx=this.selectItemIndex;
        }
    }
    
        //
        // developer on/off
        //
    
    playerToDeveloper()
    {
        let player=this.core.game.map.entityList.getPlayer();
        
        this.position.setFromPoint(player.position);
        this.position.y+=player.eyeOffset;
        this.angle.setFromPoint(player.angle);
    }
    
    developerToPlayer()
    {
        let player=this.core.game.map.entityList.getPlayer();
        
            // reset position to camera
            
        player.position.setFromPoint(this.position);
        player.position.y-=player.eyeOffset;
        if (this.lookDownLock) {
            player.angle.setFromPoint(this.fpsAngle);
        }
        else {
            player.angle.setFromPoint(this.angle);
        }
        
            // always max the player heath
            
        if (player.health!==undefined) player.health=player.healthMaxCount;
        if (player.armor!==undefined) player.armor=player.armorMaxCount;
    }
    
        //
        // interface output
        //
        
    clearInterfaceOutput()
    {
        this.core.interface.updateText('wsPosition','');
        this.core.interface.updateText('wsAngle','');
        this.core.interface.updateText('wsMesh','');
        this.core.interface.updateText('wsTarget','target:');
        this.core.interface.updateText('wsSelect','select:');
    }
    
    setInterfaceOutput()
    {
        let n,str;
        let map=this.core.game.map;
        
            // world info
            
        this.core.interface.updateText('wsPosition',('pos:'+this.position.toDisplayString()));
        this.core.interface.updateText('wsAngle',('ang:'+this.angle.toDisplayString()));
        
        let xBound=new BoundClass((this.position.x-this.CONTACT_MESH_RADIUS),(this.position.x+this.CONTACT_MESH_RADIUS));
        let yBound=new BoundClass((this.position.y-this.CONTACT_MESH_RADIUS),(this.position.y+this.CONTACT_MESH_RADIUS));
        let zBound=new BoundClass((this.position.z-this.CONTACT_MESH_RADIUS),(this.position.z+this.CONTACT_MESH_RADIUS));
        
        str='';

        for (n=0;n!==map.meshList.meshes.length;n++) {
            if (map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=map.meshList.meshes[n].name;
            }
        }
        
        if (str==='') {
            this.core.interface.updateText('wsMesh','mesh:');
        }
        else {
            this.core.interface.updateText('wsMesh',('mesh:'+str));
        }
    }
    
        //
        // enter/exit developer mode
        //
        
    developerModeEnter()
    {
        this.on=true;
        
            // attach developer camera to play location
            
        this.playerToDeveloper();
        
        this.lookDownLock=false;
        
            // highlight the map
            
        this.lightMinBackup.setFromColor(this.core.game.map.lightList.lightMin);
        this.lightMaxBackup.setFromColor(this.core.game.map.lightList.lightMax);
        
        this.core.game.map.lightList.lightMin.setFromValues(1,1,1);
        this.core.game.map.lightList.lightMax.setFromValues(1,1,1);
        
            // suspect sound
            
        this.core.soundList.suspend();
        
        console.info('developer mode: on');
    }
    
    developerModeExit()
    {
        this.on=false;
        
            // reset the player to camera location
            // and clear input
            
        this.developerToPlayer();
        this.clearInterfaceOutput();
        
            // turn off highlight
            
        this.core.game.map.lightList.lightMin.setFromColor(this.lightMinBackup);
        this.core.game.map.lightList.lightMax.setFromColor(this.lightMaxBackup);
        
            // resume sound
            
        this.core.soundList.resume();
        
        console.info('developer mode: off');
    }
    
        //
        // selections
        //
        
    isEntitySelected(idx)
    {
        return((this.selectItemType===this.SELECT_ITEM_ENTITY) && (this.selectItemIndex===idx));
    }
        
    isEffectSelected(idx)
    {
        return((this.selectItemType===this.SELECT_ITEM_EFFECT) && (this.selectItemIndex===idx));
    }
        
    isLightSelected(idx)
    {
        return((this.selectItemType===this.SELECT_ITEM_LIGHT) && (this.selectItemIndex===idx));
    }
    
    getSelectedNodeIndex()
    {
        if (this.selectItemType!==this.SELECT_ITEM_NODE) return(-1);
        return(this.selectItemIndex);
    }

        //
        // mainline
        //
        
    run()
    {
        let idx;
        let fpsStr=this.core.game.fps.toString();
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
                this.developerModeExit();
            }
            else {
                this.developerModeEnter();
            }
        }
        
            // exit if not in developer mode
            
        if (!this.on) return;
        
            // move and select
            
        this.moveSwitch();
        if (!this.lookDownLock) {
            this.fpsMove();
        }
        else {
            this.lookDownMove();
        }
        this.select();
        this.pathEditor();
        
            // draw modes
            
        if (input.isKeyDownAndClear('PageDown')) {
            if (this.drawMode===this.DRAW_MODE_NORMAL) {
                this.drawMode=(this.core.game.map.hasShadowmap)?this.DRAW_MODE_SHADOW:this.DRAW_MODE_COLLISION;
            }
            else {
                this.drawMode=(this.drawMode===this.DRAW_MODE_SHADOW)?this.DRAW_MODE_COLLISION:this.DRAW_MODE_NORMAL;
            }
        }
        
            // run the targetting
            
        this.developerRay.run(this.position,this.angle);

    }
}
