import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate room altar decoration class
//

export default class GenerateAltarClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // single altar
        //

    static addAltar(core,room,name,platformBitmap,lx,rx,tz,bz,stepHigh,boxCount,segmentSize)
    {
        let n,y,x,z,dx,dz;
        let xBound,yBound,zBound;
        let levelCount=GenerateUtilityClass.randomInt(5,5);
        
        y=room.offset.y;
        
        for (n=0;n!==levelCount;n++) {
            xBound=new BoundClass((room.offset.x+(lx*segmentSize)),(room.offset.x+(rx*segmentSize)));
            yBound=new BoundClass(y,(y+stepHigh));
            zBound=new BoundClass((room.offset.z+(tz*segmentSize)),(room.offset.z+(bz*segmentSize)));

            GenerateMeshClass.createCube(core,room,(name+'_'+boxCount),platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,GenerateMeshClass.UV_MAP,segmentSize);
            boxCount++;
            
            if (n===0) {
                for (z=tz;z<bz;z++) {
                    for (x=lx;x<rx;x++) {
                        room.setGrid(0,x,z,1);
                    }
                }
            }
            
            y+=stepHigh;
            
            dx=Math.abs(lx-rx);
            dz=Math.abs(tz-bz);
            if ((dx<=1) || (dz<=1)) break;
            
            if (dx>dz) {
                if (GenerateUtilityClass.randomPercentage(0.5)) {
                    lx++;
                }
                else {
                    rx--;
                }
            }
            else {
                if (GenerateUtilityClass.randomPercentage(0.5)) {
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

    static buildRoomAltar(core,room,name,platformBitmap,segmentSize)
    {
        let mx,mz;
        let stepHigh=Math.floor(segmentSize*0.1);
        let boxCount;
        
            // rooms with 10x10 can get half or quarter versions
            
        if ((room.piece.size.x>=10) && (room.piece.size.z>=10)) {
            
            mx=Math.trunc(room.piece.size.x*0.5);
            mz=Math.trunc(room.piece.size.z*0.5);
            
            switch (GenerateUtilityClass.randomIndex(3)) {
                case 0:
                    this.addAltar(core,room,name,platformBitmap,2,(room.piece.size.x-2),2,(room.piece.size.z-2),stepHigh,0,segmentSize);
                    break;
                case 1:
                    boxCount=this.addAltar(core,room,name,platformBitmap,2,mx,2,(room.piece.size.z-2),stepHigh,0,segmentSize);
                    this.addAltar(core,room,name,platformBitmap,mx,(room.piece.size.x-2),2,(room.piece.size.z-2),stepHigh,boxCount,segmentSize);
                    break;
                case 2:
                    boxCount=this.addAltar(core,room,name,platformBitmap,2,mx,2,mz,stepHigh,0,segmentSize);
                    boxCount=this.addAltar(core,room,name,platformBitmap,2,mx,mz,(room.piece.size.z-2),stepHigh,boxCount,segmentSize);
                    boxCount=this.addAltar(core,room,name,platformBitmap,mx,(room.piece.size.x-2),2,mz,stepHigh,boxCount,segmentSize);
                    this.addAltar(core,room,name,platformBitmap,mx,(room.piece.size.x-2),mz,(room.piece.size.z-2),stepHigh,boxCount,segmentSize);
                    break;
            }
        }
        else {
            this.addAltar(core,room,name,platformBitmap,2,(room.piece.size.x-2),2,(room.piece.size.z-2),stepHigh,0,segmentSize);
        }
    }

}
