import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';

//
// generate room altar decoration class
//

export default class GenerateAltarClass
{
    constructor(core,room,name,genMesh,platformBitmap,segmentSize)
    {
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.platformBitmap=platformBitmap;
        this.segmentSize=segmentSize;
        
        Object.seal(this);
    }
    
        //
        // single altar
        //

    addAltar(lx,rx,tz,bz,stepHigh,boxCount)
    {
        let n,y,x,z,dx,dz;
        let xBound,yBound,zBound;
        let levelCount=this.core.randomInt(5,5);
        
        y=this.room.offset.y;
        
        for (n=0;n!==levelCount;n++) {
            xBound=new BoundClass((this.room.offset.x+(lx*this.segmentSize)),(this.room.offset.x+(rx*this.segmentSize)));
            yBound=new BoundClass(y,(y+stepHigh));
            zBound=new BoundClass((this.room.offset.z+(tz*this.segmentSize)),(this.room.offset.z+(bz*this.segmentSize)));

            this.genMesh.createCube(this.room,(this.name+'_'+boxCount),this.platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,this.genMesh.UV_MAP,this.segmentSize);
            boxCount++;
            
            if (n===0) {
                for (z=tz;z<bz;z++) {
                    for (x=lx;x<rx;x++) {
                        this.room.setGrid(0,x,z,1);
                    }
                }
            }
            
            y+=stepHigh;
            
            dx=Math.abs(lx-rx);
            dz=Math.abs(tz-bz);
            if ((dx<=1) || (dz<=1)) break;
            
            if (dx>dz) {
                if (this.core.randomPercentage(0.5)) {
                    lx++;
                }
                else {
                    rx--;
                }
            }
            else {
                if (this.core.randomPercentage(0.5)) {
                    tz++;
                }
                else {
                    bz--;
                }
            }
        }
        
        return(boxCount);
    }
            
        //
        // alter
        //

    build()
    {
        let mx,mz;
        let stepHigh=Math.floor(this.segmentSize*0.1);
        let boxCount;
        
            // rooms with 10x10 can get half or quarter versions
            
        if ((this.room.piece.size.x>=10) && (this.room.piece.size.z>=10)) {
            
            mx=Math.trunc(this.room.piece.size.x*0.5);
            mz=Math.trunc(this.room.piece.size.z*0.5);
            
            switch (this.core.randomIndex(3)) {
                case 0:
                    this.addAltar(2,(this.room.piece.size.x-2),2,(this.room.piece.size.z-2),stepHigh,0);
                    break;
                case 1:
                    boxCount=this.addAltar(2,mx,2,(this.room.piece.size.z-2),stepHigh,0);
                    this.addAltar(mx,(this.room.piece.size.x-2),2,(this.room.piece.size.z-2),stepHigh,boxCount);
                    break;
                case 2:
                    boxCount=this.addAltar(2,mx,2,mz,stepHigh,0);
                    boxCount=this.addAltar(2,mx,mz,(this.room.piece.size.z-2),stepHigh,boxCount);
                    boxCount=this.addAltar(mx,(this.room.piece.size.x-2),2,mz,stepHigh,boxCount);
                    this.addAltar(mx,(this.room.piece.size.x-2),mz,(this.room.piece.size.z-2),stepHigh,boxCount);
                    break;
            }
        }
        else {
            this.addAltar(2,(this.room.piece.size.x-2),2,(this.room.piece.size.z-2),stepHigh,0);
        }
    }

}
