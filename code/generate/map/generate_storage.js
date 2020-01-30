import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';

//
// generate room storage decoration class
//

export default class GenerateStorageClass
{
    constructor(core,room,name,genMesh,boxBitmap,segmentSize)
    {
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.boxBitmap=boxBitmap;
        this.segmentSize=segmentSize;

        Object.seal(this);
    }
    
        //
        // boxes
        //

    addBoxes(x,z,storageCount)
    {
        let stackLevel,stackCount;
        let boxSize,boxHalfSize,boxXBound,boxYBound,boxZBound;
        let boxPos,rotAngle;
        
            // box size
            
        x=(this.room.offset.x+(x*this.segmentSize))+Math.trunc(this.segmentSize*0.5);
        z=(this.room.offset.z+(z*this.segmentSize))+Math.trunc(this.segmentSize*0.5);
        
        boxSize=this.core.randomInt(Math.trunc(this.segmentSize*0.3),Math.trunc(this.segmentSize*0.4));
        boxHalfSize=Math.trunc(boxSize*0.5);
            
        boxXBound=new BoundClass((x-boxHalfSize),(x+boxHalfSize));
        boxYBound=new BoundClass(this.room.offset.y,(this.room.offset.y+boxSize));
        boxZBound=new BoundClass((z-boxHalfSize),(z+boxHalfSize));
        
        boxPos=new PointClass(0,0,0);
        rotAngle=new PointClass(0.0,0.0,0.0);
        
            // stacks of boxes
            
        stackCount=this.core.randomInt(1,3);
            
            // the stacks
            
        for (stackLevel=0;stackLevel!==stackCount;stackLevel++) {
            rotAngle.setFromValues(0.0,(this.core.randomFloat(-10.0,20.0)),0.0);
            this.genMesh.createCubeRotated(this.room,(this.name+'_'+storageCount+'_'+stackLevel),this.boxBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,(stackLevel!==0),false,this.genMesh.UV_WHOLE,this.segmentSize);
            
                // go up one level

            boxYBound.add(boxSize);
            if (boxYBound.max>(this.room.offset.y+(this.segmentSize*this.room.storyCount))) break;
        }
    }
            
        //
        // storage
        //

    build()
    {
        let x,z,lx,rx,tz,bz;
        let storageCount;
        
            // bounds with margins
            
        lx=this.room.piece.margins[0];
        rx=this.room.piece.size.x-(this.room.piece.margins[2]);
        if (this.room.requiredStairs.length!==0) {
            if (lx<2) lx=2;
            if (rx>(this.room.piece.size.x-2)) rx=this.room.piece.size.x-2;
        }
        if (rx<=lx) return;
        
        tz=this.room.piece.margins[1];
        bz=this.room.piece.size.z-(this.room.piece.margins[3]);
        if (this.room.requiredStairs.length!==0) {
            if (tz<2) tz=2;
            if (bz>(this.room.piece.size.z-2)) bz=this.room.piece.size.z-2;
        }
        if (bz<=tz) return;
        
            // create the pieces
            
        storageCount=0;
            
        for (z=tz;z<bz;z++) {
            for (x=lx;x<rx;x++) {
                if (this.core.randomPercentage(0.5)) {
                    this.addBoxes(x,z);
                    storageCount++;
                    
                    this.room.setGrid(0,x,z,1);
                }
            }
        }
    }

}
