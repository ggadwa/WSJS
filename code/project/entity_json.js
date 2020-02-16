import PointClass from '../utility/point.js';
import BlockContainerClass from '../project/block_container.js';
import BlockPlayerClass from '../project/block_player.js';
import BlockFPSMovementClass from '../project/block_fps_movement.js';
import BlockFPSWeaponsClass from '../project/block_fps_weapons.js';
import BlockWeaponClass from '../project/block_weapon.js';
import BlockFireHitscanClass from '../project/block_fire_hitscan.js';
import BlockFireProjectileClass from '../project/block_fire_projectile.js';
import BlockDeveloperClass from '../project/block_developer.js';
import ProjectEntityClass from '../project/project_entity.js';

//
// json entity class
//

export default class EntityJsonClass extends ProjectEntityClass
{
    constructor(core,name,position,angle,data,overrideJsonName)
    {
        super(core,name,position,angle,data);
        
        this.overrideJsonName=overrideJsonName;     // supergumba -- hack to get this all to work while translating to blocks
    }
    
    initialize()
    {
        let block,blockCode;
        
        super.initialize();
        
            // load the json
            
        if (this.overrideJsonName===undefined) {
            this.json=this.core.game.getCachedJson(this.getJsonName());
        }
        else {
            this.json=this.core.game.getCachedJson(this.overrideJsonName);
        }
        if (this.json===null) return(false);
        
            // setup
            
        if ((this.json.setup.model!==null) && (this.json.setup.model!==undefined)) {
            this.setModel(this.json.setup.model);
            this.scale.setFromValues(this.json.setup.scale.x,this.json.setup.scale.y,this.json.setup.scale.z);
        }
            
        this.radius=this.json.setup.radius;
        this.height=this.json.setup.height;
        
        this.eyeOffset=this.json.setup.eyeOffset;
        this.weight=this.json.setup.weight;
        
            // add any interface elements
            
        if (!this.core.interface.addFromJson(this.json.interface)) return(false);
        
            // block data, specialized internal
            // data that can be shared between blocks

        this.blockData=new Map();
        
            // setup the blocks
            
        this.blockCodes=[];
        
        if (this.json.blocks===undefined) return(true);
        
        for (block of this.json.blocks) {
            switch (block.type) {
                case 'container':
                    this.blockCodes.push(new BlockContainerClass(this.core,block));
                    break;
                case 'player':
                    this.blockCodes.push(new BlockPlayerClass(this.core,block));
                    break;
                case 'fps_movement':
                    this.blockCodes.push(new BlockFPSMovementClass(this.core,block));
                    break;
                case 'fps_weapons':
                    this.blockCodes.push(new BlockFPSWeaponsClass(this.core,block));
                    break;
                case 'weapon':
                    this.blockCodes.push(new BlockWeaponClass(this.core,block));
                    break;
                case 'fire_hitscan':
                    this.blockCodes.push(new BlockFireHitscanClass(this.core,block));
                    break;
                case 'fire_projectile':
                    this.blockCodes.push(new BlockFireProjectileClass(this.core,block));
                    break;
                case 'developer':
                    this.blockCodes.push(new BlockDeveloperClass(this.core,block));
                    break;
                default:
                    console.log('Unknown block for '+this.name+': '+block.type);
                    return(false);
            }
        }

        for (blockCode of this.blockCodes) {
            if (!blockCode.initialize(this)) return(false);
        }
        
        return(true);
    }
    
    getJsonName()
    {
        return(null);
    }
        
    ready()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            blockCode.ready(this);
        }
    }
    
    run()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            blockCode.run(this);
        }
    }
        
    drawSetup()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            if (!blockCode.drawSetup(this)) return(false);
        }
        
        return(true);
    }

}
