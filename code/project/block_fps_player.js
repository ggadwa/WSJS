import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';
import MapPathNodeClass from '../map/map_path_node.js';

export default class BlockFPSPlayerClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.idleAnimation=null;
        this.runAnimation=null;
        
        this.inStandingAnimation=true;
        
        this.maxTurnSpeed=0;
        this.maxLookSpeed=0;
        this.maxLookAngle=0;
        this.orwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.jumpHeight=0;
        this.jumpWaterHeight=0;
        this.splashSound=null;
        this.flySwimYReduce=0;
        
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.lastWheelClick=0;
        
        this.carouselWeapons=[];        // weapons in the carousel
        this.extraWeapons=[];           // any other weapon
        
        this.currentCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
        
        this.forceAnimationUpdate=false;
        this.currentIdleAnimation=null;
        this.currentRunAnimation=null;
        
            // some developer flags
              
        this.developer=false;
        this.developerPlayerFly=false;
        this.developerPlayerNoClip=false;
        this.developerPlayerNoDamage=false;
        
            // pre-allocates
            
        this.rotMovement=new PointClass(0,0,0);
    }
        
    initialize(entity)
    {
        let n,weaponBlock,weaponEntity;
        
        this.idleAnimation=this.block.idleAnimation;
        this.runAnimation=this.block.runAnimation;
        
        this.maxTurnSpeed=this.core.game.lookupValue(this.block.maxTurnSpeed,entity.data);
        this.maxLookSpeed=this.core.game.lookupValue(this.block.maxLookSpeed,entity.data);
        this.maxLookAngle=this.core.game.lookupValue(this.block.maxLookAngle,entity.data);
        this.forwardAcceleration=this.core.game.lookupValue(this.block.forwardAcceleration,entity.data);
        this.forwardDeceleration=this.core.game.lookupValue(this.block.forwardDeceleration,entity.data);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.block.forwardMaxSpeed,entity.data);
        this.sideAcceleration=this.core.game.lookupValue(this.block.sideAcceleration,entity.data);
        this.sideDeceleration=this.core.game.lookupValue(this.block.sideDeceleration,entity.data);
        this.sideMaxSpeed=this.core.game.lookupValue(this.block.sideMaxSpeed,entity.data);
        this.jumpHeight=this.core.game.lookupValue(this.block.jumpHeight,entity.data);
        this.jumpWaterHeight=this.core.game.lookupValue(this.block.jumpWaterHeight,entity.data);
        this.liquidInSound=this.block.liquidInSound;
        this.liquidOutSound=this.block.liquidOutSound;
        this.flySwimYReduce=this.core.game.lookupValue(this.block.flySwimYReduce,entity.data);
        
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.lastWheelClick=0;

            // setup the weapons
        
        this.defaultCarouselWeaponIdx=-1;
        
        for (n=0;n!==this.block.weapons.length;n++) {
            weaponBlock=this.block.weapons[n];
            
                // add the weapon in the correct array
                
            if (weaponBlock.inCarousel) {
                weaponEntity=this.addEntity(entity,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.carouselWeapons.push(weaponEntity);
                if ((weaponBlock.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                weaponEntity=this.addEntity(entity,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.extraWeapons.push(weaponEntity);
            }
            
                // push the parent animations to the weapons
                // so we can pick them up later
                
            weaponEntity.parentIdleAnimation=weaponBlock.parentIdleAnimation;
            weaponEntity.parentRunAnimation=weaponBlock.parentRunAnimation;
            weaponEntity.parentFireIdleAnimation=weaponBlock.parentFireIdleAnimation;
            weaponEntity.parentFireRunAnimation=weaponBlock.parentFireRunAnimation;
        }
        
            // developer mode adds some interface elements
            
        this.developer=this.block.developer;
        
        if (this.developer) {
            this.core.interface.addText('fps','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('meshCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":46},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('trigCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":69},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('modelCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":92},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('effectCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":115},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        }
        
        return(true);
    }
    
    release(entity)
    {
        let n;
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].release();
        }
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].release();
        }
    }
    
    showCarouselWeapon(entity)
    {
        let n,weaponEntity,meshName;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            weaponEntity=this.carouselWeapons[n];
            
            if (n===this.currentCarouselWeaponIdx) {
                weaponEntity.show=true;
                
                this.forceAnimationUpdate=true;
                this.currentIdleAnimation=weaponEntity.parentIdleAnimation;
                this.currentRunAnimation=weaponEntity.parentRunAnimation;
                
                for (meshName of this.block.weapons[n].meshes) {
                    entity.modelEntityAlter.show(meshName,true);
                }
            }
            else {
                weaponEntity.show=false;
                
                for (meshName of this.block.weapons[n].meshes) {
                    entity.modelEntityAlter.show(meshName,false);
                }
            }
        }
    }
    
    setCurrentAnimation(entity)
    {
        if ((entity.movement.x!==0) || (entity.movement.z!==0)) {
            if ((this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.currentRunAnimation[0],this.currentRunAnimation[1]);
            }
            this.inStandingAnimation=false;
        }
        else {
            if ((!this.inStandingAnimation) || (this.forceAnimationUpdate)) {
                entity.modelEntityAlter.startAnimationChunkInFrames(null,30,this.currentIdleAnimation[0],this.currentIdleAnimation[1]);
            }
            this.inStandingAnimation=true;
        }
        
        this.forceAnimationUpdate=false;        
    }
    
    ready(entity)
    {
        let n;
        
            // some animation defaults
            
        this.currentIdleAnimation=this.idleAnimation;
        this.currentRunAnimation=this.runAnimation;
        
            // ready all the weapons
            
        this.currentCarouselWeaponIdx=this.defaultCarouselWeaponIdx;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].ready();
        }
        
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].ready();
        }
        
        this.showCarouselWeapon(entity);

            // start with the idle animation
            
        this.inStandingAnimation=true;
        this.setCurrentAnimation(entity);
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
    
    developerRun(entity)
    {
        let idx;
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
            entity.developerPlayerNoClip=!entity.developerPlayerNoClip;
            console.info('player no clip='+entity.developerPlayerNoClip);
        }
        
            // = for fly
        
        if (input.isKeyDownAndClear('=')) {
            entity.developerPlayerFly=!entity.developerPlayerFly;
            console.info('player fly='+entity.developerPlayerFly);
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
            entity.developerPlayerNoDamage=!entity.developerPlayerNoDamage;
            console.info('no damage='+entity.developerPlayerNoDamage);
        }
        
            // path editing
            
        if (this.core.debugPaths) this.pathEditor(entity);
    }
    
    run(entity)
    {
        let n,x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquidIdx,bump;
        let turnAdd,lookAdd;
        let mouseWheelClick;
        let input=this.core.input;
        let setup=this.core.setup;
        
            // weapon switching
            
        mouseWheelClick=this.core.input.mouseWheelRead();
        
        if ((mouseWheelClick<0) && (this.lastWheelClick===0)) {
            if (this.currentCarouselWeaponIdx>0) {
                this.currentCarouselWeaponIdx--;
                this.showCarouselWeapon(entity);
            }
            entity.weaponPrevious=false;
        }

        if ((mouseWheelClick>0) && (this.lastWheelClick===0)) {
            if (this.currentCarouselWeaponIdx<(this.carouselWeapons.length-1)) {
                this.currentCarouselWeaponIdx++;
                this.showCarouselWeapon(entity);
            }
            entity.weaponNext=false;
        }
        
        for (n=0;n<this.carouselWeapons.length;n++) {
            if (this.core.input.isKeyDown(String.fromCharCode(49+n))) {
                this.currentCarouselWeaponIdx=n;
                this.showCarouselWeapon(entity);
            }
        }
        
        this.lastWheelClick=mouseWheelClick;
        
            // weapon firing
            
        entity.firePrimary=this.core.input.mouseButtonFlags[0]||this.core.input.isTouchStickRightClick();    
        entity.fireSecondary=this.core.input.mouseButtonFlags[1];
        entity.fireTertiary=this.core.input.mouseButtonFlags[2];
        
            // forward and shift controls
            
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('ArrowUp')) || (input.getTouchStickLeftY()<0);
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('ArrowDown')) || (input.getTouchStickLeftY()>0);
        moveLeft=input.isKeyDown('a') || (input.getTouchStickLeftX()<0);
        moveRight=input.isKeyDown('d') || (input.getTouchStickLeftX()>0);
        
            // turning
            
        turnAdd=0;
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.maxTurnSpeed) turnAdd=this.maxTurnSpeed*Math.sign(turnAdd);
        }
        
        turnAdd-=(input.getTouchStickRightX()*(setup.touchStickXSensitivity*20));
        
        if (turnAdd!==0) {
            entity.angle.y+=turnAdd;
            if (entity.angle.y<0.0) entity.angle.y+=360.0;
            if (entity.angle.y>=360.00) entity.angle.y-=360.0;
        }
        
            // looking
            
        lookAdd=0;
            
        if (this.core.camera.isFirstPerson()) {
            y=input.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.maxLookSpeed) lookAdd=this.maxLookSpeed*Math.sign(lookAdd);
            }

            lookAdd+=(input.getTouchStickRightY()*(setup.touchStickYSensitivity*20));

            if ((setup.snapLook) && (moveForward || moveBackward || moveLeft || moveRight)) {
                if (lookAdd===0) {
                    entity.angle.x=entity.angle.x*0.95;
                    if (Math.abs(entity.angle.x)<0.05) entity.angle.x=0;
                }
            }
        
            if (lookAdd!==0) {
                entity.angle.x+=lookAdd;
                if (entity.angle.x<-this.maxLookAngle) entity.angle.x=-this.maxLookAngle;
                if (entity.angle.x>=this.maxLookAngle) entity.angle.x=this.maxLookAngle;
            }
        }
        else {
            entity.angle.x=0;
        }
        
            // liquid changes
            
        liquidIdx=this.core.map.liquidList.getLiquidForEyePoint(entity.position,entity.eyeOffset);
        
        if (liquidIdx!==-1) {
            this.lastUnderLiquid=true;
        }
        else {
            if ((this.lastUnderLiquid) && (this.angle.x>0)) {
                this.gravity=0;
                this.movement.y-=this.jumpWaterHeight;
            }
            
            this.lastUnderLiquid=false;
        }
        
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(entity.position);
        
        if (liquidIdx!==-1) {
            if ((!this.lastInLiquid) && (this.liquidInSound!==null)) this.core.soundList.playJson(entity,null,this.liquidInSound);
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.liquidOutSound!==null)) this.core.soundList.playJson(entity,null,this.liquidOutSound);
            this.lastInLiquid=false;
        }
        
            // jumping
           
        if (input.isKeyDown(' ')) {
            if ((entity.standOnMeshIdx!==-1) && (liquidIdx===-1) && (!entity.developerPlayerFly)) {
                entity.gravity=this.core.map.gravityMinValue;
                entity.movement.y=this.jumpHeight;
            }
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up, the only exception is
            // swimming, which always bumps over small obstacles
            
        bump=(entity.standOnMeshIdx!==-1)||(this.lastUnderLiquid);
        
            // figure out the movement
         
        entity.movement.moveZWithAcceleration(moveForward,moveBackward,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed);
        entity.movement.moveXWithAcceleration(moveLeft,moveRight,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(entity.movement);
        if ((entity.developerPlayerFly) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,entity.angle.x);     // if flying or swimming, add in the X rotation
            this.rotMovement.y*=this.flySwimYReduce;
        }
        this.rotMovement.rotateY(null,entity.angle.y);

            // if no clipping is on then
            // just move directly through map
            
        if (entity.developerPlayerNoClip) {
            entity.position.addPoint(this.rotMovement);
        }

            // move around the map
        
        else {
            entity.movement.y=entity.moveInMapY(this.rotMovement,entity.developerPlayerFly);
            entity.moveInMapXZ(this.rotMovement,bump,true);
        }

            // camera swap button
            
        if (this.block.multiCamera) {
            if (this.core.input.isKeyDownAndClear('`')) {
                if (this.core.camera.isFirstPerson()) {
                    this.core.camera.gotoThirdPersonBehind(10000,-10);
                }
                else {
                    this.core.camera.gotoFirstPerson();
                }
            }
        }
        
            // developer
            
        if (this.developer) this.developerRun(entity);
        
            // current animation
            
        this.setCurrentAnimation(entity);
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        entity.modelEntityAlter.angle.setFromValues(0,entity.angle.y+180,0);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(this.core.camera.isThirdPersonBehind());
    }
}

