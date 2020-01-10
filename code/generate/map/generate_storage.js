import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate room storage decoration class
//

export default class GenerateStorageClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // boxes
        //

    static addBoxes(core,room,name,boxBitmap,x,z,segmentSize)
    {
        let stackLevel,stackCount;
        let boxSize,boxHalfSize,boxXBound,boxYBound,boxZBound;
        let boxPos,rotAngle;
        
            // box size
            
        x=(room.offset.x+(x*segmentSize))+Math.trunc(segmentSize*0.5);
        z=(room.offset.z+(z*segmentSize))+Math.trunc(segmentSize*0.5);
        
        boxSize=GenerateUtilityClass.randomInt(Math.trunc(segmentSize*0.3),Math.trunc(segmentSize*0.4));
        boxHalfSize=Math.trunc(boxSize*0.5);
            
        boxXBound=new BoundClass((x-boxHalfSize),(x+boxHalfSize));
        boxYBound=new BoundClass(room.offset.y,(room.offset.y+boxSize));
        boxZBound=new BoundClass((z-boxHalfSize),(z+boxHalfSize));
        
        boxPos=new PointClass(0,0,0);
        rotAngle=new PointClass(0.0,0.0,0.0);
        
            // stacks of boxes
            
        stackCount=GenerateUtilityClass.randomInt(1,3);
            
            // the stacks
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {
            rotAngle.setFromValues(0.0,(GenerateUtilityClass.randomFloat(-10.0,20.0)),0.0);
            GenerateMeshClass.createCubeRotated(core,room,(name+'_'+stackLevel),boxBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,(stackLevel!==0),false,GenerateMeshClass.UV_WHOLE,segmentSize);
            
                // go up one level

            boxYBound.add(boxSize);
            if (boxYBound.max>(room.offset.y+(segmentSize*room.storyCount))) break;
        }
    }
            
        //
        // storage
        //

    static buildRoomStorage(core,room,name,boxBitmap,segmentSize)
    {
        let x,z,lx,rx,tz,bz;
        let storageCount;
        
            // bounds with margins
            
        lx=room.piece.margins[0];
        rx=room.piece.size.x-(room.piece.margins[2]);
        if (room.requiredStairs.length!==0) {
            if (lx<2) lx=2;
            if (rx>(room.piece.size.x-2)) rx=room.piece.size.x-2;
        }
        if (rx<=lx) return;
        
        tz=room.piece.margins[1];
        bz=room.piece.size.z-(room.piece.margins[3]);
        if (room.requiredStairs.length!==0) {
            if (tz<2) tz=2;
            if (bz>(room.piece.size.z-2)) bz=room.piece.size.z-2;
        }
        if (bz<=tz) return;
        
            // create the pieces
            
        storageCount=0;
            
        for (z=tz;z<bz;z++) {
            for (x=lx;x<rx;x++) {
                if (GenerateUtilityClass.randomPercentage(0.5)) {
                    this.addBoxes(core,room,(name+'_'+storageCount),boxBitmap,x,z,segmentSize);
                    storageCount++;
                }
            }
        }
    }

}
