import PointClass from '../../utility/point.js';

//
// these are meshes that are parallel to the map mesh
// array, we need to build these because they contain
// pre-calc information and workers can't get DOM objects
//

export default class ShadowmapMeshClass
{
    constructor(mesh)
    {
        let n;
        let v0,v1,v2,v3,vIdx,tIdx;
        
        this.name=mesh.name;
        this.bitmapName=mesh.bitmap.simpleName;
        
        this.moveable=mesh.moveable;
        this.center=mesh.center.copy();
        this.xBound=mesh.xBound.copy();
        this.yBound=mesh.yBound.copy();
        this.zBound=mesh.zBound.copy();
        
        this.indexArray=new Uint32Array(mesh.indexArray);
        this.vertexArray=new Float32Array(mesh.vertexArray);
        this.normalArray=new Float32Array(mesh.normalArray);
        
            // keep track of what shadowmap this
            // mesh is in
            
        this.shadowmapRuns=[];
        
        this.vertexShadowArray=null;
        this.uvShadowArray=null;
        
            // pre-calc one vertex of the triangle
            // and then the two vectors for ray tracing
            
        this.trigCount=mesh.trigCount;
        
        v0=new PointClass(0,0,0);
        v1=new PointClass(0,0,0);
        v2=new PointClass(0,0,0);
            
        this.shadowmapCacheV0=[];
        this.shadowmapCacheV10=[];
        this.shadowmapCacheV20=[];

        for (n=0;n!==this.trigCount;n++) {
            
                // get the triangle vertexes
                
            tIdx=n*3;

            vIdx=mesh.indexArray[tIdx]*3;
            v0.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);

            vIdx=mesh.indexArray[tIdx+1]*3;
            v1.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);

            vIdx=mesh.indexArray[tIdx+2]*3;
            v2.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);

                // and we want to remember the v0, and the two
                // vectors from v0-v1 and v0-v2
                
            this.shadowmapCacheV0.push(v0.copy());
            this.shadowmapCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
            this.shadowmapCacheV20.push(new PointClass((v2.x-v0.x),(v2.y-v0.y),(v2.z-v0.z)));
        }
        
            // now we pre-calc fake triangles for a cube
            // so we can quick eliminate some collisions
            
        v3=new PointClass(0,0,0);
        
        this.cubeCacheV0=[];
        this.cubeCacheV10=[];
        this.cubeCacheV20=[];
        
            // min x side
            
        v0.setFromValues(this.xBound.min,this.yBound.min,this.zBound.min);
        v1.setFromValues(this.xBound.min,this.yBound.min,this.zBound.max);
        v2.setFromValues(this.xBound.min,this.yBound.max,this.zBound.max);
        v3.setFromValues(this.xBound.min,this.yBound.max,this.zBound.min);
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
        
            // max x side
            
        v0.x=this.xBound.max;
        v1.x=this.xBound.max;
        v2.x=this.xBound.max;
        v3.x=this.xBound.max;
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
        
            // min y side
            
        v0.setFromValues(this.xBound.min,this.yBound.min,this.zBound.min);
        v1.setFromValues(this.xBound.max,this.yBound.min,this.zBound.min);
        v2.setFromValues(this.xBound.max,this.yBound.min,this.zBound.max);
        v3.setFromValues(this.xBound.min,this.yBound.min,this.zBound.max);
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
        
            // max y side
            
        v0.y=this.yBound.max;
        v1.y=this.yBound.max;
        v2.y=this.yBound.max;
        v3.y=this.yBound.max;
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
        
            // min z side
            
        v0.setFromValues(this.xBound.min,this.yBound.min,this.zBound.min);
        v1.setFromValues(this.xBound.max,this.yBound.min,this.zBound.min);
        v2.setFromValues(this.xBound.max,this.yBound.max,this.zBound.min);
        v3.setFromValues(this.xBound.min,this.yBound.max,this.zBound.min);
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
        
            // max z side
            
        v0.z=this.zBound.max;
        v1.z=this.zBound.max;
        v2.z=this.zBound.max;
        v3.z=this.zBound.max;
        
        this.cubeCacheV0.push(v0.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v0.x),(v1.y-v0.y),(v1.z-v0.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v0.x),(v3.y-v0.y),(v3.z-v0.z)));
        
        this.cubeCacheV0.push(v2.copy());
        this.cubeCacheV10.push(new PointClass((v1.x-v2.x),(v1.y-v2.y),(v1.z-v2.z)));
        this.cubeCacheV20.push(new PointClass((v3.x-v2.x),(v3.y-v2.y),(v3.z-v2.z)));
    }

}
