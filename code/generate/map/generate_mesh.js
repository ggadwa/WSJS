import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
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
        
    static buildStairs(core,room,name,stepBitmap,segmentSize,x,y,z,dir,stepWidth,sides)
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
                sx2=sx+(segmentSize*stepWidth);
                centerPnt=new PointClass(Math.trunc(x+(segmentSize*0.5)),room.offset.y,Math.trunc(z+segmentSize));
                break;
            case GenerateMeshClass.STAIR_DIR_POS_X:
            case GenerateMeshClass.STAIR_DIR_NEG_X:
                sz=z;
                sz2=sz+(segmentSize*stepWidth);
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
        let dir,stepWidth;
        
            // determine room to room direction
            
        if (room.forwardPath) {
            dir=GenerateMeshClass.STAIR_DIR_POS_Z;
            stepWidth=room.piece.size.x;
        }
        else {
            dir=(room.pathXDeviation>0)?GenerateMeshClass.STAIR_DIR_POS_X:GenerateMeshClass.STAIR_DIR_NEG_X;
            stepWidth=room.piece.size.z;
        }
        
        this.buildStairs(core,room,name,stepBitmap,segmentSize,room.offset.x,room.offset.y,room.offset.z,dir,stepWidth,false);
    }
    
    static buildStoryStairs(core,room,name,wallBitmap,stepBitmap,segmentSize,x,y,z,dir)
    {
        let stepSize=Math.trunc((segmentSize*10)*0.02);
        
            // the steps
            
        this.buildStairs(core,room,name,stepBitmap,segmentSize,x,y,z,dir,1,true);
        
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
    
    
        //
        // cylinders
        //
    
    static createCylinderSegmentList(segmentCount,segmentExtra)
    {
        let n;
        let segCount=GenerateUtilityClass.randomInt(segmentCount,segmentExtra);
        let segments=[];
        
        segments.push(1.0);      // top always biggest
        
        for (n=0;n!==segCount;n++) {
            segments.push(GenerateUtilityClass.randomFloat(0.5,0.5));
        }
        
        segments.push(1.0);      // and bottom
        
        return(segments);
    }
    
    static createCylinder(core,room,name,bitmap,centerPt,yBound,segments,radius,top,bot)
    {
        let n,k,t,y,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2,mesh;
        let topRad,botRad;
        let u1,u2;
        let iIdx,vStartIdx;
        let yAdd,ySegBound,ang,ang2,angAdd;
        let sideCount=12;
        let segCount=segments.length-1;     // always one extra for top
        let normal=new PointClass(0,0,0);
        let vertexArray=[];
        let normalArray=[];
        let uvArray=[];
        let tangentArray;
        let indexArray=[];
        
        iIdx=0;
        
        angAdd=360.0/sideCount;
        yAdd=Math.trunc(yBound.getSize()/segCount);
            
        ySegBound=yBound.copy();
        ySegBound.min=ySegBound.max-yAdd;
        
        botRad=segments[0]*radius;
            
        for (k=0;k!==segCount;k++) {
            
                // new radius
                
            topRad=segments[k+1]*radius;

                // cyliner faces

            ang=0.0;

            for (n=0;n!==sideCount;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*segCount)/360.0;
                u2=(ang2*segCount)/360.0;

                    // force last segment to wrap
                    
                if (n===(sideCount-1)) ang2=0.0;

                rd=ang*PointClass.DEGREE_TO_RAD;
                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));

                rd=ang2*PointClass.DEGREE_TO_RAD;
                tx2=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz2=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                bx2=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz2=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));
                
                    // the points
                    
                vStartIdx=Math.trunc(vertexArray.length/3);
                
                vertexArray.push(tx,ySegBound.min,tz);
                uvArray.push(u1,0.0);
                indexArray.push(iIdx++);
                
                vertexArray.push(tx2,ySegBound.min,tz2);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vertexArray.push(bx,ySegBound.max,bz);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                vertexArray.push(tx2,ySegBound.min,tz2);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vertexArray.push(bx2,ySegBound.max,bz2);
                uvArray.push(u2,1.0);
                indexArray.push(iIdx++);
                
                vertexArray.push(bx,ySegBound.max,bz);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                    // the normals
                    
                y=ySegBound.getMidPoint();
                
                for (t=0;t!==6;t++) {
                    normal.x=vertexArray[vStartIdx]-centerPt.x;
                    normal.y=vertexArray[vStartIdx++]-y;
                    normal.z=vertexArray[vStartIdx++]-centerPt.z;
                    normal.normalize();
                    normalArray.push(normal.x,normal.y,normal.z);
                }
                
                ang=ang2;
            }

            botRad=topRad;
            
            ySegBound.max=ySegBound.min;
            ySegBound.min-=yAdd;
        }
        
            // top and bottom triangles
            
        if (top) {
            vStartIdx=Math.trunc(vertexArray.length/3);
            
            ang=0.0;
            topRad=segments[0]*radius;

            for (n=0;n!==sideCount;n++) {
                rd=ang*PointClass.DEGREE_TO_RAD;
                
                u1=(Math.sin(rd)*0.5)+0.5;
                u2=(Math.cos(rd)*0.5)+0.5;

                tx=centerPt.x+((topRad*Math.sin(rd))+(topRad*Math.cos(rd)));
                tz=centerPt.z+((topRad*Math.cos(rd))-(topRad*Math.sin(rd)));
                
                    // the points
                
                vertexArray.push(tx,yBound.min,tz);
                uvArray.push(u1,u2);
                normalArray.push(0.0,-1.0,0.0);
                
                ang+=angAdd;
            }

            for (n=0;n!==(sideCount-2);n++) {
                indexArray.push(vStartIdx);
                indexArray.push(vStartIdx+(n+1));
                indexArray.push(vStartIdx+(n+2));
            }
        }
        
        if (bot) {
            vStartIdx=Math.trunc(vertexArray.length/3);
            
            ang=0.0;
            botRad=segments[segments.length-1]*radius;

            for (n=0;n!==sideCount;n++) {
                rd=ang*PointClass.DEGREE_TO_RAD;
                
                u1=(Math.sin(rd)*0.5)+0.5;
                u2=(Math.cos(rd)*0.5)+0.5;

                bx=centerPt.x+((botRad*Math.sin(rd))+(botRad*Math.cos(rd)));
                bz=centerPt.z+((botRad*Math.cos(rd))-(botRad*Math.sin(rd)));
                
                    // the points
                
                vertexArray.push(bx,yBound.max,bz);
                uvArray.push(u1,u2);
                normalArray.push(0.0,1.0,0.0);
                
                ang+=angAdd;
            }

            for (n=0;n!==(sideCount-2);n++) {
                indexArray.push(vStartIdx);
                indexArray.push(vStartIdx+(n+1));
                indexArray.push(vStartIdx+(n+2));
            }
        }
        
            // create the mesh

        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        mesh.simpleCollisions=true;
        core.map.meshList.add(mesh);
    }
    
    static createMeshCylinderSimple(core,room,name,bitmap,centerPt,yBound,radius,top,bot)
    {
        let segments=[1.0,1.0];
        
        this.createMeshCylinder(core,room,name,bitmap,centerPt,yBound,segments,radius,top,bot);
    }
 
}

