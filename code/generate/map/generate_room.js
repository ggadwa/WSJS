import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';

export default class GenerateRoomClass
{
    constructor(core,piece,segmentSize)
    {
        this.core=core;
        this.piece=piece;

        this.storyCount=this.core.randomInt(this.piece.storyMinimum,3);
        
        this.offset=new PointClass(0,0,0);
        this.size=new PointClass((segmentSize*piece.size.x),(segmentSize*this.storyCount),(segmentSize*piece.size.z));
        
            // flags for staircases
            
        this.requiredStairs=[];
        
            // vertex hiding array, had 3 possible stories
            
        this.vertexHideArray=new Uint8Array(this.piece.vertexes.length*3);
        
            // grids for blocking off floor/stories/etc
            
        this.grid=new Uint8Array((this.piece.size.x*this.piece.size.z)*5);        // up to 5 stories
    }
    
        //
        // collisions and touches with room boxes
        //
        
    collides(rooms)
    {
        let n,checkRoom;
        
        for (n=0;n!==rooms.length;n++) {
            checkRoom=rooms[n];
            if (this.offset.x>=(checkRoom.offset.x+checkRoom.size.x)) continue;
            if ((this.offset.x+this.size.x)<=checkRoom.offset.x) continue;
            if (this.offset.z>=(checkRoom.offset.z+checkRoom.size.z)) continue;
            if ((this.offset.z+this.size.z)<=checkRoom.offset.z) continue;
            
            return(true);
        }
        
        return(false);
    }
    
    touches(rooms)
    {
        let n,checkRoom;
        
        for (n=0;n!==rooms.length;n++) {
            checkRoom=rooms[n];
            if ((this.offset.x===(checkRoom.offset.x+checkRoom.size.x)) || ((this.offset.x+this.size.x)===checkRoom.offset.x)) {
                if (this.offset.z>=(checkRoom.offset.z+checkRoom.size.z)) continue;
                if ((this.offset.z+this.size.z)<=checkRoom.offset.z) continue;
                return(n);
            }
            
            if ((this.offset.z===(checkRoom.offset.z+checkRoom.size.z)) || ((this.offset.z+this.size.z)===checkRoom.offset.z)) {
                if (this.offset.x>=(checkRoom.offset.x+checkRoom.size.x)) continue;
                if ((this.offset.x+this.size.x)<=checkRoom.offset.x) continue;
                return(n);
            }
        }
        
        return(-1);
    }
    
        //
        // shared/touching walls
        //
        
    hasSharedWalls(checkRoom,segmentSize)
    {
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        
            // check to see if two rooms share a wall segment
        
        nVertex=this.piece.vertexes.length;
        nVertex2=checkRoom.piece.vertexes.length;
                
        vIdx=0;

        while (vIdx<nVertex) {
            nextIdx=vIdx+1;
            if (nextIdx===nVertex) nextIdx=0;

            ax=Math.trunc(this.piece.vertexes[vIdx][0]*segmentSize)+this.offset.x
            az=Math.trunc(this.piece.vertexes[vIdx][1]*segmentSize)+this.offset.z

            ax2=Math.trunc(this.piece.vertexes[nextIdx][0]*segmentSize)+this.offset.x
            az2=Math.trunc(this.piece.vertexes[nextIdx][1]*segmentSize)+this.offset.z

            vIdx2=0;

            while (vIdx2<nVertex2) {
                nextIdx2=vIdx2+1;
                if (nextIdx2===nVertex2) nextIdx2=0;

                bx=Math.trunc(checkRoom.piece.vertexes[vIdx2][0]*segmentSize)+checkRoom.offset.x
                bz=Math.trunc(checkRoom.piece.vertexes[vIdx2][1]*segmentSize)+checkRoom.offset.z

                bx2=Math.trunc(checkRoom.piece.vertexes[nextIdx2][0]*segmentSize)+checkRoom.offset.x
                bz2=Math.trunc(checkRoom.piece.vertexes[nextIdx2][1]*segmentSize)+checkRoom.offset.z

                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) return(true);

                vIdx2++;
            }

            vIdx++;
        }
        
        return(false);
    }
    
    getTouchWallRange(checkRoom,xRun,segmentSize)
    {
        let n,k,vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        let touchMin,touchMax;
        let touchPoints=[];
        
            // find all the touching wall segements
        
        nVertex=this.piece.vertexes.length;
        nVertex2=checkRoom.piece.vertexes.length;
                
        vIdx=0;

        while (vIdx<nVertex) {
            nextIdx=vIdx+1;
            if (nextIdx===nVertex) nextIdx=0;

            ax=Math.trunc(this.piece.vertexes[vIdx][0]*segmentSize)+this.offset.x
            az=Math.trunc(this.piece.vertexes[vIdx][1]*segmentSize)+this.offset.z

            ax2=Math.trunc(this.piece.vertexes[nextIdx][0]*segmentSize)+this.offset.x
            az2=Math.trunc(this.piece.vertexes[nextIdx][1]*segmentSize)+this.offset.z

            vIdx2=0;

            while (vIdx2<nVertex2) {
                nextIdx2=vIdx2+1;
                if (nextIdx2===nVertex2) nextIdx2=0;

                bx=Math.trunc(checkRoom.piece.vertexes[vIdx2][0]*segmentSize)+checkRoom.offset.x
                bz=Math.trunc(checkRoom.piece.vertexes[vIdx2][1]*segmentSize)+checkRoom.offset.z

                bx2=Math.trunc(checkRoom.piece.vertexes[nextIdx2][0]*segmentSize)+checkRoom.offset.x
                bz2=Math.trunc(checkRoom.piece.vertexes[nextIdx2][1]*segmentSize)+checkRoom.offset.z

                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                    if (xRun) {
                        touchPoints.push(Math.min(this.piece.vertexes[vIdx][0],this.piece.vertexes[nextIdx][0]));   // always use the min, as stairs draw from there
                    }
                    else {
                         touchPoints.push(Math.min(this.piece.vertexes[vIdx][1],this.piece.vertexes[nextIdx][1]));
                    }
                }

                vIdx2++;
            }

            vIdx++;
        }
        
            // now convert into x or z runs
            
        if (touchPoints.length===0) return(null);
            
        touchMin=touchMax=touchPoints[0];

        for (n=1;n<touchPoints.length;n++) {
            k=touchPoints[n];
            if (k<touchMin) touchMin=k;
            if (k>touchMax) touchMax=k;
        }
        
        return(new BoundClass(touchMin,touchMax));
    }
    
        //
        // vertexes
        //
    
    hideVertex(story,vIdx)
    {
        this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]=1;
    }
    
    isWallHidden(story,vIdx)
    {
        return(this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]===1);
    }
    
        //
        // grids (for marking off areas used by things)
        //
    
    setGrid(storyIdx,x,z,flag)
    {
        this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]=flag;
    }
    
    setGridAllStories(x,z,flag)
    {
        let n;
        
        for (n=0;n!=(this.storyCount+1);n++) {
            this.setGrid(n,x,z,flag);
        }
    }
    
    getGrid(storyIdx,x,z)
    {
        return(this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]);
    }
    
}
