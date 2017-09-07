import * as constants from '../../code/main/constants.js';
import GenBitmapWallClass from '../../generate/bitmap/gen_bitmap_wall.js';
import GenBitmapFloorClass from '../../generate/bitmap/gen_bitmap_floor.js';
import GenBitmapCeilingClass from '../../generate/bitmap/gen_bitmap_ceiling.js';
import GenBitmapDoorClass from '../../generate/bitmap/gen_bitmap_door.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';
import GenBitmapWoodClass from '../../generate/bitmap/gen_bitmap_wood.js';
import GenBitmapPanelClass from '../../generate/bitmap/gen_bitmap_panel.js';
import GenBitmapPipeClass from '../../generate/bitmap/gen_bitmap_pipe.js';
import GenBitmapLiquidClass from '../../generate/bitmap/gen_bitmap_liquid.js';
import GenBitmapMachineClass from '../../generate/bitmap/gen_bitmap_machine.js';
import GenBitmapGlassClass from '../../generate/bitmap/gen_bitmap_glass.js';
import GenBitmapGooClass from '../../generate/bitmap/gen_bitmap_goo.js';
import GenBitmapParticleClass from '../../generate/bitmap/gen_bitmap_particle.js';
import GenBitmapItemClass from '../../generate/bitmap/gen_bitmap_item.js';
//import GenBitmapSkinClass from '../../generate/bitmap/gen_bitmap_skin.js';
import GenBitmapSkyClass from '../../generate/bitmap/gen_bitmap_sky.js';

//
// generate bitmap class
//

export default class GenBitmapClass
{
    constructor(view)
    {
        this.view=view;

            // these are all precreated because the instance
            // will have a default color so everything of the same
            // type has the same color scheme

        this.genBitmapWall=new GenBitmapWallClass(this.view);
        this.genBitmapFloor=new GenBitmapFloorClass(this.view);
        this.genBitmapCeiling=new GenBitmapCeilingClass(this.view);
        this.genBitmapDoor=new GenBitmapDoorClass(this.view);
        this.genBitmapMetal=new GenBitmapMetalClass(this.view);
        this.genBitmapWood=new GenBitmapWoodClass(this.view);
        this.genBitmapPanel=new GenBitmapPanelClass(this.view);
        this.genBitmapPipe=new GenBitmapPipeClass(this.view);
        this.genBitmapLiquid=new GenBitmapLiquidClass(this.view);
        this.genBitmapMachine=new GenBitmapMachineClass(this.view);
        this.genBitmapGlass=new GenBitmapGlassClass(this.view);
        this.genBitmapGoo=new GenBitmapGooClass(this.view);
        this.genBitmapParticle=new GenBitmapParticleClass(this.view);
        this.genBitmapItem=new GenBitmapItemClass(this.view);
        //this.genBitmapSkin=new GenBitmapSkinClass(this.view);
        this.genBitmapSky=new GenBitmapSkyClass(this.view);

        Object.seal(this);
    }
    
        //
        // generate mainline
        //
    
    generate(generateType,inDebug)
    {
        switch (generateType) {
            
            case constants.BITMAP_TYPE_WALL:
                return(this.genBitmapWall.generate(inDebug));
             
            case constants.BITMAP_TYPE_FLOOR:
                return(this.genBitmapFloor.generate(inDebug));
            
            case constants.BITMAP_TYPE_CEILING:
                return(this.genBitmapCeiling.generate(inDebug));
                
            case constants.BITMAP_TYPE_DOOR:
                return(this.genBitmapDoor.generate(inDebug));
                
            case constants.BITMAP_TYPE_METAL:
                return(this.genBitmapMetal.generate(inDebug));
                
            case constants.BITMAP_TYPE_WOOD:
                return(this.genBitmapWood.generate(inDebug));
                
            case constants.BITMAP_TYPE_PANEL:
                return(this.genBitmapPanel.generate(inDebug));
                
            case constants.BITMAP_TYPE_LIQUID:
                return(this.genBitmapLiquid.generate(inDebug));
                
            case constants.BITMAP_TYPE_MACHINE:
                return(this.genBitmapMachine.generate(inDebug));
                
            case constants.BITMAP_TYPE_PLATFORM:
                return(this.genBitmapCeiling.generate(inDebug));
                
            case constants.BITMAP_TYPE_PIPE:
                return(this.genBitmapPipe.generate(inDebug));
                
            case constants.BITMAP_TYPE_FRAME:
                return(this.genBitmapWall.generate(inDebug));
                
            case constants.BITMAP_TYPE_PILLAR:
                return(this.genBitmapWall.generate(inDebug));
                
            case constants.BITMAP_TYPE_GLASS:
                return(this.genBitmapGlass.generate(inDebug));
                
            case constants.BITMAP_TYPE_GOO:
                return(this.genBitmapGoo.generate(inDebug));
               
            case constants.BITMAP_TYPE_PARTICLE:
                return(this.genBitmapParticle.generate(inDebug));
                
            case constants.BITMAP_TYPE_ITEM:
                return(this.genBitmapItem.generate(inDebug));
            /*    
            case constants.BITMAP_TYPE_SKIN:
                return(this.genBitmapSkin.generate(inDebug));
            */    
            case constants.BITMAP_TYPE_SKY:
                return(this.genBitmapSky.generate(inDebug));

        }
         
        return(null);
    }

}
