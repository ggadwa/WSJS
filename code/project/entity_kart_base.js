import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import EntityClass from '../project/entity.js';
import EntityPickupClass from '../project/entity_pickup.js';

//
// kart base module
//
// this is used for both kart players and bots as they have
// mostly the same methods
//

export default class EntityKartBaseClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.TURN_COOL_DOWN_PERIOD=15;
        
        this.maxTurnSpeed=0;
        this.driftMaxTurnSpeed=0;
        this.forwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.reverseAcceleration=0;
        this.reverseDeceleration=0;
        this.reverseMaxSpeed=0;
        this.forwardBrakeDeceleration=0;
        this.reverseBrakeDeceleration=0;
        this.jumpHeight=0;
        this.bounceWaitCount=0;
        this.spinOutSpeed=0;
        this.driftDecelerationFactor=0;
        
        this.maxSpeedItemCount=0;
        this.speedItemIncrease=0;
        
        this.rigidBodyMaxDrop=0;
        this.rigidBodyMaxAngle=0;
        this.rigidBodyTransformPerTick=0;
        
        this.engineSoundRateMin=0;
        this.engineSoundRateAdd=0;
        this.engineSoundRateAirIncrease=0;

        this.smokeThickness=0;
        this.smokeAngles=[];
        this.smokeEffect=null;
        
        this.idleAnimation=null;
        this.driveAnimation=null;
        this.turnLeftAnimation=null;
        this.turnRightAnimation=null;
        this.spinOutAnimation=null;
        
        this.engineSound=null;
        this.skidSound=null;
        this.crashKartSound=null;
        this.crashWallSound=null;
        
            // variables
            
        this.inDrift=false;
        
        this.smokeCoolDownCount=0;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.turnSmooth=0;
        this.turnCoolDown=0;
    
        this.hitMidpoint=false;
    
        this.lastDrawTick=0;
        
        this.engineSoundPlayIdx=0;
        this.engineSoundRateAirIncrease=0;
        
        this.speedItemCount=0;
        
            // lap calculations
            
        this.lap=0;
        this.previousLap=-1;
        this.place=0;
        this.previousPlace=-1;
        this.placeNodeIdx=0;
        this.placeNodeDistance=0;
        this.placeLap=0;
        this.hitMidpoint=false;
        
        this.goalNodeIdx=0;
        this.endNodeIdx=0;

            // weapons
        
        this.currentWeaponIdx=-1;
        this.weapons=[];
        
            // pre-allocate
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.driftMovement=new PointClass(0,0,0);
        this.smokePosition=new PointClass(0,0,0);
        
        this.rigidAngle=new PointClass(0,0,0);
        this.rigidGotoAngle=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
            // some static nodes
            
        this.goalNodeIdx=-1;
        this.endNodeIdx=-1;
        
            // no seal, object is extended
    }
    
    initialize()
    {
        let n,weaponBlock,weaponEntity;
        
        super.initialize();
        
            // kart settings
            
        this.maxTurnSpeed=this.core.game.lookupValue(this.json.config.maxTurnSpeed,this.data,1.5);
        this.driftMaxTurnSpeed=this.core.game.lookupValue(this.json.config.driftMaxTurnSpeed,this.data,2.5);
        this.forwardAcceleration=this.core.game.lookupValue(this.json.config.forwardAcceleration,this.data,8);
        this.forwardDeceleration=this.core.game.lookupValue(this.json.config.forwardDeceleration,this.data,25);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.json.config.forwardMaxSpeed,this.data,1500);
        this.reverseAcceleration=this.core.game.lookupValue(this.json.config.reverseAcceleration,this.data,5);
        this.reverseDeceleration=this.core.game.lookupValue(this.json.config.reverseDeceleration,this.data,35);
        this.reverseMaxSpeed=this.core.game.lookupValue(this.json.config.reverseMaxSpeed,this.data,1000);
        this.forwardBrakeDeceleration=this.core.game.lookupValue(this.json.config.forwardBrakeDeceleration,this.data,50);
        this.reverseBrakeDeceleration=this.core.game.lookupValue(this.json.config.reverseBrakeDeceleration,this.data,50);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,1000);
        this.bounceWaitCount=this.core.game.lookupValue(this.json.config.bounceWaitCount,this.data,20);
        this.spinOutSpeed=this.core.game.lookupValue(this.json.config.spinOutSpeed,this.data,6);
        this.driftDecelerationFactor=this.core.game.lookupValue(this.json.config.driftDecelerationFactor,this.data,0.99);
        
        this.maxSpeedItemCount=this.core.game.lookupValue(this.json.config.maxSpeedItemCount,this.data,0);
        this.speedItemIncrease=this.core.game.lookupValue(this.json.config.speedItemIncrease,this.data,0);
        
        this.rigidBodyMaxDrop=this.core.game.lookupValue(this.json.config.rigidBodyMaxDrop,this.data,0);
        this.rigidBodyMaxAngle=this.core.game.lookupValue(this.json.config.rigidBodyMaxAngle,this.data,0);
        this.rigidBodyTransformPerTick=this.core.game.lookupValue(this.json.config.rigidBodyTransformPerTick,this.data,0);
        
        this.engineSoundRateMin=this.core.game.lookupValue(this.json.config.engineSoundRateMin,this.data,0);
        this.engineSoundRateAdd=this.core.game.lookupValue(this.json.config.engineSoundRateAdd,this.data,0);
        this.engineSoundRateAirIncrease=this.core.game.lookupValue(this.json.config.engineSoundRateAirIncrease,this.data,0);

        this.smokeThickness=this.core.game.lookupValue(this.json.config.smokeThickness,this.data,5);
        this.smokeAngles=this.json.config.smokeAngles;
        this.smokeEffect=this.core.game.lookupValue(this.json.config.smokeEffect,this.data,null);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.driveAnimation=this.core.game.lookupAnimationValue(this.json.animations.driveAnimation);
        this.turnLeftAnimation=this.core.game.lookupAnimationValue(this.json.animations.turnLeftAnimation);
        this.turnRightAnimation=this.core.game.lookupAnimationValue(this.json.animations.turnRightAnimation);
        this.spinOutAnimation=this.core.game.lookupAnimationValue(this.json.animations.spinOutAnimation);
        
        this.engineSound=this.core.game.lookupSoundValue(this.json.sounds.engineSound);
        this.skidSound=this.core.game.lookupSoundValue(this.json.sounds.skidSound);
        this.crashKartSound=this.core.game.lookupSoundValue(this.json.sounds.crashKartSound);
        this.crashWallSound=this.core.game.lookupSoundValue(this.json.sounds.crashWallSound);
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];

             weaponEntity=this.addEntity(weaponBlock.weaponJson,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),weaponBlock.weaponData,this,this,true);
             this.weapons.push(weaponEntity);
        }
            
        return(true);
    }
    
    release()
    {
        super.release();
    }
    
        //
        // ready
        //
        
    ready()
    {
        super.ready();
         
        this.inDrift=false;
        
        this.smokeCoolDownCount=0;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.turnSmooth=0;
        this.turnCoolDown=0;
        
        this.lap=-1;
        this.hitMidpoint=true;      // first lap starts the laps
        
        this.lastDrawTick=this.getTimestamp();
        this.rigidGotoAngle.setFromValues(0,0,0);
        
        this.currentWeaponIdx=0;
        
            // reset the speed items
            
        this.speedItemCount=0;
        
            // engine sound
            
        this.engineSoundRateAirIncrease=0;
        this.engineSoundPlayIdx=this.core.soundList.playJson(this.position,this.engineSound);
        
            // some specific nodes
            
        this.goalNodeIdx=this.findKeyNodeIndex('goal');
        this.endNodeIdx=this.findKeyNodeIndex('end');
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
    }
    
        //
        // drift smoke
        //
        
    createSmoke(offsetAngleY)
    {
        this.smokePosition.setFromValues(0,Math.trunc(this.height*0.25),this.radius);
        this.smokePosition.rotateX(null,this.angle.x);
        this.smokePosition.rotateZ(null,this.angle.z);
        this.smokePosition.rotateY(null,((this.angle.y+offsetAngleY)%360));
        this.smokePosition.addPoint(this.position);

        this.addEffect(this,this.smokeEffect,this.smokePosition,null,true);
    }
    
        //
        // pickup items
        //
        
    addSpeed(count)
    {
        console.info(this.name+' SPEED');
        this.speedItemCount+=count;
        if (this.speedItemCount>this.maxSpeedItemCount) this.speedItemCount=this.maxSpeedItemCount;
    }
    
    removeSpeed(count)
    {
        this.speedItemCount-=count;
        if (this.speedItemCount<0) this.speedItemCount=0;
    }
    
    addAmmo(weaponName,fireMethod,count)
    {
        let weapon;
        
        console.info(this.name+' AMMO');
        
        for (weapon of this.weapons) {
            if (weapon.name===weaponName) {
                weapon.addAmmo(fireMethod,count);
                return;
            }
        }
    }
    
        //
        // drifts, bounces, spins
        //
        
    driftStart()
    {
        this.inDrift=true;
        this.driftMovement.setFromPoint(this.rotMovement);
        this.lastDriftSoundPlayIdx=this.core.soundList.playJson(this.position,this.skidSound);
    }
    
    driftEnd()
    {
        if (!this.inDrift) return;
        
        this.inDrift=false;

        if (this.lastDriftSoundPlayIdx!==-1) {
            this.core.soundList.stop(this.lastDriftSoundPlayIdx);
            this.lastDriftSoundPlayIdx=-1;
        }
    }

    bounceStart(soundJson)
    {
            // turn on bounce
            
        this.bounceCount=this.bounceWaitCount;
        if (this.spinOutCount===0) this.spinOutCount=360;
        this.core.soundList.playJson(this.position,soundJson);
        
            // all bounces cost a speed item
            
        this.removeSpeed(1);
        
            // bounces cancel drifts
            
        this.driftEnd();
    }
    
    spinStart(soundJson)
    {
        this.spinOutCount=360;
        this.core.soundList.playJson(this.position,soundJson);
    }

        //
        // kart mainline
        //
    
    moveKart(turnAdd,moveForward,moveReverse,drifting,brake,fire,jump)
    {
        let maxTurnSpeed,speed,rate;
        let cube;
        let smokeAngle;
        
            // start spinning if you touch a monster
            
        if (this.spinOutCount===0) {
            if (this.touchEntity!==null) {
                if (this.touchEntity.name.startsWith('monster_')) {
                    this.spinStart(this.crashKartSound);
                }
            }
        }
        else {
            moveForward=false;          // if spinning, you can't drive forward or backwards or drift
            moveReverse=false;
            drifting=false;
            
            this.spinOutCount-=this.spinOutSpeed;
            if (this.spinOutCount<=0) this.spinOutCount=0;
        }
        
            // bounce if we hit another kart
            
        if (this.touchEntity!==null) {
            if (this.touchEntity instanceof EntityKartBaseClass) this.bounceStart(this.crashKartSound);

        }   
        
            // firing
        
        if (fire) {
            if (this.currentWeaponIdx!==-1) {
                this.weapons[this.currentWeaponIdx].firePrimary(this.position,this.drawAngle);
             }
        }
        
            // turning
            
        if (turnAdd!==0) {
            
                // clamp to max turning speed
                
            maxTurnSpeed=(this.inDrift)?this.driftMaxTurnSpeed:this.maxTurnSpeed;
            if (Math.abs(turnAdd)>maxTurnSpeed) turnAdd=maxTurnSpeed*Math.sign(turnAdd);

            this.angle.y+=turnAdd;
            if (this.angle.y<0.0) this.angle.y+=360.0;
            if (this.angle.y>=360.00) this.angle.y-=360.0;
        }
        
            // can we go into a drift?
            // if so we stick to the current movement
            
        if ((drifting) && (this.bounceCount===0) && (this.spinOutCount===0)) {
            if (!this.inDrift) {
                this.driftStart();
            }
        }
        else {
            this.driftEnd();
        }
        
            // jumping
           
        if (jump) {
            if (this.isStandingOnFloor()) {
                this.gravity=this.core.map.gravityMinValue;
                this.movement.y=this.jumpHeight;
            }
        }
        
            // figure out the movement
            // if drifting, we just continue on with
            // movement before the drift
         
        if (this.inDrift) {
            let len=this.driftMovement.lengthXZ();
            this.driftMovement.normalize();
            this.driftMovement.scale(len*this.driftDecelerationFactor);
            this.rotMovement.setFromPoint(this.driftMovement);
        }
        else {
            if (brake) {
                this.movement.moveZWithAcceleration(false,false,0,this.forwardBrakeDeceleration,this.forwardMaxSpeed,0,this.reverseBrakeDeceleration,this.reverseMaxSpeed);
            }
            else {
                if (this.isStandingOnFloor()) {
                    speed=this.forwardMaxSpeed+(this.speedItemIncrease*this.speedItemCount);
                    this.movement.moveZWithAcceleration(moveForward,moveReverse,this.forwardAcceleration,this.forwardDeceleration,speed,this.reverseAcceleration,this.reverseDeceleration,this.reverseMaxSpeed);
                }
            }

            this.rotMovement.setFromPoint(this.movement);
            this.rotMovement.rotateY(null,this.angle.y);
        }
                
            // if we are bouncing, reverse movement
            
        if (this.bounceCount!==0) this.rotMovement.scale(-1);
        
            // move around the map
        
        this.movement.y=this.moveInMapY(this.rotMovement,1.0,false);
        this.moveInMapXZ(this.rotMovement,true,true);
        
            // animations

        if (this.bounceCount!==0) {
            this.modelEntityAlter.continueAnimationChunkInFrames(this.spinOutAnimation);
        }
        else {
            if (this.movement.z===0) {
                this.modelEntityAlter.continueAnimationChunkInFrames(this.idleAnimation);
            }
            else {
                if (this.turnCoolDown===0) {
                    this.turnCoolDown=this.TURN_COOL_DOWN_PERIOD;
                    this.turnSmooth=turnAdd;
                }
                
                if (this.turnSmooth>0.1) {
                    this.modelEntityAlter.continueAnimationChunkInFrames(this.turnLeftAnimation);
                }
                else {
                    if (this.turnSmooth<-0.1) {
                        this.modelEntityAlter.continueAnimationChunkInFrames(this.turnRightAnimation);
                    }
                    else {
                        this.modelEntityAlter.continueAnimationChunkInFrames(this.driveAnimation);
                    }
                }
                
                if (this.turnCoolDown!==0) this.turnCoolDown--;
            }
        }
       
            // bounce and spin out if hit wall
        
        if (this.bounceCount!==0) {
            this.bounceCount--;
        }
        else {
            if ((this.collideWallMeshIdx!==-1) || (this.slideWallMeshIdx!==-1)) {
                this.bounceStart(this.crashWallSound);
            }
        }

            // smoke if drifting, spinning out, or turning
            // without moving
            
        if (this.smokeEffect!==null) {
            if ((this.inDrift) || (this.spinOutCount!==0) || ((turnAdd!==0) && (this.movement.z===0))) {
                if (this.smokeCoolDownCount===0) {
                    this.smokeCoolDownCount=this.smokeThickness;
                    for (smokeAngle of this.smokeAngles) {
                        this.createSmoke(smokeAngle);
                    }
                }
                else {
                    this.smokeCoolDownCount--;
                }
            }
        }
        
            // update the sound
        
        rate=this.engineSoundRateMin+(((Math.abs(this.movement.z)/this.forwardMaxSpeed)*this.engineSoundRateAdd)+this.engineSoundRateAirIncrease);
        if (this.isStandingOnFloor()) {
            if (this.engineSoundRateAirIncrease>=0) {
                this.engineSoundRateAirIncrease-=0.01;
                if (this.engineSoundRateAirIncrease<0) this.engineSoundRateAirIncrease=0;
            }
        }
        else {
            if (this.engineSoundRateAirIncrease<=this.engineSoundRateAirIncrease) {
                this.engineSoundRateAirIncrease+=0.01;
                if (this.engineSoundRateAirIncrease>this.engineSoundRateAirIncrease) this.engineSoundRateAirIncrease=this.engineSoundRateAirIncrease;
            }
        }
        
        this.core.soundList.changeRate(this.engineSoundPlayIdx,rate);
        
            // determine any cube hits
            
        cube=this.core.map.cubeList.findCubeContainingEntity(this);
        if (cube!==null) {
            if (cube.name==='goal') {
                if (this.hitMidpoint) {
                    this.hitMidpoint=false;
                    this.lap++;
                }
            }
            else {
                if (cube.name==='mid') {
                    this.hitMidpoint=true;
                }
            }
        }
    }
    
        //
        // calculate kart place
        //
        
    calculatePlaces()
    {
        let n,y,yMin,yMax;
        let nodeIdx,nodeIdx2,nextNodeIdx,spliceIdx,entity;
        let entityList=this.getEntityList();
        let placeList=[];

            // this is a bit complicated, we assume there
            // is a path where the goalNodeIdx is right on the goal
            // line and then a single path around the map
            
            // we find the nearest node, calculate the angle to
            // the next node in the path, and that is the travel angle,
            // then find the nearest node inside that angle.
            // this gets us the nearest node in the direction of travel
            // instead of just the nearest node (so it's always the
            // node we are heading towards, not any node behind us)
            
            // this is then used to calculate the entities distance
            // around the track (taking into account the lap)
            
        for (entity of entityList.entities) {
            if (!(entity instanceof EntityKartBaseClass)) continue;
            
                // get nearest node and then the next node
                // in the kart travel path

            nodeIdx=entity.findNearestPathNode(-1);
            nextNodeIdx=(nodeIdx===this.endNodeIdx)?this.goalNodeIdx:(nodeIdx+1);

                // get the angle between this nodes,
                // which is the direction of travel

            y=entity.getYAngleBetweenNodes(nodeIdx,nextNodeIdx);

                // now find the nearest node again, but
                // only at the travel angle, this gets
                // us the nearest node that is only ahead of us

            yMin=y-90;
            if (yMin<0) yMin=360+yMin;

            yMax=y+90;
            if (yMax>=360) yMax-=360;

            nodeIdx2=entity.findNearestPathNodeWithinYAngleSweep(-1,yMin,yMax);
            entity.placeNodeIdx=(nodeIdx2!==-1)?nodeIdx2:nodeIdx;

                // get the distance for the traveling node,
                // this tells us which entity is closest if they
                // are both heading towards this node
                
            entity.placeNodeDistance=entity.getNodePosition(entity.placeNodeIdx).distance(entity.position);
            
                // if we are heading towards the goal node,
                // we are still in an earlier lap but we have to count
                // it as the next lap else we fall behind right before the goal
                
            entity.placeLap=(entity.placeNodeIdx===this.goalNodeIdx)?(entity.lap+1):entity.lap;
            
                // sort it
                
            spliceIdx=-1;
            
            for (n=0;n!=placeList.length;n++) {
                if (entity.placeLap<placeList[n].placeLap) {
                    spliceIdx=n;
                    break;
                }
                if (entity.placeLap===placeList[n].placeLap) {
                    if (entity.placeNodeIdx===placeList[n].placeNodeIdx) {
                        if (entity.placeNodeDistance>placeList[n].placeNodeDistance) {
                            spliceIdx=n;
                            break;
                        }
                    }
                    if (entity.placeNodeIdx<placeList[n].placeNodeIdx) {
                        spliceIdx=n;
                        break;
                    }
                }
            }
            
            if (spliceIdx===-1) {
                placeList.push(entity);
            }
            else {
                placeList.splice(spliceIdx,0,entity);
            }
        }
        
            // now set the place
            
        for (n=0;n!=placeList.length;n++) {
            placeList[n].place=((placeList.length-1)-n);
            entity=placeList[n];
        }
    }
        
        //
        // drawing
        //

    drawSetup()
    {
        let speed;
        let timestamp=this.getTimestamp();
        
            // physics are guarenteed to be run 60fps, but
            // drawing could be slower so only do the rigid body stuff here
        
            // create the rigid body goto angle
            // the regular angle is slowly transformed to reflect this
            
        if (!this.isStandingOnFloor()) {
            this.rigidGotoAngle.x=0;
            this.rigidGotoAngle.z=0;
        }
        else {
            this.getRigidBodyAngle(this.rigidAngle,this.rigidBodyMaxDrop,this.rigidBodyMaxAngle);

                // go towards the larger angle of the X/Z
                // and then reduce the other angle in half
            
            if (Math.abs(this.rigidAngle.x)>Math.abs(this.rigidAngle.z)) {
                this.rigidGotoAngle.x=this.rigidAngle.x;
                this.rigidGotoAngle.z*=0.5;
            }
            else {
                this.rigidGotoAngle.x*=0.5;
                this.rigidGotoAngle.z=this.rigidAngle.z;
            }
        }
        
            // transform the rigid body into the
            // actual draw angles, depending on how
            // much time has passed
            
        speed=this.rigidBodyTransformPerTick*(timestamp-this.lastDrawTick);
        this.lastDrawTick=timestamp;
        
        this.angle.turnXTowards(this.rigidGotoAngle.x,speed);
        this.angle.turnZTowards(this.rigidGotoAngle.z,speed);
        
            // the drawing angle
            
        this.drawAngle.setFromPoint(this.angle);
        if (this.spinOutCount!==0) this.drawAngle.y+=this.spinOutCount;
            
            // and finally just call the regular draw position
            // stuff
            
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}
