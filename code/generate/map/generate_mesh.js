import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateMeshClass
{
    static STAIR_STEP_COUNT=10;
    
    static STAIR_DIR_POS_Z=0;
    static STAIR_DIR_NEG_Z=1;
    static STAIR_DIR_POS_X=2;
    static STAIR_DIR_NEG_X=3;

    constructor()
    {
    }
    
        //
        // room pieces
        //
        
    static buildRoomFloorCeiling(core,room,centerPnt,name,bitmap,y,segmentSize)
    {
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        
        vertexArray.push(room.offset.x,y,room.offset.z);
        vertexArray.push((room.offset.x+room.size.x),y,room.offset.z);
        vertexArray.push((room.offset.x+room.size.x),y,(room.offset.z+room.size.z));
        vertexArray.push(room.offset.x,y,(room.offset.z+room.size.z));

        GenerateUtilityClass.addQuadToIndexes(indexArray,0);
        
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
    static buildRoomWalls(core,room,centerPnt,name,bitmap,segmentSize)
    {
        let n,k,k2,y;
        let nVertex,trigIdx;
        let vertexArray,indexArray,uvArray,normalArray,tangentArray;
        let piece=room.piece;
        
        nVertex=piece.vertexes.length;
        
        vertexArray=[];
        indexArray=[];

        trigIdx=0;
        y=room.offset.y;
        
        for (n=0;n!==room.storyCount;n++) {
            
            for (k=0;k!=nVertex;k++) {
                k2=k+1;
                if (k2===nVertex) k2=0;
                
                if (room.isWallHidden(n,k)) continue;
                
                vertexArray.push((Math.trunc(piece.vertexes[k][0]*segmentSize)+room.offset.x),(y+segmentSize),(Math.trunc(piece.vertexes[k][1]*segmentSize)+room.offset.z));
                vertexArray.push((Math.trunc(piece.vertexes[k2][0]*segmentSize)+room.offset.x),(y+segmentSize),(Math.trunc(piece.vertexes[k2][1]*segmentSize)+room.offset.z));
                vertexArray.push((Math.trunc(piece.vertexes[k2][0]*segmentSize)+room.offset.x),y,(Math.trunc(piece.vertexes[k2][1]*segmentSize)+room.offset.z));
                vertexArray.push((Math.trunc(piece.vertexes[k][0]*segmentSize)+room.offset.x),y,(Math.trunc(piece.vertexes[k][1]*segmentSize)+room.offset.z));

                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            }

            y+=segmentSize;
        }
        
        if (vertexArray.length===0) return;

        vertexArray=new Float32Array(vertexArray);
        indexArray=new Uint16Array(indexArray);
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray));
    }
    
        //
        // staircases
        //
        
    static buildStairs(core,room,name,stepBitmap,segmentSize,x,y,z,dir,sides)
    {
        let n,trigIdx;
        let sx,sx2,sy,sz,sz2;
        let centerPnt;
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        let stepSize=Math.trunc((segmentSize*10)*0.02);
        let stepHigh=Math.trunc(segmentSize/GenerateMeshClass.STAIR_STEP_COUNT);

            // initial locations

        switch (dir) {
            case GenerateMeshClass.STAIR_DIR_POS_Z:
            case GenerateMeshClass.STAIR_DIR_NEG_Z:
                sx=x;
                sx2=sx+segmentSize;
                centerPnt=new PointClass(Math.trunc(x+(segmentSize*0.5)),room.offset.y,Math.trunc(z+segmentSize));
                break;
            case GenerateMeshClass.STAIR_DIR_POS_X:
            case GenerateMeshClass.STAIR_DIR_NEG_X:
                sz=z;
                sz2=sz+segmentSize;
                centerPnt=new PointClass(Math.trunc(x+segmentSize),room.offset.y,Math.trunc(z+(segmentSize*0.5)));
                break;
        }
        
            // the steps
        
        trigIdx=0;
        sy=y+stepHigh;
        
        for (n=0;n!==GenerateMeshClass.STAIR_STEP_COUNT;n++) { 
            
                // step top
                
            switch (dir) {
                case GenerateMeshClass.STAIR_DIR_POS_Z:
                    sz=z+(n*stepSize);
                    sz2=sz+stepSize;
                    break;
                case GenerateMeshClass.STAIR_DIR_NEG_Z:
                    sz=(z+(segmentSize*2))-(n*stepSize);
                    sz2=sz-stepSize;
                    break;
                case GenerateMeshClass.STAIR_DIR_POS_X:
                    sx=x+(n*stepSize);
                    sx2=sx+stepSize;
                    break;
                case GenerateMeshClass.STAIR_DIR_NEG_X:
                    sx=(x+(segmentSize*2))-(n*stepSize);
                    sx2=sx-stepSize;
                    break;
            }
           
            vertexArray.push(sx,sy,sz);
            vertexArray.push(sx2,sy,sz);
            vertexArray.push(sx2,sy,sz2);
            vertexArray.push(sx,sy,sz2);
            
            trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            
                // step front
                
            switch (dir) {
                case GenerateMeshClass.STAIR_DIR_POS_Z:
                case GenerateMeshClass.STAIR_DIR_NEG_Z:
                    vertexArray.push(sx,sy,sz);
                    vertexArray.push(sx2,sy,sz);
                    vertexArray.push(sx2,(sy-stepHigh),sz);
                    vertexArray.push(sx,(sy-stepHigh),sz);
                    break;
                case GenerateMeshClass.STAIR_DIR_POS_X:
                case GenerateMeshClass.STAIR_DIR_NEG_X:
                    vertexArray.push(sx,sy,sz);
                    vertexArray.push(sx,sy,sz2);
                    vertexArray.push(sx,(sy-stepHigh),sz2);
                    vertexArray.push(sx,(sy-stepHigh),sz);
                    break;
            }
            
            trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            
                // step sides
                
            if (sides) {
                switch (dir) {
                    case GenerateMeshClass.STAIR_DIR_POS_Z:
                    case GenerateMeshClass.STAIR_DIR_NEG_Z:
                        vertexArray.push(sx,sy,sz);
                        vertexArray.push(sx,sy,sz2);
                        vertexArray.push(sx,y,sz2);
                        vertexArray.push(sx,y,sz);
                        vertexArray.push(sx2,sy,sz);
                        vertexArray.push(sx2,sy,sz2);
                        vertexArray.push(sx2,y,sz2);
                        vertexArray.push(sx2,y,sz);
                        break;
                    case GenerateMeshClass.STAIR_DIR_POS_X:
                    case GenerateMeshClass.STAIR_DIR_NEG_X:
                        vertexArray.push(sx,sy,sz);
                        vertexArray.push(sx2,sy,sz);
                        vertexArray.push(sx2,y,sz);
                        vertexArray.push(sx,y,sz);
                        vertexArray.push(sx,sy,sz2);
                        vertexArray.push(sx2,sy,sz2);
                        vertexArray.push(sx2,y,sz2);
                        vertexArray.push(sx,y,sz2);
                        break;
                }

                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
                trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            }
            
            sy+=stepHigh;
        }
            // create the mesh
            
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,false);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,stepBitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
    static buildRoomStairs(core,room,name,stepBitmap,segmentSize)
    {
        let dir;
        
            // determine room to room direction
            
        if (room.forwardPath) {
            dir=GenerateMeshClass.STAIR_DIR_POS_Z;
        }
        else {
            dir=(room.pathXDeviation>0)?GenerateMeshClass.STAIR_DIR_POS_X:GenerateMeshClass.STAIR_DIR_NEG_X;
        }
        
        this.buildStairs(core,room,name,stepBitmap,segmentSize,room.offset.x,room.offset.y,room.offset.z,dir,false);
    }
    
    static buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,x,y,z,dir)
    {
        let stepSize=Math.trunc((segmentSize*10)*0.02);
        
            // the steps
            
        this.buildStairs(core,room,name,stepBitmap,segmentSize,x,y,z,dir,true);
        
            // the sides
/*
        switch (dir) {
            case GenerateMeshClass.STAIR_DIR_POS_Z:
            case GenerateMeshClass.STAIR_DIR_NEG_Z:
                GenerateUtilityClass.addBox(core,(name+'_side1'),wallBitmap,(x-stepSize),x,room.offset.y,(room.offset.y+segmentSize),z,(z+(segmentSize*2)),true,true,false,true,true,true,segmentSize);
                GenerateUtilityClass.addBox(core,(name+'_side1'),wallBitmap,(x+segmentSize),((x+segmentSize)+stepSize),room.offset.y,(room.offset.y+segmentSize),z,(z+(segmentSize*2)),true,true,false,true,true,true,segmentSize);
                break;
            case GenerateMeshClass.STAIR_DIR_POS_X:
            case GenerateMeshClass.STAIR_DIR_NEG_X:
                GenerateUtilityClass.addBox(core,(name+'_side1'),wallBitmap,x,(x+(segmentSize*2)),room.offset.y,(room.offset.y+segmentSize),(z-stepSize),z,true,true,false,true,true,true,segmentSize);
                GenerateUtilityClass.addBox(core,(name+'_side1'),wallBitmap,x,(x+(segmentSize*2)),room.offset.y,(room.offset.y+segmentSize),(z+segmentSize),((z+segmentSize)+stepSize),true,true,false,true,true,true,segmentSize);
                break;
        }
 */
    }
}

