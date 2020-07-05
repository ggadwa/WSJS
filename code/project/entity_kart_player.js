import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import EntityClass from '../project/entity.js';
import EntityPickupClass from '../project/entity_pickup.js';
import EntityKartBotClass from '../project/entity_kart_bot.js';

export default class EntityKartPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.maxTurnSpeed=1.5;
        this.driftMaxTurnSpeed=2.5;
        this.forwardAcceleration=8;
        this.forwardDeceleration=25;
        this.forwardMaxSpeed=2000;
        this.reverseAcceleration=5;
        this.reverseDeceleration=35;
        this.reverseMaxSpeed=1500;
        this.speedItemIncrease=50;
        this.forwardBrakeDeceleration=50;
        this.reverseBrakeDeceleration=50;
        this.jumpHeight=1000;
        this.bounceWaitCount=20;
        this.spinOutSpeed=6;
        this.driftDecelerationFactor=0.99;
        this.fireWaitTick=1000;
        
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;
        this.maxSpeedItemCount=0;
        this.interfaceSpeedItem=null;
        
        this.smokeThickness=0;
        this.smokeAngles=[];
        this.smokeEffect=null;
        
        this.engineSound=null;
        this.skidSound=null;
        this.crashKartSound=null;
        this.crashWallSound=null;
        
        
            // lap calculations
            // the existence of these means this entity
            // is calculated into the laps
            
        this.lap=0;
        this.previousLap=-1;
        this.place=0;
        this.previousPlace=-1;
        this.placeNodeIdx=0;
        this.placeNodeDistance=0;
        this.placeLap=0;
        this.hitMidpoint=false;


        
        this.currentWeaponIdx=-1;
        this.weapons=[];
    }
    
    initialize()
    {
        let n,weaponBlock,weaponEntity;
        
        super.initialize();
        
        this.MAX_RIGID_DROP=3000;
        this.MAX_RIGID_ANGLE=25;
        this.RIGID_TRANSFORM_SPEED_PER_TICK=0.025;
        this.MAX_LOOK_ANGLE=80.0;
        this.MAX_PROJECTILE_COUNT=3;
        this.MOUSE_MAX_LOOK_SPEED=8;
        this.MAX_LOOK_ANGLE=80.0;
        
        this.inDrift=false;
        this.smokeCoolDownCount=0;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
    
        this.hitMidpoint=false;
    
        this.lastDrawTick=0;
    
        
            // pre-allocate
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.driftMovement=new PointClass(0,0,0);
        this.smokePosition=new PointClass(0,0,0);
        
        this.rigidAngle=new PointClass(0,0,0);
        this.rigidGotoAngle=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
            // some static nodes
            
        this.goalNodeIdx=this.findKeyNodeIndex('goal');
        this.endNodeIdx=this.findKeyNodeIndex('end');

            
            
        this.MIN_ENGINE_SOUND_RATE=0.5;
        this.ADD_ENGINE_SOUND_RATE=0.8;
        this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE=0.2;

            // kart settings
            
        this.maxTurnSpeed=1.5;
        this.driftMaxTurnSpeed=2.5;
        this.forwardAcceleration=8;
        this.forwardDeceleration=25;
        this.forwardMaxSpeed=1500;
        this.reverseAcceleration=5;
        this.reverseDeceleration=35;
        this.reverseMaxSpeed=1000;
        this.itemSpeedIncrease=50;
        this.forwardBrakeDeceleration=50;
        this.reverseBrakeDeceleration=50;
        this.jumpHeight=1000;
        this.bounceWaitCount=20;
        this.spinOutSpeed=6;
        this.driftDecelerationFactor=0.99;
        this.fireWaitTick=1000;
        
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        
        this.maxSpeedItemCount=this.core.game.lookupValue(this.json.config.maxSpeedItemCount,this.data,0);
        this.interfaceSpeedItem=this.core.game.lookupValue(this.json.config.interfaceSpeedItem,this.data,null);
        
        this.smokeThickness=this.core.game.lookupValue(this.json.config.smokeThickness,this.data,5);
        this.smokeAngles=this.json.config.smokeAngles;
        this.smokeEffect=this.core.game.lookupValue(this.json.config.smokeEffect,this.data,null);
        
        this.engineSound=this.core.game.lookupSoundValue(this.json.sounds.engineSound);
        this.skidSound=this.core.game.lookupSoundValue(this.json.sounds.skidSound);
        this.crashKartSound=this.core.game.lookupSoundValue(this.json.sounds.crashKartSound);
        this.crashWallSound=this.core.game.lookupSoundValue(this.json.sounds.crashWallSound);
        
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];

             weaponEntity=this.addEntity(weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,this,this,true);
             this.weapons.push(weaponEntity);
        }
        
            // variables
            
        this.engineSoundPlayIdx=0;
        this.engineSoundRateAirIncrease=0;
            
            
            
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
        let n,weaponBlock;

        super.ready();
        
        this.core.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraLookAngle);
        
        this.inDrift=false;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.lap=-1;
        this.hitMidpoint=true;      // first lap starts the laps
        
        this.lastDrawTick=this.getTimestamp();
        this.rigidGotoAngle.setFromValues(0,0,0);
        
        this.currentWeaponIdx=0;
        
            // reset the speed items
            
        this.speedItemCount=0;
        if (this.interfaceSpeedItem!==null) this.core.interface.setCount(this.interfaceSpeedItem,this.speedItemCount);
        
        this.engineSoundRateAirIncrease=0;
        this.engineSoundPlayIdx=this.core.soundList.playJson(this.position,this.engineSound);
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
        this.speedItemCount+=count;
        if (this.speedItemCount>this.maxSpeedItemCount) this.speedItemCount=this.maxSpeedItemCount;
        
        if (this.interfaceSpeedItem!==null) this.core.interface.setCount(this.interfaceSpeedItem,this.speedItemCount);
    }
    
    removeSpeed(count)
    {
        this.speedItemCount-=count;
        if (this.speedItemCount<0) this.speedItemCount=0;
        
        if (this.interfaceSpeedItem!==null) this.core.interface.setCount(this.interfaceSpeedItem,this.speedItemCount);
    }
    
    addAmmo(weaponName,fireMethod,count)
    {
        let weapon;
        
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
        
    driftStart(timestamp)
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
    
    moveKart(turnAdd,moveForward,moveReverse,drifting,brake,fire,jump,isPlayer)
    {
        let maxTurnSpeed,speed;
        let cube,weapon;
        let smokeAngle;
        let timestamp=this.getTimestamp();
        
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
            if (this.touchEntity instanceof EntityKartBotClass) this.bounceStart(this.crashKartSound);

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
        // figure out kart place
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
            if (entity.lap===undefined) continue;           // use this variable to tell if it's something that calculates place
            
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
        // run player
        //
    
    run()
    {
        let x,y,turnAdd,fire;
        let forward,reverse,drifting,brake,jump;
        let rate,textLap;
        let input=this.core.input;
        let setup=this.getSetup();
        
            // keys
            
        forward=input.isKeyDown('w');
        reverse=input.isKeyDown('s');
        drifting=(input.isKeyDown('a')||input.isKeyDown('d'));
        brake=input.isKeyDown('q');
        jump=input.isKeyDown(' ');
        
            // turning
            
        turnAdd=0;

        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
        }
        
            // run the kart
        
        fire=input.mouseButtonFlags[0];  
        this.moveKart(turnAdd,forward,reverse,drifting,brake,fire,jump,true);
        
            // update the sound
        
        rate=this.MIN_ENGINE_SOUND_RATE+(((Math.abs(this.movement.z)/this.forwardMaxSpeed)*this.ADD_ENGINE_SOUND_RATE)+this.engineSoundRateAirIncrease);
        if (this.isStandingOnFloor()) {
            if (this.engineSoundRateAirIncrease>=0) {
                this.engineSoundRateAirIncrease-=0.01;
                if (this.engineSoundRateAirIncrease<0) this.engineSoundRateAirIncrease=0;
            }
        }
        else {
            if (this.engineSoundRateAirIncrease<=this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE) {
                this.engineSoundRateAirIncrease+=0.01;
                if (this.engineSoundRateAirIncrease>this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE) this.engineSoundRateAirIncrease=this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE;
            }
        }
        
        this.core.soundList.changeRate(this.engineSoundPlayIdx,rate);
        
            // calculate place
            
        this.calculatePlaces();
        
            // update the UI
            
        textLap=(this.lap===-1)?1:(this.lap+1);
            
        this.core.interface.updateText('place',(this.place+1));
        this.core.interface.updateText('lap',(textLap+'/3'));
        this.core.interface.updateText('speed',this.movement.z);      // testing
        
        if ((this.place!==this.previousPlace) || (this.lap!==this.previousLap)) {
            if ((this.previousPlace!==-1) && (this.previousLap!==-1)) this.core.interface.pulseElement('lap_background',500,10);
            this.previousPlace=this.place;
            this.previousLap=this.lap;
        }
    }
    
        //
        // drawing overrides
        //
    
    animatedBoneSetup()
    {
    //    this.tempQuat.setFromVectorAndAngle(0,1,0,this.getPeriodicLinear(5000,360));
    //    this.modelEntityAlter.setBoneRotationQuaternion('captain_chest_cover',this.tempQuat);
    }

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
            this.getRigidBodyAngle(this.rigidAngle,this.MAX_RIGID_DROP,this.MAX_RIGID_ANGLE);

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
            
        speed=this.RIGID_TRANSFORM_SPEED_PER_TICK*(timestamp-this.lastDrawTick);
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
