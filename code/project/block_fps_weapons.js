import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockFPSWeaponsClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.carouselWeapons=[];        // weapons in the carousel
        this.extraWeapons=[];           // any other weapon
        
        this.currentCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
        
        this.lastWheelClick=0;
    }
        
    initialize(entity)
    {
        let n,weapon;
        
        this.defaultCarouselWeaponIdx=-1;
        
        for (n=0;n!==this.block.weapons.length;n++) {
            weapon=this.block.weapons[n];
            
            if (weapon.inCarousel) {
                this.carouselWeapons.push(this.addEntity(entity,weapon.json,weapon.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true));
                if ((weapon.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                this.extraWeapons.push(this.addEntity(entity,weapon.json,weapon.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true));
            }
        }
        
        return(true);
    }
    
    resetWeapons(entity)
    {
        let n,weapon;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            weapon=this.carouselWeapons[n];
            
            weapon.ready();
            weapon.show=(n===this.currentCarouselWeaponIdx);
        }
        
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].ready();
        }
        
        //this.blockData.set('currentWeapon',(this.currentWeaponIdx===-1)?nullthis.weapons[0]);
    }
    
    ready(entity)
    {
        this.lastWheelClick=0;
        
        this.currentCarouselWeaponIdx=this.defaultCarouselWeaponIdx;
        this.resetWeapons(entity);
    }
    
    run(entity)
    {
        let n,mouseWheelClick;
        let weapon;

        /*
        fireWeapon=this.isMouseButtonDown(0)||this.isTouchStickRightClick();

        if (fireWeapon) {
            switch (this.currentWeapon) {
                case this.WEAPON_BERETTA:
                    this.beretta.receiveMessage("fire",null);
                    //this.beretta.fire(this.position,this.angle,this.eyeOffset);
                    break;
                case this.WEAPON_M16:
                    this.m16.receiveMessage("fire",null);
                    //this.m16.fire(this.position,this.angle,this.eyeOffset);
                    break;
            }
        }
        
            // grenade throw
        
        if (this.isMouseButtonDown(2)) this.grenade.receiveMessage("fire",null);
        //if (this.isMouseButtonDown(2)) this.grenade.fire(this.position,this.angle,this.eyeOffset);
*/
            // change weapons with mouse wheel
        
        mouseWheelClick=this.core.input.mouseWheelRead();
        
        if ((mouseWheelClick<0) && (this.lastWheelClick===0)) {
            if (this.currentCarouselWeaponIdx>0) {
                this.currentCarouselWeaponIdx--;
                this.resetWeapons(entity);
            }
        }

        if ((mouseWheelClick>0) && (this.lastWheelClick===0)) {
            if (this.currentCarouselWeaponIdx<this.carouselWeapons.length-1) {
                this.currentCarouselWeaponIdx++;
                this.resetWeapons(entity);
            }
        }
        
        this.lastWheelClick=mouseWheelClick;
        
            // change weapons by number
            
        for (n=0;n!==this.carouselWeapons.length;n++) {
            if (this.core.input.isKeyDown(String.fromCharCode(49+n))) {
                this.currentCarouselWeaponIdx=n;
                this.resetWeapons(entity);
                break;
            }
        }
    }
}

