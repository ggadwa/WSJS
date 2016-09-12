"use strict";

//
// particle list class
//

class ParticleListClass
{
    constructor()
    {
        this.particleShader=new ParticleShaderClass();
        
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
        var n,particle;
        var genBitmapParticle;

            // create the shader
            
        if (!this.particleShader.initialize()) return(false);
        
            // precreate all the particles so we don't have GC problems
            
        this.particles=[];
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            particle=new ParticleClass();
            particle.initialize();
            this.particles.push(particle);
        }
        
            // construct a particle bitmap
            
        genBitmapParticle=new GenBitmapParticleClass(new GenRandomClass(config.SEED_BITMAP_PARTICLE));  
        this.particleBitmap=genBitmapParticle.generate(genBitmapParticle.TYPE_OVAL,false);
       
        return(true);
    }

    release()
    {
        var n;
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
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
        return(PARTICLE_MAX_COUNT);
    }

    getParticle(particleIdx)
    {
        return(this.particles[particleIdx]);
    }
    
    getFree()
    {
        var n;
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            if (this.particles[n].isFree()) return(this.particles[n]);
        }
        
        return(null);
    }
    
        //
        // some particle types
        //
        
    addExplosionParticles(centerPt)
    {
        var particle;
        
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
        particle.setTiming(view.timeStamp,1500);

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
        particle.setTiming(view.timeStamp,1500);
        
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
        particle.setTiming(view.timeStamp,1500);
    }
    
    addDebugParticles(centerPt,count)
    {
        var particle;
        
        particle=this.getFree();
        if (particle===null) return(null);
        
        particle.setCount(count);
        particle.setRadius(100,100);
        particle.setMovement(1.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,1.0);
        particle.setColor(0.0,1.0,1.0,0.0,1.0,1.0);
        particle.setTiming(view.timeStamp,0);
        particle.setNoDepthTest(true);
        
        return(particle);
    }
    
        //
        // draw all particles
        //
        
    draw()
    {
        var n,needDraw;
        var gl=view.gl;
        
            // check if any particles are
            // active, if not, skip out
        
        needDraw=false;
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
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
            
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            if (!this.particles[n].isFree()) {
                this.particles[n].draw(this.particleShader);
                this.particles[n].timeout();
            }
        }
        
        gl.disable(gl.BLEND);
        
        this.particleShader.drawEnd();
    }

}
    
//
// the global particlelist object
//

var particleList=new ParticleListClass();
