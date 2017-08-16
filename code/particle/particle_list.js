import ParticleShaderClass from '../../code/particle/particle_shader.js';
import ParticleClass from '../../code/particle/particle.js';
import GenBitmapParticleClass from '../../generate/bitmap/gen_bitmap_particle.js';

//
// particle list class
//

export default class ParticleListClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        
            // constants
            
        this.PARTICLE_MAX_COUNT=50;
        
            // variables
            
        this.particleShader=new ParticleShaderClass(view,fileCache);
        
        this.particleBitmap=null;
        this.particleBitmapSize=32;

        this.particles=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release particle list
        //

    initialize()
    {
        let n,particle;
        let genBitmapParticle;

            // create the shader
            
        if (!this.particleShader.initialize()) return(false);
        
            // precreate all the particles so we don't have GC problems
            
        this.particles=[];
        
        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            particle=new ParticleClass(this.view);
            particle.initialize();
            this.particles.push(particle);
        }
        
            // construct a particle bitmap
            
        genBitmapParticle=new GenBitmapParticleClass(this.view);  
        this.particleBitmap=genBitmapParticle.generate(genBitmapParticle.TYPE_OVAL,false);
       
        return(true);
    }

    release()
    {
        let n;
        
        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            this.particles[n].release();
        }
        
        this.particleBitmap.close();
        
        this.particleShader.release();
    }

        //
        // particle list
        //

    countParticle()
    {
        return(this.PARTICLE_MAX_COUNT);
    }

    getParticle(particleIdx)
    {
        return(this.particles[particleIdx]);
    }
    
    getFree()
    {
        let n;
        
        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            if (this.particles[n].isFree()) return(this.particles[n]);
        }
        
        return(null);
    }
    
        //
        // find all the particle lights in this view
        // and add them to the view light list
        //

    addViewLightsFromParticleLights()
    {
        let n,k,idx;
        let x,y,z;
        let light;

            // get the distance from the camera
            // to all the particle lights

        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            if (this.particles[n].isFree()) continue;
            if (!this.particles[n].castsLight()) continue;
            
            this.particles[n].calcLightIntensity();

            light=this.particles[n].light;

            x=this.view.camera.position.x-light.position.x;
            y=this.view.camera.position.y-light.position.y;
            z=this.view.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
        }
        
            // find the view.MAX_LIGHT_COUNT closest lights
            // and put them into the view list

        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            if (this.particles[n].isFree()) continue;
            if (!this.particles[n].castsLight()) continue;

            light=this.particles[n].light;
            
                // calculate if this lights bounds
                // are within the frustrum and eliminate if they arent
                
            if (!light.isInsideFrustrum()) continue;

                // find the light place
                
            idx=-1;

            for (k=0;k!==this.view.lights.length;k++) {
                if (this.view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // add the light
                
            if (idx===-1) {
                if (this.view.lights.length<this.view.MAX_LIGHT_COUNT) this.view.lights.push(light);
            }
            else {
                this.view.lights.splice(idx,0,light);
                if (this.view.lights.length>this.view.MAX_LIGHT_COUNT) this.view.lights.pop();
            }
        }
    }
    
        //
        // some particle types
        //
        
    addExplosionParticles(centerPt)
    {
        let particle;
        
            // red particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(100);
        particle.setRadius(300,10);
        particle.setMovement(4000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.0,0.0,0.7,0.0,0.0);
        particle.setTiming(this.view.timeStamp,1500);
        
            // the light
            
        particle.light.setPosition(centerPt.x,centerPt.y,centerPt.z);
        particle.light.setColor(1.0,0.2,0.0); 
        particle.setLightMaxItensity(5000);

            // orange particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(80);
        particle.setRadius(300,20);
        particle.setMovement(2500.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.5,0.0,1.0,0.5,0.0);
        particle.setTiming(this.view.timeStamp,1500);
        
        particle.setLightMaxItensity(0);
        
            // yellow particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(60);
        particle.setRadius(300,30);
        particle.setMovement(1000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,1.0,0.0,0.7,0.7,0.0);
        particle.setTiming(this.view.timeStamp,1500);
        
        particle.setLightMaxItensity(0);
    }
    
    addDebugParticles(centerPt,count)
    {
        let particle;
        
        particle=this.getFree();
        if (particle===null) return(null);
        
        particle.setCount(count);
        particle.setRadius(100,100);
        particle.setMovement(1.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,1.0);
        particle.setColor(0.0,1.0,1.0,0.0,1.0,1.0);
        particle.setTiming(this.view.timeStamp,0);
        particle.setNoDepthTest(true);
        
        particle.light.clear();
        particle.setLightMaxItensity(0);
        
        return(particle);
    }
    
        //
        // draw all particles
        //
        
    draw()
    {
        let n,needDraw;
        let gl=this.view.gl;
        
            // check if any particles are
            // active, if not, skip out
        
        needDraw=false;
        
        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            if (!this.particles[n].isFree()) {
                needDraw=true;
                break;
            }
        }
        
        if (!needDraw) return;
        
            // start the shader
            
        this.particleShader.drawStart();
        
        gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA,gl.ONE);        // additive   
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // setup, draw, and timeout any
            // particles
            
        for (n=0;n!==this.PARTICLE_MAX_COUNT;n++) {
            if (!this.particles[n].isFree()) {
                this.particles[n].draw(this.particleShader);
                this.particles[n].timeout();
            }
        }
        
        gl.disable(gl.BLEND);
        
        this.particleShader.drawEnd();
    }

}
