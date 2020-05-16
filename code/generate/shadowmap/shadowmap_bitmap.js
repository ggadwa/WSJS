import PointClass from '../../utility/point.js';

//
// shadowmap bitmap class
// records each generated shadowmap
// canvas and the last chunk written to
//

export default class ShadowmapBitmapClass
{
    constructor(shadowmapGenerator)
    {
        let n;
        
        this.shadowmapGenerator=shadowmapGenerator;
        
            // some constants
            
        this.CHUNK_UV_REDUCE=0.99;
        
        this.shadowMapSize=shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE;
        this.chunkSize=shadowmapGenerator.SHADOWMAP_CHUNK_SIZE;
        this.chunkPerRow=Math.trunc(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE/this.chunkSize);
        
            // the final bitmap
            
        this.bitmap=null;

            // the luminosity data

        this.lumData=new Uint8ClampedArray(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE*shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE);

            // clear to min shadow color

        for (n=0;n!==(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE*shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE);n++) {
            this.lumData[n]=shadowmapGenerator.SHADOW_MIN_VALUE;
        }

            // chunk 0 is the all black chunk,
            
        this.fillChunk(0,shadowmapGenerator.SHADOW_MIN_VALUE);
            
            // so first free chunk is 1
            
        this.chunkIdx=1;
        
        Object.seal(this);
    }
    
        //
        // chunk utilities
        //
        
    getChunkDrawCoordinates(cIdx,p0,p1,p2)
    {
        let x,y;
        let firstTrig=cIdx&0x1;
        
        cIdx=cIdx>>1;
        
        x=(cIdx%this.chunkPerRow)*this.chunkSize;
        y=Math.trunc(cIdx/this.chunkPerRow)*this.chunkSize;
        
            // hypontenuse is always p2->p0
            // so we can line these up with hypontenuse
            // on 3d triangle
            
        if (firstTrig) {
            p0.setFromValues(x,(y+this.chunkSize),0);
            p1.setFromValues(x,y,0);
            p2.setFromValues((x+this.chunkSize),y,0);
        }
        else {
            p0.setFromValues((x+this.chunkSize),y,0);
            p1.setFromValues((x+this.chunkSize),(y+this.chunkSize),0);
            p2.setFromValues(x,(y+this.chunkSize),0);
        }
    }
    
    getChunkUVCoordinatesReduceVertex(pnt,cx,cy,factor)
    {
        let dx,dy,dist;
        let nx,ny;
        
            // get the distance to the center
            
        dx=pnt.x-cx;
        dy=pnt.y-cy;
        
            // make it a normal
        
        dist=Math.sqrt((dx*dx)+(dy*dy));
        if (dist===0) return;
        
        nx=dx/dist;
        ny=dy/dist;
        
            // now calculate the shrunk version
            
        dist=dist*factor;
        pnt.x=cx+Math.trunc(nx*dist);
        pnt.y=cy+Math.trunc(ny*dist);
    }
    
    getChunkUVCoordinates(cIdx,p0,p1,p2)
    {
        let cx,cy;
        
            // get the draw coordinates
            
        this.getChunkDrawCoordinates(cIdx,p0,p1,p2);
        
            // and reduce
    
        cx=Math.trunc((p0.x+p1.x+p2.x)/3);
        cy=Math.trunc((p0.y+p1.y+p2.y)/3);
        
        this.getChunkUVCoordinatesReduceVertex(p0,cx,cy,this.CHUNK_UV_REDUCE);
        this.getChunkUVCoordinatesReduceVertex(p1,cx,cy,this.CHUNK_UV_REDUCE);
        this.getChunkUVCoordinatesReduceVertex(p2,cx,cy,this.CHUNK_UV_REDUCE);
    }
    
    fillChunk(cIdx,lum)
    {
        let pIdx;
        let x,y,ty,by,lx,rx,tlx,blx,trx,brx;
        let p0=new PointClass(0,0,0);
        let p1=new PointClass(0,0,0);
        let p2=new PointClass(0,0,0);
        
        this.getChunkDrawCoordinates(cIdx,p0,p1,p2);
        
        if (cIdx&0x1) {
            ty=p1.y;
            by=p0.y;
            
            tlx=blx=p1.x;
            trx=p2.x;
            brx=p0.x;
        }
        else {
            ty=p0.y;
            by=p1.y;
            
            tlx=p0.x;
            blx=p2.x;
            trx=brx=p0.x;
        }
        
        for (y=ty;y<by;y++) {
            lx=tlx+Math.trunc(((blx-tlx)*(y-ty))/(by-ty));
            rx=trx+Math.trunc(((brx-trx)*(y-ty))/(by-ty));
            
            pIdx=(y*this.shadowMapSize)+lx;
                
            for (x=lx;x<rx;x++) {
                this.lumData[pIdx++]=lum;
            }
        }
    }
}
