import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';

//
// generate computer decoration class
//

export default class GenerateComputerClass
{
    constructor(core,room,name,genMesh,platformBitmap,computerBitmap,segmentSize)
    {
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.platformBitmap=platformBitmap;
        this.computerBitmap=computerBitmap;
        this.segmentSize=segmentSize;

        Object.seal(this);
    }
    
        //
        // computers
        //

    build()
    {
        let x,z,k,wid,widOffset,topY,botY;
        let lx,rx,tz,bz,skipX,skipZ;
        let xBound,yBound,zBound,computerCount;
        
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
        
            // size
            
        wid=Math.trunc(this.segmentSize*0.7);
        widOffset=Math.trunc((this.segmentSize*0.3)*0.5);
        topY=this.segmentSize;
        botY=Math.trunc(this.segmentSize*0.1);
        
            // the equipment floor
            
        xBound=new BoundClass((this.room.offset.x+(lx*this.segmentSize)),(this.room.offset.x+(rx*this.segmentSize)));
        yBound=new BoundClass(this.room.offset.y,(this.room.offset.y+botY));
        zBound=new BoundClass((this.room.offset.z+(tz*this.segmentSize)),(this.room.offset.z+(bz*this.segmentSize)));
            
        this.genMesh.createCube(this.room,(this.name+'_pedestal'),this.platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,this.genMesh.UV_MAP,this.segmentSize);
        
            // if enough room, make a path
            // through the computers
        
        skipX=-1;
        if ((rx-lx)>2) skipX=this.core.randomInBetween((lx+1),(rx-1));
        skipZ=-1;
        if ((bz-tz)>2) skipZ=this.core.randomInBetween((tz+1),(bz-1));
        
            // the computers
          
        computerCount=0;
        
        yBound.setFromValues((this.room.offset.y+botY),(this.room.offset.y+topY));
        
        for (z=tz;z<bz;z++) {
            if (z===skipZ) continue;
            
            k=(this.room.offset.z+(z*this.segmentSize))+widOffset;
            zBound.setFromValues(k,(k+wid));
            
            for (x=lx;x<rx;x++) {
                if (x===skipX) continue;
                
                k=(this.room.offset.x+(x*this.segmentSize))+widOffset;
                xBound.setFromValues(k,(k+wid));
                
                this.genMesh.createCube(this.room,(this.name+'_computer_'+computerCount),this.computerBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,this.genMesh.UV_BOX,this.segmentSize);
                computerCount++;
                
                this.room.setGrid(0,x,z,1);
            }
        }
    }

}
