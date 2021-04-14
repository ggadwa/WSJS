import PointClass from '../utility/point.js';
import EntityClass from '../game/entity.js';
import EntityFPSPlayerClass from '../entity/entity_fps_player.js';
import EntityFPSMonsterClass from '../entity/entity_fps_monster.js';

export default class EntityFPSBotClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.health=0;
        this.healthInitialCount=0;
        this.healthMaxCount=0;
        
        this.armor=0;
        this.armorInitialCount=0;
        this.armorMaxCount=0;
        
        this.inStandingAnimation=true;
        
        this.maxTurnSpeed=0;
        this.forwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.backwardAcceleration=0;
        this.backwardDeceleration=0;
        this.backwardMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.swimAcceleration=0;
        this.swimDeceleration=0;
        this.swimMaxSpeed=0;
        this.flyAcceleration=0;
        this.flyDeceleration=0;
        this.flyMaxSpeed=0;

        this.jumpHeight=0;
        this.jumpWaterHeight=0;
        this.damageFlinchWaitTick=0;
        this.fallDamageMinDistance=0;
        this.fallDamagePercentage=0;
        this.respawnWaitTick=0;
        this.movementFreezeTick=0;
        
        this.nextDamageTick=0;
        this.falling=false;
        this.fallStartY=0;
        this.lastInLiquidIdx=-1;
        this.lastUnderLiquid=false;
        
        this.lastWheelClick=0;
        
        this.pistolWeapons=null;
        this.m16Weapon=null;
        this.grenadeWeapon=null;
        
        this.currentWeapon=null;
        
        this.forceAnimationUpdate=false;
        
        this.goalNodeIdx=-1;
        this.nextNodeIdx=-1;

        this.pausedTriggerName=null;
        this.targetEntity=null;
        this.lastTargetAngleDif=360;
        this.currentTargetYScan=0;
        
        this.flying=false;
        this.stuckCount=0;

        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
        this.seekNodeDistanceSlop=0;
        this.seekNodeAngleSlop=0;
        this.targetScanYRange=0;
        this.targetForgetDistance=0;
        this.targetFireYRange=0;
        this.targetFireSlop=0;
        
            // animations
            
        this.idleAnimationPistol={"startFrame":0,"endFrame":50, "actionFrame":0,"meshes":null};
        this.runAnimationPistol={"startFrame":492,"endFrame":518,"actionFrame":0,"meshes":null};
        this.fireIdleAnimationPistol={"startFrame":364,"endFrame":401,"actionFrame":0,"meshes":null};
        this.fireRunAnimationPistol={"startFrame":523,"endFrame":549,"actionFrame":0,"meshes":null};

        this.idleAnimationM16={"startFrame":710,"endFrame":760,"actionFrame":0,"meshes":null};
        this.runAnimationM16={"startFrame":933,"endFrame":955,"actionFrame":0,"meshes":null};
        this.fireIdleAnimationM16={"startFrame":775,"endFrame":815,"actionFrame":0,"meshes":null};
        this.fireRunAnimationM16={"startFrame":865,"endFrame":887,"actionFrame":0,"meshes":null};
        
        this.dieAnimation={"startFrame":209,"endFrame":247,"actionFrame":0,"meshes":null};
        
            // sounds
            
        this.hurtSound={"name":"hurt","rate":0.5,"randomRateAdd":1.0,"distance":5000,"loopStart":0,"loopEnd":0,"loop":false};
        this.dieSound={"name":"player_die","rate":0.8,"randomRateAdd":0,"distance":30000,"loopStart":0,"loopEnd":0,"loop":false};
        
            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        
        this.stuckPoint=new PointClass(0,0,0);
        this.lookPoint=new PointClass(0,0,0);
        this.lookVector=new PointClass(0,0,0);
        this.lookHitPoint=new PointClass(0,0,0);
        
        this.firePosition=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.healthInitialCount=this.core.game.lookupValue(this.json.config.healthInitialCount,this.data,0);
        this.healthMaxCount=this.core.game.lookupValue(this.json.config.healthMaxCount,this.data,0);
        this.armorInitialCount=this.core.game.lookupValue(this.json.config.armorInitialCount,this.data,0);
        this.armorMaxCount=this.core.game.lookupValue(this.json.config.armorMaxCount,this.data,0);
        
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data,0);
        
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data,0);
        this.forwardDeceleration=this.core.game.lookupValue(this.json.config.forwardDeceleration,this.data,0);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data,0);
        this.backwardAcceleration=this.core.game.lookupValue(this.json.config.backwardAcceleration,this.data,0);
        this.backwardDeceleration=this.core.game.lookupValue(this.json.config.backwardDeceleration,this.data,0);
        this.backwardMaxSpeed=this.core.game.lookupValue(this.json.config.backwardMaxSpeed,this.data,0);
        this.sideAcceleration=this.core.game.lookupValue(this.json.config.sideAcceleration,this.data,0);
        this.sideDeceleration=this.core.game.lookupValue(this.json.config.sideDeceleration,this.data,0);
        this.sideMaxSpeed=this.core.game.lookupValue(this.json.config.sideMaxSpeed,this.data,0);
        this.swimAcceleration=this.core.game.lookupValue(this.json.config.swimAcceleration,this.data,0);
        this.swimDeceleration=this.core.game.lookupValue(this.json.config.swimDeceleration,this.data,0);
        this.swimMaxSpeed=this.core.game.lookupValue(this.json.config.swimMaxSpeed,this.data,0);
        this.flyAcceleration=this.core.game.lookupValue(this.json.config.flyAcceleration,this.data,0);
        this.flyDeceleration=this.core.game.lookupValue(this.json.config.flyDeceleration,this.data,0);
        this.flyMaxSpeed=this.core.game.lookupValue(this.json.config.flyMaxSpeed,this.data,0);

        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.jumpWaterHeight=this.core.game.lookupValue(this.json.config.jumpWaterHeight,this.data,0);
        this.damageFlinchWaitTick=this.core.game.lookupValue(this.json.config.damageFlinchWaitTick,this.data,0);
        this.fallDamageMinDistance=this.core.game.lookupValue(this.json.config.fallDamageMinDistance,this.data,0);
        this.fallDamagePercentage=this.core.game.lookupValue(this.json.config.fallDamagePercentage,this.data,0);
        this.respawnWaitTick=this.core.game.lookupValue(this.json.config.respawnWaitTick,this.data,0);
        
        this.seekNodeDistanceSlop=this.core.game.lookupValue(this.json.config.seekNodeDistanceSlop,this.data,0);
        this.seekNodeAngleSlop=this.core.game.lookupValue(this.json.config.seekNodeAngleSlop,this.data,0);
        this.targetScanYRange=this.core.game.lookupValue(this.json.config.targetScanYRange,this.data,0);
        this.targetForgetDistance=this.core.game.lookupValue(this.json.config.targetForgetDistance,this.data,0);
        this.targetFireYRange=this.core.game.lookupValue(this.json.config.targetFireYRange,this.data,0);
        this.targetFireSlop=this.core.game.lookupValue(this.json.config.targetFireSlop,this.data,0);
        
        this.flying=false;
        
        this.nextDamageTick=0;
        this.lastInLiquidIdx=-1;
        this.lastUnderLiquid=false;
        
            // setup the weapons
        
        this.pistolWeapon=this.addEntity('weapon_pistole','pistol',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        this.m16Weapon=this.addEntity('weapon_m16','m16',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        this.grenadeWeapon=this.addEntity('weapon_grenade','grenade',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
        
        return(true);
    }
    
    release()
    {
        super.release();
        
        this.pistolWeapon.release();
        this.m16Weapon.release();
        this.grenadeWeapon.release();
    }
    
    ready()
    {
        super.ready();
        
            // full health
            
        this.health=this.healthInitialCount;
        this.armor=this.armorInitialCount;
        this.stuckCount=0;
        this.passThrough=false;         // reset if this is being called after bot died
        
        this.falling=false;
        this.fallStartY=0;
        
        this.respawnTick=0;
        this.telefragTriggerEntity=null;
        
        this.movementFreezeTick=0;
        
            // weapons
            
        this.pistolWeapon.available=true;
        this.m16Weapon.available=false;
        this.grenadeWeapon.available=true;

        this.currentWeapon=this.pistolWeapon;
        
        this.adjustMeshesForCurrentWeapon();
        
            // start scanning in middle
            
        this.currentTargetYScan=Math.trunc(this.targetScanYRange*0.5);
        
            // move to random spawn node
            
        if (this.core.game.map.path.spawnNodes.length!==0) this.moveToRandomSpawnNode(false);

            // get seek node
            
        if (this.core.game.map.path.keyNodes.length!==0) {
            this.goalNodeIdx=this.getRandomKeyNodeIndex();      // path to some random key node
            this.nextNodeIdx=this.nextNodeInPath(this.findNearestPathNode(-1),this.goalNodeIdx);    // we always spawn on a node, so next node is node in path to goal node
        }
        else {
            this.nextNodeIdx=-1;
        }
        
        this.pausedTriggerName=null;
        this.targetEntity=null;
        this.lastTargetAngleDif=360;
        
            // the draw angle is used to face a
            // different way then we are walking
            
        this.drawAngle.setFromPoint(this.angle);
        
            // turn the bot directly towards the node
            // they are heading to when starting
            
        if (this.nextNodeIdx!==-1) this.turnYTowardsNode(this.nextNodeIdx,360);

            // start animation
            
        this.startAnimation(this.runAnimationPistol);
    }
    
        //
        // health
        //
        
    die(fromEntity,isTelefrag)
    {
        this.respawnTick=this.core.game.timestamp+this.respawnWaitTick;
        this.passThrough=true;
        
        this.playSound(this.dieSound);
        this.startAnimation(this.dieAnimation);
        this.queueAnimationStop();

        this.multiplayerAddScore(fromEntity,this,isTelefrag);
    }
    
    damage(fromEntity,damage,hitPoint)
    {
        if (this.health<=0) return;
        
        this.armor-=damage;
        if (this.armor<0) {
            this.health+=this.armor;
            this.armor=0;
        }

        if (this.health<=0) {
            this.die(fromEntity,false);
            return;
        }
        
        if ((fromEntity!==null) && (fromEntity!==this)) this.targetEntity=fromEntity;
    }
    
    telefrag(fromEntity)
    {
        this.telefragTriggerEntity=fromEntity;
    }
    
        //
        // weapons, health, armor updates
        //
        
    addM16Weapon()
    {
        this.m16Weapon.available=true;
    }
    
    addPistolClip(count)
    {
        this.pistolWeapon.addClip(count);
    }
    
    addM16Clip(count)
    {
        this.m16Weapon.addClip(count);
    }
    
    addGrenadeAmmo(count)
    {
        this.grenadeWeapon.addAmmo(count);
    }
    
    addHealth(count)
    {
        this.health+=count;
        if (this.health>this.healthMaxCount) this.health=this.healthMaxCount;
    }
    
    addArmor(count)
    {
        this.armor+=count;
        if (this.armor>this.armorMaxCount) this.armor=this.armorMaxCount;
    }
    
        //
        // determine if we are at a node that is a pause node.  This is not
        // built in but we specify data that says at this node wait for a certain
        // trigger before going on to another node
        //
    
    isNodeATriggerPauseNode(nodeIdx,nextNodeIdx)
    {
        let n,data;
        
        data=this.getNodeData(nodeIdx);
        if (data===null) return(null);
        
        for (n=0;n!=data.length;n++) {
            if (data[n].link===nextNodeIdx) return(data[n].trigger);
        }
        
        return(null); 
    }
    
        //
        // fighting
        //
        
    pickBestWeapon()
    {
        let weapon;
        
            // find best weapon
            
        weapon=this.pistolWeapon;
        if ((this.m16Weapon.available) && (this.m16Weapon.ammoInClipCount!==0)) weapon=this.m16Weapon;

        if (this.currentWeapon===weapon) return;
        
            // switch weapon
            
        this.currentWeapon=weapon;
        this.adjustMeshesForCurrentWeapon();
    }

    findEntityToFight()
    {
            // special check for no ammo
            // if so, don't fight
        
        if (this.currentWeapon.ammoInClip===0) {
            this.targetEntity=null;
            return;
        }
        
            // already fighting?
            // if so, see if we are past the forget
            // distance or the target has no health
            
        if (this.targetEntity!=null) {
            if (this.targetEntity.health<=0) {
                this.targetEntity=null;
                return;
            }
            if (this.position.distance(this.targetEntity.position)>this.targetForgetDistance) {
                this.targetEntity=null;
                return;
            }
            
            return;
        }
        
            // ray trace for entities
            // we do one look angle per tick
            
        this.lookPoint.setFromPoint(this.position);
        this.lookPoint.y+=Math.trunc(this.height*0.5);      // use middle instead of eye position in case other stuff is smaller
        
        this.lookVector.setFromValues(0,0,this.targetForgetDistance);
        this.lookVector.rotateY(null,(this.angle.y+(this.currentTargetYScan-Math.trunc(this.targetScanYRange*0.5))));
        
        this.currentTargetYScan++;
        if (this.currentTargetYScan>=this.targetScanYRange) this.currentTargetYScan=0;
        
        if (this.collision.rayCollision(this,this.lookPoint,this.lookVector,this.lookHitPoint)) {
            if (this.hitEntity!==null) {
                if ((this.hitEntity instanceof EntityFPSPlayerClass) ||
                   (this.hitEntity instanceof EntityFPSBotClass) ||
                   (this.hitEntity instanceof EntityFPSMonsterClass)) this.targetEntity=this.hitEntity;
            }
        }
    }
    
        //
        // weapons
        //
        
    adjustMeshesForCurrentWeapon()
    {
        let show=(this.currentWeapon===this.pistolWeapon);
        
        this.showMesh('beretta',show);
        this.showMesh('peen',show);
        this.showMesh('beretta_top',show);
        this.showMesh('triger',show);
        this.showMesh('holder',show);

        this.showMesh('m16_rifle',!show);
        this.showMesh('m16_holder_01',!show);
        this.showMesh('shutter',!show);
        this.showMesh('trigger',!show);
    }

    fireWeapon()
    {
        let dist,weapon;
        
            // are we turned enough towards player?
            
        if (Math.abs(this.lastTargetAngleDif)>this.targetFireYRange) return;
            
            // fire position
            
        this.firePosition.setFromPoint(this.position);
        this.firePosition.y+=this.eyeOffset;
            
           // see if any extra weapons can be fired
           
        dist=this.position.distance(this.targetEntity.position);
        
        if (this.grenadeWeapon.ammoCount!==0) {
            if ((dist>15000) && (dist<60000)) {
                if (weapon.fire(this.firePosition,this.drawAngle)) return;
            }
        }
           
            // otherwise shot the held weapon
            
        this.currentWeapon.fire(this.firePosition,this.drawAngle);
        
            // animations
            
        if (this.currentWeapon===this.pistolWeapon) {
            this.interuptAnimation((this.inStandingAnimation)?this.fireIdleAnimationPistol:this.fireRunAnimationPistol);
        }
        else {
            if (this.currentWeapon===this.m16Weapon) {
                this.interuptAnimation((this.inStandingAnimation)?this.fireIdleAnimationM16:this.fireRunAnimationM16);
            }
        }
    }
    
        //
        // mainline bot run
        //
        
    run()
    {
        let nodeIdx,prevNodeIdx,moveForward;
        let turnDiff,slideLeft,liquid,liquidIdx,gravityFactor,fallDist;
        
        super.run();
        
        if (this.core.game.freezeAI) return;
        
            // liquids
            
        liquidIdx=this.core.game.map.liquidList.getLiquidForPoint(this.position);
        
        if (liquidIdx!==-1) {
            liquid=this.core.game.map.liquidList.liquids[liquidIdx];
            if (this.lastInLiquidIdx===-1) liquid.playSoundIn(this.position);
            this.lastInLiquidIdx=liquidIdx;
            gravityFactor=liquid.gravityFactor;
        }
        else {
            if (this.lastInLiquidIdx!==-1) this.core.game.map.liquidList.liquids[this.lastInLiquidIdx].playSoundOut(this.position);
            this.lastInLiquidIdx=-1;
            gravityFactor=1.0;
        }
       
            // dead
            
        if (this.respawnTick!==0) {
            
                // keep falling
                
            this.rotMovement.setFromValues(0,0,0);
            this.moveInMapY(this.rotMovement,gravityFactor,false);
            
                // bots always recover
                
            if (this.core.game.timestamp>this.respawnTick)  this.ready();
            
            return;
        }
        
            // the telefrag trigger
            // we defer this because it can happen during a spawn
            
        if (this.telefragTriggerEntity!==null) {
            this.die(this.telefragTriggerEntity,true);
            this.telefragTriggerEntity=null;
            return;
        }
        
            // falling
            
        if ((this.standOnMeshIdx!==-1) && (liquidIdx===-1)) {
            if (this.falling) {
                this.falling=false;
                fallDist=(this.fallStartY-this.position.y)-this.fallDamageMinDistance;
                if (fallDist>0) this.damage(this,Math.trunc(fallDist*this.fallDamagePercentage),this.position);
            }
        }
        else {
            if (this.movement.y>0) {
                this.falling=false;
            }
            else {
                if (!this.falling) {
                    this.falling=true;
                    this.fallStartY=this.position.y;
                }
            }
        }
        
            // if no node, just skip out
            
        if (this.nextNodeIdx===-1) return;
        
            // pick best weapon
            
        this.pickBestWeapon();
        
            // look for things to shoot
            
        this.findEntityToFight();
        
        if (this.targetEntity!==null) this.fireWeapon();
        
            // run the nodes, we do this before
            // freezing for trigger waits because we might
            // be standing upon something that auto moves us to
            // the next node
        
            // have we hit goal node?
            // we only chase goals if we aren't targetting another entity

        if (this.targetEntity===null) {
            if (this.hitPathNode(this.goalNodeIdx,this.seekNodeDistanceSlop)) {
                nodeIdx=this.goalNodeIdx;
                this.goalNodeIdx=this.getRandomKeyNodeIndex();
                this.nextNodeIdx=this.nextNodeInPath(nodeIdx,this.goalNodeIdx);
            }
        }

            // have we hit the next node?
            // if we are targetting an entity, go to the next nearest
            // linked node closest to the entity, otherwise path to the goal

        if (this.hitPathNode(this.nextNodeIdx,this.seekNodeDistanceSlop)) {
            prevNodeIdx=this.nextNodeIdx;

            if (this.targetEntity===null) {
                this.nextNodeIdx=this.nextNodeInPath(this.nextNodeIdx,this.goalNodeIdx);
            }
            else {
                this.nextNodeIdx=this.nextNodeTowardsEntity(this.nextNodeIdx,this.targetEntity);
            }

                // is this a node we should pause at?

            this.pausedTriggerName=this.isNodeATriggerPauseNode(prevNodeIdx,this.nextNodeIdx);
        }
        
            // always start by moving
            
        moveForward=true;
       
            // if we are waiting for a trigger,
            // then do nothing until trigger
            
        if (this.pausedTriggerName!==null) {
            if (!this.checkTrigger(this.pausedTriggerName)) {
                moveForward=false;
            }
            else {
                this.pausedTriggerName=null;
            }
        }
        
            // select proper animation
            
        if (!moveForward) {
            this.continueAnimation((this.currentWeapon===this.pistolWeapon)?this.idleAnimationPistol:this.idleAnimationM16);
        }
        else {
            this.continueAnimation((this.currentWeapon===this.pistolWeapon)?this.runAnimationPistol:this.runAnimationM16);
        }
        
            // if we are touching an entity, try to slide out
            // of the way
            
        slideLeft=false;
        
        if ((this.touchEntity!==null) && (moveForward)) {
            slideLeft=true;
        }
        
            // turn off all movement if in a freeze
            // mostly happens from certain weapon fires
            
        if (this.movementFreezeTick!==0) {
            if (this.movementFreezeTick>this.core.game.timestamp) {
                moveForward=false;
                slideLeft=false;
            }
            else {
                this.movementFreezeTick=0;
            }
        }
        
            // turn towards the node
            // if we aren't paused
        
        if (this.pausedTriggerName===null) {
            turnDiff=this.turnYTowardsNode(this.nextNodeIdx,this.maxTurnSpeed);
            if (turnDiff>this.seekNodeAngleSlop) moveForward=false;
        }
        
            // changing angles based on if we are
            // walking nodes or targetting
            
        if (this.targetEntity===null) {
            this.drawAngle.turnYTowards(this.angle.y,this.maxTurnSpeed);
        }
        else {
            this.lastTargetAngleDif=this.drawAngle.turnYTowards(this.position.angleYTo(this.targetEntity.position),this.maxTurnSpeed);
        }
        
            // move
            
        if (this.flying) {
            this.movement.moveZWithAcceleration(moveForward,false,this.flyAcceleration,this.flyDeceleration,this.flyMaxSpeed,this.flyAcceleration,this.flyDeceleration,this.flyMaxSpeed);
        }
        else {
            if (this.lastUnderLiquid) {
                this.movement.moveZWithAcceleration(moveForward,false,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed,this.swimAcceleration,this.swimDeceleration,this.swimMaxSpeed);
            }
            else {
                this.movement.moveZWithAcceleration(moveForward,false,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.backwardAcceleration,this.backwardDeceleration,this.backwardMaxSpeed);
            }
        }
        this.movement.moveXWithAcceleration(slideLeft,false,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(this.movement);
        if ((this.flying) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,this.angle.x);     // if flying or swimming, add in the X rotation
        }
        this.rotMovement.rotateY(null,this.angle.y);
                    
        this.movement.y=this.moveInMapY(this.rotMovement,gravityFactor,false);
        this.moveInMapXZ(this.rotMovement,true,true);
        
            // detect stuck
            // if we get stuck, then head towards the nearest node and
            // then onto a new random goal
            
        if ((this.position.equals(this.stuckPoint)) && (this.pausedTriggerName===null)) {
            this.stuckCount++;
            if (this.stuckCount>=this.MAX_STUCK_COUNT) {
                this.stuckCount=0;
                this.goalNodeIdx=this.getRandomKeyNodeIndex();
                this.nextNodeIdx=this.findNearestPathNode(-1);
            }
        }
        
        this.stuckPoint.setFromPoint(this.position);
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.setModelDrawAttributes(this.position,this.drawAngle,this.scale,false);
        return(this.boundBoxInFrustum());
    }
}

