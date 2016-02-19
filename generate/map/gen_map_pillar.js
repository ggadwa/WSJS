"use strict";

//
// generate room pillar class
//

function GenRoomPillarObject(view,map,room,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;

        //
        // pillars
        //
    
    this.addPillars=function()
    {
        var n,pos;
        var count,radius,yBound;
        var room=this.room;
        
            // pillar count
            
        count=this.genRandom.randomIndex(ROOM_MAX_PILLAR_COUNT);
        if (count===0) return;
        
            // ybound
            
        yBound=new wsBound((room.yBound.min-ROOM_FLOOR_DEPTH),room.yBound.max);
        if (room.hasStories) yBound.min-=(room.yBound.getSize()+ROOM_FLOOR_DEPTH);
        
            // pillar radius
        
        radius=this.genRandom.randomInBetween(ROOM_PILLAR_MIN_RADIUS,ROOM_PILLAR_MAX_RADIUS);
        
            // setup cylinder segments
            
        var segments=meshPrimitives.createMeshCylinderSegmentList(this.genRandom,radius,radius,1,ROOM_PILLAR_EXTRA_SEGMENTS);
        
            // make the pillars
            
        for (n=0;n!==count;n++) {
            pos=room.findRandomPillarLocation(this.genRandom);
            if (pos===null) break;          // can't find any open blocks, so stop looking
            
            map.addMesh(meshPrimitives.createMeshCylinder(map.getBitmapById(TEXTURE_PILLAR),pos,yBound,segments,MESH_FLAG_DECORATION));
        }
    };
    
}
