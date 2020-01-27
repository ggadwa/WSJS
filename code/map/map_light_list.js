import ColorClass from '../utility/color.js';
import CoreClass from '../main/core.js';

//
// map light list class
//

export default class MapLightListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.lightMin=new ColorClass(0,0,0);
        this.lightMax=new ColorClass(1.5,1.5,1.5);
        
        this.lights=[];

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
        //
        // clear lights
        //

    clear()
    {
        this.lights=[];
    }

        //
        // add light to map
        //

    add(light)
    {
        this.lights.push(light);
    }

        //
        // check if point is in light
        //

    pointInLight(pt)
    {
        let n;
        let nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            if (this.lights[n].position.distance(pt)<this.lights[n].intensity) return(true);
        }

        return(false);
    }

    pointInSingleLight(light,pt)
    {
        return(light.position.distance(pt)<light.intensity);
    }

        //
        // find all the map lights in this view
        // and add them to the view light list
        // 

    addLightsToViewLights()
    {
        let n,k,nLight,idx;
        let x,y,z;
        let light;

            // get the distance from the camera
            // to all the lights

        nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];

            x=this.core.camera.position.x-light.position.x;
            y=this.core.camera.position.y-light.position.y;
            z=this.core.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
        }
        
            // find the CoreClass.MAX_LIGHT_COUNT closest lights
            // and put them into the view list, skipping ambients
            // which we add to the list at the end so they
            // always get into the list

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            if (light.ambient) continue;
            
                // calculate if this lights bounds
                // are within the frustrum and eliminate if they arent
                
            if (!light.isInsideFrustrum(this.core)) continue;

                // find the light place
                
            idx=-1;

            for (k=0;k!==this.core.lights.length;k++) {
                if (this.core.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // add the light
                
            if (idx===-1) {
                if (this.core.lights.length<CoreClass.MAX_LIGHT_COUNT) this.core.lights.push(light);
            }
            else {
                this.core.lights.splice(idx,0,light);
                if (this.core.lights.length>CoreClass.MAX_LIGHT_COUNT) this.core.lights.pop();
            }
        }
    }

    addLightsToViewLightsAmbients()
    {
        let n,light;
        let nLight;

        nLight=this.lights.length;
        
        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            if (!light.ambient) continue;
            
            this.core.lights.splice(0,0,light);
            if (this.core.lights.length>CoreClass.MAX_LIGHT_COUNT) this.core.lights.pop();
        }
    }
    
}
