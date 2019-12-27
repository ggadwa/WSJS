import GenerateBitmapBaseClass from './generate_bitmap_base.js';
import GenerateBitmapConcreteClass from './generate_bitmap_concrete.js';
import GenerateBitmapBrickClass from './generate_bitmap_brick.js';
import GenerateBitmapStoneClass from './generate_bitmap_stone.js';
import GenerateBitmapMetalClass from './generate_bitmap_metal.js';
import GenerateBitmapWoodClass from './generate_bitmap_wood.js';
import GenerateBitmapTileClass from './generate_bitmap_tile.js';
import GenerateBitmapMosaicClass from './generate_bitmap_mosaic.js';
import GenerateBitmapComputerClass from './generate_bitmap_computer.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateBitmapRunClass
{
    constructor()
    {
    }
    
    static generateWall(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapStoneClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapWoodClass(core,colorScheme);
                break;
            case 3:
                genBitmap=new GenerateBitmapMetalClass(core,colorScheme);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
    
    static generateFloor(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch(GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapWoodClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapConcreteClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapTileClass(core,colorScheme);
                break;
            case 3:
                genBitmap=new GenerateBitmapMosaicClass(core,colorScheme);
                break;
        }
        
        return(genBitmap.generate(variationMode));
    }
    
    static generateCeiling(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch(GenerateUtilityClass.randomIndex(3)) {
            case 0:
                genBitmap=new GenerateBitmapWoodClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapConcreteClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapMetalClass(core,colorScheme);
                break;
        }
        
        return(genBitmap.generate(variationMode));
    }
    
    static generatePlatform(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(3)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapWoodClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapMetalClass(core,colorScheme);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
    
    static generateStep(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(3)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapConcreteClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapTileClass(core,colorScheme);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
    
    static generateDecoration(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(4)) {
            case 0:
                genBitmap=new GenerateBitmapBrickClass(core,colorScheme);
                break;
            case 1:
                genBitmap=new GenerateBitmapStoneClass(core,colorScheme);
                break;
            case 2:
                genBitmap=new GenerateBitmapConcreteClass(core,colorScheme);
                break;
            case 3:
                genBitmap=new GenerateBitmapMetalClass(core,colorScheme);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
    
    static generateBox(core,colorScheme)
    {
        let variationMode=0;
        let genBitmap;
        
        switch (GenerateUtilityClass.randomIndex(2)) {
            case 0:
                variationMode=GenerateBitmapWoodClass.VARIATION_BOX;
                genBitmap=new GenerateBitmapWoodClass(core,colorScheme);
                break;
            case 1:
                variationMode=GenerateBitmapMetalClass.VARIATION_BOX;
                genBitmap=new GenerateBitmapMetalClass(core,colorScheme);
                break;
        }

        return(genBitmap.generate(variationMode));
    }
    
    static generateComputer(core,colorScheme)
    {
        let genBitmap=new GenerateBitmapComputerClass(core,colorScheme);
        return(genBitmap.generate(0));
    }
}
