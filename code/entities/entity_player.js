"use strict";

//
// player entity class
//

function EntityPlayerObject(position,angle,radius,high,model)
{
    this.weaponCurrentIndex=-1;
    this.weapons=[];
    
    
        // supergumba -- ALL AWFUL REPLACE WHEN WE HAVE CLASSES
        // change all baseEntity. to this.
        
    this.baseEntity=new EntityObject(position,angle,radius,high,model);
    
    this.getModel=function()
    {
        return(this.baseEntity.getModel());
    };
    
    this.getPosition=function()
    {
        return(this.baseEntity.getPosition());
    };
    
    this.getAngle=function()
    {
        return(this.baseEntity.getAngle());
    };
    
    this.markAsDelete=function()
    {
        this.baseEntity.markedForDeletion=true;
    };
    
    this.isMarkedForDeletion=function()
    {
        return(this.baseEntity.isMarkedForDeletion());
    };

    this.inFrustum=function(view)
    {
        return(this.baseEntity.inFrustum(view));
    };
    
        // supergumba -- end of replace stuff
        // supergumba -- local code
        //
        
    this.setTurnSpeed=function(speed)
    {
        this.baseEntity.turnSpeed=speed;
    };
    
    this.setLookSpeed=function(speed)
    {
        this.baseEntity.lookSpeed=speed;
    };
    
    this.setForwardSpeed=function(speed)
    {
        this.baseEntity.forwardSpeed=speed;
    };
    
    this.setSideSpeed=function(speed)
    {
        this.baseEntity.sideSpeed=speed;
    };
    
    this.setVerticalSpeed=function(speed)
    {
        this.baseEntity.verticalSpeed=speed;
    };
    
        //
        // jump
        //
        
    this.startJump=function()
    {
        if (this.baseEntity.fallSpeed===0) this.baseEntity.fallSpeed=-300;
    };
    
        //
        // weapons
        //
        
    this.addWeapon=function(weapon)
    {
        this.weapons.push(weapon);
    };
    
    this.setCurrentWeaponIndex=function(index)
    {
        this.weaponCurrentIndex=index;
    };
    
    this.getCurrentWeapon=function()
    {
        if (this.weaponCurrentIndex===-1) return(null);
        return(this.weapons[this.weaponCurrentIndex]);
    };
    
    this.fireCurrentWeapon=function(view,entityList)
    {
        var weapon=this.getCurrentWeapon();
        if (weapon!==null) weapon.fire(view,entityList,this);
    };
    
        //
        // run player
        //
    
    this.run=function(view,map,entityList)
    {
            // input movement
            
        this.baseEntity.turn(this.baseEntity.turnSpeed);
        this.baseEntity.look(this.baseEntity.lookSpeed);
        
        if (this.baseEntity.forwardSpeed!==0.0) this.baseEntity.moveComplex(map,this.baseEntity.forwardSpeed,0.0,PLAYER_FLY,PLAYER_CLIP_WALLS);
        if (this.baseEntity.sideSpeed!==0.0) this.baseEntity.moveComplex(map,this.baseEntity.sideSpeed,90.0,PLAYER_FLY,PLAYER_CLIP_WALLS);
        
        if (this.baseEntity.verticalSpeed!==0.0) this.baseEntity.moveDirect(0.0,this.baseEntity.verticalSpeed,0.0);
        
            // falling
        
        if (!PLAYER_FLY) this.baseEntity.fall();
    };
    
}
