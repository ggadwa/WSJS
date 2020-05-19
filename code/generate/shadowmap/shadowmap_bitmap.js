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
            
        this.CHUNK_SMEAR_MARGIN=2;
        
        this.shadowmapSize=shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE;
        this.chunkSize=shadowmapGenerator.SHADOWMAP_CHUNK_SIZE;
        this.chunkPerRow=Math.trunc(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE/this.chunkSize);
        
            // the final bitmap
            
        this.bitmap=null;

            // the luminosity data

        this.lumData=new Uint8ClampedArray(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE*shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE);
        this.smearData=new Uint8ClampedArray(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE*shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE);

            // clear to min shadow color

        for (n=0;n!==(shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE*shadowmapGenerator.SHADOWMAP_TEXTURE_SIZE);n++) {
            this.lumData[n]=shadowmapGenerator.SHADOW_MIN_VALUE;
            this.smearData[n]=0;
        }

            // chunk 0 is the all black chunk,
            
        this.clearChunk(0);
            
            // so first free chunk is 1
            
        this.chunkIdx=1;
        
        Object.seal(this);
    }
    
        //
        // chunk utilities
        //
        
    getChunkCoordinates(cIdx,p0,p1,p2,margin)
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
            p0.setFromValues((x+margin),((y+this.chunkSize)-(margin*2)),0);
            p1.setFromValues((x+margin),(y+margin),0);
            p2.setFromValues(((x+this.chunkSize)-(margin*2)),(y+margin),0);
        }
        else {
            p0.setFromValues(((x+this.chunkSize)-margin),(y+(margin*2)),0);
            p1.setFromValues(((x+this.chunkSize)-margin),((y+this.chunkSize)-margin),0);
            p2.setFromValues((x+(margin*2)),((y+this.chunkSize)-margin),0);
        }
    }
    
    getChunkDrawCoordinates(cIdx,p0,p1,p2)
    {
        this.getChunkCoordinates(cIdx,p0,p1,p2,this.CHUNK_SMEAR_MARGIN);
    }
    
    clearChunk(cIdx)
    {
        let pIdx;
        let x,y,ty,by,lx,rx,tlx,blx,trx,brx;
        let p0=new PointClass(0,0,0);
        let p1=new PointClass(0,0,0);
        let p2=new PointClass(0,0,0);
        
        this.getChunkCoordinates(cIdx,p0,p1,p2,0);
        
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
            
            pIdx=(y*this.shadowmapSize)+lx;
                
            for (x=lx;x<rx;x++) {
                this.lumData[pIdx]=this.shadowmapGenerator.SHADOW_MIN_VALUE;
                this.smearData[pIdx]=0;
                pIdx++;
            }
        }
    }
    
    smearChunk(cIdx)
    {
        let pIdx,pIdx2;
        let n,x,y,ty,by,lx,rx,tlx,blx,trx,brx;
        let cx,cy,dx,dy,dist,nx,ny;
        let p0=new PointClass(0,0,0);
        let p1=new PointClass(0,0,0);
        let p2=new PointClass(0,0,0);
        
        this.getChunkCoordinates(cIdx,p0,p1,p2,0);
        
            // get triangle center
            
        cx=Math.trunc((p0.x+p1.x+p2.x)/3);
        cy=Math.trunc((p0.y+p1.y+p2.y)/3);
        
            // and smear any margin pixels
        
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
            
            pIdx=(y*this.shadowmapSize)+lx;
                
            for (x=lx;x<rx;x++) {
                
                    // see if this is a pixel we already
                    // wrote to, therefore we don't smear it
                    
                if (this.smearData[pIdx]!==0) {
                    pIdx++;
                    continue;
                }
                
                    // otherwise it's on the margins, so
                    // go inside to find the smear pixel
                    
                dx=cx-x;
                dy=cy-y;

                dist=Math.sqrt((dx*dx)+(dy*dy));
                if (dist===0) {
                    pIdx++;
                    return;     // this will never happen but just in case
                }

                nx=dx/dist;
                ny=dy/dist;

                    // now find a pixel to smear
                    // by moving towards the center until we
                    // hit a pixel drawn by the shadow mapping

                dx=x;
                dy=y;
                
                for (n=0;n<this.chunkSize;n++) {
                    dx+=nx;
                    dy+=ny;

                    pIdx2=(Math.trunc(dy)*this.shadowmapSize)+Math.trunc(dx);
                    if (this.smearData[pIdx2]!==0) break;
                }
                    
                    // and smear it
                    
                this.lumData[pIdx]=this.lumData[pIdx2];
                
                pIdx++;
            }
        }
    }
    
    blurChunk(cIdx)
    {
        let pIdx,blurData,lum,count;
        let x,y,ty,by,lx,rx,tlx,blx,trx,brx;
        let p0=new PointClass(0,0,0);
        let p1=new PointClass(0,0,0);
        let p2=new PointClass(0,0,0);
        
            // get a copy to read from
            
        blurData=new Uint8ClampedArray(this.lumData);
        
            // blur all pixels
            
        this.getChunkCoordinates(cIdx,p0,p1,p2,this.CHUNK_SMEAR_MARGIN);
        
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
            
            pIdx=(y*this.shadowmapSize)+lx;
                
            for (x=lx;x<rx;x++) {
                
                    // get the average lum
                    
                count=1;
                lum=blurData[pIdx];
                
                if (y>ty) {
                    if (x>lx) {
                        lum+=blurData[(pIdx-this.shadowmapSize)-1];
                        count++;
                    }
                    lum+=blurData[pIdx-this.shadowmapSize];
                    count++;
                    if (x<(rx-1)) {
                        lum+=blurData[(pIdx-this.shadowmapSize)+1];
                        count++;
                    }
                }
                if (x>lx) {
                    lum+=blurData[pIdx-1];
                    count++;
                }
                if (x<(rx-1)) {
                    lum+=blurData[pIdx+1];
                    count++;
                }
                if (y<(by-1)) {
                    if (x>lx) {
                        lum+=blurData[(pIdx+this.shadowmapSize)-1];
                        count++;
                    }
                    lum+=blurData[pIdx+this.shadowmapSize];
                    count++;
                    if (x<(rx-1)) {
                        lum+=blurData[(pIdx+this.shadowmapSize)+1];
                        count++;
                    }
                }
                
                this.lumData[pIdx++]=Math.trunc(lum/count);
            }
        }
    }
}
