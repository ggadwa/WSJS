import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateLightClass
{
    constructor()
    {
        Object.seal(this);
    }
    
    static buildRoomLight(core,room,name,lightBitmap,segmentSize)
    {
        let n,nLight,color;
        let x,y,z,gx,gz,lightSize,lightOffset;
        let mapLight,intensity,exponent;
        let gridCheck;
        
            // light sizes
            
        lightSize=Math.trunc(segmentSize*0.1);
        lightOffset=Math.trunc(segmentSize*0.5)+Math.trunc(lightSize*0.5);
        
            // only a single light on a single square
            
        gridCheck=new Uint8Array(room.piece.size.x*room.piece.size.y);
        
            // light intensity based on number of lights
            
        nLight=GenerateUtilityClass.randomInt(1,5);
        
        intensity=Math.trunc((Math.max(room.size.x,room.size.z)*0.7)/1);
        
            // create the lights
        /*
        for (n=0;n!==nLight;n++) {
            
            while (true) {
                gx=GenerateUtilityClass.randomIndex(room.piece.size.x);
                gz=GenerateUtilityClass.randomIndex(room.piece.size.z);
                //if (gridCheck[(gz*room.piece.size.x)+gx]!==0) continue;
                
                gridCheck[(gz*room.piece.size.x)+gx]=1;
                break;
            }
            */
           
            gx=Math.trunc(room.piece.size.x*0.5);
            gz=Math.trunc(room.piece.size.z*0.5);
           
            x=room.offset.x+((gx*segmentSize)+lightOffset);
            y=room.offset.y+(segmentSize*room.storyCount);
            z=room.offset.z+((gz*segmentSize)+lightOffset);
            
            GenerateUtilityClass.addBox(core,(name+'_'+n),lightBitmap,(x-lightSize),(x+lightSize),(y-lightSize),(y+lightSize),(z-lightSize),(z+lightSize),true,true,true,true,true,true,segmentSize);
            
            color=new ColorClass(GenerateUtilityClass.randomFloat(0.8,0.2),GenerateUtilityClass.randomFloat(0.8,0.2),GenerateUtilityClass.randomFloat(0.8,0.2));
            exponent=GenerateUtilityClass.randomFloat(0.25,0.25);
            
            mapLight=new LightClass(new PointClass(x,(y-(lightSize*2)),z),color,intensity,exponent);
            core.map.lightList.add(mapLight);
    //    }
    }
}

