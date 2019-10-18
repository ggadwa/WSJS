import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import MoveClass from '../../map/move.js';
import MovementClass from '../../map/movement.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateStoryClass
{
    static PLATFORM_DIR_POS_Z=0;
    static PLATFORM_DIR_NEG_Z=1;
    static PLATFORM_DIR_POS_X=2;
    static PLATFORM_DIR_NEG_X=3;

    constructor()
    {
    }
    
    static hasNegXWall(room,storyIdx,x,z,liftX,liftZ,xWallFlag)
    {
        if (x===0) return(false);
        if (((x-1)===liftX) && (z===liftZ)) return(true);
        if (!room.checkGrid(storyIdx,(x-1),z)) return(true);
        return(xWallFlag[x]!==xWallFlag[x-1]);
    }
    
    static hasPosXWall(room,storyIdx,x,z,liftX,liftZ,xWallFlag)
    {
        if (x===(room.piece.size.x-1)) return(false);
        if (((x+1)===liftX) && (z===liftZ)) return(true);
        if (!room.checkGrid(storyIdx,(x+1),z)) return(true);
        return(xWallFlag[x]!==xWallFlag[x+1]);
    }
    
    static hasNegZWall(room,storyIdx,x,z,liftX,liftZ,zWallFlag)
    {
        if (z===0) return(false);
        if ((x===liftX) && ((z-1)===liftZ)) return(true);
        if (!room.checkGrid(storyIdx,x,(z-1))) return(true);
        return(zWallFlag[z]!==zWallFlag[z-1]);
    }
    
    static hasPosZWall(room,storyIdx,x,z,liftX,liftZ,zWallFlag)
    {
        if (z===(room.piece.size.z-1)) return(false);
        if ((x===liftX) && ((z+1)===liftZ)) return(true);
        if (!room.checkGrid(storyIdx,x,(z+1))) return(true);
        return(zWallFlag[z]!==zWallFlag[z+1]);
    }
            
    static buildRoomSingleStory(core,room,name,bitmap,segmentSize,floorHigh,liftX,liftZ,storyIdx)
    {
        let x,z,gx,gz,sx,sz,ty,by;
        let negX,posX,negZ,posZ;
        let dir,orgDir,xWallFlag,zWallFlag;
        let wallStop,skipBottom;
        let vertexArray=[];
        let indexArray=[];
        let normalArray=[];
        let uvArray,tangentArray;
        let trigIdx;
        
            // start the random wander of segments

        gx=liftX;
        gz=liftZ;
            
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

                if ((room.checkGrid(storyIdx,sx,sz)) || (sx<0) || (sx>=room.piece.size.x) || (sz<0) || (sz>=room.piece.size.z)) {
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
                
            room.blockGrid(storyIdx,sx,sz);
            
            gx=sx;
            gz=sz;
        }
        
            // randomly make stripes where stories
            // become solid walls instead of floating blocks
            // only do it on first story
            
        xWallFlag=new Uint8Array(room.piece.size.x);
        zWallFlag=new Uint8Array(room.piece.size.z);
        
        if (storyIdx===1) {
            for (x=1;x<(room.piece.size.x-1);x++) {
                xWallFlag[x]=GenerateUtilityClass.randomPercentage(0.2);
            }

            for (z=1;z<(room.piece.size.z-1);z++) {
                zWallFlag[z]=GenerateUtilityClass.randomPercentage(0.2);
            }
        }
        
            // make the segments
        
        trigIdx=0;
        
        for (z=0;z!==room.piece.size.z;z++) {
            for (x=0;x!==room.piece.size.x;x++) {
                if (!room.checkGrid(storyIdx,x,z)) continue;
                if ((x===liftX) && (z===liftZ)) continue;       // skip the lift

                    // create the segments
                    
                if ((!xWallFlag[x]) && (!zWallFlag[z])) {
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
                
                if (this.hasNegXWall(room,storyIdx,x,z,liftX,liftZ,xWallFlag)) {
                    vertexArray.push(negX,ty,negZ,negX,ty,posZ,negX,by,posZ,negX,by,negZ);
                    normalArray.push(-1,0,0,-1,0,0,-1,0,0,-1,0,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosXWall(room,storyIdx,x,z,liftX,liftZ,xWallFlag)) {
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
                
                if (this.hasNegZWall(room,storyIdx,x,z,liftX,liftZ,zWallFlag)) {
                    vertexArray.push(negX,ty,negZ,posX,ty,negZ,posX,by,negZ,negX,by,negZ);
                    normalArray.push(0,0,-1,0,0,-1,0,0,-1,0,0,-1);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosZWall(room,storyIdx,x,z,liftX,liftZ,zWallFlag)) {
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
    
    static buildRoomStories(core,room,name,bitmap,segmentSize)
    {
        let sx,sz,y,liftX,liftZ,n;
        let liftName;
        let movement,moveMilliSec,waitMilliSec,meshIdx;
        let floorHigh=Math.trunc(segmentSize*0.1);
        
            // random start position with the lift
            
        liftX=GenerateUtilityClass.randomInt(2,(room.piece.size.x-4));
        liftZ=GenerateUtilityClass.randomInt(2,(room.piece.size.z-4));

        room.blockGridAllStories(liftX,liftZ);
        
            // create the lift
            
        sx=room.offset.x+(liftX*segmentSize);
        sz=room.offset.z+(liftZ*segmentSize);

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
        
            // build the story segments
            
        for (n=1;n<room.storyCount;n++) {
            this.buildRoomSingleStory(core,room,name,bitmap,segmentSize,floorHigh,liftX,liftZ,n);
        }
    }
}

