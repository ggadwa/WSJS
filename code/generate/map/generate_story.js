import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import MeshMoveClass from '../../mesh/mesh_move.js';
import MeshMovementClass from '../../mesh/mesh_movement.js';
import GenerateMeshClass from './generate_mesh.js';

export default class GenerateStoryClass
{
    constructor(core,room,name,genMesh,stepBitmap,platformBitmap,segmentSize)
    {
        this.PLATFORM_DIR_POS_Z=0;
        this.PLATFORM_DIR_NEG_Z=1;
        this.PLATFORM_DIR_POS_X=2;
        this.PLATFORM_DIR_NEG_X=3;
        
        this.FLAG_NONE=0;
        this.FLAG_STEPS=1;
        this.FLAG_LIFT=2;
        this.FLAG_PLATFORM=3;
        this.FLAG_WALL=4;

        this.core=core;
        this.room=room;
        this.name=name;
        this.genMesh=genMesh;
        this.stepBitmap=stepBitmap;
        this.platformBitmap=platformBitmap;
        this.segmentSize=segmentSize;
        
        Object.seal(this);
    }
    
        //
        // lifts and stairs
        //
  
    addLift(x,z)
    {
        let n,sx,sz,y,meshIdx;
        let liftName,moveMilliSec,waitMilliSec;
        let mesh;
        let floorHigh=Math.trunc(this.segmentSize*0.1);
        
            // block off all the stories
            
        this.room.setGridAllStories(x,z,this.FLAG_LIFT);

            // the lift cube
            
        sx=this.room.offset.x+(x*this.segmentSize);
        sz=this.room.offset.z+(z*this.segmentSize);

        liftName=this.name+'_lift';
        meshIdx=this.genMesh.addBox(liftName,this.stepBitmap,sx,(sx+this.segmentSize),this.room.offset.y,(this.room.offset.y+((this.segmentSize*(this.room.storyCount-1))+floorHigh)),sz,(sz+this.segmentSize),true,true,true,true,true,true,this.segmentSize);

            // the lift movement

        moveMilliSec=this.core.randomInt(1000,3000);
        waitMilliSec=this.core.randomInt(1000,3000);

        mesh=this.core.game.map.meshList.meshes[meshIdx];
        mesh.movement=new MeshMovementClass(this.core,mesh,new PointClass(0,0,0));

        mesh.movement.addMove(new MeshMoveClass(waitMilliSec,new PointClass(0,0,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));

        for (n=1;n<this.room.storyCount;n++) {
            y=-(this.segmentSize*n);
            mesh.movement.addMove(new MeshMoveClass(moveMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));
            mesh.movement.addMove(new MeshMoveClass(waitMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));
        }

        for (n=(this.room.storyCount-2);n>0;n--) {
            y=-(this.segmentSize*n);
            mesh.movement.addMove(new MeshMoveClass(moveMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));
            mesh.movement.addMove(new MeshMoveClass(waitMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));
        }

        mesh.movement.addMove(new MeshMoveClass(moveMilliSec,new PointClass(0,0,0),new PointClass(0,0,0),movement.MOVEMENT_PAUSE_NONE,null,null,null));
    }
    
    addStairs(x,z,dir,storyIdx)
    {
        let floorHigh=Math.trunc(this.segmentSize*0.1);
        let y=this.room.offset.y+(storyIdx*this.segmentSize)+(floorHigh*storyIdx);
        
        switch (dir)
        {
            case this.genMesh.STAIR_DIR_POS_Z:
                this.room.setGridAllStories(x,z,this.FLAG_STEPS);
                this.room.setGridAllStories(x,(z+1),this.FLAG_STEPS);
                break;
            case this.genMesh.STAIR_DIR_NEG_Z:
                this.room.setGridAllStories(x,z,this.FLAG_STEPS);
                this.room.setGridAllStories(x,(z-1),this.FLAG_STEPS);
                break;
            case this.genMesh.STAIR_DIR_POS_X:
                this.room.setGridAllStories(x,z,this.FLAG_STEPS);
                this.room.setGridAllStories((x+1),z,this.FLAG_STEPS);
                break;
            case this.genMesh.STAIR_DIR_NEG_X:
                this.room.setGridAllStories(x,z,this.FLAG_STEPS);
                this.room.setGridAllStories((x-1),z,this.FLAG_STEPS);
                break;
        }
        
        this.genMesh.buildStairs(this.room,this.name,this.stepBitmap,this.segmentSize,(this.room.offset.x+(x*this.segmentSize)),y,(this.room.offset.z+(z*this.segmentSize)),dir,1,true);
    }
    
        //
        // second story segments
        //
        
    hasNegXWall(storyIdx,x,z)
    {
        let flag,flag2;
        
        if (x===0) return(true);

        flag=this.room.getGrid(storyIdx,x,z);
        flag2=this.room.getGrid(storyIdx,(x-1),z);
        
        if ((flag2===this.FLAG_NONE) || (flag2===this.FLAG_STAIRS) || (flag2===this.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===this.FLAG_PLATFORM) && (flag2===this.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    hasPosXWall(storyIdx,x,z)
    {
        let flag,flag2;
        
        if (x===(this.room.piece.size.x-1)) return(true);
        
        flag=this.room.getGrid(storyIdx,x,z);
        flag2=this.room.getGrid(storyIdx,(x+1),z);
        
        if ((flag2===this.FLAG_NONE) || (flag2===this.FLAG_STAIRS) || (flag2===this.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===this.FLAG_PLATFORM) && (flag2===this.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    hasNegZWall(storyIdx,x,z)
    {
        let flag,flag2;
        
        if (z===0) return(true);
        
        flag=this.room.getGrid(storyIdx,x,z);
        flag2=this.room.getGrid(storyIdx,x,(z-1));
        
        if ((flag2===this.FLAG_NONE) || (flag2===this.FLAG_STAIRS) || (flag2===this.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===this.FLAG_PLATFORM) && (flag2===this.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    hasPosZWall(storyIdx,x,z)
    {
        let flag,flag2;
        
        if (z===(this.room.piece.size.z-1)) return(true);
        
        flag=this.room.getGrid(storyIdx,x,z);
        flag2=this.room.getGrid(storyIdx,x,(z+1));
        
        if ((flag2===this.FLAG_NONE) || (flag2===this.FLAG_STAIRS) || (flag2===this.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===this.FLAG_PLATFORM) && (flag2===this.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    setupRandomPlatforms(startX,startZ,storyIdx)
    {
        let x,z,gx,gz,sx,sz;
        let dir,orgDir;
        let wallStop;
        
        gx=startX;
        gz=startZ;
        
            // start the random wander of segments

        while (true) {

                // next random direction
                
            dir=this.core.randomIndex(4);
            orgDir=dir;
            
                // find open direction
                
            wallStop=false;
            
            while (true) {

                switch (dir) {
                    case this.PLATFORM_DIR_POS_Z:
                        sx=gx;
                        sz=gz+1;
                        break;
                    case this.PLATFORM_DIR_NEG_Z:
                        sx=gx;
                        sz=gz-1;
                        break;
                    case this.PLATFORM_DIR_POS_X:
                        sx=gx+1;
                        sz=gz;
                        break;
                    case this.PLATFORM_DIR_NEG_X:
                        sx=gx-1;
                        sz=gz;
                        break;
                }

                if ((this.room.getGrid(storyIdx,sx,sz)!==this.FLAG_NONE) || (sx<0) || (sx>=this.room.piece.size.x) || (sz<0) || (sz>=this.room.piece.size.z)) {
                    dir++;
                    if (dir===4) dir=0;
                    if (dir===orgDir) {
                        wallStop=true;
                        break;
                    }
                }
                else {
                    break;
                }
            }
            
            if (wallStop) break;
            
                // add grid spot
                
            this.room.setGrid(storyIdx,sx,sz,this.FLAG_PLATFORM);
            
            gx=sx;
            gz=sz;
        }

            // randomly make stripes where stories
            // become solid walls instead of floating blocks
            // only do it on first story
            
        if (storyIdx===1) {
            for (x=1;x<(this.room.piece.size.x-1);x++) {
                if (this.core.randomPercentage(0.2)) {
                    for (z=1;z<(this.room.piece.size.z-1);z++) {
                        if (this.room.getGrid(storyIdx,x,z)===this.FLAG_PLATFORM) this.room.setGrid(storyIdx,x,z,this.FLAG_WALL);
                    }
                }
            }

            for (z=1;z<(this.room.piece.size.z-1);z++) {
                if (this.core.randomPercentage(0.2)) {
                    for (x=1;x<(this.room.piece.size.x-1);x++) {
                        if (this.room.getGrid(storyIdx,x,z)===this.FLAG_PLATFORM) this.room.setGrid(storyIdx,x,z,this.FLAG_WALL);
                    }
                }
            }
        }
    }
    
    addPlatforms(storyIdx)
    {
        let x,z,ty,by;
        let negX,posX,negZ,posZ;
        let skipBottom;
        let vertexArray=[];
        let indexArray=[];
        let normalArray=[];
        let uvArray,tangentArray;
        let trigIdx,flag;
        let floorHigh=Math.trunc(this.segmentSize*0.1);
        
            // make the segments
        
        trigIdx=0;
        
        for (z=0;z!==this.room.piece.size.z;z++) {
            for (x=0;x!==this.room.piece.size.x;x++) {
                flag=this.room.getGrid(storyIdx,x,z);
                if ((flag!==this.FLAG_PLATFORM) && (flag!==this.FLAG_WALL)) continue;

                    // create the segments
                    
                if (flag===this.FLAG_PLATFORM) {
                    ty=this.room.offset.y+((this.segmentSize*storyIdx)+floorHigh);
                    by=this.room.offset.y+(this.segmentSize*storyIdx);
                    skipBottom=false;
                }
                else {
                    ty=this.room.offset.y+((this.segmentSize*storyIdx)+floorHigh);
                    by=this.room.offset.y+(this.segmentSize*(storyIdx-1));
                    skipBottom=true;
                }
                
                negX=this.room.offset.x+(x*this.segmentSize);
                posX=this.room.offset.x+((x+1)*this.segmentSize);
                negZ=this.room.offset.z+(z*this.segmentSize);
                posZ=this.room.offset.z+((z+1)*this.segmentSize);
                
                if (this.hasNegXWall(storyIdx,x,z)) {
                    vertexArray.push(negX,ty,negZ,negX,ty,posZ,negX,by,posZ,negX,by,negZ);
                    normalArray.push(-1,0,0,-1,0,0,-1,0,0,-1,0,0);
                    trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosXWall(storyIdx,x,z)) {
                    vertexArray.push(posX,ty,negZ,posX,ty,posZ,posX,by,posZ,posX,by,negZ);
                    normalArray.push(1,0,0,1,0,0,1,0,0,1,0,0);
                    trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);
                }
                
                    // always draw the top
                    
                vertexArray.push(negX,ty,negZ,negX,ty,posZ,posX,ty,posZ,posX,ty,negZ);
                normalArray.push(0,1,0,0,1,0,0,1,0,0,1,0);
                trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);

                if (!skipBottom) {
                    vertexArray.push(negX,by,negZ,negX,by,posZ,posX,by,posZ,posX,by,negZ);
                    normalArray.push(0,-1,0,0,-1,0,0,-1,0,0,-1,0);
                    trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasNegZWall(storyIdx,x,z)) {
                    vertexArray.push(negX,ty,negZ,posX,ty,negZ,posX,by,negZ,negX,by,negZ);
                    normalArray.push(0,0,-1,0,0,-1,0,0,-1,0,0,-1);
                    trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosZWall(storyIdx,x,z)) {
                    vertexArray.push(negX,ty,posZ,posX,ty,posZ,posX,by,posZ,negX,by,posZ);
                    normalArray.push(0,0,1,0,0,1,0,0,1,0,0,1);
                    trigIdx=this.genMesh.addQuadToIndexes(indexArray,trigIdx);
                }
            }
        }
        
        uvArray=this.genMesh.buildUVs(vertexArray,normalArray,(1/this.segmentSize));
        tangentArray=this.genMesh.buildTangents(vertexArray,uvArray,indexArray);
        
        this.core.game.map.meshList.add(new MeshClass(this.core,(this.name+'_story'),this.platformBitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
        //
        // second story mainline
        //
        
    build()
    {
        let n,x,z;
        
            // starting position
            
        x=this.core.randomInt(2,(this.room.piece.size.x-4));
        z=this.core.randomInt(2,(this.room.piece.size.z-4));
        
            // lift
            
        this.addLift(x,z);
        
            // build the story segments
            
        for (n=1;n<this.room.storyCount;n++) {
            this.setupRandomPlatforms(x,z,n);
            this.addPlatforms(n);
        }
    }
    
}

