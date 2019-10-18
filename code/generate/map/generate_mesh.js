import PointClass from '../../utility/point.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateMeshClass
{
    static STAIR_STEP_COUNT=10;
    
    static PLATFORM_DIR_POS_Z=0;
    static PLATFORM_DIR_NEG_Z=1;
    static PLATFORM_DIR_POS_X=2;
    static PLATFORM_DIR_NEG_X=3;

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
        
    static buildRoomStairs(core,room,name,wallBitmap,floorBitmap,segmentSize)
    {
        let n,x,z,x2,z2,y,trigIdx,zDir;
        let sx,sx2,sz,sz2;
        let centerPnt;
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        let stepSize=Math.trunc((segmentSize*10)*0.02);
        let stepHigh=Math.trunc(segmentSize/GenerateMeshClass.STAIR_STEP_COUNT);
        let stairSize=stepSize*GenerateMeshClass.STAIR_STEP_COUNT;
        //let pieceVertex=room.piece.vertexes[room.stairVertexIdx];       // this is now broken will need to fix
        //let pieceVertex2=room.piece.vertexes[room.stairVertexIdx2];
        
            // if we are on a forward path, then
            // the room is in the zDir
        
        zDir=room.forwardPath;
        
        if (room.pathXDeviation>0) {
            x=room.offset.x;
            x2=room.offset.x+room.size.x;
        }
        else {
            x2=room.offset.x;
            x=room.offset.x+room.size.x;
        }
        
        z=room.offset.z;
        z2=room.offset.z+room.size.z;
        /*
        if ((pieceVertex[0]===0) && (pieceVertex[1]!==0)) {     // to the -X
            x=room.offset.x+stairSize;
            x2=room.offset.x;
            z=room.offset.z+(pieceVertex[1]*segmentSize);
            z2=room.offset.z+(pieceVertex2[1]*segmentSize);
        }
        else {
            if ((pieceVertex[0]===10) && (pieceVertex[1]!==10)) {       // to the +X
                x2=room.offset.x+room.size.x;
                x=x2-stairSize;
                z=room.offset.z+(pieceVertex[1]*segmentSize);
                z2=room.offset.z+(pieceVertex2[1]*segmentSize);
            }
            else {          // to the +Z
                zDir=true;
                x=room.offset.x+(pieceVertex[0]*segmentSize);
                x2=room.offset.x+(pieceVertex2[0]*segmentSize);
                z2=room.offset.z+room.size.z;
                z=z2-stairSize;
            }
        }
*/
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
            
            trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            
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
            
            trigIdx=GenerateUtilityClass.addQuadToIndexes(indexArray,trigIdx);
            
            y+=stepHigh;
        }
            // create the mesh
            
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,false);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,(1/segmentSize));
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        core.map.meshList.add(new MeshClass(core,name,floorBitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
        
            // the sides
            /*
        if (zDir) {
            sx=(x<x2)?x:x2;
            if ((sx>room.offset.x) && (sx<(room.offset.x+room.size.x))) this.addBox(core,(name+'_side1'),wallBitmap,(sx-stepSize),sx,room.offset.y,(room.offset.y+segmentSize),z,z2,true,true,false,true,true,false,segmentSize);
            
            sx=(x<x2)?x2:x;
            if ((sx>room.offset.x) && (sx<(room.offset.x+room.size.x))) this.addBox(core,(name+'_side1'),wallBitmap,sx,(sx+stepSize),room.offset.y,(room.offset.y+segmentSize),z,z2,true,true,false,true,true,false,segmentSize);
        }
        else {
            sz=(z<z2)?z:z2;
            if ((sz>room.offset.z) && (sz<(room.offset.z+room.size.z))) this.addBox(core,(name+'_side1'),wallBitmap,x,x2,room.offset.y,(room.offset.y+segmentSize),(sz-stepSize),sz,true,false,false,true,true,true,segmentSize);
            
            sz=(z<z2)?z2:z;
            if ((sz>room.offset.z) && (sz<(room.offset.z+room.size.z))) this.addBox(core,(name+'_side1'),wallBitmap,x,x2,room.offset.y,(room.offset.y+segmentSize),sz,(sz+stepSize),true,false,false,true,true,true,segmentSize);
        }

             */
    }
}

