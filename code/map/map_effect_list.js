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
        this.effects=new Map();
        
        Object.seal(this);
    }
    
        //
        // initialize/release effect list
        //

    initialize()
    {
        this.effects.clear();
        return(true);
    }

    release()
    {
        this.effects.forEach(
                function(key,value) {
                    value.release();
                }
        );
    }

        //
        // effect list
        //

    add(name,effect)
    {
        this.effects.set(name,effect);
        effect.initialize();
    }
    
    get(name)
    {
        return(this.effects.get(name));
    }
    
        //
        // lights from effects
        //
        
    addLightsToViewLights()
    {
        let effect;
        
        for (effect of this.effects.values()) {
            effect.addFrameLight();
        }
    }
    
        //
        // draw all effects
        //
        
    draw()
    {
        let effect;
        
        for (effect of this.effects.values()) {
            effect.frameDraw();
        }
    }

}
