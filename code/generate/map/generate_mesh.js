import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateMeshClass
{
    static STAIR_STEP_COUNT=10;

    constructor()
    {
    }
    
        //
        // utilities
        //
        
    static addQuadToIndexes(indexArray,trigIdx)
    {
        indexArray.push(trigIdx,(trigIdx+1),(trigIdx+2),trigIdx,(trigIdx+2),(trigIdx+3));
        return(trigIdx+4);
    }
    
    static addBox(core,name,bitmap,negX,posX,negY,posY,negZ,posZ,isNegX,isPosX,isNegY,isPosY,isNegZ,isPosZ,roomHigh)
    {
        let vertexArray=[];
        let indexArray=[];
        let normalArray,uvArray,tangentArray;
        let trigIdx=0;
        let centerPnt=new PointClass(Math.trunc((negX+posX)*0.5),Math.trunc((negY+posY)*0.5),Math.trunc((negZ+posZ)*0.5));
        
        if (isNegX) {
            vertexArray.push(negX,negY,negZ,negX,negY,posZ,negX,posY,posZ,negX,posY,negZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
        if (isPosX) {
            vertexArray.push(posX,negY,negZ,posX,negY,posZ,posX,posY,posZ,posX,posY,negZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
        if (isNegY) {
            vertexArray.push(negX,negY,negZ,negX,negY,posZ,posX,negY,posZ,posX,negY,negZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
        if (isPosY) {
            vertexArray.push(negX,posY,negZ,negX,posY,posZ,posX,posY,posZ,posX,posY,negZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
        if (isNegZ) {
            vertexArray.push(negX,negY,negZ,posX,negY,negZ,posX,posY,negZ,negX,posY,negZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
        if (isPosZ) {
            vertexArray.push(negX,negY,posZ,posX,negY,posZ,posX,posY,posZ,negX,posY,posZ);
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
        }
            
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,false);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/roomHigh));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
        //
        // room pieces
        //
        
    static buildRoomFloorCeiling(core,room,centerPnt,name,bitmap,y,roomSize,roomHigh)
    {
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        
        vertexArray.push(room.offset.x,y,room.offset.z);
        vertexArray.push((room.offset.x+roomSize),y,room.offset.z);
        vertexArray.push((room.offset.x+roomSize),y,(room.offset.z+roomSize));
        vertexArray.push(room.offset.x,y,(room.offset.z+roomSize));

        this.addQuadToIndexes(indexArray,0);
        
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/roomHigh));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
    static buildRoomWalls(core,room,centerPnt,name,bitmap,roomSize,roomHigh)
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

                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*roomSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*roomSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k2][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*roomSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k2][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*roomSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k][1]*0.1)*roomSize)+room.offset.z));

                trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
            }

            y+=roomHigh;
        }

        vertexArray=new Float32Array(vertexArray);
        indexArray=new Uint16Array(indexArray);
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/roomHigh));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray));
    }
    
        //
        // staircases
        //
        
    static buildRoomStairs(core,room,name,wallBitmap,floorBitmap,roomSize,roomHigh)
    {
        let n,x,z,x2,z2,y,trigIdx,zDir;
        let sx,sx2,sz,sz2;
        let centerPnt;
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        let stepSize=Math.trunc(roomSize*0.02);
        let stepHigh=Math.trunc(roomHigh/GenerateMeshClass.STAIR_STEP_COUNT);
        let stairSize=stepSize*GenerateMeshClass.STAIR_STEP_COUNT;
        let pieceVertex=room.piece.vertexes[room.stairVertexIdx];
        let pieceVertex2=room.piece.vertexes[room.stairVertexIdx2];
        
            // depending on what vertex the connection was
            // is the direction of the stairs
        
        zDir=false;
        
        if ((pieceVertex[0]===0) && (pieceVertex[1]!==0)) {     // to the -X
            x=room.offset.x+stairSize;
            x2=room.offset.x;
            z=room.offset.z+(pieceVertex[1]*Math.trunc(roomSize*0.1));
            z2=room.offset.z+(pieceVertex2[1]*Math.trunc(roomSize*0.1));
        }
        else {
            if ((pieceVertex[0]===10) && (pieceVertex[1]!==10)) {       // to the +X
                x2=room.offset.x+roomSize;
                x=x2-stairSize;
                z=room.offset.z+(pieceVertex[1]*Math.trunc(roomSize*0.1));
                z2=room.offset.z+(pieceVertex2[1]*Math.trunc(roomSize*0.1));
            }
            else {          // to the +Z
                zDir=true;
                x=room.offset.x+(pieceVertex[0]*Math.trunc(roomSize*0.1));
                x2=room.offset.x+(pieceVertex2[0]*Math.trunc(roomSize*0.1));
                z2=room.offset.z+roomSize;
                z=z2-stairSize;
            }
        }

            // the steps
        
        trigIdx=0;
        y=room.offset.y+stepHigh;
        
        for (n=0;n!==GenerateMeshClass.STAIR_STEP_COUNT;n++) { 
            
            if (zDir) {
                sx=x;
                sx2=x2;
                sz=z+(n*stepSize);
                sz2=sz+stepSize;
                
                centerPnt=new PointClass(Math.trunc((x+x2)*0.5),room.offset.y,sz2);
            }
            else {
                if (x<x2) {
                    sx=x+(n*stepSize);
                    sx2=sx+stepSize;
                }
                else {
                    sx=x-(n*stepSize);
                    sx2=sx-stepSize;
                }
                sz=z;
                sz2=z2;
                
                centerPnt=new PointClass(sx2,room.offset.y,Math.trunc((z+z2)*0.5));
            }
            
            vertexArray.push(sx,y,sz);
            vertexArray.push(sx2,y,sz);
            vertexArray.push(sx2,y,sz2);
            vertexArray.push(sx,y,sz2);
            
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
            
            if (zDir) {
                vertexArray.push(x,y,sz);
                vertexArray.push(x2,y,sz);
                vertexArray.push(x2,(y-stepSize),sz);
                vertexArray.push(x,(y-stepSize),sz);
            }
            else {
                vertexArray.push(sx,y,z);
                vertexArray.push(sx,y,z2);
                vertexArray.push(sx,(y-stepSize),z2);
                vertexArray.push(sx,(y-stepSize),z);
            }
            
            trigIdx=this.addQuadToIndexes(indexArray,trigIdx);
            
            y+=stepHigh;
        }
            // create the mesh
            
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,false);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/roomHigh));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,floorBitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
        
            // the sides
            
        if (zDir) {
            sx=(x<x2)?x:x2;
            if ((sx>room.offset.x) && (sx<(room.offset.x+roomSize))) this.addBox(core,(name+'_side1'),wallBitmap,(sx-stepSize),sx,room.offset.y,(room.offset.y+roomHigh),z,z2,true,true,false,true,true,false,roomHigh);
            
            sx=(x<x2)?x2:x;
            if ((sx>room.offset.x) && (sx<(room.offset.x+roomSize))) this.addBox(core,(name+'_side1'),wallBitmap,sx,(sx+stepSize),room.offset.y,(room.offset.y+roomHigh),z,z2,true,true,false,true,true,false,roomHigh);
        }
        else {
            sz=(z<z2)?z:z2;
            if ((sz>room.offset.z) && (sz<(room.offset.z+roomSize))) this.addBox(core,(name+'_side1'),wallBitmap,x,x2,room.offset.y,(room.offset.y+roomHigh),(sz-stepSize),sz,true,false,false,true,true,true,roomHigh);
            
            sz=(z<z2)?z2:z;
            if ((sz>room.offset.z) && (sz<(room.offset.z+roomSize))) this.addBox(core,(name+'_side1'),wallBitmap,x,x2,room.offset.y,(room.offset.y+roomHigh),sz,(sz+stepSize),true,false,false,true,true,true,roomHigh);
        }
    }
}

