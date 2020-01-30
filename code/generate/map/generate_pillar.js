import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';

//
// generate room pillar decoration class
//

export default class GeneratePillarClass
{
    constructor(core,room,name,genMesh,pillarBitmap,segmentSize)
    {
        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.pillarBitmap=pillarBitmap;
        this.segmentSize=segmentSize;

        Object.seal(this);
    }
   
        //
        // pillars
        //
    
    build()
    {
        let n,x,z,gx,gz,lx,rx,tz,bz;
        let offset,radius,baseRadius,baseHigh;
        let centerPnt=new PointClass(0,0,0);
        let yBound,yBottomBaseBound,yTopBaseBound;
        let cylinderSegments=this.genMesh.createCylinderSegmentList(1,(3*this.room.storyCount),0.25);
        
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
        
            // the y bounds
         
        baseHigh=Math.trunc(this.segmentSize*this.core.randomFloat(0.1,0.2));
        yBottomBaseBound=new BoundClass(this.room.offset.y,(this.room.offset.y+baseHigh));
        yBound=new BoundClass(yBottomBaseBound.max,(this.room.offset.y+(this.room.storyCount*this.segmentSize)-baseHigh));
        yTopBaseBound=new BoundClass(yBound.max,(this.room.offset.y+(this.room.storyCount*this.segmentSize)));
        
            // build the pillars
            
        offset=Math.trunc(this.segmentSize*0.5);
        radius=Math.trunc(this.segmentSize*this.core.randomFloat(0.1,0.1));
        baseRadius=Math.trunc(radius*this.core.randomFloat(1.1,0.3));
        
        for (gz=tz;gz<bz;gz++) {
            for (gx=lx;gx<rx;gx++) {
                if (this.core.randomPercentage(0.3)) {
                    x=this.room.offset.x+((gx*this.segmentSize)+offset);
                    z=this.room.offset.z+((gz*this.segmentSize)+offset);
                    centerPnt.setFromValues(x,0,z);
                    
                    this.genMesh.createMeshCylinderSimple(this.room,(this.name+'_base_bot_'+n),this.pillarBitmap,centerPnt,yBottomBaseBound,baseRadius,true,false);
                    this.genMesh.createCylinder(this.room,(this.name+'_'+n),this.pillarBitmap,centerPnt,yBound,cylinderSegments,radius,false,false);
                    this.genMesh.createMeshCylinderSimple(this.room,(this.name+'_base_top_'+n),this.pillarBitmap,centerPnt,yTopBaseBound,baseRadius,false,true);
                    
                    this.room.setGrid(0,x,z,1);
                }
            }
        }
    }
    
}
