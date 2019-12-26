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
            GenerateMeshClass.createCubeRotated(core,room,(name+'_'+stackLevel),boxBitmap,boxXBound,boxYBound,boxZBound,rotAngle,true,true,true,true,true,(stackLevel!==0),false,true,segmentSize);
            
                // go up one level

            boxYBound.add(boxSize);
            if (boxYBound.max>(room.offset.y+(segmentSize*room.storyCount))) break;
        }
    }
            
        //
        // storage
        //

    static buildRoomComputer(core,room,name,platformBitmap,computerBitmap,segmentSize)
    {
        let x,z,k,wid,widOffset,topY,botY;
        let lx,rx,tz,bz;
        let xBound,yBound,zBound,computerCount;
        
            // bounds with margins
            
        lx=room.piece.margins[0]+1;
        rx=room.piece.size.x-(room.piece.margins[2]+1);
        tz=room.piece.margins[1]+1;
        bz=room.piece.size.z-(room.piece.margins[3]+1);
        
            // size
            
        wid=Math.trunc(segmentSize*0.7);
        widOffset=Math.trunc((segmentSize*0.3)*0.5);
        topY=segmentSize;
        botY=Math.trunc(segmentSize*0.1);
        
            // the equipment floor
            
        xBound=new BoundClass((room.offset.x+(lx*segmentSize)),(room.offset.x+(rx*segmentSize)));
        yBound=new BoundClass(room.offset.y,(room.offset.y+botY));
        zBound=new BoundClass((room.offset.z+(tz*segmentSize)),(room.offset.z+(bz*segmentSize)));
            
        GenerateMeshClass.createCube(core,room,(name+'_pedestal'),platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,true,segmentSize);
        
            // the computers
          
        computerCount=0;
        
        yBound.setFromValues((room.offset.y+botY),(room.offset.y+topY));
        
        for (z=tz;z<bz;z++) {
            k=(room.offset.z+(z*segmentSize))+widOffset;
            zBound.setFromValues(k,(k+wid));
            
            for (x=lx;x<rx;x++) {
                k=(room.offset.x+(x*segmentSize))+widOffset;
                xBound.setFromValues(k,(k+wid));
                
                GenerateMeshClass.createCube(core,room,(name+'_computer_'+computerCount),computerBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,true,segmentSize);
                
                computerCount++;
            }
        }
    }

}
