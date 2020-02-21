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
        let n,weaponBlock,weapon;
        
            // we attach a current weapon idle/fire animation
            // to player so we can change animations based on
            // choosen weapons
        
        entity.forceAnimationUpdate=false;
        entity.currentWeaponIdleAnimation=null;
        entity.currentWeaponRunAnimation=null;
        
            // setup the weapons
        
        this.defaultCarouselWeaponIdx=-1;
        
        for (n=0;n!==this.block.weapons.length;n++) {
            weaponBlock=this.block.weapons[n];
            
                // add the weapon in the correct array
                
            if (weaponBlock.inCarousel) {
                weapon=this.addEntity(entity,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.carouselWeapons.push(weapon);
                if ((weaponBlock.default) && (this.defaultCarouselWeaponIdx===-1)) this.defaultCarouselWeaponIdx=n;
            }
            else {
                weapon=this.addEntity(entity,weaponBlock.json,weaponBlock.name,new PointClass(0,0,0),new PointClass(0,0,0),null,true,true);
                this.extraWeapons.push(weapon);
            }
            
                // now pass firing animations to weapon
                
            weapon.parentIdleAnimation=weaponBlock.parentIdleAnimation;
            weapon.parentRunAnimation=weaponBlock.parentRunAnimation;
            weapon.parentFireIdleAnimation=weaponBlock.parentFireIdleAnimation;
            weapon.parentFireRunAnimation=weaponBlock.parentFireRunAnimation;
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
        let n,weapon,meshName;

        for (n=0;n!==this.carouselWeapons.length;n++) {
            weapon=this.carouselWeapons[n];
            
            if (n===this.currentCarouselWeaponIdx) {
                weapon.show=true;
                
                entity.forceAnimationUpdate=true;
                entity.currentWeaponIdleAnimation=weapon.parentIdleAnimation;     // move the current animation so weapon holder can use it
                entity.currentWeaponRunAnimation=weapon.parentRunAnimation;
                
                for (meshName of this.block.weapons[n].meshes) {
                    entity.modelEntityAlter.show(meshName,true);
                }
            }
            else {
                weapon.show=false;
                
                for (meshName of this.block.weapons[n].meshes) {
                    entity.modelEntityAlter.show(meshName,false);
                }
            }
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

