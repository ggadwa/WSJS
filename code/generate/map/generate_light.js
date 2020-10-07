import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import GenerateMeshClass from './generate_mesh.js';

export default class GenerateLightClass
{
    constructor(core,room,name,genMesh,lightBitmap,segmentSize)
    {
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.lightBitmap=lightBitmap;
        this.segmentSize=segmentSize;

        Object.seal(this);
    }
    
    build()
    {
        let n,nLight,color;
        let x,y,z,gx,gz,lightSize,lightOffset;
        let mapLight,intensity,exponent;
        let gridCheck;
        
            // light sizes
            
        lightSize=Math.trunc(this.segmentSize*0.1);
        lightOffset=Math.trunc(this.segmentSize*0.5)+Math.trunc(lightSize*0.5);
        
            // only a single light on a single square
            
        gridCheck=new Uint8Array(this.room.piece.size.x*this.room.piece.size.y);
        
            // light intensity based on number of lights
            
        nLight=this.core.randomInt(1,5);
        
        intensity=Math.trunc((Math.max(this.room.size.x,this.room.size.z)*0.7)/1);
        
            // create the lights
        /*
        for (n=0;n!==nLight;n++) {
            
            while (true) {
                gx=this.core.randomIndex(this.room.piece.size.x);
                gz=this.core.randomIndex(this.room.piece.size.z);
                //if (gridCheck[(gz*this.room.piece.size.x)+gx]!==0) continue;
                
                gridCheck[(gz*this.room.piece.size.x)+gx]=1;
                break;
            }
            */
           
            gx=Math.trunc(this.room.piece.size.x*0.5);
            gz=Math.trunc(this.room.piece.size.z*0.5);
           
            x=this.room.offset.x+((gx*this.segmentSize)+lightOffset);
            y=this.room.offset.y+(this.segmentSize*this.room.storyCount);
            z=this.room.offset.z+((gz*this.segmentSize)+lightOffset);
            
            this.genMesh.addBox((this.name+'_'+n),this.lightBitmap,(x-lightSize),(x+lightSize),(y-lightSize),(y+lightSize),(z-lightSize),(z+lightSize),true,true,true,true,true,true,this.segmentSize);
            
            color=new ColorClass(this.core.randomFloat(0.7,0.3),this.core.randomFloat(0.7,0.3),this.core.randomFloat(0.7,0.3));
            exponent=this.core.randomFloat(0.25,0.25);
            
            mapLight=new LightClass(new PointClass(x,(y-(lightSize*2)),z),color,intensity,exponent,false);
            this.core.game.map.lightList.add(mapLight);
    //    }
    }
}

