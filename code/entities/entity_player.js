"use strict";

//
// player entity class
//

class EntityPlayerClass extends EntityClass
{
    constructor(name,position,angle,radius,high,maxHealth,model)
    {
        super(name,position,angle,radius,high,maxHealth,model);
        
        this.turnSpeed=0;
        this.lookSpeed=0;
        this.forwardSpeed=0;
        this.sideSpeed=0;
        this.verticalSpeed=0;

        this.weaponCurrentIndex=-1;
        this.weaponFired=false;
        this.weapons=[];
        
        Object.seal(this);
    }
    
        //
        // looking and turning
        //
        
    setTurnSpeed(speed)
    {
        this.turnSpeed=speed;
    }
    
    setLookSpeed(speed)
    {
        this.lookSpeed=speed;
    }
    
    setForwardSpeed(speed)
    {
        this.forwardSpeed=speed;
    }
    
    setSideSpeed(speed)
    {
        this.sideSpeed=speed;
    }
    
    setVerticalSpeed(speed)
    {
        this.verticalSpeed=speed;
    }
    
        //
        // jump
        //
        
    startJump()
    {
        if (this.fallSpeed===0) this.fallSpeed=-300;
    }
    
        //
        // weapons
        //
        
    addWeapon(weapon)
    {
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
    
    fireCurrentWeapon(view,entityList)
    {
        this.weaponFired=true;
    }
    
        //
        // run player
        //
    
    run(view,map,entityList)
    {
        var bump,weapon;
        
            // fire any weapons that were triggered
            
        if (this.weaponFired) {
            this.weaponFired=false;
            
            weapon=this.getCurrentWeapon();
            if (weapon!==null) weapon.fire(view,entityList,this);
        }
        
            // input turning and looking
            
        super.turn(this.turnSpeed);
        super.look(this.lookSpeed);
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up
            
        bump=!super.isFalling();
        
            // movement
            
        if (this.forwardSpeed!==0.0) super.moveComplex(map,entityList,this.forwardSpeed,0.0,bump,config.PLAYER_FLY,config.PLAYER_CLIP_WALLS);
        if (this.sideSpeed!==0.0) super.moveComplex(map,entityList,this.sideSpeed,90.0,bump,config.PLAYER_FLY,config.PLAYER_CLIP_WALLS);
        
        if (this.verticalSpeed!==0.0) super.moveDirect(0.0,this.verticalSpeed,0.0);
        
            // falling
        
        if (!config.PLAYER_FLY) super.fall(map);
    }
    
}
