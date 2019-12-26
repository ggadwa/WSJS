import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate room pillar decoration class
//

export default class GeneratePillarClass
{
    constructor()
    {
    }
    
        //
        // pillar patterns
        //
        
    static buildCheckboardPillarPattern(core,room)
    {
        let x,z;
        let posList=[];
        
        for (z=(room.piece.margins[1]+1);z<(room.piece.size.z-(room.piece.margins[3]+1));z+=2) {
            for (x=(room.piece.margins[0]+1);x<(room.piece.size.x-(room.piece.margins[2]+1));x+=2) {
                posList.push([x,z]);
            }
        }
        
        return(posList);
    }

    static buildHorizontalPillarPattern(core,room)
    {
        let x,z;
        let posList=[];
        
        z=Math.trunc(room.piece.size.z*0.5);
        
        for (x=(room.piece.margins[0]+1);x<(room.piece.size.x-(room.piece.margins[2]+1));x+=2) {
            posList.push([x,z]);
        }
        
        return(posList);
    }

    static buildVerticalPillarPattern(core,room)
    {
        let x,z;
        let posList=[];
        
        x=Math.trunc(room.piece.size.x*0.5);
        
        for (z=(room.piece.margins[1]+1);z<(room.piece.size.z-(room.piece.margins[3]+1));z+=2) {
            posList.push([x,z]);
        }
        
        return(posList);
    }

    static buildCornerPillarPattern(core,room)
    {
        let x=room.piece.size.x-(room.piece.margins[2]+1);
        let z=room.piece.size.z-(room.piece.margins[3]+1);
        
        return([[room.piece.margins[0],room.piece.margins[1]],[x,room.piece.margins[1]],[room.piece.margins[0],z],[x,z]]);
    }
   
        //
        // pillars
        //
    
    static buildRoomPillars(core,room,name,pillarBitmap,segmentSize)
    {
        let n,x,z,posList;
        let offset,radius;
        let centerPnt=new PointClass(0,0,0);
        let yBound=new BoundClass(room.offset.y,room.offset.y+(room.storyCount*segmentSize));
        let cylinderSegments=GenerateMeshClass.createCylinderSegmentList(1,(4*room.storyCount),0.5);
        
            // get pillar positions
            
        switch(GenerateUtilityClass.randomIndex(4)) {
            
            case 0:
                posList=this.buildCheckboardPillarPattern(core,room);
                break;
            
            case 1:
                posList=this.buildHorizontalPillarPattern(core,room);
                break;
                
            case 2:
                posList=this.buildVerticalPillarPattern(core,room);
                break;
                
            case 3:
                posList=this.buildCornerPillarPattern(core,room);
                break;
            
        }
        
            // build the pillars
            
        offset=Math.trunc(segmentSize*0.5);
        radius=Math.trunc(offset*0.8);
            
        for (n=0;n!=posList.length;n++) {
            x=room.offset.x+((posList[n][0]*segmentSize)+offset);
            z=room.offset.z+((posList[n][1]*segmentSize)+offset);
            centerPnt.setFromValues(x,0,z);
            GenerateMeshClass.createCylinder(core,room,(name+'_'+n),pillarBitmap,centerPnt,yBound,cylinderSegments,radius,false,false);
        }
    }
    
}
