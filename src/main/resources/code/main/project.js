import ColorClass from '../utility/color.js';
import CharacterClass from '../main/character.js';

    //
    // temporary structs for some objects
    //

class InterfaceTextClass
{
    constructor(id,text,positionMode,positionOffset,textSize,textAlign,color,alpha,show)
    {
        this.id=id;
        this.text=text;
        this.positionMode=positionMode;
        this.positionOffset=positionOffset;
        this.textSize=textSize;
        this.textAlign=textAlign;
        this.color=color;
        this.alpha=alpha;
        this.show=show;
    }
}

class InterfaceElementClass
{
    constructor(id,bitmap,width,height,positionMode,positionOffset,color,alpha,show)
    {
        this.id=id;
        this.bitmap=bitmap;
        this.width=width;
        this.height=height;
        this.positionMode=positionMode;
        this.positionOffset=positionOffset;
        this.color=color;
        this.alpha=alpha;
        this.show=show;
    }
}

class InterfaceCountClass
{
    constructor(id,bitmap,count,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha,show)
    {
        this.id=id;
        this.bitmap=bitmap;
        this.count=count;
        this.width=width;
        this.height=height;
        this.positionMode=positionMode;
        this.positionOffset=positionOffset;
        this.addOffset=addOffset;
        this.onColor=onColor;
        this.onAlpha=onAlpha;
        this.offColor=offColor;
        this.offAlpha=offAlpha;
        this.show=show;
    }
}
   
class InterfaceDialClass
{
    constructor(id,backgroundBitmap,foregroundBitmap,needleBitmap,width,height,positionMode,positionOffset,show)
    {
        this.id=id;
        this.backgroundBitmap=backgroundBitmap;
        this.foregroundBitmap=foregroundBitmap;
        this.needleBitmap=needleBitmap;
        this.width=width;
        this.height=height;
        this.positionMode=positionMode;
        this.positionOffset=positionOffset;
        this.show=show;
    }
}

class TitleButtonClass
{
    constructor()
    {
        this.title='';
        this.show=false;
    }
}

    //
    // main project class
    //
    
export default class ProjectClass
{
    constructor(core)
    {
        this.core=core;
        
            // constants
            
        this.TEXT_ALIGN_LEFT=core.TEXT_ALIGN_LEFT;
        this.TEXT_ALIGN_CENTER=core.TEXT_ALIGN_CENTER;
        this.TEXT_ALIGN_RIGHT=core.TEXT_ALIGN_RIGHT;

        this.POSITION_TOP_LEFT=core.POSITION_TOP_LEFT;
        this.POSITION_TOP_RIGHT=core.POSITION_TOP_RIGHT;
        this.POSITION_BOTTOM_LEFT=core.POSITION_BOTTOM_LEFT;
        this.POSITION_BOTTOM_RIGHT=core.POSITION_BOTTOM_RIGHT;
        this.POSITION_MIDDLE=core.POSITION_MIDDLE;
        
        this.MENU_X_ALIGN_LEFT=core.MENU_X_ALIGN_LEFT;
        this.MENU_X_ALIGN_CENTER=core.MENU_X_ALIGN_CENTER;
        this.MENU_X_ALIGN_RIGHT=core.MENU_X_ALIGN_RIGHT;
        
        this.MENU_Y_ALIGN_TOP=core.MENU_Y_ALIGN_TOP;
        this.MENU_Y_ALIGN_CENTER=core.MENU_Y_ALIGN_CENTER;
        this.MENU_Y_ALIGN_BOTTOM=core.MENU_Y_ALIGN_BOTTOM;

            // lists
            
        this.entityClasses=new Map();
        this.effectClasses=new Map();
        this.cubeClasses=new Map();
        
        this.commonModelList=new Set();
        this.singleplayerModelList=new Set();
        this.multiplayerModelList=new Set();
        
        this.commonBitmapList=new Set();
        this.singleplayerBitmapList=new Set();
        this.multiplayerBitmapList=new Set();
        
        this.commonSoundList=new Set();
        this.singleplayerSoundList=new Set();
        this.multiplayerSoundList=new Set();
        
        this.sequenceList=new Set();
        this.characters=new Map();
        
        this.interfaceTextList=new Set();
        this.interfaceElementList=new Set();
        this.interfaceCountList=new Set();
        this.interfaceDialList=new Set();
        
            // configs
            
        this.fontName='Arial';
        this.menuFontSize=80;
        this.menuFontSizeHighlight=80;
        this.menuColor=new ColorClass(1.0,1.0,1.0);
        this.menuColorHighlight=new ColorClass(1.0,1.0,1.0);
        this.menuAlignX=this.MENU_X_ALIGN_CENTER;
        this.menuAlignY=this.MENU_Y_ALIGN_CENTER;
        this.titleClickSoundName=null;
        this.titleSelectSoundName=null;
        
        this.titlePlayButton=new TitleButtonClass();
        this.titleMultiplayerButton=new TitleButtonClass();
        this.titleSetupButton=new TitleButtonClass();
        this.titleQuitButton=new TitleButtonClass();
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }
    
    async initializeCharacters()
    {
        let character;
        
        for (character of this.characters.values()) {
            if (!(await character.initialize())) return(false);
        }
        
        return(true);
    }
    
    release()
    {
        let character;
        
        for (character of this.characters.values()) {
            character.release();
        }
    }
    
        //
        // add project items
        //
        
    addEntityClass(name,classObj)
    {
        this.entityClasses.set(name,classObj);
    }
    
    addEffectClass(name,classObj)
    {
        this.effectClasses.set(name,classObj);
    }
    
    addCubeClass(name,classObj)
    {
        this.cubeClasses.set(name,classObj);
    }
    
    addCommonModel(name)
    {
        this.commonModelList.add(name);
    }
    
    addSingleplayerModel(name)
    {
        this.singleplayerModelList.add(name);
    }
    
    addMultiplayerModel(name)
    {
        this.multiplayerModelList.add(name);
    }

    addCommonBitmap(name)
    {
        this.commonBitmapList.add(name);
    }
    
    addSingleplayerBitmap(name)
    {
        this.singleplayerBitmapList.add(name);
    }
    
    addMultiplayerBitmap(name)
    {
        this.multiplayerBitmapList.add(name);
    }

    addCommonSound(name)
    {
        this.commonSoundList.add(name);
    }
    
    addSingleplayerSound(name)
    {
        this.singleplayerSoundList.add(name);
    }
    
    addMultiplayerSound(name)
    {
        this.multiplayerSoundList.add(name);
    }
    
    addSequence(name)
    {
        this.sequenceList.add(name);
    }
    
    addCharacter(name,playerType,botType,bitmap,data)
    {
        this.characters.set(name,new CharacterClass(this.core,name,playerType,botType,bitmap,data));
    }
    
    addInterfaceText(id,text,positionMode,positionOffset,textSize,textAlign,color,alpha,show)
    {
        this.interfaceTextList.add(new InterfaceTextClass(id,text,positionMode,positionOffset,textSize,textAlign,color,alpha,show));
    }
    
    addInterfaceElement(id,bitmap,width,height,positionMode,positionOffset,color,alpha,show)
    {
        this.interfaceElementList.add(new InterfaceElementClass(id,bitmap,width,height,positionMode,positionOffset,color,alpha,show));
    }
    
    addInterfaceCount(id,bitmap,count,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha,show)
    {
        this.interfaceCountList.add(new InterfaceCountClass(id,bitmap,count,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha,show));
    }
    
    addInterfaceDial(id,backgroundBitmap,foregroundBitmap,needleBitmap,width,height,positionMode,positionOffset,show)
    {
        this.interfaceDialList.add(new InterfaceDialClass(id,backgroundBitmap,foregroundBitmap,needleBitmap,width,height,positionMode,positionOffset,show));
    }
    
        //
        // project setup
        //

    setTitleConfig(fontName,titleClickSoundName,titleSelectSoundName)
    {
        this.fontName=fontName;
        this.titleClickSoundName=titleClickSoundName;
        this.titleSelectSoundName=titleSelectSoundName;
    }
    
    setTitleMenu(menuFontSize,menuFontSizeHighlight,menuColor,menuColorHighlight,menuAlignX,menuAlignY)
    {
        this.menuFontSize=menuFontSize;
        this.menuFontSizeHighlight=menuFontSizeHighlight;
        this.menuColor=menuColor;
        this.menuColorHighlight=menuColorHighlight;
        this.menuAlignX=menuAlignX;
        this.menuAlignY=menuAlignY;
    }
    
    setTitlePlayButton(title,show)
    {
        this.titlePlayButton.title=title;
        this.titlePlayButton.show=show;
    }
    
    setTitleMultiplayerButton(title,show)
    {
        this.titleMultiplayerButton.title=title;
        this.titleMultiplayerButton.show=show;
    }
    
    setTitleSetupButton(title,show)
    {
        this.titleSetupButton.title=title;
        this.titleSetupButton.show=show;
    }
    
    setTitleQuitButton(title,show)
    {
        this.titleQuitButton.title=title;
        this.titleQuitButton.show=show;
    }

        //
        // utilities
        //
    
    buildPerpendicularLineForLoop(startNodeKey,endNodeKey,lineLen)
    {
        this.core.game.map.path.buildPerpendicularLineForLoop(startNodeKey,endNodeKey,lineLen);
    }
    
    startSequence(name)
    {
        this.core.game.startSequence(name);
    }
    
    getCharacter(name)
    {
        return(this.characters.get(name));
    }
    
    getCharacterList()
    {
        return([...this.characters.keys()]);
    }
    
        //
        // combine lists for loading, or just convert
        // sets to arrays
        //
        
    getModelList(isSingleplayer)
    {
        if (isSingleplayer) return([...this.commonModelList,...this.singleplayerModelList]);
        return([...this.commonModelList,...this.multiplayerModelList]);
    }
    
    getBitmapList(isSingleplayer)
    {
        if (isSingleplayer) return([...this.commonBitmapList,...this.singleplayerBitmapList]);
        return([...this.commonBitmapList,...this.multiplayerBitmapList]);
    }
    
    getSoundList(isSingleplayer)
    {
        if (isSingleplayer) return([...this.commonSoundList,...this.singleplayerSoundList]);
        return([...this.commonSoundList,...this.multiplayerSoundList]);
    }
    
    getSequenceList()
    {
        return([...this.sequenceList]);
    }
    
    getInterfaceTextList()
    {
        return([...this.interfaceTextList]);
    }
    
    getInterfaceElementList()
    {
        return([...this.interfaceElementList]);
    }
    
    getInterfaceCountList()
    {
        return([...this.interfaceCountList]);
    }
    
    getInterfaceDialList()
    {
        return([...this.interfaceDialList]);
    }
    
        //
        // overrides
        //
        
    mapStartup(mapName)
    {
    }
        
}
