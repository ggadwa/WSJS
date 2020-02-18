import PointClass from '../utility/point.js';
import LineClass from '../utility/line.js';
import BoundClass from '../utility/bound.js';
import CollisionTrigClass from '../collision/collision_trig.js';
import MapClass from '../map/map.js';

//
// map mesh class
//

export default class MeshClass
{
    constructor(core,name,bitmap,noSkinAttachedNodeIdx,skinIdx,vertexArray,normalArray,tangentArray,uvArray,jointArray,weightArray,indexArray)
    {
        this.FLOOR_MIN_XZ_ELIMINATION_SIZE=500;       // if the min x/z of a segment is less than this, then it's elimated as a floor/ceiling segment

        this.core=core;
        this.name=name;
        this.bitmap=bitmap;
        this.noSkinAttachedNodeIdx=noSkinAttachedNodeIdx;       // which node a non-skinned mesh is attached to
        this.skinIdx=skinIdx;                                   // if attached to a skin, then which skin is it
        this.vertexArray=vertexArray;       // expected Float32Array
        this.normalArray=normalArray;       // expected Float32Array
        this.tangentArray=tangentArray;     // expected Float32Array
        this.uvArray=uvArray;               // expected Float32Array
        this.jointArray=jointArray;         // expected Uint16/32Array or null (when not used)
        this.weightArray=weightArray;       // expected Float32Array or null (when not used)
        this.indexArray=indexArray;         // expected Uint16/32Array
        
        this.vertexCount=this.vertexArray.length;
        this.indexCount=this.indexArray.length;
        this.trigCount=Math.trunc(this.indexCount/3);
        
            // check for 16/32 integers
            
        this.need32BitIndexes=(indexArray.constructor.name==='Uint32Array');
        
        this.need32BitJointIndexes=false;
        if (this.jointArray!==null) this.need32BitJointIndexes=(this.jointArray.constructor.name==='Uint32Array');
        
            // center and bounds
            
        this.center=new PointClass(0,0,0);
        this.xBound=new BoundClass(0,0);
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        this.originalXBound=new BoundClass(0,0);
        this.originalYBound=new BoundClass(0,0);
        this.originalZBound=new BoundClass(0,0);

            // gl buffers

        this.vertexBuffer=null;
        this.normalBuffer=null;
        this.tangentBuffer=null;
        this.uvBuffer=null;
        this.jointBuffer=null;
        this.weightBuffer=null;
        this.indexBuffer=null;
        
            // decals
            
        this.decal=false;

            // collision lists

        this.noCollisions=false;
        this.simpleCollisions=false;
        this.bump=true;
        
        this.collisionWallTrigs=[];
        this.collisionFloorTrigs=[];
        this.collisionCeilingTrigs=[];
        
            // marks if the vertices have changed
            // and a buffer update is required
            
        this.requiresVertexBufferUpdate=false;
        this.requiresNormalBufferUpdate=false;
        
            // setup the bounds
        
        this.setupBounds();
        
            // global variables to stop GCd

        this.rotPoint=new PointClass(0,0,0);
        this.rotVector=new PointClass(0.0,0.0,0.0);
        this.rotCenterPnt=new PointClass(0.0,0.0,0.0);
        this.rotNormal=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // close mesh
        //

    close()
    {
        let gl=this.core.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexBuffer!==null) gl.deleteBuffer(this.vertexBuffer);
        if (this.normalBuffer!==null) gl.deleteBuffer(this.normalBuffer);
        if (this.tangentBuffer!==null) gl.deleteBuffer(this.tangentBuffer);
        if (this.uvBuffer!==null) gl.deleteBuffer(this.uvBuffer);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // mesh box collision
        //

    boxBoundCollision(xBound,yBound,zBound)
    {
        if (xBound!==null) {
            if (this.xBound.min>=xBound.max) return(false);
            if (this.xBound.max<=xBound.min) return(false);
        }
        if (yBound!==null) {
            if (this.yBound.min>=yBound.max) return(false);
            if (this.yBound.max<=yBound.min) return(false);
        }
        if (zBound!==null) {
            if (this.zBound.min>=zBound.max) return(false);
            if (this.zBound.max<=zBound.min) return(false);
        }
        return(true);
    }
    
    boxMeshCollision(checkMesh)
    {
        if (this.xBound.min>=checkMesh.xBound.max) return(false);
        if (this.xBound.max<=checkMesh.xBound.min) return(false);
        if (this.yBound.min>=checkMesh.yBound.max) return(false);
        if (this.yBound.max<=checkMesh.yBound.min) return(false);
        if (this.zBound.min>=checkMesh.zBound.max) return(false);
        return(!(this.zBound.max<=checkMesh.zBound.min));
    }
    
    boxTouchOtherMeshInside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.min) || (this.xBound.max===checkMesh.xBound.max)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.min) || (this.zBound.max===checkMesh.zBound.max)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }
    
    boxTouchOtherMeshOutside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.max) || (this.xBound.max===checkMesh.xBound.min)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.max) || (this.zBound.max===checkMesh.zBound.min)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }

        //
        // setup mesh boxes and bounds
        //

    setupBounds()
    {
        let n;
        let x=this.vertexArray[0];
        let y=this.vertexArray[1];
        let z=this.vertexArray[2];
        
            // get bounds
            
        this.xBound.setFromValues(x,x);
        this.yBound.setFromValues(y,y);
        this.zBound.setFromValues(z,z);

        for (n=3;n<this.vertexCount;n+=3) {
            x=this.vertexArray[n];
            y=this.vertexArray[n+1];
            z=this.vertexArray[n+2];
            
            this.xBound.adjust(x);
            this.yBound.adjust(y);
            this.zBound.adjust(z);
        }

            // get center
            
        this.center.x=this.xBound.getMidPoint();
        this.center.y=this.yBound.getMidPoint();
        this.center.z=this.zBound.getMidPoint();
        
            // save original version to use
            // for modelmatrix recalculations
            
        this.originalXBound.setFromBound(this.xBound);
        this.originalYBound.setFromBound(this.yBound);
        this.originalZBound.setFromBound(this.zBound);
    }
    
        //
        // only use on maps as they aren't rigged
        // animations have inverseBindMatrixes which have
        // transposes in them so you can only scale them
        // in model matrixes
        //
    
    scale(scale)
    {
        let n;
        
        for (n=0;n!=this.vertexCount;n++) {
            this.vertexArray[n]*=scale;
        }
        
        this.setupBounds();
    }
    
        //
        // collision geometry
        //
        
    buildCollisionGeometry(maxFloorCeilingDetectionFactor)
    {
        let n,ny;
        let tIdx,vIdx;
        let xSize,zSize;
        let x0,y0,z0,x1,y1,z1,x2,y2,z2;
        
            // some meshes can be tagged as no
            // collision, specifically things like
            // webs or bushes, etc
            
        if (this.noCollisions) return(false);
        
             // other messages can be simple collisions,
            // which means they collide on their bounds
            
        if (this.simpleCollisions) {
            
                // top and bottom
                
            this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.max,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(0,1,0)));
            this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.max,this.zBound.min),new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.max,this.zBound.max),new PointClass(0,1,0)));
            
            this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.max),new PointClass(0,-1,0)));
            this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.max),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max),new PointClass(0,-1,0)));

                // left and right
                
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.max,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(-1,0,0)));
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.min,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max),new PointClass(-1,0,0)));

            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.max,this.yBound.max,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(1,0,0)));
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.max),new PointClass(1,0,0)));

                // front and back
                
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.min),new PointClass(this.xBound.min,this.yBound.max,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(0,0,-1)));
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.min),new PointClass(this.xBound.min,this.yBound.min,this.zBound.min),new PointClass(this.xBound.max,this.yBound.min,this.zBound.min),new PointClass(0,0,-1)));

            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max),new PointClass(0,0,1)));
            this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(this.xBound.max,this.yBound.max,this.zBound.max),new PointClass(this.xBound.min,this.yBound.min,this.zBound.max),new PointClass(this.xBound.max,this.yBound.min,this.zBound.max),new PointClass(0,0,1)));

            return(true);
        }
       
            // run through the triangles
            // and find any that make a wall to
            // create collision lines and floors
            // to create collision boxes
            
        for (n=0;n!==this.trigCount;n++) {
            
                // get trig vertices
                
            tIdx=n*3;

            vIdx=this.indexArray[tIdx]*3;
            x0=this.vertexArray[vIdx];
            y0=this.vertexArray[vIdx+1];
            z0=this.vertexArray[vIdx+2];
            
            ny=this.normalArray[vIdx+1];      // arrays are parallel, we need normal to check slope
            
            vIdx=this.indexArray[tIdx+1]*3;
            x1=this.vertexArray[vIdx];
            y1=this.vertexArray[vIdx+1];
            z1=this.vertexArray[vIdx+2];
            
            ny+=this.normalArray[vIdx+1];
            
            vIdx=this.indexArray[tIdx+2]*3;
            x2=this.vertexArray[vIdx];
            y2=this.vertexArray[vIdx+1];
            z2=this.vertexArray[vIdx+2];
            
            ny+=this.normalArray[vIdx+1];
            
                // average out the normal, this kind
                // of stuff takes a dot product but since
                // we are comparing it to (0,-1,0) etc the
                // product will only be the Y coordinate to
                // find the slope
                
            ny=ny/3;
            
                // get the x/z area for some floor
                // or ceiling eliminations, if too small
                // it can't be stood on and is decorative
                // sometimes we get walls that are just slivers,
                // also eliminate them
                
            xSize=Math.max(Math.abs(x0-x1),Math.abs(x0-x2),Math.abs(x1-x2));
            zSize=Math.max(Math.abs(z0-z1),Math.abs(z0-z2),Math.abs(z1-z2));
            
                // detect if triangle is a floor
                
            if (ny>=maxFloorCeilingDetectionFactor) {
                if (Math.min(xSize,zSize)<this.FLOOR_MIN_XZ_ELIMINATION_SIZE) continue;
                this.collisionFloorTrigs.push(new CollisionTrigClass(new PointClass(x0,y0,z0),new PointClass(x1,y1,z1),new PointClass(x2,y2,z2),new PointClass(this.normalArray[vIdx],this.normalArray[vIdx+1],this.normalArray[vIdx+2])));
            }
            
                // detect if triangle is a ceiling
                
            else {
                if (ny<=-maxFloorCeilingDetectionFactor) {
                    if (Math.min(xSize,zSize)<this.FLOOR_MIN_XZ_ELIMINATION_SIZE) continue;
                    this.collisionCeilingTrigs.push(new CollisionTrigClass(new PointClass(x0,y0,z0),new PointClass(x1,y1,z1),new PointClass(x2,y2,z2),new PointClass(this.normalArray[vIdx],this.normalArray[vIdx+1],this.normalArray[vIdx+2])));
                }

                    // else consider it a wall

                else {

                    this.collisionWallTrigs.push(new CollisionTrigClass(new PointClass(x0,y0,z0),new PointClass(x1,y1,z1),new PointClass(x2,y2,z2),new PointClass(this.normalArray[vIdx],this.normalArray[vIdx+1],this.normalArray[vIdx+2])));
                }
            }
        }
        
        return(true);
    }
    
        //
        // move or rotate mesh
        //
        
    move(movePnt)
    {
        let n;
        let nCollide;
        
            // move the vertexes
            
        for (n=0;n<this.vertexCount;n+=3) {
            this.vertexArray[n]+=movePnt.x;
            this.vertexArray[n+1]+=movePnt.y;
            this.vertexArray[n+2]+=movePnt.z;
        }
        
            // update the collision boxes
            
        nCollide=this.collisionWallTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionWallTrigs[n].move(movePnt);
        }
        
        nCollide=this.collisionFloorTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionFloorTrigs[n].move(movePnt);
        }
        
        nCollide=this.collisionCeilingTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionCeilingTrigs[n].move(movePnt);
        }
            
            // and finally the bounds
            
        this.center.addPoint(movePnt);
        this.xBound.add(movePnt.x);
        this.yBound.add(movePnt.y);
        this.zBound.add(movePnt.z);
        
            // and mark as requiring a
            // gl buffer update when drawing
            
        this.requiresVertexBufferUpdate=true;
    }
    
    rotate(rotateAngle,offsetPnt)
    {
        let n,x,y,z;
        let nCollide;
        
            // have to rebuild the bounds during rotate
            // note: for now we don't move the center
            // as it'll mess up the rotation
            
        x=this.vertexArray[0];
        y=this.vertexArray[1];
        z=this.vertexArray[2];
        
        this.xBound.setFromValues(x,x);
        this.yBound.setFromValues(y,y);
        this.zBound.setFromValues(z,z);
        
            // rotate the vertexes
            
        this.rotCenterPnt.setFromAddPoint(this.center,offsetPnt);
        
        for (n=0;n<this.vertexCount;n+=3) {
            this.rotPoint.setFromValues(this.vertexArray[n],this.vertexArray[n+1],this.vertexArray[n+2]);
            
                // the point
                
            this.rotVector.setFromSubPoint(this.rotPoint,this.rotCenterPnt);
            this.rotVector.rotate(rotateAngle);
            this.rotPoint.setFromAddPoint(this.rotCenterPnt,this.rotVector);
            
            this.vertexArray[n]=this.rotPoint.x;
            this.vertexArray[n+1]=this.rotPoint.y;
            this.vertexArray[n+2]=this.rotPoint.z;
            
                // the normal
             
            this.rotNormal.setFromValues(this.normalArray[n],this.normalArray[n+1],this.normalArray[n+2]);
            this.rotNormal.rotate(rotateAngle);
            
            this.normalArray[n]=this.rotNormal.x;
            this.normalArray[n+1]=this.rotNormal.y;
            this.normalArray[n+2]=this.rotNormal.z;
            
                // rebuild the bounds while here
                
            this.xBound.adjust(this.rotPoint.x);
            this.yBound.adjust(this.rotPoint.y);
            this.zBound.adjust(this.rotPoint.z);
        }
        
            // update the collision boxes
            
        nCollide=this.collisionWallTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionWallTrigs[n].rotate(rotateAngle,this.rotCenterPnt);
        }
        
        nCollide=this.collisionFloorTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionFloorTrigs[n].rotate(rotateAngle,this.rotCenterPnt);
        }
        
        nCollide=this.collisionCeilingTrigs.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionCeilingTrigs[n].rotate(rotateAngle,this.rotCenterPnt);
        }
        
            // and mark as requiring a
            // gl buffer update when drawing
            
        this.requiresVertexBufferUpdate=true;
        this.requiresNormalBufferUpdate=true;
    }
    
        //
        // mesh binding
        //

    setupBuffers()
    {
        let gl=this.core.gl;
        
            // create all the buffers

        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.STATIC_DRAW);

        this.normalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.normalArray,gl.STATIC_DRAW);

        this.tangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.tangentArray,gl.STATIC_DRAW);

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvArray,gl.STATIC_DRAW);
        
        if (this.jointArray!==null) {
            this.jointBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.jointBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.jointArray,gl.STATIC_DRAW);
            
            this.weightBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.weightBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.weightArray,gl.STATIC_DRAW);
        }
            
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexArray,gl.STATIC_DRAW);
    }

    bindBuffers(shader)
    {
        let gl=this.core.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
        gl.vertexAttribPointer(shader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.tangentBuffer);
        gl.vertexAttribPointer(shader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
            // any rigging if available
            
        if (this.jointArray!==null) {
            gl.bindBuffer(gl.ARRAY_BUFFER,this.jointBuffer);
            gl.vertexAttribPointer(shader.vertexJointAttribute,4,(this.need32BitJointIndexes?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT),false,0,0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER,this.weightBuffer);
            gl.vertexAttribPointer(shader.vertexWeightAttribute,4,gl.FLOAT,false,0,0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    }
    
        //
        // update buffers
        // this happens when a map mesh is moved, and flagged to get
        // updated.  We only do this when the mesh is drawn so we don't
        // update uncessarly
        //
        
    updateBuffers()
    {
        let gl=this.core.gl;
        
            // vertex buffer updates
            
        if (this.requiresVertexBufferUpdate) {
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);

                // mark as updated

            this.requiresVertexBufferUpdate=false;
        }
        
             // normal buffer updates
            
        if (this.requiresNormalBufferUpdate) {
            gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.normalArray);

                // mark as updated

            this.requiresNormalBufferUpdate=false;
        }
    }
            
        //
        // mesh drawing
        //

    draw()
    {
        let gl=this.core.gl;
        
        gl.drawElements(gl.TRIANGLES,this.indexCount,(this.need32BitIndexes?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT),0);
            
        this.core.drawMeshCount++;
        this.core.drawTrigCount+=Math.trunc(this.indexCount/3);
    }
}
