import ColorClass from '../utility/color.js';
import ProjectGameClass from '../project/project_game.js';
import InterfaceTextClass from '../interface/interface_text.js';

export default class ProjectGameDeveloprClass extends ProjectGameClass
{
    constructor(core,data)
    {
        super(core,data);
    }
    
    initialize()
    {
        let x=this.getInterfaceWidth()-5;
        
        super.initialize();
        
        this.addInterfaceText('fps','',x,23,20,InterfaceTextClass.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('meshCount','',x,46,20,InterfaceTextClass.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('trigCount','',x,69,20,InterfaceTextClass.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.addInterfaceText('modelCount','',x,92,20,InterfaceTextClass.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
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
