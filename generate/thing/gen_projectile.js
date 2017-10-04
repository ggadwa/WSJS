import ProjectileClass from '../../code/entities/projectile.js';
import GenModelProjectileClass from '../../generate/model/gen_model_projectile.js';
import GenSoundClass from '../../generate/sound/gen_sound.js';
import genRandom from '../../generate/utility/random.js';

//
// generate projectile class
//

export default class GenProjectileClass
{
    constructor(view,map,sound,modelList)
    {
        this.view=view;
        this.map=map;
        this.sound=sound;
        this.modelList=modelList;       // todo -- DELETE THIS temporary until shaders are global
        
        Object.seal(this);
    }

    generate(ownerName,isPlayer)
    {
        let projectile,genModel,model;
        let genSound;
        
            // the model
            
        genModel=new GenModelProjectileClass(this.view);
        model=genModel.generate(('projectile_'+ownerName),1.0,false);
        this.modelList.addModel(model);
        
            // sound generator
            
        genSound=new GenSoundClass(this.sound.getAudioContext());
            
            // the projectile
            
        projectile=new ProjectileClass(this.view,this.map,this.sound,model);
        
        projectile.setLifeTick(10000);
        projectile.setFireSoundBuffer(genSound.generate(genSound.TYPE_GUN_FIRE,false));
        projectile.setHitSoundBuffer(genSound.generate(genSound.TYPE_EXPLOSION,false));
        projectile.setDamage((isPlayer?25:15),0,0);
        
            // enemy settings
            
        if (!isPlayer) {
            projectile.setSpeed(genRandom.randomInt(150,150));
            
                // possible lob or reflect
                
            if (genRandom.randomPercentage(0.5)) {
                projectile.setLob(-genRandom.randomInt(150,150));
                projectile.setNoGravity(false);
            }
            
            if (genRandom.randomPercentage(0.5)) {
                projectile.setReflect(true);
            }
            
            if (genRandom.randomPercentage(0.5)) {
                projectile.setBounce(true,0.95);
            }
        }
        
            // player settings
            
        else {
            projectile.setSpeed(400);
        }
        
        return(projectile);
    }
    
}
