import * as constants from '../main/constants.js';
import CoreClass from '../main/core.js';
import ProjectEffectClass from '../project/project_effect.js';

//
// map effect list class
//

export default class MapEffectListClass
{
    constructor(core)
    {
        this.core=core;
        this.effects=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release effect list
        //

    initialize()
    {
        this.effects=[];
        return(true);
    }

    release()
    {
        let effect;
        
        for (effect of this.effects) {
            effect.release();
        }
    }

        //
        // effect list
        //

    add(effect)
    {
        this.effects.push(effect);
        effect.initialize();
    }
    
        //
        // lights from effects
        //
        
    addLightsToViewLights()
    {
        let effect,light;
        let n,x,y,z,idx;
        
        for (effect of this.effects) {
            if (!effect.show) continue;
            
            light=effect.light;
            if (light.intensity===0) continue;
            
                // always reset light to
                // effect position
                
            light.position.setFromPoint(effect.position);
            
                // skip any lights outside of frustrum
                
            if (!light.isInsideFrustrum(this.core)) continue;
            
                // add the light, find it's place in
                // the list
                
            x=this.core.camera.position.x-light.position.x;
            y=this.core.camera.position.y-light.position.y;
            z=this.core.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
                
            idx=-1;

            for (n=0;n!==this.core.lights.length;n++) {
                if (this.core.lights[n].dist>light.dist) {
                    idx=n;
                    break;
                }
            }
            
                // add the light to the list
                
            if (idx===-1) {
                if (this.core.lights.length<CoreClass.MAX_LIGHT_COUNT) this.core.lights.push(light);
            }
            else {
                this.core.lights.splice(idx,0,light);
                if (this.core.lights.length>CoreClass.MAX_LIGHT_COUNT) this.core.lights.pop();
            }
        }
    }
        
        //
        // draw all effects
        //
        
    draw()
    {
        let effect;
        
        for (effect of this.effects) {
            if (!effect.show) continue;
            
            if (effect.drawSetup()) effect.draw();
        }
    }

}
