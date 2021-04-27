export default class ProjectClass
{
    constructor(core)
    {
        this.core=core;
        
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
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }
    
    release()
    {
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
    
        //
        // combine model lists for loading
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
    
        //
        // overrides
        //
        
    mapStartup(mapName)
    {
    }
        
}
