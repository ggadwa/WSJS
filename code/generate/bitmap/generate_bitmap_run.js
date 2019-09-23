import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateBitmapBlockClass from './generate_bitmap_block.js';
import GenerateBitmapBrickClass from './generate_bitmap_brick.js';
import GenerateBitmapStoneClass from './generate_bitmap_stone.js';
import GenerateBitmapMetalClass from './generate_bitmap_metal.js';
import GenerateBitmapWoodClass from './generate_bitmap_wood.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateBitmapRun
{
    constructor()
    {
    }
    
    static generateWall(core,temp)
    {
        let genBitmap;
        
        switch (temp) {
            case 0:
                genBitmap=new GenerateBitmapStoneClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapBrickClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapWoodClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate());
    }
}
