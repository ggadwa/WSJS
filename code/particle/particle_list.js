"use strict";

//
// particle list class
//

class ParticleListClass
{
    constructor()
    {
        this.particleShader=new ParticleShaderClass();

        this.particles=[];
    }
    
        //
        // initialize/release particle list
        //

    initialize(view,fileCache)
    {
        var n,particle;

            // create the shader
            
        if (!this.particleShader.initialize(view,fileCache)) return(false);
        
            // precreate all the particles so we don't have GC problems
            
        this.particles=[];
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            particle=new ParticleClass();
            particle.initialize(view);
            this.particles.push(particle);
        }
        
        return(true);
    }

    release(view)
    {
        var n;
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            this.particles[n].release(view);
        }
        
        this.particleShader.release(view);
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
        
    addExplosionParticles(view,bitmap,centerPt)
    {
        var particle;
        
            // red particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(view,100);
        particle.setRadius(300,10);
        particle.setMovement(4000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(bitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.0,0.0,0.7,0.0,0.0);
        particle.setTiming(view.timeStamp,1500);

            // orange particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(view,80);
        particle.setRadius(300,20);
        particle.setMovement(2500.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(bitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,0.5,0.0,1.0,0.5,0.0);
        particle.setTiming(view.timeStamp,1500);
        
            // yellow particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(view,60);
        particle.setRadius(300,30);
        particle.setMovement(1000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(bitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,1.0,0.0,0.7,0.7,0.0);
        particle.setTiming(view.timeStamp,1500);
    }
    
        //
        // draw all particles
        //
        
    draw(view)
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
            
        this.particleShader.drawStart(view);
        
        gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA,gl.ONE);        // additive   
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // setup, draw, and timeout any
            // particles
            
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            if (!this.particles[n].isFree()) {
                this.particles[n].draw(view,this.particleShader);
                this.particles[n].timeout(view);
            }
        }
        
        gl.disable(gl.BLEND);
        
        this.particleShader.drawEnd(view);
    }

}
    
