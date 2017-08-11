import PointClass from '../../code/utility/point.js';
import genRandom from '../../generate/utility/random.js';
import map from '../../code/map/map.js';

//
// map ledges
//

export default class GenRoomLedgeClass
{
    constructor()
    {
        this.LEDGE_PERCENTAGE=0.5;              // percentage of > 1 story rooms that have ledges
        this.LEDGE_MIN_HEIGHT=300;              // minimum height of ledges
        this.LEDGE_EXTRA_HEIGHT=1500;           // extra height of ledges
        this.LEDGE_MIN_WIDTH=2000;              // minum width of ledges
        this.LEDGE_EXTRA_WIDTH=3000;            // extra width

        Object.seal(this);
    }
    
        //
        // add ledge chunk
        //

    addLedgeChunk(room,pts,nSide,high,bitmap)
    {
        let n,k,idx,indexes;
        let vertexCount,vertexList;
        
            // height
            
        let by=room.yBound.max;
        let ty=by-high;
        
            // get vertex count
        
        vertexCount=(nSide-2)*3;            // the top
        vertexCount+=(6*nSide);             // sides
        
            // get cube size

        idx=0;
        vertexList=MeshUtilityClass.createMapVertexList(vertexCount);

            // sides

        for (n=0;n!==nSide;n++) {
            k=n+1;
            if (k===nSide) k=0;

            vertexList[idx++].position.setFromValues(pts[n].x,ty,pts[n].z); 
            vertexList[idx++].position.setFromValues(pts[k].x,ty,pts[k].z);        
            vertexList[idx++].position.setFromValues(pts[k].x,by,pts[k].z);     
            vertexList[idx++].position.setFromValues(pts[n].x,ty,pts[n].z);    
            vertexList[idx++].position.setFromValues(pts[k].x,by,pts[k].z);  
            vertexList[idx++].position.setFromValues(pts[n].x,by,pts[n].z);
        }

            // top

        for (n=0;n!==(nSide-2);n++) {
            vertexList[idx++].position.setFromValues(pts[0].x,ty,pts[0].z);
            vertexList[idx++].position.setFromValues(pts[n+1].x,ty,pts[n+1].z);
            vertexList[idx++].position.setFromValues(pts[n+2].x,ty,pts[n+2].z);
        }

        indexes=new Uint16Array(vertexCount);

        for (n=0;n!==vertexCount;n++) {
            indexes[n]=n;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        MeshUtilityClass.buildVertexListNormals(vertexList,indexes,null,false);
        MeshUtilityClass.buildVertexListUVs(bitmap,vertexList);
        MeshUtilityClass.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        map.addMesh(new MapMeshClass(bitmap,vertexList,indexes,map.MESH_FLAG_LEDGE));
    }
        
        //
        // create ledges
        // 
    
    createLedges(room)
    {
        let x,z;
        let ledgeBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        let wid,high;
        let xMax,zMax;
        let pts;
        
            // does this room have a ledge?
            
        if (!genRandom.randomPercentage(this.LEDGE_PERCENTAGE)) return;
        
            // ledge width and height
            
        wid=genRandom.randomInt(this.LEDGE_MIN_WIDTH,this.LEDGE_EXTRA_WIDTH);
        high=genRandom.randomInt(this.LEDGE_MIN_HEIGHT,this.LEDGE_EXTRA_HEIGHT);
        
        xMax=room.xBlockSize*map.ROOM_BLOCK_WIDTH;
        zMax=room.zBlockSize*map.ROOM_BLOCK_WIDTH;
        
        pts=[new PointClass(0,0,0),new PointClass(0,0,0),new PointClass(0,0,0),new PointClass(0,0,0),new PointClass(0,0,0)];

            // left and right sides
        
        for (z=1;z<(room.zBlockSize-1);z++) {
            
            if (room.getEdgeGridValue(0,z)===0) {
                pts[0].setFromValues(0,0,(z*map.ROOM_BLOCK_WIDTH));
                pts[0].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[1].setFromValues(wid,0,(z*map.ROOM_BLOCK_WIDTH));
                pts[1].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[2].setFromValues(wid,0,((z+1)*map.ROOM_BLOCK_WIDTH));
                pts[2].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[3].setFromValues(0,0,((z+1)*map.ROOM_BLOCK_WIDTH));
                pts[3].addValues(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,ledgeBitmap);
            }
            
            if (room.getEdgeGridValue((room.xBlockSize-1),z)===0) {
                pts[0].setFromValues((xMax-wid),0,(z*map.ROOM_BLOCK_WIDTH));
                pts[0].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[1].setFromValues(xMax,0,(z*map.ROOM_BLOCK_WIDTH));
                pts[1].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[2].setFromValues(xMax,0,((z+1)*map.ROOM_BLOCK_WIDTH));
                pts[2].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[3].setFromValues((xMax-wid),0,((z+1)*map.ROOM_BLOCK_WIDTH));
                pts[3].addValues(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,ledgeBitmap);
            }
        }
        
            // top and bottom sides
            
        for (x=1;x<(room.xBlockSize-1);x++) {
            
            if (room.getEdgeGridValue(x,0)===0) {
                pts[0].setFromValues((x*map.ROOM_BLOCK_WIDTH),0,0);
                pts[0].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[1].setFromValues((x*map.ROOM_BLOCK_WIDTH),0,wid);
                pts[1].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[2].setFromValues(((x+1)*map.ROOM_BLOCK_WIDTH),0,wid);
                pts[2].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[3].setFromValues(((x+1)*map.ROOM_BLOCK_WIDTH),0,0);
                pts[3].addValues(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,ledgeBitmap);
            }
            
            if (room.getEdgeGridValue(x,(room.zBlockSize-1))===0) {
                pts[0].setFromValues((x*map.ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[0].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[1].setFromValues((x*map.ROOM_BLOCK_WIDTH),0,zMax);
                pts[1].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[2].setFromValues(((x+1)*map.ROOM_BLOCK_WIDTH),0,zMax);
                pts[2].addValues(room.xBound.min,0,room.zBound.min);
                
                pts[3].setFromValues(((x+1)*map.ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[3].addValues(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,ledgeBitmap);
            }
        }
        
            // corners
            // they can have different heights
            
        high=genRandom.randomInt(this.LEDGE_MIN_HEIGHT,this.LEDGE_EXTRA_HEIGHT);
            
        if (room.getEdgeGridValue(0,0)===0) {
            pts[0].setFromValues(0,0,0);
            pts[0].addValues(room.xBound.min,0,room.zBound.min);

            pts[1].setFromValues(map.ROOM_BLOCK_WIDTH,0,0);
            pts[1].addValues(room.xBound.min,0,room.zBound.min);

            pts[2].setFromValues(map.ROOM_BLOCK_WIDTH,0,wid);
            pts[2].addValues(room.xBound.min,0,room.zBound.min);

            pts[3].setFromValues(wid,0,map.ROOM_BLOCK_WIDTH);
            pts[3].addValues(room.xBound.min,0,room.zBound.min);
            
            pts[4].setFromValues(0,0,map.ROOM_BLOCK_WIDTH);
            pts[4].addValues(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,ledgeBitmap);
        }
        
        if (room.getEdgeGridValue((room.xBlockSize-1),0)===0) {
            pts[0].setFromValues((xMax-map.ROOM_BLOCK_WIDTH),0,0);
            pts[0].addValues(room.xBound.min,0,room.zBound.min);

            pts[1].setFromValues(xMax,0,0);
            pts[1].addValues(room.xBound.min,0,room.zBound.min);

            pts[2].setFromValues(xMax,0,map.ROOM_BLOCK_WIDTH);
            pts[2].addValues(room.xBound.min,0,room.zBound.min);

            pts[3].setFromValues((xMax-wid),0,map.ROOM_BLOCK_WIDTH);
            pts[3].addValues(room.xBound.min,0,room.zBound.min);
            
            pts[4].setFromValues((xMax-map.ROOM_BLOCK_WIDTH),0,wid);
            pts[4].addValues(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,ledgeBitmap);
        }
        
        if (room.getEdgeGridValue((room.xBlockSize-1),(room.zBlockSize-1))===0) {
            pts[0].setFromValues((xMax-wid),0,(zMax-map.ROOM_BLOCK_WIDTH));
            pts[0].addValues(room.xBound.min,0,room.zBound.min);

            pts[1].setFromValues(xMax,0,(zMax-map.ROOM_BLOCK_WIDTH));
            pts[1].addValues(room.xBound.min,0,room.zBound.min);

            pts[2].setFromValues(xMax,0,zMax);
            pts[2].addValues(room.xBound.min,0,room.zBound.min);

            pts[3].setFromValues((xMax-map.ROOM_BLOCK_WIDTH),0,zMax);
            pts[3].addValues(room.xBound.min,0,room.zBound.min);
            
            pts[4].setFromValues((xMax-map.ROOM_BLOCK_WIDTH),0,(zMax-wid));
            pts[4].addValues(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,ledgeBitmap);
        }
        
        if (room.getEdgeGridValue(0,(room.zBlockSize-1))===0) {
            pts[0].setFromValues(0,0,(zMax-map.ROOM_BLOCK_WIDTH));
            pts[0].addValues(room.xBound.min,0,room.zBound.min);

            pts[1].setFromValues(wid,0,(zMax-map.ROOM_BLOCK_WIDTH));
            pts[1].addValues(room.xBound.min,0,room.zBound.min);

            pts[2].setFromValues(map.ROOM_BLOCK_WIDTH,0,(zMax-wid));
            pts[2].addValues(room.xBound.min,0,room.zBound.min);

            pts[3].setFromValues(map.ROOM_BLOCK_WIDTH,0,zMax);
            pts[3].addValues(room.xBound.min,0,room.zBound.min);
            
            pts[4].setFromValues(0,0,zMax);
            pts[4].addValues(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,ledgeBitmap);
        }
    }
    
}

