import ParticleClass from '../../code/particle/particle.js';

//
// particle utility class
//

export default class ParticleUtilityClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // some particle types
        //
        
    static createExplosionParticles(map,centerPt)
    {
        let particle;
        
            // red particles
            
        particle=map.particleList.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(100);
        particle.setRadius(300,2000);
        particle.setMovement(4000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(map.particleList.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.0,0.0,0.7,0.0,0.0);
        particle.setLifeTime(1500);
        
            // the light
            
        particle.light.setPosition(centerPt.x,centerPt.y,centerPt.z);
        particle.light.setColor(1.0,0.2,0.0); 
        particle.setLightMaxItensity(5000);

            // orange particles
            
        particle=map.particleList.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(80);
        particle.setRadius(300,1500);
        particle.setMovement(2500.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(map.particleList.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.5,0.0,1.0,0.5,0.0);
        particle.setLifeTime(1500);
        
        particle.setLightMaxItensity(0);
        
            // yellow particles
            
        particle=map.particleList.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(60);
        particle.setRadius(300,1000);
        particle.setMovement(1000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(map.particleList.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,1.0,0.0,0.7,0.7,0.0);
        particle.setLifeTime(1500);
        
        particle.setLightMaxItensity(0);
    }
    
    static createDebugParticles(map,centerPt,count)
    {
        let particle;
        
        particle=map.particleList.getFree();
        if (particle===null) return(null);
        
        particle.setCount(count);
        particle.setRadius(100,100);
        particle.setMovement(1.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(map.particleList.particleBitmap);
        particle.setAlpha(1.0,1.0);
        particle.setColor(0.0,1.0,1.0,0.0,1.0,1.0);
        particle.setLifeTime(0);
        particle.setNoDepthTest(true);
        
        particle.light.clear();
        particle.setLightMaxItensity(0);
        
        return(particle);
    }

}
