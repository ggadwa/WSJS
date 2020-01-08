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
        Object.seal(this);
    }
   
        //
        // pillars
        //
    
    static buildRoomPillars(core,room,name,pillarBitmap,segmentSize)
    {
        let n,x,z,gx,gz;
        let offset,radius,baseRadius,baseHigh;
        let centerPnt=new PointClass(0,0,0);
        let yBound,yBottomBaseBound,yTopBaseBound;
        let cylinderSegments=GenerateMeshClass.createCylinderSegmentList(1,(3*room.storyCount),0.25);
        
            // the y bounds
         
        baseHigh=Math.trunc(segmentSize*GenerateUtilityClass.randomFloat(0.1,0.2));
        yBottomBaseBound=new BoundClass(room.offset.y,(room.offset.y+baseHigh));
        yBound=new BoundClass(yBottomBaseBound.max,(room.offset.y+(room.storyCount*segmentSize)-baseHigh));
        yTopBaseBound=new BoundClass(yBound.max,(room.offset.y+(room.storyCount*segmentSize)));
        
            // build the pillars
            
        offset=Math.trunc(segmentSize*0.5);
        radius=Math.trunc(segmentSize*GenerateUtilityClass.randomFloat(0.1,0.1));
        baseRadius=Math.trunc(radius*GenerateUtilityClass.randomFloat(1.1,0.3));
        
        for (gz=(room.piece.margins[1]+1);gz<(room.piece.size.z-(room.piece.margins[3]+1));gz++) {
            for (gx=(room.piece.margins[0]+1);gx<(room.piece.size.x-(room.piece.margins[2]+1));gx++) {
                if (GenerateUtilityClass.randomPercentage(0.3)) {
                    x=room.offset.x+((gx*segmentSize)+offset);
                    z=room.offset.z+((gz*segmentSize)+offset);
                    centerPnt.setFromValues(x,0,z);
                    
                    GenerateMeshClass.createMeshCylinderSimple(core,room,(name+'_base_bot_'+n),pillarBitmap,centerPnt,yBottomBaseBound,baseRadius,true,false);
                    GenerateMeshClass.createCylinder(core,room,(name+'_'+n),pillarBitmap,centerPnt,yBound,cylinderSegments,radius,false,false);
                    GenerateMeshClass.createMeshCylinderSimple(core,room,(name+'_base_top_'+n),pillarBitmap,centerPnt,yTopBaseBound,baseRadius,false,true);
                }
            }
        }
    }
    
}
