import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate computer decoration class
//

export default class GenerateComputerClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // computers
        //

    static buildRoomComputer(core,room,name,platformBitmap,computerBitmap,segmentSize)
    {
        let x,z,k,wid,widOffset,topY,botY;
        let lx,rx,tz,bz,skipX,skipZ;
        let xBound,yBound,zBound,computerCount;
        
            // bounds with margins
            
        lx=room.piece.margins[0]+1;
        rx=room.piece.size.x-(room.piece.margins[2]+1);
        if (rx<=lx) rx=lx+1;
        
        tz=room.piece.margins[1]+1;
        bz=room.piece.size.z-(room.piece.margins[3]+1);
        if (bz<=tz) bz=tz+1;
        
            // size
            
        wid=Math.trunc(segmentSize*0.7);
        widOffset=Math.trunc((segmentSize*0.3)*0.5);
        topY=segmentSize;
        botY=Math.trunc(segmentSize*0.1);
        
            // the equipment floor
            
        xBound=new BoundClass((room.offset.x+(lx*segmentSize)),(room.offset.x+(rx*segmentSize)));
        yBound=new BoundClass(room.offset.y,(room.offset.y+botY));
        zBound=new BoundClass((room.offset.z+(tz*segmentSize)),(room.offset.z+(bz*segmentSize)));
            
        GenerateMeshClass.createCube(core,room,(name+'_pedestal'),platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,GenerateMeshClass.UV_MAP,segmentSize);
        
            // if enough room, make a path
            // through the computers
        
        skipX=-1;
        if ((rx-lx)>2) skipX=GenerateUtilityClass.randomInBetween((lx+1),(rx-1));
        skipZ=-1;
        if ((bz-tz)>2) skipZ=GenerateUtilityClass.randomInBetween((tz+1),(bz-1));
        
            // the computers
          
        computerCount=0;
        
        yBound.setFromValues((room.offset.y+botY),(room.offset.y+topY));
        
        for (z=tz;z<bz;z++) {
            if (z===skipZ) continue;
            
            k=(room.offset.z+(z*segmentSize))+widOffset;
            zBound.setFromValues(k,(k+wid));
            
            for (x=lx;x<rx;x++) {
                if (x===skipX) continue;
                
                k=(room.offset.x+(x*segmentSize))+widOffset;
                xBound.setFromValues(k,(k+wid));
                
                GenerateMeshClass.createCube(core,room,(name+'_computer_'+computerCount),computerBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,GenerateMeshClass.UV_BOX,segmentSize);
                
                computerCount++;
            }
        }
    }

}
