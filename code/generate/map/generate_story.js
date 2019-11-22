import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import MoveClass from '../../map/move.js';
import MovementClass from '../../map/movement.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateStoryClass
{
    static PLATFORM_POS_Z=0;
    static PLATFORM_NEG_Z=1;
    static PLATFORM_POS_X=2;
    static PLATFORM_NEG_X=3;
    
    static FLAG_NONE=0;
    static FLAG_STEPS=1;
    static FLAG_LIFT=2;
    static FLAG_PLATFORM=3;
    static FLAG_WALL=4;

    constructor()
    {
    }
    
        //
        // steps and lifts
        //
        
    static buildRoomStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,x,z,storyIdx)
    {
        let px,pz;
        let floorHigh=Math.trunc(segmentSize*0.1);
        let y=room.offset.y+(storyIdx*segmentSize)+(floorHigh*storyIdx);
        
            // determine the direction from which wall is furthest away
            // we block off the stairs and the block in front of the stairs

        px=room.piece.size.x-x;
        pz=room.piece.size.z-z;

            // pos x

        if ((x>px) && (x>z) && (x>pz)) {
            room.setGridAllStories((x-1),z,GenerateStoryClass.FLAG_STEPS);
            room.setGridAllStories((x-2),z,GenerateStoryClass.FLAG_STEPS);
            room.setGridAllStories((x-3),z,GenerateStoryClass.FLAG_STEPS);
            GenerateMeshClass.buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,(room.offset.x+((x-2)*segmentSize)),y,(room.offset.z+(z*segmentSize)),GenerateMeshClass.STAIR_DIR_POS_X);
        }

        else {

                // neg x

            if ((px>z) && (px>pz)) {
                room.setGridAllStories((x+1),z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories((x+2),z,GenerateStoryClass.FLAG_STEPS);
                room.setGridAllStories((x+3),z,GenerateStoryClass.FLAG_STEPS);
                GenerateMeshClass.buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,(room.offset.x+((x+1)*segmentSize)),y,(room.offset.z+(z*segmentSize)),GenerateMeshClass.STAIR_DIR_NEG_X);
            }

            else {

                    // pos x

                if (z>pz) {
                    room.setGridAllStories(x,(z-1),GenerateStoryClass.FLAG_STEPS);
                    room.setGridAllStories(x,(z-2),GenerateStoryClass.FLAG_STEPS);
                    room.setGridAllStories(x,(z-3),GenerateStoryClass.FLAG_STEPS);
                    GenerateMeshClass.buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,(room.offset.x+(x*segmentSize)),y,(room.offset.z+((z-2)*segmentSize)),GenerateMeshClass.STAIR_DIR_POS_Z);
                }

                else {

                        // neg z

                    room.setGridAllStories(x,(z+1),GenerateStoryClass.FLAG_STEPS);
                    room.setGridAllStories(x,(z+2),GenerateStoryClass.FLAG_STEPS);
                    room.setGridAllStories(x,(z+3),GenerateStoryClass.FLAG_STEPS);
                    GenerateMeshClass.buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,(room.offset.x+(x*segmentSize)),y,(room.offset.z+((z+1)*segmentSize)),GenerateMeshClass.STAIR_DIR_NEG_Z);
                }
            }
        }
    }
    
    static buildRoomLift(core,room,name,bitmap,segmentSize,x,z)
    {
        let n,sx,sz,y,meshIdx;
        let liftName,moveMilliSec,waitMilliSec;
        let movement;
        let startPosList=[];
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
        
            // lifts have the same start position on all stories
            
        for (n=0;n<(room.storyCount-1);n++) {
            startPosList.push([x,z]);
        }

        return(startPosList);
    }
    
        //
        // second story segments
        //
        
    static hasNegXWall(room,storyPiece,gridOn,x,z,xOff,zOff)
    {
        if (((x+xOff)===0) || (x===0)) return(true);
        return(!gridOn[storyPiece.grid[z][x-1]]);
    }
    
    static hasPosXWall(room,storyPiece,gridOn,x,z,xOff,zOff)
    {
        if (((x+xOff)===(room.piece.size.x-1)) || (x===(storyPiece.size.x-1))) return(true);
        return(!gridOn[storyPiece.grid[z][x+1]]);
    }
    
    static hasNegZWall(room,storyPiece,gridOn,x,z,xOff,zOff)
    {
        if (((z+zOff)===0) || (z===0)) return(true);
        return(!gridOn[storyPiece.grid[z-1][x]]);
    }
    
    static hasPosZWall(room,storyPiece,gridOn,x,z,xOff,zOff)
    {
        if (((z+zOff)===(room.piece.size.z-1)) || (z===(storyPiece.size.z-1))) return(true);
        return(!gridOn[storyPiece.grid[z+1][x]]);
    }

    static buildRoomStories(core,room,genPiece,name,wallBitmap,stepBitmap,segmentBitmap,segmentSize)
    {
        let n,x,z,ty,by,xOff,zOff;
        let negX,posX,negZ,posZ,storyPiece;
        let gridOn=[];
        let vertexArray=[];
        let indexArray=[];
        let normalArray=[];
        let uvArray,tangentArray;
        let trigIdx;
        let floorHigh=Math.trunc(segmentSize*0.1);
        
            // set the second story piece
            
        storyPiece=genPiece.getPlatformPiece();
        room.storyPiece=storyPiece;
        
            // offset for story piece
            
        xOff=Math.trunc((room.piece.size.x-storyPiece.size.x)*0.5);
        zOff=Math.trunc((room.piece.size.z-storyPiece.size.z)*0.5);
        
            // grids 0 is always off, 1 always on
            // grids 2-9 are randomly turned on/off
            
        gridOn.push(false);
        gridOn.push(true);
        
        for (n=2;n!==10;n++) {
            gridOn.push(GenerateUtilityClass.randomPercentage(0.5));
        }
        
            // make the segments
        
        trigIdx=0;
        
        for (z=0;z!==storyPiece.size.z;z++) {
            for (x=0;x!==storyPiece.size.x;x++) {
                if (!gridOn[storyPiece.grid[z][x]]) continue;

                    // create the segments
                    
                ty=room.offset.y+(segmentSize+floorHigh);
                by=room.offset.y+segmentSize;
                
                negX=room.offset.x+((x+xOff)*segmentSize);
                posX=room.offset.x+(((x+xOff)+1)*segmentSize);
                negZ=room.offset.z+((z+zOff)*segmentSize);
                posZ=room.offset.z+(((z+zOff)+1)*segmentSize);
                
                if (this.hasNegXWall(room,storyPiece,gridOn,x,z,xOff,zOff)) {
                    vertexArray.push(negX,ty,negZ,negX,ty,posZ,negX,by,posZ,negX,by,negZ);
                    normalArray.push(-1,0,0,-1,0,0,-1,0,0,-1,0,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosXWall(room,storyPiece,gridOn,x,z,xOff,zOff)) {
                    vertexArray.push(posX,ty,negZ,posX,ty,posZ,posX,by,posZ,posX,by,negZ);
                    normalArray.push(1,0,0,1,0,0,1,0,0,1,0,0);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                    // top and bottom
                    
                vertexArray.push(negX,ty,negZ,negX,ty,posZ,posX,ty,posZ,posX,ty,negZ);
                normalArray.push(0,1,0,0,1,0,0,1,0,0,1,0);
                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);

                vertexArray.push(negX,by,negZ,negX,by,posZ,posX,by,posZ,posX,by,negZ);
                normalArray.push(0,-1,0,0,-1,0,0,-1,0,0,-1,0);
                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                
                if (this.hasNegZWall(room,storyPiece,gridOn,x,z,xOff,zOff)) {
                    vertexArray.push(negX,ty,negZ,posX,ty,negZ,posX,by,negZ,negX,by,negZ);
                    normalArray.push(0,0,-1,0,0,-1,0,0,-1,0,0,-1);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
                
                if (this.hasPosZWall(room,storyPiece,gridOn,x,z,xOff,zOff)) {
                    vertexArray.push(negX,ty,posZ,posX,ty,posZ,posX,by,posZ,negX,by,posZ);
                    normalArray.push(0,0,1,0,0,1,0,0,1,0,0,1);
                    trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                }
            }
        }
        
        if (trigIdx===0) return;
        
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,(name+'_story'),segmentBitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
        //
        // second story mainline
        //
        /*
    static buildRoomStories(core,room,genPiece,name,wallBitmap,stepBitmap,segmentBitmap,segmentSize)
    {
        let n,storyPiece;
        
            // create the stories
            
        //for (n=1;n<room.storyCount;n++) {
        
        n=1;
            
            storyPiece=genPiece.getPlatformPiece();

                

                // build stairs or lifts
                
            switch (storySide) {
                case GenerateStoryClass.PLATFORM_POS_Z:
                    x=GenerateUtilityClass.randomInt(1,(room.piece.size.x-2));
                    z=GenerateUtilityClass.randomInt((room.piece.size.z-storyWidth),storyWidth);
                    break;
                case GenerateStoryClass.PLATFORM_NEG_Z:
                    x=GenerateUtilityClass.randomInt(1,(room.piece.size.x-2));
                    z=GenerateUtilityClass.randomInt(0,storyWidth);
                    break;
                case GenerateStoryClass.PLATFORM_POS_X:
                    x=GenerateUtilityClass.randomInt((room.piece.size.x-storyWidth),storyWidth);
                    z=GenerateUtilityClass.randomInt(1,(room.piece.size.z-2));
                    break;
                case GenerateStoryClass.PLATFORM_NEG_X:
                    x=GenerateUtilityClass.randomInt(0,storyWidth);
                    z=GenerateUtilityClass.randomInt(1,(room.piece.size.z-2));
                    break;
            }
                
            this.buildRoomStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,x,z,(n-1));

           
                // and build the platform mesh
                
            this.buildRoomSingleStory(core,room,name,storyPiece,segmentBitmap,segmentSize,n);
        //}
            
    }
        
         */
}

