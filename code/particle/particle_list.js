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

    initialize(view,fileCache)
    {
        var n,particle;
        var genBitmapUtility,bitmapCanvas,bitmapCTX;

            // create the shader
            
        if (!this.particleShader.initialize(view,fileCache)) return(false);
        
            // precreate all the particles so we don't have GC problems
            
        this.particles=[];
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            particle=new ParticleClass();
            particle.initialize(view);
            this.particles.push(particle);
        }
        
            // construct a particle bitmap
        
        genBitmapUtility=new GenBitmapUtilityClass(view.genRandom);
        
        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.particleBitmapSize;
        bitmapCanvas.height=this.particleBitmapSize;
        bitmapCTX=bitmapCanvas.getContext('2d');
        
        genBitmapUtility.drawRect(bitmapCTX,0,0,this.particleBitmapSize,this.particleBitmapSize,new wsColor(0.0,0.0,0.0));
        genBitmapUtility.drawOval(bitmapCTX,0,0,this.particleBitmapSize,this.particleBitmapSize,new wsColor(1.0,1.0,1.0),null);
        
        this.particleBitmap=new BitmapClass(view,'Particle Blob',bitmapCanvas,null,null,1.0,0.0);
        
        /* debugging
        var cvs=document.createElement('canvas');
        cvs.style.position="absolute";
        cvs.style.left='1024px';
        cvs.style.top='0px';
        cvs.style.border='1px solid #000000';
        cvs.width=this.particleBitmapSize;
        cvs.height=this.particleBitmapSize;

        var ctx=cvs.getContext('2d');
        ctx.drawImage(bitmapCanvas,0,0,this.particleBitmapSize,this.particleBitmapSize);

        document.body.appendChild(cvs);
        */
       
        return(true);
    }

    release(view)
    {
        var n;
        
        for (n=0;n!==PARTICLE_MAX_COUNT;n++) {
            this.particles[n].release(view);
        }
        
        this.particleBitmap.close();
        
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
        
    addExplosionParticles(view,centerPt)
    {
        var particle;
        
            // red particles
            
        particle=this.getFree();
        if (particle===null) return;
        
        particle.createRandomGlobePoints(view,100);
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
        
        particle.createRandomGlobePoints(view,80);
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
        
        particle.createRandomGlobePoints(view,60);
        particle.setRadius(300,30);
        particle.setMovement(1000.0);
        particle.setCenterPointFromPoint(centerPt);
        particle.setBitmap(this.particleBitmap);
        particle.setAlpha(1.0,0.1);
        particle.setColor(1.0,1.0,0.0,0.7,0.7,0.0);
        particle.setTiming(view.timeStamp,1500);
    }
    
    addDebugParticles(view,centerPt,count)
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
    
