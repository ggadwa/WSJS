import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import MoveClass from '../../map/move.js';
import MovementClass from '../../map/movement.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateStoryClass
{
    static PLATFORM_DIR_POS_Z=0;
    static PLATFORM_DIR_NEG_Z=1;
    static PLATFORM_DIR_POS_X=2;
    static PLATFORM_DIR_NEG_X=3;
    
    static FLAG_NONE=0;
    static FLAG_STEPS=1;
    static FLAG_LIFT=2;
    static FLAG_PLATFORM=3;
    static FLAG_WALL=4;

    constructor()
    {
    }
    
        //
        // lifts and stairs
        //
  
    static addLift(core,room,name,bitmap,segmentSize,x,z)
    {
        let n,sx,sz,y,meshIdx;
        let liftName,moveMilliSec,waitMilliSec;
        let movement;
        let floorHigh=Math.trunc(segmentSize*0.1);
        
            // block off all the stories
            
        room.setGridAllStories(x,z,GenerateStoryClass.FLAG_LIFT);

            // the lift cube
            
        sx=room.offset.x+(x*segmentSize);
        sz=room.offset.z+(z*segmentSize);

        liftName=name+'_lift';
        meshIdx=GenerateUtilityClass.addBox(core,liftName,bitmap,sx,(sx+segmentSize),room.offset.y,(room.offset.y+((segmentSize*(room.storyCount-1))+floorHigh)),sz,(sz+segmentSize),true,true,true,true,true,true,segmentSize);

            // the lift movement

        moveMilliSec=GenerateUtilityClass.randomInt(1000,3000);
        waitMilliSec=GenerateUtilityClass.randomInt(1000,3000);

        movement=new MovementClass(core,[meshIdx],null,new PointClass(0,0,0),new PointClass(0,0,0));

        movement.addMove(new MoveClass(waitMilliSec,new PointClass(0,0,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));

        for (n=1;n<room.storyCount;n++) {
            y=-(segmentSize*n);
            movement.addMove(new MoveClass(moveMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));
            movement.addMove(new MoveClass(waitMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));
        }

        for (n=(room.storyCount-2);n>0;n--) {
            y=-(segmentSize*n);
            movement.addMove(new MoveClass(moveMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));
            movement.addMove(new MoveClass(waitMilliSec,new PointClass(0,y,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));
        }

        movement.addMove(new MoveClass(moveMilliSec,new PointClass(0,0,0),new PointClass(0,0,0),MoveClass.PAUSE_NONE,null,null,null));

        core.map.movementList.add(movement);
    }
    
    static addStairs(core,room,name,stepBitmap,segmentSize,x,z,dir,storyIdx)
    {
        let floorHigh=Math.trunc(segmentSize*0.1);
        let y=room.offset.y+(storyIdx*segmentSize)+(floorHigh*storyIdx);
        
        switch (dir)
        {
            case GenerateMeshClass.STAIR_DIR_POS_Z:
                room.setGridAllStories(x,z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories(x,(z+1),GenerateStoryClass.FLAG_STEPS);
                break;
            case GenerateMeshClass.STAIR_DIR_NEG_Z:
                room.setGridAllStories(x,z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories(x,(z-1),GenerateStoryClass.FLAG_STEPS);
                break;
            case GenerateMeshClass.STAIR_DIR_POS_X:
                room.setGridAllStories(x,z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories((x+1),z,GenerateStoryClass.FLAG_STEPS);
                break;
            case GenerateMeshClass.STAIR_DIR_NEG_X:
                room.setGridAllStories(x,z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories((x-1),z,GenerateStoryClass.FLAG_STEPS);
                break;
        }
        
        GenerateMeshClass.buildStairs(core,room,name,stepBitmap,segmentSize,(room.offset.x+(x*segmentSize)),y,(room.offset.z+(z*segmentSize)),dir,1,true);
    }
    
        //
        // second story segments
        //
        
    static hasNegXWall(room,storyIdx,x,z)
    {
        let flag,flag2;
        
        if (x===0) return(true);

        flag=room.getGrid(storyIdx,x,z);
        flag2=room.getGrid(storyIdx,(x-1),z);
        
        if ((flag2===GenerateStoryClass.FLAG_NONE) || (flag2===GenerateStoryClass.FLAG_STAIRS) || (flag2===GenerateStoryClass.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===GenerateStoryClass.FLAG_PLATFORM) && (flag2===GenerateStoryClass.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    static hasPosXWall(room,storyIdx,x,z)
    {
        let flag,flag2;
        
        if (x===(room.piece.size.x-1)) return(true);
        
        flag=room.getGrid(storyIdx,x,z);
        flag2=room.getGrid(storyIdx,(x+1),z);
        
        if ((flag2===GenerateStoryClass.FLAG_NONE) || (flag2===GenerateStoryClass.FLAG_STAIRS) || (flag2===GenerateStoryClass.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===GenerateStoryClass.FLAG_PLATFORM) && (flag2===GenerateStoryClass.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    static hasNegZWall(room,storyIdx,x,z)
    {
        let flag,flag2;
        
        if (z===0) return(true);
        
        flag=room.getGrid(storyIdx,x,z);
        flag2=room.getGrid(storyIdx,x,(z-1));
        
        if ((flag2===GenerateStoryClass.FLAG_NONE) || (flag2===GenerateStoryClass.FLAG_STAIRS) || (flag2===GenerateStoryClass.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===GenerateStoryClass.FLAG_PLATFORM) && (flag2===GenerateStoryClass.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    static hasPosZWall(room,storyIdx,x,z)
    {
        let flag,flag2;
        
        if (z===(room.piece.size.z-1)) return(true);
        
        flag=room.getGrid(storyIdx,x,z);
        flag2=room.getGrid(storyIdx,x,(z+1));
        
        if ((flag2===GenerateStoryClass.FLAG_NONE) || (flag2===GenerateStoryClass.FLAG_STAIRS) || (flag2===GenerateStoryClass.FLAG_LIFT)) return(true);
        if (flag===flag2) return(false);           // if both the same type of wall, eliminate
        if ((flag===GenerateStoryClass.FLAG_PLATFORM) && (flag2===GenerateStoryClass.FLAG_WALL)) return(false);     // if short wall and other is tall wall, then eliminate
        return(true);
    }
    
    static setupExitPlatform(core,room,posZWid,negZWid,posXWid,negXWid)
    {
        let x,z;
        
            // x platforms
    
        for (z=0;z!==room.piece.size.z;z++) {
            for (x=0;x!==posXWid;x++) {
                room.setGrid(1,x,z,GenerateStoryClass.FLAG_PLATFORM);
            }
            for (x=(room.piece.size.x-negXWid);x!==room.piece.size.x;x++) {
                room.setGrid(1,x,z,GenerateStoryClass.FLAG_PLATFORM);
            }
        }
        
            // z platforms
            
        for (x=0;x!==room.piece.size.x;x++) {
            for (z=0;z!==posZWid;z++) {
                room.setGrid(1,x,z,GenerateStoryClass.FLAG_PLATFORM);
            }
            for (z=(room.piece.size.z-negZWid);z!==room.piece.size.z;z++) {
                room.setGrid(1,x,z,GenerateStoryClass.FLAG_PLATFORM);
            }
        }
    }
            
    static setupRandomPlatforms(core,room,startX,startZ,storyIdx)
    {
        let x,z,gx,gz,sx,sz;
        let dir,orgDir;
        let wallStop;
        
        gx=startX;
        gz=startZ;
        
            // start the random wander of segments

        while (true) {

                // next random direction
                
            dir=GenerateUtilityClass.randomIndex(4);
            orgDir=dir;
            
                // find open direction
                
            wallStop=false;
            
            while (true) {

                switch (dir) {
                    case GenerateStoryClass.PLATFORM_DIR_POS_Z:
                        sx=gx;
                        sz=gz+1;
                        break;
                    case GenerateStoryClass.PLATFORM_DIR_NEG_Z:
                        sx=gx;
                        sz=gz-1;
                        break;
                    case GenerateStoryClass.PLATFORM_DIR_POS_X:
                        sx=gx+1;
                        sz=gz;
                        break;
                    case GenerateStoryClass.PLATFORM_DIR_NEG_X:
                        sx=gx-1;
                        sz=gz;
                        break;
                }

                if ((room.getGrid(storyIdx,sx,sz)!==GenerateStoryClass.FLAG_NONE) || (sx<0) || (sx>=room.piece.size.x) || (sz<0) || (sz>=room.piece.size.z)) {
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
                
            room.setGrid(storyIdx,sx,sz,GenerateStoryClass.FLAG_PLATFORM);
            
            gx=sx;
            gz=sz;
        }

            // randomly make stripes where stories
            // become solid walls instead of floating blocks
            // only do it on first story
            
        if (storyIdx===1) {
            for (x=1;x<(room.piece.size.x-1);x++) {
                if (GenerateUtilityClass.randomPercentage(0.2)) {
                    for (z=1;z<(room.piece.size.z-1);z++) {
                        if (room.getGrid(storyIdx,x,z)===GenerateStoryClass.FLAG_PLATFORM) room.setGrid(storyIdx,x,z,GenerateStoryClass.FLAG_WALL);
                    }
                }
            }

            for (z=1;z<(room.piece.size.z-1);z++) {
                if (GenerateUtilityClass.randomPercentage(0.2)) {
                    for (x=1;x<(room.piece.size.x-1);x++) {
                        if (room.getGrid(storyIdx,x,z)===GenerateStoryClass.FLAG_PLATFORM) room.setGrid(storyIdx,x,z,GenerateStoryClass.FLAG_WALL);
                    }
                }
            }
        }
    }
    
    static addPlatforms(core,room,name,bitmap,segmentSize,storyIdx)
    {
        let x,z,ty,by;
        let negX,posX,negZ,posZ;
        let skipBottom;
        let vertexArray=[];
        let indexArray=[];
        let normalArray=[];
        let uvArray,tangentArray;
        let trigIdx,flag;
        let floorHigh=Math.trunc(segmentSize*0.1);
        
            // make the segments
        
        trigIdx=0;
        
        for (z=0;z!==room.piece.size.z;z++) {
            for (x=0;x!==room.piece.size.x;x++) {
                flag=room.getGrid(storyIdx,x,z);
                if ((flag!==GenerateStoryClass.FLAG_PLATFORM) && (flag!==GenerateStoryClass.FLAG_WALL)) continue;

                    // create the segments
                    
                if (flag===GenerateStoryClass.FLAG_PLATFORM) {
                    ty=room.offset.y+((segmentSize*storyIdx)+floorHigh);
                    by=room.offset.y+(segmentSize*storyIdx);
                    skipBottom=false;
                }
                else {
                    ty=room.offset.y+((segmentSize*storyIdx)+floorHigh);
                    by=room.offset.y+(segmentSize*(storyIdx-1));
                    skipBottom=true;
                }
                
                negX=room.offset.x+(x*segmentSize);
                posX=room.offset.x+((x+1)*segmentSize);
                negZ=room.offset.z+(z*segmentSize);
                posZ=room.offset.z+((z+1)*segmentSize);
                
                if (this.hasNegXWall(room,storyIdx,x,z)) {
                    vertexArray.push(negX,ty,negZ,negX,ty,posZ,negX,by,posZ,negX,by,negZ);
                    normalArray.push(-1,0,0,-1,0,0,-1,0,0,-1,0,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosXWall(room,storyIdx,x,z)) {
                    vertexArray.push(posX,ty,negZ,posX,ty,posZ,posX,by,posZ,posX,by,negZ);
                    normalArray.push(1,0,0,1,0,0,1,0,0,1,0,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                    // always draw the top
                    
                vertexArray.push(negX,ty,negZ,negX,ty,posZ,posX,ty,posZ,posX,ty,negZ);
                normalArray.push(0,1,0,0,1,0,0,1,0,0,1,0);
                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);

                if (!skipBottom) {
                    vertexArray.push(negX,by,negZ,negX,by,posZ,posX,by,posZ,posX,by,negZ);
                    normalArray.push(0,-1,0,0,-1,0,0,-1,0,0,-1,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasNegZWall(room,storyIdx,x,z)) {
                    vertexArray.push(negX,ty,negZ,posX,ty,negZ,posX,by,negZ,negX,by,negZ);
                    normalArray.push(0,0,-1,0,0,-1,0,0,-1,0,0,-1);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosZWall(room,storyIdx,x,z)) {
                    vertexArray.push(negX,ty,posZ,posX,ty,posZ,posX,by,posZ,negX,by,posZ);
                    normalArray.push(0,0,1,0,0,1,0,0,1,0,0,1);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
            }
        }
        
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,(name+'_story'),bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
        //
        // second story mainline
        //
        
    static buildRoomStories(core,room,name,stepBitmap,platformBitmap,segmentSize)
    {
        let n,x,z;
        
            // starting position
            
        x=GenerateUtilityClass.randomInt(2,(room.piece.size.x-4));
        z=GenerateUtilityClass.randomInt(2,(room.piece.size.z-4));
        
            // lift
            
        this.addLift(core,room,name,stepBitmap,segmentSize,x,z);
        
            // build the story segments
            
        for (n=1;n<room.storyCount;n++) {
            this.setupRandomPlatforms(core,room,x,z,n);
            this.addPlatforms(core,room,name,platformBitmap,segmentSize,n);
        }
    }
    
        //
        // exit platform mainline
        //
        
    static buildRoomExitPlatform(core,room,name,stepBitmap,platformBitmap,segmentSize)
    {
        let x,z,dir;
        let posZWid,negZWid,posXWid,negXWid;
        
            // width of platforms
            
        posZWid=GenerateUtilityClass.randomInt(1,((room.piece.size.z>5)?3:1));
        negZWid=GenerateUtilityClass.randomInt(1,((room.piece.size.z>5)?3:1));
        posXWid=GenerateUtilityClass.randomInt(1,((room.piece.size.x>5)?3:1));
        negXWid=GenerateUtilityClass.randomInt(1,((room.piece.size.x>5)?3:1));

            // stairs
            
        dir=GenerateUtilityClass.randomIndex(4);
        
        switch (dir)
        {
            case GenerateMeshClass.STAIR_DIR_POS_Z:
                x=GenerateUtilityClass.randomInBetween(posXWid,(room.piece.size.x-negXWid));
                z=room.piece.size.z-(negZWid+2);
                break;
            case GenerateMeshClass.STAIR_DIR_NEG_Z:
                x=GenerateUtilityClass.randomInBetween(posXWid,(room.piece.size.x-negXWid));
                z=posZWid;
                break;
            case GenerateMeshClass.STAIR_DIR_POS_X:
                x=room.piece.size.x-(negXWid+2);
                z=GenerateUtilityClass.randomInBetween(posZWid,(room.piece.size.z-negZWid));
                break;
            case GenerateMeshClass.STAIR_DIR_NEG_X:
                x=posXWid;
                z=GenerateUtilityClass.randomInBetween(posZWid,(room.piece.size.z-negZWid));
                break;
        }
            
        this.addStairs(core,room,name,stepBitmap,segmentSize,x,z,dir,0);
        
            // platforms
            
        this.setupExitPlatform(core,room,posZWid,negZWid,posXWid,negXWid);
        this.addPlatforms(core,room,name,platformBitmap,segmentSize,1);
    }
}

