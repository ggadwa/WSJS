import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateBitmapBlockClass from './generate_bitmap_block.js';
import GenerateBitmapBrickClass from './generate_bitmap_brick.js';
import GenerateBitmapStoneClass from './generate_bitmap_stone.js';
import GenerateBitmapMetalClass from './generate_bitmap_metal.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateBitmapRun
{
    constructor()
    {
    }
    
    static generateWall(core)
    {
        let genBitmap;
        
        genBitmap=new GenerateBitmapStoneClass(core,false,false,false);
        
        /*
        switch(GenerateUtilityClass.randomIndex(2)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core);
                break;
            case 1:
                genBitmap=new GenerateBitmapStoneClass(core);
                break;
        }
        */
        return(genBitmap.generate());
    }
}
