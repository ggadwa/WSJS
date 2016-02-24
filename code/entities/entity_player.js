"use strict";

//
// player entity class
//

function EntityPlayerObject(name,position,angle,radius,high,model)
{
    this.weaponCurrentIndex=-1;
    this.weapons=[];
    
    
        // supergumba -- ALL AWFUL REPLACE WHEN WE HAVE CLASSES
        // change all baseEntity. to this.
        
    this.baseEntity=new EntityObject(name,position,angle,radius,high,model);
    
    this.getName=function()
    {
        return(this.baseEntity.name);
    };
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
    this.getRadius=function()
    {
        return(this.baseEntity.radius);
    };
    
    this.getHigh=function()
    {
        return(this.baseEntity.high);
    };
    this.setId=function(id)
    {
        this.baseEntity.setId(id);
    };
    
    this.getId=function()
    {
        return(this.baseEntity.getId());
    };
    
    this.markAsDelete=function()
    {
        this.baseEntity.markedForDeletion=true;
    };
    
    this.isMarkedForDeletion=function()
    {
        return(this.baseEntity.isMarkedForDeletion());
    };
    this.clearTouchEntity=function()
    {
        this.baseEntity.touchEntity=null;
    };
    
    this.setTouchEntity=function(entity)
    {
        this.baseEntity.touchEntity=entity;
    };
    
    this.getTouchEntity=function()
    {
        return(this.baseEntity.touchEntity);
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
        var bump;
        
            // input turning and looking
            
        this.baseEntity.turn(this.baseEntity.turnSpeed);
        this.baseEntity.look(this.baseEntity.lookSpeed);
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up
            
        bump=!this.baseEntity.isFalling();
        
            // movement
            
        if (this.baseEntity.forwardSpeed!==0.0) this.baseEntity.moveComplex(map,entityList,this.baseEntity.forwardSpeed,0.0,bump,PLAYER_FLY,PLAYER_CLIP_WALLS);
        if (this.baseEntity.sideSpeed!==0.0) this.baseEntity.moveComplex(map,entityList,this.baseEntity.sideSpeed,90.0,bump,PLAYER_FLY,PLAYER_CLIP_WALLS);
        
        if (this.baseEntity.verticalSpeed!==0.0) this.baseEntity.moveDirect(0.0,this.baseEntity.verticalSpeed,0.0);
        
            // falling
        
        if (!PLAYER_FLY) this.baseEntity.fall();
    };
    
}
