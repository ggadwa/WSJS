import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import MapMeshClass from '../../code/map/map_mesh.js';
import MeshUtilityClass from '../../generate/utility/mesh_utility.js';
import genRandom from '../../generate/utility/random.js';

//
// generate room closet class
//

export default class GenRoomClosetClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        Object.seal(this);
    }
    
        // build the closet cube
        
    createClosetCube(xBound,yBound,zBound)
    {
        let n,idx;
        let vertexList,indexes;
        let bitmap;
        
            // center point for normal creation
            
        let centerPoint=new PointClass(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the walls
            
        bitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_WALL);

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(24);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min); 
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);        
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);     
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);    
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);  
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(24);

        for (n=0;n!==24;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        this.map.addMesh(new MapMeshClass(this.view,bitmap,vertexList,indexes,constants.MESH_FLAG_ROOM_WALL));

            // ceiling
            
        bitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_CEILING);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(6);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.min,zBound.max);
        
        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        this.map.addMesh(new MapMeshClass(this.view,bitmap,vertexList,indexes,constants.MESH_FLAG_ROOM_CEILING));

            // floor
        
        bitmap=this.map.getTexture(constants.MAP_TEXTURE_TYPE_FLOOR);
        
        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(6);

        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.setFromValues(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.setFromValues(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);
        
        this.map.addMesh(new MapMeshClass(this.view,bitmap,vertexList,indexes,constants.MESH_FLAG_ROOM_FLOOR));
    }

        // closet mainline
        
    addCloset(room)
    {
        let n,k,x,z,xAdd,zAdd;
        let story,storyHigh;
        let connectSide,connectOffset,closetLen;
        let xClosetBound,yClosetBound,zClosetBound;
        
        let closetCount=genRandom.randomIndex(constants.CLOSET_MAX_COUNT);
        if (closetCount===0) return;
        
            // story height
            
        storyHigh=constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH;
        
            // create closests
            
        for (n=0;n!==closetCount;n++) {
            
                // find a connection side, skip if
                // there's a door on this side
                
            connectSide=genRandom.randomIndex(4);
            
            if (room.isDoorOnConnectionSide(connectSide)) continue;
            
                // get length and offset
            
            if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                closetLen=genRandom.randomInt(2,(room.zBlockSize-2));
                connectOffset=genRandom.randomInt(0,(room.zBlockSize-closetLen));
            }
            else {
                closetLen=genRandom.randomInt(2,(room.xBlockSize-2));
                connectOffset=genRandom.randomInt(0,(room.xBlockSize-closetLen));
            }
            
                // get the Y bound
                // always need to remove on floor depth for top of closet
                
            story=genRandom.randomInt(0,room.storyCount);
            yClosetBound=new BoundClass(((room.yBound.max-((story+1)*storyHigh))+constants.ROOM_FLOOR_DEPTH),(room.yBound.max-(story*storyHigh)));
            
                // get the box
                
            switch (connectSide) {
                
                case constants.ROOM_SIDE_LEFT:
                    xAdd=0;
                    zAdd=constants.ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xClosetBound=new BoundClass((room.xBound.min-constants.ROOM_BLOCK_WIDTH),room.xBound.min);
                    zClosetBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));
                    break;
                    
                case constants.ROOM_SIDE_TOP:
                    xAdd=constants.ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xClosetBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
                    zClosetBound=new BoundClass((room.zBound.min-constants.ROOM_BLOCK_WIDTH),room.zBound.min);
                    break;
                    
                case constants.ROOM_SIDE_RIGHT:
                    xAdd=0;
                    zAdd=constants.ROOM_BLOCK_WIDTH;
                    z=room.zBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xClosetBound=new BoundClass(room.xBound.max,(room.xBound.max+constants.ROOM_BLOCK_WIDTH));
                    zClosetBound=new BoundClass(z,(z+constants.ROOM_BLOCK_WIDTH));
                    break;
                    
                case constants.ROOM_SIDE_BOTTOM:
                    xAdd=constants.ROOM_BLOCK_WIDTH;
                    zAdd=0;
                    x=room.xBound.min+(connectOffset*constants.ROOM_BLOCK_WIDTH);
                    xClosetBound=new BoundClass(x,(x+constants.ROOM_BLOCK_WIDTH));
                    zClosetBound=new BoundClass(room.zBound.max,(room.zBound.max+constants.ROOM_BLOCK_WIDTH));
                    break;
            }
            
                // build the blocks
            
            for (k=0;k!==closetLen;k++) {
                if (this.map.boxBoundCollision(xClosetBound,null,zClosetBound,constants.MESH_FLAG_ROOM_WALL)!==-1) break;

                this.createClosetCube(xClosetBound,yClosetBound,zClosetBound);
                this.map.addOverlayCloset(xClosetBound,zClosetBound);
                
                if (story===0) room.maskEdgeGridBlockToBounds(xClosetBound,zClosetBound);    // block off ledges for edge grid
                
                xClosetBound.add(xAdd);
                zClosetBound.add(zAdd);
            }
        }
        
    }

}
