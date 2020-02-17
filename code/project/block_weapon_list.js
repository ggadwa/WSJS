import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockWeaponsListClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.carouselWeapons=[];        // weapons in the carousel
        this.extraWeapons=[];           // any other weapon
        
        this.currentCarouselWeaponIdx=0;
        this.defaultCarouselWeaponIdx=0;
    }
        
    initialize(entity)
    {
        let n,weapon;
        
            // setup the weapons
        
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
        
            // variables that all blocks need access to, added
            // by fps_control but put here in case that block isn't used
            
        entity.firePrimary=false;
        entity.fireSecondary=false;
        entity.fireTertiary=false;
        
        entity.weaponNext=false;
        entity.weaponPrevious=false;
        entity.weaponSwitchNumber=-1;
        
        return(true);
    }
    
    release(entity)
    {
        let n;
        
        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].release();
        }
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].release();
        }
    }
    
    showCarouselWeapon(entity)
    {
        let n;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].show=(n===this.currentCarouselWeaponIdx);
        }
    }
    
    ready(entity)
    {
        let n;
        
        this.currentCarouselWeaponIdx=this.defaultCarouselWeaponIdx;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            this.carouselWeapons[n].ready();
        }
        
        for (n=0;n!==this.extraWeapons.length;n++) {
            this.extraWeapons[n].ready();
        }
        
        this.showCarouselWeapon(entity);
    }
    
    run(entity)
    {
            // change weapons
        
        if (entity.weaponPrevious) {
            if (this.currentCarouselWeaponIdx>0) {
                this.currentCarouselWeaponIdx--;
                this.showCarouselWeapon(entity);
            }
            entity.weaponPrevious=false;
        }

        if (entity.weaponNext) {
            if (this.currentCarouselWeaponIdx<(this.carouselWeapons.length-1)) {
                this.currentCarouselWeaponIdx++;
                this.showCarouselWeapon(entity);
            }
            entity.weaponNext=false;
        }
        
        if (entity.weaponSwitchNumber!==-1) {
            if (entity.weaponSwitchNumber<this.carouselWeapons.length) {
                this.currentCarouselWeaponIdx=entity.weaponSwitchNumber;
                this.showCarouselWeapon(entity);
            }
            entity.weaponSwitchNumber=-1;
        }
    }
}

