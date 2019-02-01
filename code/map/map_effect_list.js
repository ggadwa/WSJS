import * as constants from '../../code/main/constants.js';
import ProjectEffectClass from '../../code/project/project_effect.js';

//
// map particle list class
//

export default class MapEffectListClass
{
    constructor(view)
    {
        this.view=view;
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
            
            light=effect.getLight();
            if (light===null) continue;
            
                // skip any lights outside of frustrum
                
            if (!light.isInsideFrustrum(this.view)) continue;
            
                // add the light, find it's place in
                // the list
                
            x=this.view.camera.position.x-light.position.x;
            y=this.view.camera.position.y-light.position.y;
            z=this.view.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
                
            idx=-1;

            for (n=0;n!==this.view.lights.length;n++) {
                if (this.view.lights[n].dist>light.dist) {
                    idx=n;
                    break;
                }
            }
            
                // add the light to the list
                
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
        // draw all effects
        //
        
    draw()
    {
        let effect;
        
        for (effect of this.effects) {
            if (!effect.show) continue;
            
            effect.drawSetup();
            if (effect.isInView()) effect.draw();
        }
    }

}
