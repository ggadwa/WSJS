import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import EntityClass from '../project/entity.js';

export default class EntityKartPlayerClass extends EntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
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
        this.MAX_STARS=10;
        this.MAX_PROJECTILE_COUNT=3;
        this.MOUSE_MAX_LOOK_SPEED=8;
        this.MAX_LOOK_ANGLE=80.0;
        this.SMOKE_COOL_DOWN_COUNT=2;
        
        this.fighter=true;
        
        this.inDrift=false;
        this.smokeCoolDownCount=0;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
    
        this.hitMidpoint=false;
    
        this.starCount=0;

        this.lastProjectileFireTick=0;
    
        this.lastDrawTick=0;
    
        this.lap=0;
        this.previousLap=-1;
        this.place=0;
        this.previousPlace=-1;
        this.placeNodeIdx=0;
        this.placeNodeDistance=0;
        this.placeLap=0;
        
            // pre-allocate
            
        this.movement=new PointClass(0,0,0);
        this.rotMovement=new PointClass(0,0,0);
        this.driftMovement=new PointClass(0,0,0);
        this.smokePosition=new PointClass(0,0,0);
        this.firePosition=new PointClass(0,0,0);
        
        this.rigidAngle=new PointClass(0,0,0);
        this.rigidGotoAngle=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
            // some static nodes
            
        this.goalNodeIdx=this.findKeyNodeIndex('goal');
        this.endNodeIdx=this.findKeyNodeIndex('end');

            
            
        this.MIN_ENGINE_SOUND_RATE=0.5;
        this.ADD_ENGINE_SOUND_RATE=0.8;
        this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE=0.2;

            // settings
            
        this.filter='player';          // filters are used when searching for entities
        
            // kart settings
            
        this.maxTurnSpeed=1.5;
        this.driftMaxTurnSpeed=2.5;
        this.forwardAcceleration=8;
        this.forwardDeceleration=25;
        this.forwardMaxSpeed=2000;
        this.reverseAcceleration=5;
        this.reverseDeceleration=35;
        this.reverseMaxSpeed=1500;
        this.starSpeedIncrease=50;
        this.forwardBrakeDeceleration=50;
        this.reverseBrakeDeceleration=50;
        this.jumpHeight=1000;
        this.bounceWaitCount=20;
        this.spinOutSpeed=6;
        this.driftDecelerationFactor=0.99;
        this.fireWaitTick=1000;
        this.maxMines=5;
        this.mineRechargeTick=2000;
        this.weight=500;
        
        
        
        for (n=0;n!==this.json.weapons.length;n++) {
            weaponBlock=this.json.weapons[n];

             weaponEntity=this.addEntity(this,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
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
        
        this.inDrift=false;
        this.bounceCount=0;
        this.spinOutCount=0;
        this.lastDriftSoundPlayIdx=-1;
        
        this.starCount=0;
        
        this.mineCount=this.maxMines;
        this.lastProjectileFireTick=0;
        this.lastMineTick=0;
        
        this.lap=-1;
        this.hitMidpoint=true;      // first lap starts the laps
        
        this.lastDrawTick=this.getTimestamp();
        this.rigidGotoAngle.setFromValues(0,0,0);
        
        this.currentWeaponIdx=0;
        
        this.resetStars();
        
        this.engineSoundRateAirIncrease=0;
        this.engineSoundPlayIdx=this.playGlobal('engine',this.MIN_ENGINE_SOUND_RATE,true);
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

        this.addEffect(this,'effect_tire_smoke',this.smokePosition,null,true);
    }
    
        //
        // star UI
        //
        
    resetStars()
    {
        this.starCount=0;
        this.core.interface.setCount('stars',this.starCount);
    }
    
    addStar()
    {
        if ((this.starCount+1)===this.MAX_STARS) return;
        
        this.starCount++;
        this.core.interface.setCount('stars',this.starCount);
    }
    
    removeStar()
    {
        if (this.starCount===0) return;
        
        this.starCount--;
        this.core.interface.setCount('stars',this.starCount);
    }
    
    
        //
        // drifts, bounces, spins
        //
        
    driftStart(timestamp)
    {
        this.inDrift=true;
        this.driftMovement.setFromPoint(this.rotMovement);
        this.lastDriftSoundPlayIdx=this.playSound('skid',1.0,false);
    }
    
    driftEnd()
    {
        if (!this.inDrift) return;
        
        this.inDrift=false;

        if (this.lastDriftSoundPlayIdx!==-1) {
            this.stopSound(this.lastDriftSoundPlayIdx);
            this.lastDriftSoundPlayIdx=-1;
        }
    }

    bounceStart(crashSoundRate)
    {
            // turn on bounce
            
        this.bounceCount=this.bounceWaitCount;
        if (this.spinOutCount===0) this.spinOutCount=360;
        this.playSound('crash',crashSoundRate,false);
        
            // all bounces cost a star
            
        this.removeStar();
        
            // bounces cancel drifts
            
        this.driftEnd();
    }
    
    spinStart(crashSoundRate)
    {
        this.spinOutCount=360;
        this.playSound('crash',crashSoundRate,false);
    }

        //
        // kart mainline
        //
    
    moveKart(turnAdd,moveForward,moveReverse,drifting,brake,fire,jump,isPlayer)
    {
        let maxTurnSpeed,speed;
        let cube,weapon;
        let timestamp=this.getTimestamp();
        
            // start spinning if you touch a monster
            
        if (this.spinOutCount===0) {
            if (this.touchEntity!==null) {
                if (this.touchEntity.name.startsWith('monster_')) {
                    this.spinStart(1.5);
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
        
            // push if we hit another kart
            // we loose a star for this and bounce back
            
        if (this.touchEntity!==null) {
            if (this.touchEntity.name.startsWith('kart_')) {
                this.bounceStart(2.0);
            }
        }   
        
            // firing
        
        if (fire) {
            if (this.currentWeaponIdx!==-1) {
                this.weapons[this.currentWeaponIdx].firePrimary();
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
                    speed=this.forwardMaxSpeed+(this.starSpeedIncrease*this.starCount);
                    this.movement.moveZWithAcceleration(moveForward,moveReverse,this.forwardAcceleration,this.forwardDeceleration,speed,this.reverseAcceleration,this.reverseDeceleration,this.reverseMaxSpeed);
                }
            }

            this.rotMovement.setFromPoint(this.movement);
            if (this.core.game.developer.playerFly) {
                this.rotMovement.y=0;       // only Y movement comes from X angle rotation
                this.rotMovement.rotateX(null,this.angle.x);
                this.rotMovement.y*=0.5;
            }
            this.rotMovement.rotateY(null,this.angle.y);
        }
                
            // if we are bouncing, reverse movement
            
        if (this.bounceCount!==0) this.rotMovement.scale(-1);
        
            // move around the map
        
        if ((!this.core.game.developer.playerNoClip) || (!isPlayer)) {
            this.movement.y=this.moveInMapY(this.rotMovement,1.0,false);
            this.moveInMapXZ(this.rotMovement,true,true);
        }
        else {
            this.position.addPoint(this.rotMovement);
        }
        
            // bounce and spin out if hit wall
            // we loose a star for this
        
        if (this.bounceCount!==0) {
            this.bounceCount--;
        }
        else {
            if ((this.collideWallMeshIdx!==-1) || (this.slideWallMeshIdx!==-1)) {
                this.bounceStart(1.0);
            }
        }

            // smoke if drifting, spinning out, or turning
            // without moving
            
        if ((this.inDrift) || (this.spinOutCount!==0) || ((turnAdd!==0) && (this.movement.z===0))) {
            if (this.smokeCoolDownCount===0) {
                this.smokeCoolDownCount=this.SMOKE_COOL_DOWN_COUNT;
                this.createSmoke(135);
                this.createSmoke(225);
            }
            else {
                this.smokeCoolDownCount--;
            }
        }
        
            // determine any cube hits
            
        cube=this.findCubeContainingEntity();
        if (cube!==null) {
            if (cube.key==='goal') {
                if (this.hitMidpoint) {
                    this.hitMidpoint=false;
                    this.lap++;
                }
            }
            else {
                if (cube.key==='mid') {
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
            if (!entity.name.startsWith('kart_')) continue;
            
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
        let x,y,turnAdd,lookAdd,fire;
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

        x=this.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
        }
        
            // looking (mostly for developer flying)
        
        if (this.core.game.developer.playerFly) {    
            y=this.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.MOUSE_MAX_LOOK_SPEED) lookAdd=this.MOUSE_MAX_LOOK_SPEED*Math.sign(lookAdd);

                this.angle.x+=lookAdd;
                if (this.angle.x<-this.MAX_LOOK_ANGLE) this.angle.x=-this.MAX_LOOK_ANGLE;
                if (this.angle.x>=this.MAX_LOOK_ANGLE) this.angle.x=this.MAX_LOOK_ANGLE;
            }
        }
        else {
            this.angle.x=0;
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
        
        this.changeSoundRate(this.engineSoundPlayIdx,rate);
        
            // calculate place
            
        this.calculatePlaces();
        
            // update the UI
            
        textLap=(this.lap===-1)?1:(this.lap+1);
            
        this.updateInterfaceText('place',(this.place+1));
        this.updateInterfaceText('lap',(textLap+'/3'));
        this.updateInterfaceText('speed',this.movement.z);      // testing
        
        if ((this.place!==this.previousPlace) || (this.lap!==this.previousLap)) {
            if ((this.previousPlace!==-1) && (this.previousLap!==-1)) this.pulseInterfaceElement('lap_background',500,10);
            this.previousPlace=this.place;
            this.previousLap=this.lap;
        }
        
        //let cube=this.findCubeContainingEntity();
        //if (cube!==null) console.info('in cube='+cube.key);
    }
    
        //
        // drawing overrides
        //
    
    animatedBoneSetup()
    {
    //    this.tempQuat.setFromVectorAndAngle(0,1,0,this.getPeriodicLinear(5000,360));
    //    this.setModelBoneRotationQuaternion('captain_chest_cover',this.tempQuat);
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
            
        this.setModelDrawPosition(this.position,this.drawAngle,this.scale,false);
        return(true);
    }
}
