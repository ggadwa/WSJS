import config from '../../code/main/config.js';
import EntityClass from '../../code/entities/entity.js';

//
// player entity class
//

export default class EntityPlayerClass extends EntityClass
{
    constructor(view,map,sound,name,position,angle,maxHealth,model)
    {
        super(view,map,sound,name,position,angle,maxHealth,model);
        
            // entity setup
            
        this.movementForwardMaxSpeed=175;
        this.movementForwardAcceleration=10;
        this.movementForwardDeceleration=20;
        this.movementSideMaxSpeed=125;
        this.movementSideAcceleration=20;
        this.movementSideDeceleration=40;
        
            // local variables
        
        this.turnSpeed=0;
        this.maxTurnSpeed=8.0;
        
        this.lookSpeed=0;
        this.maxLookSpeed=8.0;
        
        this.jumpHeight=300;
        this.jumpWaterHeight=400;
        
        this.lastInLiquid=false;

        this.weaponFiredTrigger=false;
        this.weaponAltFiredTrigger=false;
        
        this.weaponCurrentIndex=-1;
        this.weapons=[];
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        super.initialize();
    }
    
    release()
    {
        let weapon;
        
        super.release();
        
        for (weapon of weapons)
        {
            weapon.release();
        }
    }
    
        //
        // looking and turning
        //
        
    setTurnSpeed(speed)
    {
        speed*=config.MOUSE_TURN_SENSITIVITY;
        if (Math.abs(speed)>this.maxTurnSpeed) speed=(speed>0)?this.maxTurnSpeed:-this.maxTurnSpeed;
        
        this.turnSpeed=speed;
    }
    
    setLookSpeed(speed)
    {
        speed*=config.MOUSE_LOOK_SENSITIVITY;
        if (Math.abs(speed)>this.maxLookSpeed) speed=(speed>0)?this.maxLookSpeed:-this.maxLookSpeed;
        
        this.lookSpeed=speed;
    }
        
        //
        // jump
        //
        
    startJump()
    {
            // can't jump if falling or in liquid
            
        if ((this.isStandingOnFloor()) && (!this.isInLiquid())) this.movementJump(this.jumpHeight);
    }
    
        //
        // weapons
        //
        
    addWeapon(weapon)
    {
        weapon.initialize();
        this.weapons.push(weapon);
    }
    
    setCurrentWeaponIndex(index)
    {
        this.weaponCurrentIndex=index;
    }
    
    getCurrentWeapon()
    {
        if (this.weaponCurrentIndex===-1) return(null);
        return(this.weapons[this.weaponCurrentIndex]);
    }
    
    previousWeapon()
    {
        this.weaponCurrentIndex--;
        if (this.weaponCurrentIndex<0) this.weaponCurrentIndex=this.weapons.length-1;
    }
    
    nextWeapon()
    {
        this.weaponCurrentIndex++;
        if (this.weaponCurrentIndex>=this.weapons.length) this.weaponCurrentIndex=0;
    }
    
    fireCurrentWeapon()
    {
        this.weaponFiredTrigger=true;
    }
    
    fireCurrentWeaponAlt()
    {
        this.weaponAltFiredTrigger=true;
    }
    
    getCurrentWeaponDisplayString()         // todo -- probably temporary
    {
        return(this.weapons[this.weaponCurrentIndex].getWeaponDisplayString());
    }
    
        //
        // death override
        //
        
    die()
    {
        console.log('Dead');
    }
    
        //
        // run player
        //
    
    run()
    {
        let bump,weapon;
        let noGravity;
        
            // fire any weapons that were triggered
            
        if (this.weaponFiredTrigger) {
            this.weaponFiredTrigger=false;
            
            weapon=this.getCurrentWeapon();
            if (weapon!==null) weapon.fire(this);
        }
        
        if (this.weaponAltFiredTrigger) {
            this.weaponAltFiredTrigger=false;
            
            weapon=this.getCurrentWeapon();
            if (weapon!==null) weapon.altFire(this);
        }
        
            // input turning and looking
            
        this.turn(this.turnSpeed);
        this.look(this.lookSpeed);
        
            // determine if we've passed out of a liquid
            // if we are, auto-jump to get out of liquid
            
            // colliding while moving can depend on being on
            // precise ticks so we count hits within a certain
            // time frame
        
        if (this.isInLiquid()) {
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.angle.x>0)) {
                this.gravity=0;
                this.movement.y-=this.jumpWaterHeight;
            }
            
            this.lastInLiquid=false;
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up
            
            // the only exception is swimming, which always
            // bumps over small obstacles
            
        bump=(this.isStandingOnFloor())||(this.lastInLiquid);
        
            // movement
            
        noGravity=((config.PLAYER_FLY) || (this.lastInLiquid));
        this.move(bump,true,noGravity,config.PLAYER_CLIP_WALLS);
    }
    
}
