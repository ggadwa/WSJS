import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import MapPathNodeClass from '../map/map_path_node.js';

export default class EntityUtilityClass
{
    constructor(core,entity)
    {
        this.core=core;
        this.entity=entity;
        
            // flags
            
        this.lastUnderLiquid=false;
        this.lastInLiquid=false;
        
        this.debugPlayerFly=false;
        this.debugPlayerNoClip=false;
        this.debugPaths=false;
        this.debugEntityBounds=false;
        this.debugSkeletons=false;
        this.debugCollisionSurfaces=false;
        this.debugNoDamage=false;
        
            // pre-allocates
        
        this.rotMovement=new PointClass(0,0,0);    
        this.firePoint=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }
    
    calculateValue(value)
    {
        return(this.core.game.calculateValue(value,this.entity.variables,this.entity.data,this.entity.currentMessageContent));
    }
    
        //
        // control fps
        //
        
    controlFPS(action)
    {
        let x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquidIdx,bump;
        let turnAdd=0;
        let lookAdd=0;
        let entity=this.entity;
        let input=this.core.input;
        let setup=this.core.setup;
        let maxTurnSpeed,maxLookSpeed,maxLookAngle;
        let forwardAcceleration=this.calculateValue(action.forwardAcceleration);
        let forwardDeceleration=this.calculateValue(action.forwardDeceleration);
        let forwardMaxSpeed=this.calculateValue(action.forwardMaxSpeed);
        let sideAcceleration=this.calculateValue(action.sideAcceleration);
        let sideDeceleration=this.calculateValue(action.sideDeceleration);
        let sideMaxSpeed=this.calculateValue(action.sideMaxSpeed);
        
            // forward and shift controls
            
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('ArrowUp')) || (input.getTouchStickLeftY()<0);
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('ArrowDown')) || (input.getTouchStickLeftY()>0);
        moveLeft=input.isKeyDown('a') || (input.getTouchStickLeftX()<0);
        moveRight=input.isKeyDown('d') || (input.getTouchStickLeftX()>0);
        
            // turning
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            
            maxTurnSpeed=this.calculateValue(action.maxTurnSpeed);
            if (Math.abs(turnAdd)>maxTurnSpeed) turnAdd=maxTurnSpeed*Math.sign(turnAdd);
        }
        
        turnAdd-=(input.getTouchStickRightX()*(setup.touchStickXSensitivity*20));
        
        if (turnAdd!==0) {
            entity.angle.y+=turnAdd;
            if (entity.angle.y<0.0) entity.angle.y+=360.0;
            if (entity.angle.y>=360.00) entity.angle.y-=360.0;
        }
        
            // looking
            
        if (this.core.camera.isFirstPerson()) {
            y=input.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                
                maxLookSpeed=this.calculateValue(action.maxLookSpeed);
                if (Math.abs(lookAdd)>maxLookSpeed) lookAdd=maxLookSpeed*Math.sign(lookAdd);
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
                
                maxLookAngle=this.calculateValue(action.maxLookAngle);
                if (entity.angle.x<-maxLookAngle) entity.angle.x=-maxLookAngle;
                if (entity.angle.x>=maxLookAngle) entity.angle.x=maxLookAngle;
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
                this.movement.y-=this.JUMP_WATER_HEIGHT;
            }
            
            this.lastUnderLiquid=false;
        }
        
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(entity.position);
        
        if (liquidIdx!==-1) {
            if (!this.lastInLiquid) this.playSound('splash',1.0,false);
            this.lastInLiquid=true;
        }
        else {
            if (this.lastInLiquid) this.playSound('splash',0.8,false);
            this.lastInLiquid=false;
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up, the only exception is
            // swimming, which always bumps over small obstacles
            
        bump=(entity.standOnMeshIdx!==-1)||(this.lastUnderLiquid);
        
            // figure out the movement
         
        entity.movement.moveZWithAcceleration(moveForward,moveBackward,forwardAcceleration,forwardDeceleration,forwardMaxSpeed,forwardAcceleration,forwardDeceleration,forwardMaxSpeed);
        entity.movement.moveXWithAcceleration(moveLeft,moveRight,sideAcceleration,sideDeceleration,sideMaxSpeed,sideAcceleration,sideDeceleration,sideMaxSpeed);
        
        this.rotMovement.setFromPoint(entity.movement);
        if ((this.debugPlayerFly) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,entity.angle.x);     // if flying or swimming, add in the X rotation
            this.rotMovement.y*=this.calculateValue(action.flySwimYReduce);
        }
        this.rotMovement.rotateY(null,entity.angle.y);

            // if no clipping is on then
            // just move directly through map
            
        if (this.debugPlayerNoClip) {
            entity.position.addPoint(this.rotMovement);
        }

            // move around the map
        
        else {
            entity.movement.y=entity.moveInMapY(this.rotMovement,this.debugPlayerFly);
            entity.moveInMapXZ(this.rotMovement,bump,true);
        }
    }
    
        //
        // vehicle control
        //
        
    controlVehicle(action)
    {
    }
    
        //
        // weapon control
        //
        
    controlWeapon(action)
    {
        
    }
    
        //
        // developer tools
        //
        
    positionInfo()
    {
        let n,nodeIdx,str;
        let entity=this.entity;
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
    
    pathEditor()
    {
        let n,k,nodeIdx;
        let node,links,str;
        let entity=this.entity;
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
    
    controlDeveloper()
    {
        let input=this.core.input;
        
            // backspace prints out position info
            
        if (input.isKeyDownAndClear('Backspace')) {
            this.positionInfo();
            return;
        }
        
            // - for no clip
            
        if (input.isKeyDownAndClear('-')) {
            this.debugPlayerNoClip=!this.debugPlayerNoClip;
            console.info('player no clip='+this.debugPlayerNoClip);
        }
        
            // = for fly
        
        if (input.isKeyDownAndClear('=')) {
            this.debugPlayerFly=!this.debugPlayerFly;
            console.info('player fly='+this.debugPlayerFly);
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
            this.debugNoDamage=!this.debugNoDamage;
            console.info('no damage='+this.debugNoDamage);
        }
        
            // path editing
            
        if (this.core.debugPaths) this.pathEditor();
    }

        //
        // weapon type utilities
        //
        
    hitScan(fromEntity,maxDistance,hitFilter,damage,hitEffectName)
    {
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
            
        this.firePoint.setFromPoint(fromEntity.position);
        this.firePoint.y+=fromEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,maxDistance);
        this.fireVector.rotateX(null,fromEntity.angle.x);
        this.fireVector.rotateY(null,fromEntity.angle.y);
        
        if (fromEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint,hitFilter,null)) {
            
                // is this an entity we can hit?
                
            if (fromEntity.hitEntity) {
                if (fromEntity.hitEntity.damage!==undefined) {
                    fromEntity.hitEntity.damage(fromEntity,damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (hitEffectName!==null) {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.core.map.effectList.add(hitEffectName,this.fireHitPoint,null,true);
            }
        }

    }
}
