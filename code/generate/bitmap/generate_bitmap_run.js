import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateBitmapConcreteClass from './generate_bitmap_concrete.js';
import GenerateBitmapBrickClass from './generate_bitmap_brick.js';
import GenerateBitmapStoneClass from './generate_bitmap_stone.js';
import GenerateBitmapMetalClass from './generate_bitmap_metal.js';
import GenerateBitmapWoodClass from './generate_bitmap_wood.js';
import GenerateBitmapTileClass from './generate_bitmap_tile.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateBitmapRun
{
    constructor()
    {
    }
    
    static generateWall(core)
    {
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapStoneClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapWoodClass(core,false,false,false);
                break;
            case 3:
                genBitmap=new GenerateBitmapMetalClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate());
    }
    
    static generateFloorOrCeiling(core)
    {
        let genBitmap;
        
        switch(GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapWoodClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapConcreteClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapMetalClass(core,false,false,false);
                break;
            case 3:
                genBitmap=new GenerateBitmapTileClass(core,false,false,false);
                break;
        }
        
        return(genBitmap.generate());
    }
    
    static generatePlatform(core)
    {
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(3)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapWoodClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapMetalClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate());
    }
    
    static generateStep(core)
    {
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(3)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapConcreteClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapTileClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate());
    }
    
    static generateDecoration(core)
    {
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,false,false,false);
                break;
            case 1:
                genBitmap=new GenerateBitmapStoneClass(core,false,false,false);
                break;
            case 2:
                genBitmap=new GenerateBitmapConcreteClass(core,false,false,false);
                break;
            case 3:
                genBitmap=new GenerateBitmapMetalClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate());
    }
}
