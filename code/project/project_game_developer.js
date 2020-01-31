/**
 * @module ProjectGameDeveloperClass
 * @ignore
*/

import ColorClass from '../utility/color.js';
import ProjectGameClass from '../project/project_game.js';

/**
 * A specialized version of ProjectGameClass that has additional
 * options for developing games, mostly notable fps/count outputs.
 * A shipping game should extend it's main game class from ProjectGameClass
 * and use this for development only.
 * 
 * @hideconstructor
 * @extends ProjectGameClass
 */
export default class ProjectGameDeveloperClass extends ProjectGameClass
{
    constructor(core,data)
    {
        super(core,data);
    }
    
    createInterface()
    {
        let x=this.getInterfaceWidth()-5;
        
        super.createInterface();
        
        this.addInterfaceText('fps','',x,23,20,this.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('meshCount','',x,46,20,this.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('trigCount','',x,69,20,this.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('modelCount','',x,92,20,this.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
    }
    
    run()
    {
        let idx;
        let fpsStr=this.core.fps.toString();
        
        idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }
        
        this.updateInterfaceText('fps',fpsStr);
        this.updateInterfaceText('meshCount',('mesh:'+this.core.drawMeshCount));
        this.updateInterfaceText('trigCount',('trig:'+this.core.drawTrigCount));
        this.updateInterfaceText('modelCount',('model:'+this.core.drawModelCount));
    }
}
