import ModelClass from '../model/model.js';

//
// core model list class
//

export default class ModelListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.models=new Map();

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
        //
        // get a model
        //
        
    get(name)
    {
        return(this.models.get(name));
    }
    
        //
        // loading
        //
      
    addEntityProjectileToModelSet(modelSet,jsonProjectileItem)
    {
        let jsonProjectile;
        
        if ((jsonProjectileItem===undefined) || (jsonProjectileItem===null)) return;
        if ((jsonProjectileItem.projectileJson===undefined) || (jsonProjectileItem.projectileJson===null)) return;
        
        jsonProjectile=this.core.game.getCachedJsonEntity(jsonProjectileItem.projectileJson);
        if (jsonProjectile.setup.model!==null) modelSet.add(jsonProjectile.setup.model);
    }
    
    addEntityWeaponToModelSet(modelSet,jsonWeaponItem)
    {
        let jsonWeapon;
        
        jsonWeapon=this.core.game.getCachedJsonEntity(jsonWeaponItem.json);
        if (jsonWeapon.setup.model!==null) modelSet.add(jsonWeapon.setup.model);

        this.addEntityProjectileToModelSet(modelSet,jsonWeapon.config.primary);
        this.addEntityProjectileToModelSet(modelSet,jsonWeapon.config.secondary);
        this.addEntityProjectileToModelSet(modelSet,jsonWeapon.config.tertiary);
    }
    
    addEntityToModelSet(modelSet,entity)
    {
        let jsonEntity;
        let jsonWeaponItem;
        
            // the entity model itself
            
        jsonEntity=this.core.game.getCachedJsonEntity(entity.jsonName);
        if (jsonEntity.setup.model!==null) modelSet.add(jsonEntity.setup.model);

            // fps/kart type weapons
            
        if (jsonEntity.weapons!==undefined) {
            for (jsonWeaponItem of jsonEntity.weapons) {
                this.addEntityWeaponToModelSet(modelSet,jsonWeaponItem);
            }
        }
        
            // monster projectiles
            
        if (jsonEntity.config!==undefined) this.addEntityProjectileToModelSet(modelSet,jsonEntity.config);
    }
        
    async loadAllModels()
    {
        let entity;
        let name,model,modelSet;
        let success,promises;
        
            // look through all the entities and get
            // a Set of models (to eliminate duplicates)
        
        modelSet=new Set();
        
        for (entity of this.core.map.entityList.entities) {
            this.addEntityToModelSet(modelSet,entity);
        }
        
            // now build into a promise list
            
        promises=[];
        
        for (name of modelSet) {
            model=new ModelClass(this.core,{"name":name});
            model.initialize();
            promises.push(model.load());
            
            this.models.set(name,model);
        }

            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );

        return(success);
    }
    
}
