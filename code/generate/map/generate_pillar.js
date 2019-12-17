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
        // pillar types
        //
        /*
    addPillarSingle(core,room,name,pillarBitmap,x,z,segmentSize)
    {
        let x,z,yBound,pos,radius;
        let platformXBound,platformYBound,platformZBound;
        
            // check the grid to avoid blocking stairs
            
        if (room.checkBlockGrid(0,rect.lft,rect.top)) return;

            // position
            
        x=room.xBound.min+Math.trunc(((rect.lft+rect.rgt)*constants.ROOM_BLOCK_WIDTH)*0.5);
        z=room.zBound.min+Math.trunc(((rect.top+rect.bot)*constants.ROOM_BLOCK_WIDTH)*0.5);
        yBound=room.getGroundFloorSpawnToFirstPlatformOrTopBound(rect.lft,rect.top);
        
            // possible platforms
            
        if (this.hasPlatform) {
            platformXBound=new BoundClass((room.xBound.min+(rect.lft*constants.ROOM_BLOCK_WIDTH)),(room.xBound.min+(rect.rgt*constants.ROOM_BLOCK_WIDTH)));
            platformZBound=new BoundClass((room.zBound.min+(rect.top*constants.ROOM_BLOCK_WIDTH)),(room.zBound.min+(rect.bot*constants.ROOM_BLOCK_WIDTH)));
            
            platformYBound=new BoundClass(yBound.min,(yBound.min+constants.ROOM_FLOOR_DEPTH));
            this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,false,true,false,constants.MESH_FLAG_DECORATION));

            platformYBound=new BoundClass((yBound.max-constants.ROOM_FLOOR_DEPTH),yBound.max);
            this.map.meshList.add(MeshPrimitivesClass.createMeshCube(this.view,this.platformBitmap,platformXBound,platformYBound,platformZBound,true,true,true,true,true,false,false,constants.MESH_FLAG_DECORATION));

            yBound.min+=constants.ROOM_FLOOR_DEPTH;
            yBound.max-=constants.ROOM_FLOOR_DEPTH;
        }
        
            // the pillar itself
            
        pos=new PointClass(x,yBound.max,z);
        radius=Math.trunc(((rect.rgt-rect.lft)*constants.ROOM_BLOCK_WIDTH)*0.3);
        
        this.map.meshList.add(MeshPrimitivesClass.createMeshCylinder(this.view,this.pillarBitmap,pos,yBound,this.segments,radius,false,false,constants.MESH_FLAG_DECORATION));
    }
        */
    /*
    addPillarLineX(room,rect)
    {
        let x,z;
        let pillarRect=new RectClass(0,0,0,0);
        
        z=Math.trunc((rect.top+rect.bot)*0.5);
        
        for (x=rect.lft;x!==rect.rgt;x++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect);
        }
    }
    
    addPillarLineZ(room,rect)
    {
        let x,z;
        let pillarRect=new RectClass(0,0,0,0);
        
        x=Math.trunc((rect.lft+rect.rgt)*0.5);
        
        for (z=rect.top;z!==rect.bot;z++) {
            pillarRect.setFromValues(x,z,(x+1),(z+1));
            this.addPillarSingle(room,pillarRect);
        }
    }
    */
        //
        // pillars
        //
    
    static buildRoomPillars(core,room,name,pillarBitmap,segmentSize)
    {
        let centerPt=new PointClass(room.offset.x,0,room.offset.z);
        let yBound=new BoundClass(room.offset.y,room.offset.y+8000);
        
        let segments=GenerateMeshClass.createCylinderSegmentList(1,4);
        
        GenerateMeshClass.createCylinder(core,room,name,pillarBitmap,centerPt,yBound,segments,2500,false,false);
        
        //this.addPillarSingle(core,room,name,pillarBitmap,3,3,segmentSize);
        
        /*
            // determine if this is a square rect
            // if so, one big pillar
            
        if (rect.isSquare()) {
            this.addPillarSingle(room,rect);
            return;
        }
        
            // otherwise a line across the rect
        
        if (rect.isXLarger()) {
            this.addPillarLineX(room,rect);
        }
        else {
            this.addPillarLineZ(room,rect);
        }
            
         */
    }
    
}
