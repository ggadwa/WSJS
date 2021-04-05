import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import EntityClass from '../game/entity.js';

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
        
        this.burstEndTimestamp=0;
        
        this.turnCoolDownPeriod=0;
        
        this.rigidBodyMaxDrop=0;
        this.rigidBodyMaxAngle=0;
        this.rigidBodyTransformPerTick=0;
        
        this.engineSoundRateMin=0;
        this.engineSoundRateAdd=0;
        this.engineSoundRateAirIncrease=0;

        this.smokeThickness=0;
        this.smokeAngles=[];
        this.smokeEffect=null;
        
        this.burstThickness=0;
        this.burstAngles=[];
        this.burstEffect=null;
        
        this.idleAnimation=null;
        this.driveAnimation=null;
        this.turnLeftAnimation=null;
        this.turnRightAnimation=null;
        this.spinOutAnimation=null;
        
        this.engineSound=null;
        this.skidSound=null;
        this.burstSound=null;
        this.crashKartSound=null;
        this.crashWallSound=null;
        
            // variables
            
        this.inDrift=false;
        
        this.smokeCoolDownCount=0;
        this.burstCoolDownCount=0;
        this.bounceCount=0;
        this.reflectCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.turnSmooth=0;
        this.turnCoolDown=0;

        this.driftMinAngle=0;
        this.brakeMinAngle=0;
        this.pathNodeSlop=0;
    
        this.lastDrawTick=0;
        
        this.engineSoundPlayIdx=0;
        this.engineSoundRateAirIncrease=0;
        
        this.starCount=0;
        
            // variables for bots, they
            // are here so player kart can self-drive
            // after win/loss
            
        this.pathNodeIdx=-1;
        this.trackZOffset=0;
        
        this.gotoRotPoint=new PointClass(0,0,0);
        this.gotoPosition=new PointClass(0,0,0);
        
            // lap calculations
            
        this.LAP_STATUS_BEFORE_GOAL=0;
        this.LAP_STATUS_PASS_GOAL=1;
        this.LAP_STATUS_PASSING_MIDPOINT=2;
        
        this.lapStatus=0;
            
        this.lap=0;
        this.previousLap=-1;
        this.place=0;
        this.previousPlace=-1;
        this.placeNodeIdx=0;
        this.placeNodeDistance=0;
        this.placeLap=-1;
        
        this.endNodeIdx=0;
        this.goalNodeIdx=0;
        this.firstNodeIdx=0;
        this.midpointNodeIdx=0;
        
        this.bowlingBallWeapon=null;
        
            // pre-allocate
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.driftMovement=new PointClass(0,0,0);
        this.bounceReflectMovement=new PointClass(0,0,0);
        this.smokePosition=new PointClass(0,0,0);
        this.burstPosition=new PointClass(0,0,0);
        
        this.placeCalcRotPoint=new PointClass(0,0,0);
        this.placeCalcPassLine1=new PointClass(0,0,0);
        this.placeCalcPassLine2=new PointClass(0,0,0);
        this.placeCalcKartLine2=new PointClass(0,0,0);
        this.placeCalcKartCollidePoint=new PointClass(0,0,0);
        
        this.rigidAngle=new PointClass(0,0,0);
        this.rigidGotoAngle=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        this.fireAngle=new PointClass(0,0,0);
        
            // some static nodes
            
        this.goalNodeIdx=-1;
        this.endNodeIdx=-1;
        
            // no seal, object is extended
    }
    
    initialize()
    {
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
        
        this.turnCoolDownPeriod=this.core.game.lookupValue(this.json.config.turnCoolDownPeriod,this.data,15);

        this.driftMinAngle=this.core.game.lookupValue(this.json.config.driftMinAngle,this.data,60);
        this.brakeMinAngle=this.core.game.lookupValue(this.json.config.brakeMinAngle,this.data,90);
        this.pathNodeSlop=this.core.game.lookupValue(this.json.config.pathNodeSlop,this.data,0);
        
        this.rigidBodyMaxDrop=this.core.game.lookupValue(this.json.config.rigidBodyMaxDrop,this.data,0);
        this.rigidBodyMaxAngle=this.core.game.lookupValue(this.json.config.rigidBodyMaxAngle,this.data,0);
        this.rigidBodyTransformPerTick=this.core.game.lookupValue(this.json.config.rigidBodyTransformPerTick,this.data,0);
        
        this.engineSoundRateMin=this.core.game.lookupValue(this.json.config.engineSoundRateMin,this.data,0);
        this.engineSoundRateAdd=this.core.game.lookupValue(this.json.config.engineSoundRateAdd,this.data,0);
        this.engineSoundRateAirIncrease=this.core.game.lookupValue(this.json.config.engineSoundRateAirIncrease,this.data,0);

        this.smokeThickness=this.core.game.lookupValue(this.json.config.smokeThickness,this.data,5);
        this.smokeAngles=this.json.config.smokeAngles;
        this.smokeEffect=this.core.game.lookupValue(this.json.config.smokeEffect,this.data,null);
        
        this.burstThickness=this.core.game.lookupValue(this.json.config.burstThickness,this.data,5);
        this.burstAngles=this.json.config.burstAngles;
        this.burstEffect=this.core.game.lookupValue(this.json.config.burstEffect,this.data,null);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.driveAnimation=this.core.game.lookupAnimationValue(this.json.animations.driveAnimation);
        this.turnLeftAnimation=this.core.game.lookupAnimationValue(this.json.animations.turnLeftAnimation);
        this.turnRightAnimation=this.core.game.lookupAnimationValue(this.json.animations.turnRightAnimation);
        this.spinOutAnimation=this.core.game.lookupAnimationValue(this.json.animations.spinOutAnimation);
        
        this.engineSound=this.core.game.lookupSoundValue(this.json.sounds.engineSound);
        this.skidSound=this.core.game.lookupSoundValue(this.json.sounds.skidSound);
        this.burstSound=this.core.game.lookupSoundValue(this.json.sounds.burstSound);
        this.crashKartSound=this.core.game.lookupSoundValue(this.json.sounds.crashKartSound);
        this.crashWallSound=this.core.game.lookupSoundValue(this.json.sounds.crashWallSound);
        
        this.bowlingBallWeapon=this.addEntity('weapon_bowling_ball','weapon_bowling_ball',new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
            
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
        let startIdx;
        
        super.ready();
         
        this.inDrift=false;
        
        this.smokeCoolDownCount=0;
        this.burstCoolDownCount=0;
        this.bounceCount=0;
        this.reflectCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.turnSmooth=0;
        this.turnCoolDown=0;
        
        this.burstEndTimestamp=0
        
        this.lapStatus=this.LAP_STATUS_BEFORE_GOAL;
        
        this.lap=-1;
        
        this.lastDrawTick=this.core.game.timestamp;
        this.rigidGotoAngle.setFromValues(0,0,0);
        
            // reset the stars
            
        this.starCount=0;
        
            // engine sound
            
        this.engineSoundRateAirIncrease=0;
        this.engineSoundPlayIdx=this.playSound(this.engineSound);
        
            // some specific nodes
            
        this.endNodeIdx=this.findKeyNodeIndex('end');
        this.goalNodeIdx=this.findKeyNodeIndex('goal');
        this.firstNodeIdx=this.findKeyNodeIndex('first');
        this.midpointNodeIdx=this.findKeyNodeIndex('midpoint');
        
            // get a random place
            
        startIdx=Math.trunc(this.core.game.map.kartStartPositions.length*Math.random());
        this.position.setFromPoint(this.core.game.map.kartStartPositions[startIdx]);
        
        this.core.game.map.kartStartPositions.splice(startIdx,1);

            // idle animation
            
        this.startAnimation(this.idleAnimation);
    }
    
        //
        // smoke and burst effects
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
    
    createBurst(offsetAngleY)
    {
        this.burstPosition.setFromValues(0,Math.trunc(this.height*0.25),this.radius);
        this.burstPosition.rotateX(null,this.angle.x);
        this.burstPosition.rotateZ(null,this.angle.z);
        this.burstPosition.rotateY(null,((this.angle.y+offsetAngleY)%360));
        this.burstPosition.addPoint(this.position);

        this.addEffect(this,this.burstEffect,this.burstPosition,null,true);
    }
    
        //
        // pickup items
        //
        
    addStar()
    {
        this.starCount++;
        if (this.starCount>10) this.starCount=10;
    }
    
    removeStar()
    {
        this.starCount--;
        if (this.starCount<0) this.starCount=0;
    }
    
    addBurst()
    {
        this.burstEndTimestamp=this.core.game.timestamp+2500;
        
        this.playSound(this.burstSound);
    }
    
        //
        // drifts, bounces, spins
        //
        
    driftStart()
    {
        this.inDrift=true;
        this.driftMovement.setFromPoint(this.rotMovement);
        this.lastDriftSoundPlayIdx=this.playSound(this.skidSound);
    }
    
    driftEnd()
    {
        if (!this.inDrift) return;
        
        this.inDrift=false;

        if (this.lastDriftSoundPlayIdx!==-1) {
            this.core.audio.soundStop(this.lastDriftSoundPlayIdx);
            this.lastDriftSoundPlayIdx=-1;
        }
    }

    bounceStart()
    {
        if ((this.bounceCount!==0) || (this.reflectCount!==0) || (this.spinOutCount!==0)) return;
        
            // turn on bounce
            
        this.bounceCount=this.bounceWaitCount;
        this.bounceReflectMovement.setFromPoint(this.rotMovement);
        this.bounceReflectMovement.scale(-1);
        
        this.movement.z=0;          // clear all forward movement for a bounce
        
        this.playSound(this.crashWallSound);
        
            // bounce cost a star
            
        this.removeStar();
        
            // bounces cancel drifts
            
        this.driftEnd();
    }
    
    reflectStart(hitEntity)
    {
        if ((this.bounceCount!==0) || (this.reflectCount!==0) || (this.spinOutCount!==0)) return;
        
            // turn on reflect
            
        this.reflectCount=this.bounceWaitCount;
        this.bounceReflectMovement.setFromPoint(this.movement);
        this.bounceReflectMovement.rotateY(null,hitEntity.position.angleYTo(this.position));
        
        this.playSound(this.crashKartSound);
        
            // reflect cost a star
            
        this.removeStar();
        
            // reflect cancel drifts
            
        this.driftEnd();
    }
    
        //
        // damage
        //
        
    damage(fromEntity,damage,hitPoint)
    {
            // projectile hits cost a star and start
            // a spin
            
        this.spinOutCount=360;
        this.removeStar();
        
        this.playSound(this.crashWallSound);
    }
    
        //
        // ai routines
        //
        
    calcGotoPosition(fromNodeIdx,toNodeIdx)
    {
        let angY;
        
            // calc the goto position from the
            // next node and the track offset
            
            // get direction of driving,
            // add in 90 degrees and then rotate
            // the offset
            
        angY=this.getNodePosition(fromNodeIdx).angleYTo(this.getNodePosition(toNodeIdx))+90;
        if (angY>360.0) angY-=360.0;
        
        this.gotoRotPoint.setFromValues(0,0,this.trackZOffset);
        this.gotoRotPoint.rotateY(null,angY);
        
        this.gotoPosition.setFromAddPoint(this.getNodePosition(toNodeIdx),this.gotoRotPoint);
    }
    
    trackOffsetSetup()
    {
        let goalPosition;
        
            // we assume all maps have the starting direction
            // heading -x, so we get the Z distance and that
            // makes our track when turned 90 degrees from
            // the node path
            
        goalPosition=this.getNodePosition(this.goalNodeIdx);
        this.trackZOffset=goalPosition.z-this.position.z;
    }
    
    pathSetup(nodeAdd)
    {
            // always start by going to node after the goal
            
        this.pathNodeIdx=this.goalNodeIdx+nodeAdd;
        this.calcGotoPosition(this.goalNodeIdx,this.pathNodeIdx);
    }
    
    pathRun()
    {
        let fromNodeIdx;
        
            // have we hit the next drive to position?
            
        if (this.position.distance(this.gotoPosition)<this.pathNodeSlop) {
            fromNodeIdx=this.pathNodeIdx;
            
            if (this.getNodeKey(this.pathNodeIdx)==='end') {
                this.pathNodeIdx=this.findKeyNodeIndex('goal');
            }
            else {
                this.pathNodeIdx++;
            }
            
            this.calcGotoPosition(fromNodeIdx,this.pathNodeIdx);
        }
    }

        //
        // kart mainline
        //
    
    moveKart(turnAdd,moveForward,moveReverse,drifting,brake,fire,jump)
    {
        let maxTurnSpeed,speed,rate;
        let smokeAngle,burstAngle;
        
            // spinning
            
        if (this.spinOutCount!==0) {
            moveForward=false;          // if spinning, you can't drive forward or backwards or drift
            moveReverse=false;
            drifting=false;
            
            this.spinOutCount-=this.spinOutSpeed;
            if (this.spinOutCount<=0) this.spinOutCount=0;
        }
        
            // firing
        
        if (fire) {
            this.fireAngle.setFromPoint(this.drawAngle);
            this.fireAngle.x=-this.fireAngle.z;      // translate rigid body to fire position
            this.bowlingBallWeapon.fire(this.position,this.fireAngle);
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
            
        if ((drifting) && (this.bounceCount===0) && (this.reflectCount===0) && (this.spinOutCount===0)) {
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
                this.gravity=this.core.game.map.gravityMinValue;
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
                    speed=this.forwardMaxSpeed+(10*this.starCount);
                    if (this.burstEndTimestamp!==0) {
                        if (this.burstEndTimestamp<this.core.game.timestamp) {
                            this.burstEndTimestamp=0;
                        }
                        else {
                            speed+=75;
                        }
                    }
                    this.movement.moveZWithAcceleration(moveForward,moveReverse,this.forwardAcceleration,this.forwardDeceleration,speed,this.reverseAcceleration,this.reverseDeceleration,this.reverseMaxSpeed);
                }
            }

            this.rotMovement.setFromPoint(this.movement);
            this.rotMovement.rotateY(null,this.angle.y);
        }
                
            // change movement if bouncing or reflecting
            
        if ((this.bounceCount!==0) || (this.reflectCount!==0)) {
            this.rotMovement.addPoint(this.bounceReflectMovement);
        }
        
            // move around the map
        
        this.movement.y=this.moveInMapY(this.rotMovement,1.0,false);
        this.moveInMapXZ(this.rotMovement,true,true);
        
            // animations

        if (this.spinOutCount!==0) {
            this.continueAnimation(this.spinOutAnimation);
        }
        else {
            if (this.movement.z===0) {
                this.continueAnimation(this.idleAnimation);
            }
            else {
                if (this.turnCoolDown===0) {
                    this.turnCoolDown=this.turnCoolDownPeriod;
                    this.turnSmooth=turnAdd;
                }
                
                if (this.turnSmooth>0.1) {
                    this.continueAnimation(this.turnLeftAnimation);
                }
                else {
                    if (this.turnSmooth<-0.1) {
                        this.continueAnimation(this.turnRightAnimation);
                    }
                    else {
                        this.continueAnimation(this.driveAnimation);
                    }
                }
                
                if (this.turnCoolDown!==0) this.turnCoolDown--;
            }
        }
       
            // bounce and reflects
        
        if (this.bounceCount!==0) {
            this.bounceCount--;
        }
        else {
            if ((this.collideWallMeshIdx!==-1) || (this.slideWallMeshIdx!==-1)) this.bounceStart();
        }
        
        if (this.reflectCount!==0) {
            this.reflectCount--;
        }
        else {
            if (this.touchEntity!==null) {
                if (this.touchEntity instanceof EntityKartBaseClass) this.reflectStart(this.touchEntity);
            }   
        }
        
            // smoke if drifting, spinning out, bursting, or turning
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
        
            // burst if bursting
            
        if (this.burstEffect!==null) {
            if (this.burstEndTimestamp!==0) {
                if (this.burstCoolDownCount===0) {
                    this.burstCoolDownCount=this.burstThickness;
                    for (burstAngle of this.burstAngles) {
                        this.createBurst(burstAngle);
                    }
                }
                else {
                    this.burstCoolDownCount--;
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
        
        this.core.audio.soundChangeRate(this.engineSoundPlayIdx,rate);
    }
    
        //
        // calculate kart place
        //
        
    collideEntityWithNodeLine(entity,nodeIdx)
    {
        let prevNodeIdx;
        let angY,angY2,nodeDist;
        let sx1,sz1,sx2,sz2;
        let f,s,t,px,pz;
        
            // get the perpendicular line through this node
            // from the line going through the previous node to this
            // node.  This is the line we collide the kart with to
            // find the distance to "passing" this node
            
        prevNodeIdx=(nodeIdx===this.goalNodeIdx)?this.endNodeIdx:(nodeIdx-1);

        angY=this.getNodePosition(prevNodeIdx).angleYTo(this.getNodePosition(nodeIdx));
            
        angY2=angY+90;
        if (angY2>360.0) angY2-=360.0;

        this.placeCalcRotPoint.setFromValues(0,0,(entity.radius*10));        // this is a bit hard set, but we say only 10 karts width for each tracks
        this.placeCalcRotPoint.rotateY(null,angY2);
        this.placeCalcPassLine1.setFromAddPoint(this.getNodePosition(nodeIdx),this.placeCalcRotPoint);
        this.placeCalcPassLine2.setFromSubPoint(this.getNodePosition(nodeIdx),this.placeCalcRotPoint);
            
            // get a distance between these nodes, we use
            // this to determine the length of the line from
            // the kart which will collide with this node

        nodeDist=this.getNodePosition(prevNodeIdx).distanceScrubY(this.getNodePosition(nodeIdx));

            // get a line from the kart traveling
            // down the node line

        this.placeCalcKartLine2.setFromValues(0,0,(nodeDist*2));
        this.placeCalcKartLine2.rotateY(null,angY);
        this.placeCalcKartLine2.addPoint(entity.position);
        
            // finally run the line-to-line collision
            // and get the distance to the collision point
            
        sx1=this.placeCalcPassLine2.x-this.placeCalcPassLine1.x;
        sz1=this.placeCalcPassLine2.z-this.placeCalcPassLine1.z;
        sx2=this.placeCalcKartLine2.x-entity.position.x;
        sz2=this.placeCalcKartLine2.z-entity.position.z;

        f=(-sx2 * sz1 + sx1 * sz2);
        if (f===0) return(-1);
        
        s=((-sz1*(this.placeCalcPassLine1.x-entity.position.x))+(sx1*(this.placeCalcPassLine1.z-entity.position.z)))/f;
        t=((sx2*(this.placeCalcPassLine1.z-entity.position.z))-(sz2*(this.placeCalcPassLine1.x-entity.position.x)))/f;

        if ((s>=0)&&(s<=1)&&(t>=0)&&(t<=1)) {
            px=entity.position.x-(this.placeCalcPassLine1.x+(t*sx1));
            pz=entity.position.z-(this.placeCalcPassLine1.z+(t*sz1));
            return(Math.sqrt((px*px)+(pz*pz)));
        }
        
        return(-1);
    }

    calculatePlaces()
    {
        let n,nodeDist,prevNodeDist,nextNodeDist;
        let nodeIdx,prevNodeIdx,nextNodeIdx,spliceIdx,entity;
        let entityList=this.core.game.map.entityList;
        let placeList=[];

            // this is a bit complicated -- the path of travel
            // allows us to create a "pass line" for each node which
            // when then collide with the same path of travel from the
            // center of each kart.  all of that together gives
            // use the kart place
            
        for (entity of entityList.entities) {
            if (!(entity instanceof EntityKartBaseClass)) continue;
            
                // we try three nodes, the one closest to the kart
                // and the one before and after, -1 means we passed
                // the travel line, take the closest node as the one
                // we are heading two

            nodeIdx=entity.findNearestPathNode(-1);
            prevNodeIdx=(nodeIdx===entity.goalNodeIdx)?entity.endNodeIdx:(nodeIdx-1);
            nextNodeIdx=(nodeIdx===entity.endNodeIdx)?entity.goalNodeIdx:(nodeIdx+1);
    
            nodeDist=this.collideEntityWithNodeLine(entity,nodeIdx);
            prevNodeDist=this.collideEntityWithNodeLine(entity,prevNodeIdx);
            nextNodeDist=this.collideEntityWithNodeLine(entity,nextNodeIdx);
            
            if ((prevNodeDist===-1) && (nodeDist===-1)) {
                entity.placeNodeIdx=nextNodeIdx;
                entity.placeNodeDistance=nextNodeDist;
            }
            else {
                if (prevNodeDist===-1) {
                    if (nodeDist<nextNodeDist) {
                        entity.placeNodeIdx=nodeIdx;
                        entity.placeNodeDistance=nodeDist;
                    }
                    else {
                        entity.placeNodeIdx=nextNodeIdx;
                        entity.placeNodeDistance=nextNodeDist;
                    }
                }
                else {
                    if (nodeDist<prevNodeDist) {
                        entity.placeNodeIdx=nodeIdx;
                        entity.placeNodeDistance=nodeDist;
                    }
                    else {
                        entity.placeNodeIdx=prevNodeIdx;
                        entity.placeNodeDistance=prevNodeDist;
                    }
                }
            }
            
                // determine lap status
                // we have to pass a midpoint before we can be
                // before goal, and we have to be before goal
                // before we can add up a lap
                
            if (entity.placeNodeIdx===entity.midpointNodeIdx) {
                entity.lapStatus=this.LAP_STATUS_PASSING_MIDPOINT;
            }
            else {
                if (entity.placeNodeIdx===entity.endNodeIdx) {
                    if (entity.lapStatus===this.LAP_STATUS_PASSING_MIDPOINT) entity.lapStatus=this.LAP_STATUS_BEFORE_GOAL;
                }
                else {
                    if (entity.placeNodeIdx===entity.firstNodeIdx) {
                        if (entity.lapStatus===this.LAP_STATUS_BEFORE_GOAL) {
                            entity.lapStatus=this.LAP_STATUS_PASS_GOAL;
                            entity.lap++;
                        }
                    }
                }
            }
            
                // if we are heading towards the goal (which is
                // node 0) then we need to push the lap ahead one
                // or else we end up in last place
                
            entity.placeLap=((entity.lapStatus===this.LAP_STATUS_BEFORE_GOAL) && (entity.placeNodeIdx===entity.goalNodeIdx))?(entity.lap+1):entity.lap;

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
        let timestamp=this.core.game.timestamp;
        
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
            
        this.setModelDrawAttributes(this.position,this.drawAngle,this.scale,false);
        return(this.boundBoxInFrustum());
    }
}
