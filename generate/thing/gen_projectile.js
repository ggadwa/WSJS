import ProjectileClass from '../../code/entities/projectile.js';
import genRandom from '../../generate/utility/random.js';

//
// generate projectile class
//

export default class GenProjectileClass
{
    constructor(view,map,sound,modelList,genSound)
    {
        this.view=view;
        this.map=map;
        this.sound=sound;
        this.modelList=modelList;
        this.genSound=genSound;
        
        Object.seal(this);
    }

    generate(entityAI,isPlayer)
    {
        let projectile=new ProjectileClass(this.view,this.map,this.sound,this.modelList.getModel('projectile_0'));
        
        projectile.setLifeTick(10000);
        projectile.setFireSoundBuffer(this.genSound.generate(this.genSound.TYPE_GUN_FIRE,false));
        projectile.setHitSoundBuffer(this.genSound.generate(this.genSound.TYPE_EXPLOSION,false));
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
