import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateBitmapConcreteClass from './generate_bitmap_concrete.js';
import GenerateBitmapBrickClass from './generate_bitmap_brick.js';
import GenerateBitmapStoneClass from './generate_bitmap_stone.js';
import GenerateBitmapMetalClass from './generate_bitmap_metal.js';
import GenerateBitmapWoodClass from './generate_bitmap_wood.js';
import GenerateBitmapTileClass from './generate_bitmap_tile.js';
import GenerateBitmapMosaicClass from './generate_bitmap_mosaic.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateBitmapRun
{
    constructor()
    {
    }
    
    static generateWall(core)
    {
        let variationMode=0;
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

        return(genBitmap.generate(variationMode));
    }
    
    static generateFloorOrCeiling(core)
    {
        let variationMode=0;
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
            case 4:
                genBitmap=new GenerateBitmapMosaicClass(core,false,false,false);
                break;
        }
        
        return(genBitmap.generate(variationMode));
    }
    
    static generatePlatform(core)
    {
        let variationMode=0;
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

        return(genBitmap.generate(variationMode));
    }
    
    static generateStep(core)
    {
        let variationMode=0;
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

        return(genBitmap.generate(variationMode));
    }
    
    static generateDecoration(core)
    {
        let variationMode=0;
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

        return(genBitmap.generate(variationMode));
    }
    
    static generateBox(core)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(2)) {
            case 0:
                variationMode=GenerateBitmapWoodClass.VARIATION_BOX;
                genBitmap=new GenerateBitmapWoodClass(core,false,false,false);
                break;
            case 1:
                variationMode=GenerateBitmapMetalClass.VARIATION_BOX;
                genBitmap=new GenerateBitmapMetalClass(core,false,false,false);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
}
