import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import RectClass from '../../code/utility/rect.js';
import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';

//
// generate bitmap class
//

export default class GenBitmapBaseClass
{
    constructor(view,hasNormal,hasSpecular,hasGlow)
    {
        this.view=view;
        this.hasNormal=hasNormal;
        this.hasSpecular=hasSpecular;
        this.hasGlow=hasGlow;
        
            // constants
            
        this.BITMAP_MAP_TEXTURE_SIZE=512;
        this.BITMAP_MODEL_TEXTURE_SIZE=512;
        this.BITMAP_SKY_TEXTURE_WIDTH=2048;
        this.BITMAP_SKY_TEXTURE_HEIGHT=1024;
        this.BITMAP_PARTICLE_TEXTURE_SIZE=64;
        
        this.BITMAP_STACKED_X_MIN_COUNT=1;
        this.BITMAP_STACKED_X_EXTRA_COUNT=4;
        this.BITMAP_STACKED_Y_MIN_COUNT=3;
        this.BITMAP_STACKED_Y_EXTRA_COUNT=4;

        this.BITMAP_GRID_DIVISION=100;
        this.BITMAP_GRID_MIN_BLOCK_WIDTH=30;
        this.BITMAP_GRID_EXTRA_BLOCK_WIDTH=10;
        this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_WIDTH=20;
        this.BITMAP_GRID_MIN_BLOCK_HEIGHT=10;
        this.BITMAP_GRID_EXTRA_BLOCK_HEIGHT=15;
        this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_HEIGHT=10;

            // some precalced normals

        this.NORMAL_CLEAR=new PointClass(0.0,0.0,1.0);

        this.NORMAL_LEFT_45=new PointClass(-0.60,0.02,0.70);
        this.NORMAL_RIGHT_45=new PointClass(0.60,-0.02,0.70);
        this.NORMAL_TOP_45=new PointClass(-0.02,0.60,0.70);
        this.NORMAL_BOTTOM_45=new PointClass(0.02,-0.60,0.70);

        this.NORMAL_LEFT_10=new PointClass(-0.1,0.0,0.90);
        this.NORMAL_RIGHT_10=new PointClass(0.1,0.0,0.90);
        this.NORMAL_TOP_10=new PointClass(0.0,0.1,0.90);
        this.NORMAL_BOTTOM_10=new PointClass(0.0,-0.1,0.90);
        
        this.NORMAL_TOP_LEFT_45=new PointClass(-0.30,0.30,0.70);
        this.NORMAL_TOP_RIGHT_45=new PointClass(0.30,0.30,0.70);
        this.NORMAL_BOTTOM_LEFT_45=new PointClass(-0.30,-0.30,0.70);
        this.NORMAL_BOTTOM_RIGHT_45=new PointClass(0.30,-0.30,0.70);
        
            // the bitmap, normal, specular, and glow
            
        this.bitmapCanvas=null;
        this.bitmapCTX=null;
        this.normalCanvas=null;
        this.normalCTX=null;
        this.specularCanvas=null;
        this.specularCTX=null;
        this.glowCanvas=null;
        this.glowCTX=null;
        
            // current clip rect
            
        this.clipLft=-1;
        this.clipTop=-1;
        this.clipRgt=-1;
        this.clipBot=-1;
        
            // some precalced colors
            
        this.blackColor=new ColorClass(0.0,0.0,0.0);
        this.whiteColor=new ColorClass(1.0,1.0,1.0);
        
            // some primary colors
            
        this.primaryColorList=
                [
                    [0.7,0.0,0.0],      // red
                    [0.0,0.7,0.0],      // green
                    [0.0,0.0,0.7],      // blue
                    [0.7,0.7,0.0],      // yellow
                    [0.8,0.0,0.8],      // purple
                    [0.8,0.8,0.0],      // light blue
                    [0.0,0.9,0.6],     // sea green
                    [1.0,0.4,0.0],      // orange
                    [0.7,0.4,0.0],     // brown
                    [0.8,0.6,0.0],     // gold
                    [0.8,0.6,0.8],     // lavender
                    [1.0,0.8,0.8],    // pink
                    [0.6,0.9,0.0],      // lime
                    [0.2,0.5,0.0],     // tree green
                    [0.5,0.5,0.5],      // gray
                    [0.6,0.0,0.9],      // dark purple
                    [0.0,0.3,0.5],      // slate blue
                    [0.9,0.6,0.4],     // peach
                    [0.9,0.0,0.4],     // muave
                    [0.8,0.5,0.5]      // dull red
                ];
                
        // can't seal as this is a parent class
    }
    
        //
        // segmenting routines
        //

    createStackedSegments(cvsWid,cvsHigh)
    {
        let x,y;
        let lft,top;
        let halfBrick;
        let segments=[];

        let xCount=this.BITMAP_STACKED_X_MIN_COUNT+Math.trunc(genRandom.random()*this.BITMAP_STACKED_X_EXTRA_COUNT);
        let wid=Math.trunc(cvsWid/xCount);
        let halfWid=Math.trunc(wid/2);

        let yCount=this.BITMAP_STACKED_Y_MIN_COUNT+Math.trunc(genRandom.random()*this.BITMAP_STACKED_Y_EXTRA_COUNT);
        let high=Math.trunc(cvsHigh/yCount);

        top=0;
        halfBrick=false;

        for (y=0;y!==yCount;y++) {

            lft=halfBrick?-halfWid:0;

            for (x=0;x!==xCount;x++) {
                segments.push(new RectClass(lft,top,(lft+wid),(top+high)));
                lft+=wid;
            }

            if (halfWid) segments.push(new RectClass(lft,top,(lft+wid),(top+high)));

            top+=high;
            halfBrick=!halfBrick;
        }

        return(segments);
    }

    createRandomSegments(cvsWid,cvsHigh)
    {
        let x,y,x2,y2,hit;
        let wid,high,startWid,startHigh;
        let top,lft,bot,rgt;
        let segments=[];

            // create a grid to
            // build segments in
            // typed arrays initialize to 0

        let grid=new Uint16Array(this.BITMAP_GRID_DIVISION*this.BITMAP_GRID_DIVISION);

            // start making the segments

        while (true) {

                // find first open spot

            x=y=0;
            hit=false;

            while (true) {
                if (grid[(y*this.BITMAP_GRID_DIVISION)+x]===0) {
                    hit=true;
                    break;
                }
                x++;
                if (x===this.BITMAP_GRID_DIVISION) {
                    x=0;
                    y++;
                    if (y===this.BITMAP_GRID_DIVISION) break;
                }
            }

                // no more open spots!

            if (!hit) break;

                // random size

            startWid=this.BITMAP_GRID_MIN_BLOCK_WIDTH+Math.trunc(genRandom.random()*this.BITMAP_GRID_EXTRA_BLOCK_WIDTH);
            if ((x+startWid)>=this.BITMAP_GRID_DIVISION) startWid=this.BITMAP_GRID_DIVISION-x;

            startHigh=this.BITMAP_GRID_MIN_BLOCK_HEIGHT+Math.trunc(genRandom.random()*this.BITMAP_GRID_EXTRA_BLOCK_HEIGHT);
            if ((y+startHigh)>=this.BITMAP_GRID_DIVISION) startHigh=this.BITMAP_GRID_DIVISION-y;

                // make sure we aren't leaving a little sliver
                // at the end

            if (((x+startWid)+this.BITMAP_GRID_MIN_BLOCK_WIDTH)>=this.BITMAP_GRID_DIVISION) startWid=this.BITMAP_GRID_DIVISION-x;
            if (((y+startHigh)+this.BITMAP_GRID_MIN_BLOCK_HEIGHT)>=this.BITMAP_GRID_DIVISION) startHigh=this.BITMAP_GRID_DIVISION-y;

                // determine what can fit

            wid=1;

            while (wid<startWid) {
                if (grid[(y*this.BITMAP_GRID_DIVISION)+(x+wid)]!==0) break;
                wid++;
            }

            high=1;

            while (high<startHigh) {
                if (grid[((y+high)*this.BITMAP_GRID_DIVISION)+x]!==0) break;
                high++;
            }

                // if segment is too small, just block off
                // the single grid item and try again

            if ((wid<this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_WIDTH) || (high<this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_HEIGHT)) {
                grid[(y*this.BITMAP_GRID_DIVISION)+x]=1;
                continue;
            }

                // create the segment and block off
                // the grid

            lft=Math.trunc(x*(cvsWid/this.BITMAP_GRID_DIVISION));
            top=Math.trunc(y*(cvsHigh/this.BITMAP_GRID_DIVISION));
            rgt=Math.trunc((x+wid)*(cvsWid/this.BITMAP_GRID_DIVISION));
            bot=Math.trunc((y+high)*(cvsHigh/this.BITMAP_GRID_DIVISION));

            segments.push(new RectClass(lft,top,rgt,bot));

            for (y2=0;y2!==high;y2++) {
                for (x2=0;x2!==wid;x2++) {
                    grid[((y+y2)*this.BITMAP_GRID_DIVISION)+(x+x2)]=1;
                }
            }
        }

        return(segments);
    }
    
        //
        // clipping
        //
        
    startClip(bitmapCTX,lft,top,rgt,bot)
    {
        bitmapCTX.save();
        bitmapCTX.rect(lft,top,(rgt-lft),(bot-top));
        bitmapCTX.clip();
        
        this.clipLft=lft;
        this.clipTop=top;
        this.clipRgt=rgt;
        this.clipBot=bot;
    }
    
    endClip(bitmapCTX)
    {
        bitmapCTX.restore();
        
        this.clipLft=-1;
        this.clipTop=-1;
        this.clipRgt=-1;
        this.clipBot=-1;
    }

        //
        // color routines
        //

    getRandomColor()
    {
        let col=this.primaryColorList[genRandom.randomIndex(this.primaryColorList.length)];
        let darken=0.1-(genRandom.random()*0.2);
        
        return(new ColorClass((col[0]-darken),(col[1]-darken),(col[2]-darken)));
    }
    
    getRandomGray(min,max)
    {
        let col=min+(genRandom.random()*(max-min));
        return(new ColorClass(col,col,col));
    }
    
    getRandomWoodColor()
    {
        return(new ColorClass(genRandom.randomFloat(0.6,0.2),genRandom.randomFloat(0.3,0.2),0.0));
    }
    
    getRandomGrassColor()
    {
        return(new ColorClass(genRandom.randomFloat(0.0,0.2),genRandom.randomFloat(0.8,0.2),genRandom.randomFloat(0.0,0.2)));
    }
    
    getRandomDirtColor()
    {
        return(new ColorClass(genRandom.randomFloat(0.6,0.2),genRandom.randomFloat(0.3,0.2),0.0));
    }
    
    getRandomMetalColor()
    {
        let f;
        
        if (genRandom.randomPercentage(0.5)) {      // blue-ish
            f=genRandom.randomFloat(0.2,0.3);
            return(new ColorClass(f,(f+0.4),1.0));
        }
        
        f=genRandom.randomFloat(0.7,0.2);           // silver-ish
        return(new ColorClass(f,f,(f+0.1)))
    }
    
    getRandomFurColor()
    {
        let f;
        
        switch (genRandom.randomIndex(5)) {
            
            case 0:         // blonde
                f=genRandom.randomFloat(0.5,0.2);
                return(new ColorClass(f,f,0.0));
                
            case 1:         // white
                f=genRandom.randomFloat(0.7,0.1);
                return(new ColorClass(f,f,f));
                
            case 2:         // black
                f=genRandom.randomFloat(0.2,0.2);
                return(new ColorClass(f,f,f));
                
            case 3:         // brown
                f=genRandom.randomFloat(0.3,0.2);
                return(new ColorClass((f+0.3),f,0.0));

            case 4:         // red
                f=genRandom.randomFloat(0.5,0.3);
                return(new ColorClass(f,0.2,0.2));

        }
    }
    
    getRandomScaleColor()
    {
        let f;
        
        if (genRandom.randomPercentage(0.5)) {      // green-ish
            f=genRandom.randomFloat(0.2,0.3);
            return(new ColorClass(f,1.0,f));
        }
        
        f=genRandom.randomFloat(0.7,0.2);           // purple-ish
        return(new ColorClass(f,0.2,f))
    }
    
    darkenColor(color,darkenFactor)
    {
        return(new ColorClass((color.r*darkenFactor),(color.g*darkenFactor),(color.b*darkenFactor)));
    }
    
    lightenColor(color,lightenFactor)
    {
        return(new ColorClass((color.r+(color.r*lightenFactor)),(color.g+(color.g*lightenFactor)),(color.b+(color.b*lightenFactor))));
    }
    
    boostColor(color,boostAdd)
    {
        return(new ColorClass((color.r+boostAdd),(color.g+boostAdd),(color.b+boostAdd)));
    }
    
    dullColor(color,dullFactor)
    {
            // find the midpoint
            
        let midPoint=(color.r+color.g+color.b)/3.0;
        
            // move towards it
            
        let r=color.r+(midPoint-color.r)*dullFactor;
        let g=color.g+(midPoint-color.g)*dullFactor;
        let b=color.b+(midPoint-color.b)*dullFactor;

        return(new ColorClass(r,g,b));
    }

    colorToRGBColor(color)
    {
        let colorStr='rgb(';
        colorStr+=Math.trunc(color.r*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.g*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.b*255.0);
        colorStr+=')';

        return(colorStr);
    }
    
    colorToRGBAColor(color,alpha)
    {
        let colorStr='rgba(';
        colorStr+=Math.trunc(color.r*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.g*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.b*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(alpha*255.0);
        colorStr+=')';

        return(colorStr);
    }

    normalToRGBColor(normal)
    {
        let colorStr='rgb(';
        colorStr+=Math.trunc((normal.x+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.trunc((normal.y+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.trunc((normal.z+1.0)*127.0);
        colorStr+=')';

        return(colorStr);
    }

    createRandomColorStripeArray(factor,baseColor)
    {
        let n,f,count;
        let r,g,b,color;
        let colors=[];

            // make stripes of varying sizes and colors

        count=0;

        for (n=0;n!==100;n++) {
            count--;

            if (count<=0) {
                count=1+Math.trunc(genRandom.random()*3);

                f=1.0+((1.0-(genRandom.random()*2.0))*factor);

                r=baseColor.r*f;
                if (r<0.0) r=0.0;
                if (r>1.0) r=1.0;

                g=baseColor.g*f;
                if (g<0.0) g=0.0;
                if (g>1.0) g=1.0;

                b=baseColor.b*f;
                if (b<0.0) b=0.0;
                if (b>1.0) b=1.0;
                
                color=new ColorClass(r,g,b);
            }

            colors.push(color);
        }    

        return(colors);
    }
    
        //
        // normal and glow clearing
        //

    clearNormalsRect(normalCTX,lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }
    
    clearGlowRect(glowCTX,lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        glowCTX.fillStyle='#000000';
        glowCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }

        //
        // noise routines
        //

    addNoiseRect(bitmapCTX,lft,top,rgt,bot,minDarken,maxDarken,percentage)
    {    
        let n,nPixel,idx;
        let col,fct;
        let wid=rgt-lft;
        let high=bot-top;    
        let darkenDif=maxDarken-minDarken;
        let bitmapImgData,bitmapData;

            // get the image data to add noise to
        
        if ((lft>=rgt) || (top>=bot)) return;

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;

            // get the image data to add noise to

        idx=0;
        nPixel=wid*high;

        for (n=0;n!==nPixel;n++) {

            if (genRandom.randomPercentage(percentage)) {

                    // the bitmap noise

                fct=minDarken+(darkenDif*genRandom.random());

                    // darken the pixel

                col=(bitmapData[idx]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx]=Math.trunc(col*255.0);

                col=(bitmapData[idx+1]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx+1]=Math.trunc(col*255.0);

                col=(bitmapData[idx+2]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx+2]=Math.trunc(col*255.0);
            }

                // next pixel

            idx+=4;
        }

        bitmapCTX.putImageData(bitmapImgData,lft,top);
    }
    
    addNormalNoiseRect(normalCTX,lft,top,rgt,bot,percentage)
    {    
        let n,nPixel,idx;
        let wid=rgt-lft;
        let high=bot-top;    
        let normalImgData,normalData;
        let normal;
        let normals=[this.NORMAL_LEFT_10,this.NORMAL_RIGHT_10,this.NORMAL_TOP_10,this.NORMAL_BOTTOM_10];

            // get the image data to add noise to

        if ((lft>=rgt) || (top>=bot)) return;

        normalImgData=normalCTX.getImageData(lft,top,wid,high);
        normalData=normalImgData.data;
        
            // get the image data to add noise to

        idx=0;
        nPixel=wid*high;

        for (n=0;n!==nPixel;n++) {

            if (genRandom.randomPercentage(percentage)) {

                    // the random normal

                normal=normals[genRandom.randomIndex(4)];

                normalData[idx]=Math.trunc(normal.x*255.0);
                normalData[idx+1]=Math.trunc(normal.y*255.0);
                normalData[idx+2]=Math.trunc(normal.z*255.0);
            }

                // next pixel

            idx+=4;
        }

        normalCTX.putImageData(normalImgData,lft,top);
    }
    
        //
        // blur routines
        //
        
    blur(bitmapCTX,lft,top,rgt,bot,blurCount,clamp)
    {
        let n,idx;
        let x,y,cx,cy,cxs,cxe,cys,cye,dx,dy;
        let r,g,b;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData,blurData;
        
        if ((wid<=0) || (high<=0)) return;

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
        blurData=new Uint8ClampedArray(bitmapData.length);
        
            // blur pixels to count

        for (n=0;n!==blurCount;n++) {
            
            for (y=0;y!==high;y++) {

                cys=y-1;
                cye=y+2;

                for (x=0;x!==wid;x++) {

                        // get blur from 8 surrounding pixels

                    r=g=b=0;

                    cxs=x-1;
                    cxe=x+2;

                    for (cy=cys;cy!==cye;cy++) {
                        
                        dy=cy;
                        if (!clamp) {
                            if (dy<0) dy=high+dy;
                            if (dy>=high) dy=dy-high;
                        }
                        else {
                            if (dy<0) dy=0;
                            if (dy>=high) dy=high-1;
                        }
                        
                        for (cx=cxs;cx!==cxe;cx++) {
                            if ((cy===y) && (cx===x)) continue;       // ignore self
                            
                            dx=cx;
                            if (!clamp) {
                                if (dx<0) dx=wid+dx;
                                if (dx>=wid) dx=dx-wid;
                            }
                            else {
                                if (dx<0) dx=0;
                                if (dx>=wid) dx=wid-1;
                            }
                            
                                // add up blur from the
                                // original pixels

                            idx=((dy*wid)+dx)*4;

                            r+=bitmapData[idx];
                            g+=bitmapData[idx+1];
                            b+=bitmapData[idx+2];
                        }
                    }
                    
                    idx=((y*wid)+x)*4;

                    blurData[idx]=Math.trunc(r*0.125);
                    blurData[idx+1]=Math.trunc(g*0.125);
                    blurData[idx+2]=Math.trunc(b*0.125);
                }
            }

                // transfer over the changed pixels

            for (y=0;y!==high;y++) {
                idx=(y*wid)*4;
                for (x=0;x!==wid;x++) {       
                    bitmapData[idx]=blurData[idx];
                    bitmapData[idx+1]=blurData[idx+1];
                    bitmapData[idx+2]=blurData[idx+2];
                    idx+=4;
                }
            }
        } 
        
        bitmapCTX.putImageData(bitmapImgData,lft,top);
    }

        //
        // specular routines
        //

    createSpecularMap(bitmapCTX,specularCTX,wid,high,clamp)
    {
        let n,idx,nPixel;
        let f,fMin,fMax,fDif;

        let bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        let bitmapData=bitmapImgData.data;

        let specularImgData=specularCTX.getImageData(0,0,wid,high);
        let specularData=specularImgData.data;

        idx=0;
        nPixel=wid*high;
        
            // get the min-max across the entire
            // bitmap
            
        fMin=1.0;
        fMax=0.0;

        for (n=0;n!==nPixel;n++) {
            f=(bitmapData[idx]+bitmapData[idx+1]+bitmapData[idx+2])/(255.0*3.0);
            if (f<fMin) fMin=f;
            if (f>fMax) fMax=f;

            idx+=4;
        }
        
            // more than likely never going to happen, but
            // just in case reset if min-max are bad
            
        if (fMin>fMax) {
            fMin=0.0;
            fMax=1.0;
        }
        
            // use the the min/max to reclamp
            // to 0...1 then * clamp
        
        idx=0;
        fDif=fMax-fMin;
        
        for (n=0;n!==nPixel;n++) {
            f=(bitmapData[idx]+bitmapData[idx+1]+bitmapData[idx+2])/(255.0*3.0);
            f=((f-fMin)/fDif)*clamp;
            f*=255.0;
                    
            specularData[idx++]=f;
            specularData[idx++]=f;
            specularData[idx++]=f;
            specularData[idx++]=0xFF;
        } 

        specularCTX.putImageData(specularImgData,0,0);
    }
    
        //
        // glow utility
        //

    createGlowMap(bitmapCTX,glowCTX,wid,high,clamp)
    {
        let n,idx,nPixel;

        let bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        let bitmapData=bitmapImgData.data;

        let glowImgData=glowCTX.getImageData(0,0,wid,high);
        let glowData=glowImgData.data;

            // transfer over the bitmap and
            // clamp it for the glow
            
        idx=0;
        nPixel=wid*high;
        
        for (n=0;n!==nPixel;n++) {
            glowData[idx]=Math.trunc(bitmapData[idx]*clamp);
            glowData[idx+1]=Math.trunc(bitmapData[idx+1]*clamp);
            glowData[idx+2]=Math.trunc(bitmapData[idx+2]*clamp);
            glowData[idx+3]=0xFF;
            
            idx+=4;
        } 

        glowCTX.putImageData(glowImgData,0,0);
    }
    
        //
        // channel swaps
        //
        
    swapRedToAlpha(bitmapCTX,wid,high)
    {
        let n,nPixel,idx;
        
        let bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        let bitmapData=bitmapImgData.data;
        
        idx=0;
        nPixel=wid*high;
        
        for (n=0;n!==nPixel;n++) {
            bitmapData[idx+3]=bitmapData[idx];
            idx+=4;
        }
        
        bitmapCTX.putImageData(bitmapImgData,0,0);
    }


        //
        // rectangles, ovals, lines
        //

    drawRect(bitmapCTX,lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        bitmapCTX.fillStyle=this.colorToRGBColor(color);
        bitmapCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }
    
    drawGlowRect(glowCTX,lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        glowCTX.fillStyle=this.colorToRGBColor(this.darkenColor(color,0.5));
        glowCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }

    draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,color,faceOut)
    {
        let n,lx,rx,ty,by;
        let colFactor,edgeColor,fillColor;

            // draw the edges

        lx=lft;
        rx=rgt;
        ty=top;
        by=bot;

        for (n=0;n<=edgeSize;n++) {
            if (faceOut) {
                colFactor=((n/edgeSize)*0.3)+0.7;
            }
            else {
                colFactor=(0.3-((n/edgeSize)*0.3))+0.7;
            }
            
            edgeColor=this.darkenColor(color,colFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(edgeColor);

                // the color

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lx,ty);
            bitmapCTX.lineTo(lx,by);
            bitmapCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(rx,ty);
            bitmapCTX.lineTo(rx,by);
            bitmapCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lx,ty);
            bitmapCTX.lineTo(rx,ty);
            bitmapCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lx,by);
            bitmapCTX.lineTo(rx,by);
            bitmapCTX.stroke();

                // the normal

            normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_LEFT_45:this.NORMAL_RIGHT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,ty);
            normalCTX.lineTo(lx,by);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_RIGHT_45:this.NORMAL_LEFT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(rx,ty);
            normalCTX.lineTo(rx,by);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_TOP_45:this.NORMAL_BOTTOM_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,ty);
            normalCTX.lineTo(rx,ty);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_BOTTOM_45:this.NORMAL_TOP_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,by);
            normalCTX.lineTo(rx,by);
            normalCTX.stroke();

                // next edge

            lx++;
            rx--;
            ty++;
            by--;
        }
        
            // if this is facing in, then we use darker color
        
        fillColor=color;
        if (!faceOut) fillColor=this.darkenColor(color,0.7);

            // draw the inner fill

        this.drawRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),fillColor);

        this.clearNormalsRect(normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize));
    }

    draw3DComplexRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        let n,k,k2,add;
        let darkenFactor,darkColor;

        let wid=rgt-lft;
        let high=bot-top;

        let mx=Math.trunc((lft+rgt)/2);
        let my=Math.trunc((top+bot)/2);
        
        let sidePointCount=15;
        let totalPointCount=sidePointCount*4;

            // build the polygon

        let x=new Uint16Array(totalPointCount);
        let y=new Uint16Array(totalPointCount);
        
        for (n=0;n!==sidePointCount;n++) {
            add=Math.trunc((wid/sidePointCount)*n);
            x[n]=lft+add;
            y[n]=top;
            x[n+(sidePointCount*2)]=rgt-add;
            y[n+(sidePointCount*2)]=bot;
        }

        for (n=0;n!==sidePointCount;n++) {
            add=Math.trunc((high/sidePointCount)*n);
            x[n+sidePointCount]=rgt;
            y[n+sidePointCount]=top+add;
            x[n+(sidePointCount*3)]=lft;
            y[n+(sidePointCount*3)]=bot-add;
        }
        
            // round the corners
        
        add=genRandom.randomInt(5,5);
        x[0]+=add;
        y[0]+=add;
        add*=0.5;
        x[1]+=add;
        y[1]+=add;
        x[(sidePointCount*4)-1]+=add;
        y[(sidePointCount*4)-1]+=add;
        
        add=genRandom.randomInt(5,5);
        x[sidePointCount]-=add;
        y[sidePointCount]+=add;
        add*=0.5;
        x[sidePointCount-1]-=add;
        y[sidePointCount-1]+=add;
        x[sidePointCount+1]-=add;
        y[sidePointCount+1]+=add;

        add=genRandom.randomInt(5,5);
        x[sidePointCount*2]-=add;
        y[sidePointCount*2]-=add;
        add*=0.5;
        x[(sidePointCount*2)-1]-=add;
        y[(sidePointCount*2)-1]-=add;
        x[(sidePointCount*2)+1]-=add;
        y[(sidePointCount*2)+1]-=add;

        add=genRandom.randomInt(5,5);
        x[sidePointCount*3]+=add;
        y[sidePointCount*3]-=add;
        add*=0.5;
        x[(sidePointCount*3)-1]+=add;
        y[(sidePointCount*3)-1]-=add;
        x[(sidePointCount*3)+1]+=add;
        y[(sidePointCount*3)+1]-=add;

            // randomize it

        for (n=0;n!==totalPointCount;n++) {
            add=genRandom.randomIndex(5);
            x[n]+=(x[n]<mx)?add:-add;
            add=genRandom.randomIndex(5);
            y[n]+=(y[n]<my)?add:-add;
        }

            // draw the edges

        bitmapCTX.lineWidth=2;
        normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the color outline

            darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(x[0],y[0]);

            for (k=1;k!==totalPointCount;k++) {
                bitmapCTX.lineTo(x[k],y[k]);
            }

            bitmapCTX.lineTo(x[0],y[0]);
            bitmapCTX.stroke();

                // the normals

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
            normalCTX.beginPath();

            for (k=0;k!==sidePointCount;k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_45);
            normalCTX.beginPath();

            for (k=sidePointCount;k!==(sidePointCount*2);k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
            normalCTX.beginPath();

            for (k=(sidePointCount*2);k!==(sidePointCount*3);k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_45);
            normalCTX.beginPath();

            for (k=(sidePointCount*3);k!==(sidePointCount*4);k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                if (k2===totalPointCount) k2=0;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

                // reduce polygon

            for (k=0;k!==totalPointCount;k++) {
                x[k]+=(x[k]<mx)?1:-1;
                y[k]+=(y[k]<my)?1:-1;
            }
        }

        bitmapCTX.lineWidth=1;
        normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fill

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            bitmapCTX.lineTo(x[k],y[k]);
        }

        bitmapCTX.fill();
        
        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

        normalCTX.beginPath();
        normalCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            normalCTX.lineTo(x[k],y[k]);
        }

        normalCTX.fill();
    }
    
    draw3DHexagon(bitmapCTX,normalCTX,wid,high,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        let n,lx,rx,my,xAdd;
        let darkenFactor,darkColor;

            // build the polygon

        xAdd=Math.trunc((rgt-lft)*0.1);
        
        lx=lft-xAdd;
        rx=rgt;
        rgt-=xAdd;
        my=Math.trunc((top+bot)/2);
        
            // draw the edges
            
        bitmapCTX.lineWidth=2;
        normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the colors

            darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
                // top-left to top to top-right
            
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lx,my);
            bitmapCTX.lineTo(lft,top);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_LEFT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,my);
            normalCTX.lineTo(lft,top);
            normalCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lft,top);
            bitmapCTX.lineTo(rgt,top);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lft,top);
            normalCTX.lineTo(rgt,top);
            normalCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(rgt,top);
            bitmapCTX.lineTo(rx,my);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_RIGHT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(rgt,top);
            normalCTX.lineTo(rx,my);
            normalCTX.stroke();
            
                // bottom-right to bottom to bottom-left
            
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(rx,my);
            bitmapCTX.lineTo(rgt,bot);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_RIGHT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(rx,my);
            normalCTX.lineTo(rgt,bot);
            normalCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(rgt,bot);
            bitmapCTX.lineTo(lft,bot);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
            normalCTX.beginPath();
            normalCTX.moveTo(rgt,bot);
            normalCTX.lineTo(lft,bot);
            normalCTX.stroke();

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lft,bot);
            bitmapCTX.lineTo(lx,my);
            bitmapCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_LEFT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lft,bot);
            normalCTX.lineTo(lx,my);
            normalCTX.stroke();
            
                // reduce it
                
            lx++;
            lft++;
            rx--;
            rgt--;
            top++;
            bot--;
        }
        
        bitmapCTX.lineWidth=1;
        normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fills
            // which we have to break up because canvases
            // get confused with offscreen coordinates

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

            // the box
            
        bitmapCTX.fillRect(lft,top,(rgt-lft),(bot-top));
        normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
        
            // left triangle

        if (lft>=0) {
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lx,my);
            bitmapCTX.lineTo(lft,top);
            bitmapCTX.lineTo(lft,bot);
            bitmapCTX.fill();
           
            normalCTX.beginPath();
            normalCTX.moveTo(lx,my);
            normalCTX.lineTo(lft,top);
            normalCTX.lineTo(lft,bot);
            normalCTX.fill();
        }

        if (rgt<wid) {
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(rx,my);
            bitmapCTX.lineTo(rgt,top);
            bitmapCTX.lineTo(rgt,bot);
            bitmapCTX.fill();
           
            normalCTX.beginPath();
            normalCTX.moveTo(rx,my);
            normalCTX.lineTo(rgt,top);
            normalCTX.lineTo(rgt,bot);
            normalCTX.fill();
        }
    }
    
    drawDiamond(bitmapCTX,lft,top,rgt,bot,fillRGBColor,borderRGBColor)
    {
        let mx,my;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) bitmapCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(mx,top);
        bitmapCTX.lineTo(rgt,my);
        bitmapCTX.lineTo(mx,bot);
        bitmapCTX.lineTo(lft,my);
        bitmapCTX.lineTo(mx,top);
        bitmapCTX.fill();
        if (borderRGBColor!==null) bitmapCTX.stroke();
    }
    
    drawOval(bitmapCTX,lft,top,rgt,bot,fillRGBColor,borderRGBColor)
    {
        let mx,my,xRadius,yRadius;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);
        
        xRadius=Math.trunc((rgt-lft)*0.5);
        yRadius=Math.trunc((bot-top)*0.5);

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) bitmapCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);
        
        bitmapCTX.beginPath();
        bitmapCTX.ellipse(mx,my,xRadius,yRadius,0.0,0.0,(Math.PI*2));
        bitmapCTX.fill();
        if (borderRGBColor!==null) bitmapCTX.stroke();
    }
    
    drawWrappedOval(bitmapCTX,lft,top,rgt,bot,wid,high,fillRGBColor,borderRGBColor)
    {
        let         x,y;
        
        this.drawOval(bitmapCTX,lft,top,rgt,bot,fillRGBColor,borderRGBColor);
        if (lft<0) {
            x=wid+lft;
            this.drawOval(bitmapCTX,x,top,(x+(rgt-lft)),bot,fillRGBColor,borderRGBColor);
        }
        if (rgt>wid) {
            x=-(rgt-wid);
            this.drawOval(bitmapCTX,x,top,(x+(rgt-lft)),bot,fillRGBColor,borderRGBColor);
        }
        if (top<0) {
            y=high+top;
            this.drawOval(bitmapCTX,lft,y,rgt,(y+(bot-top)),fillRGBColor,borderRGBColor);
        }
        if (bot>high) {
            y=-(bot-high);
            this.drawOval(bitmapCTX,lft,y,rgt,(y+(bot-top)),fillRGBColor,borderRGBColor);
        }
    }
    
    draw3DOval(bitmapCTX,normalCTX,lft,top,rgt,bot,startArc,endArc,edgeSize,flatInnerSize,fillRGBColor,edgeRGBColor)
    {
        let n,x,y,mx,my,halfWid,halfHigh;
        let rad,fx,fy,col,idx;
        let orgWid,orgHigh,wid,high,edgeCount;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData;
        
            // start and end arc
            
        startArc=Math.trunc(startArc*1000);
        endArc=Math.trunc(endArc*1000);
        if (startArc>=endArc) return;
        
            // the drawing size
            
        orgWid=rgt-lft;
        orgHigh=bot-top;
        wid=orgWid-1;
        high=orgHigh-1;         // avoids clipping on bottom from being on wid,high
        mx=Math.trunc(wid/2);
        my=Math.trunc(high/2);

        bitmapImgData=bitmapCTX.getImageData(lft,top,orgWid,orgHigh);
        bitmapData=bitmapImgData.data;

        edgeCount=edgeSize;
        
            // fill the oval

        while ((wid>0) && (high>0)) {

            halfWid=wid*0.5;
            halfHigh=high*0.5;
            
            if (edgeCount>0) {
                col=edgeRGBColor;
            }
            else {
                col=fillRGBColor;
            }

            for (n=startArc;n<endArc;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                x=mx+Math.trunc(halfWid*fx);
                if (x<0) x=0;

                fy=Math.cos(rad);
                y=my-Math.trunc(halfHigh*fy);
                if (y<0) y=0;
                
                    // clipping
                    
                if (this.clipLft!==-1) {
                    if (((x+lft)<this.clipLft) || ((x+lft)>=this.clipRgt)) continue;
                    if (((y+top)<this.clipTop) || ((y+top)>=this.clipBot)) continue;
                }

                    // the color pixel

                idx=((y*orgWid)+x)*4;

                bitmapData[idx]=Math.trunc(col.r*255.0);
                bitmapData[idx+1]=Math.trunc(col.g*255.0);
                bitmapData[idx+2]=Math.trunc(col.b*255.0);
            }

            if (edgeCount>0) edgeCount--;
            if ((edgeCount===0) && (fillRGBColor===null)) break;

            wid--;
            high--;
        }

        bitmapCTX.putImageData(bitmapImgData,lft,top);
        
            // chrome has a really onbxious bug where it'll get
            // image data messed up and doing both of these at once
            // tends to get the normal written to the bitmap, so,
            // sigh, we do both these separately
            
        normalImgData=normalCTX.getImageData(lft,top,orgWid,orgHigh);
        normalData=normalImgData.data;
        
        wid=orgWid-1;
        high=orgHigh-1;
        
        edgeCount=edgeSize;
        
            // create the normals

        while ((wid>0) && (high>0)) {

            halfWid=wid*0.5;
            halfHigh=high*0.5;

            for (n=startArc;n<endArc;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                x=mx+Math.trunc(halfWid*fx);
                if (x<0) x=0;

                fy=Math.cos(rad);
                y=my-Math.trunc(halfHigh*fy);
                if (y<0) y=0;
                
                    // clipping
                    
                if (this.clipLft!==-1) {
                    if (((x+lft)<this.clipLft) || ((x+lft)>=this.clipRgt)) continue;
                    if (((y+top)<this.clipTop) || ((y+top)>=this.clipBot)) continue;
                }

                    // get a normal for the pixel change
                    // if within the flat inner circle, just point the z out
                    // otherwise calculate from radius

                idx=((y*orgWid)+x)*4;

                if ((wid<=flatInnerSize) || (high<=flatInnerSize)) {
                    normalData[idx]=127;
                    normalData[idx+1]=127;
                    normalData[idx+2]=255;
                }
                else {
                    normalData[idx]=(fx+1.0)*127.0;
                    normalData[idx+1]=(fy+1.0)*127.0;
                    normalData[idx+2]=(0.5+1.0)*127.0;        // just so we remember that we are focing the Z back to top
                }
            }
            
            if (edgeCount>0) edgeCount--;
            if ((edgeCount===0) && (fillRGBColor===null)) break;

            wid--;
            high--;
        }
        
        normalCTX.putImageData(normalImgData,lft,top);
    }

    draw3DComplexOval(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        let n,k,k2,add,rad,fx,fy;
        let darkenFactor,darkColor,normal;

        let wid=rgt-lft;
        let high=bot-top;

        let mx=Math.trunc((lft+rgt)/2);
        let my=Math.trunc((top+bot)/2);
        let halfWid=wid*0.5;
        let halfHigh=high*0.5;
        
        let totalPointCount=60;

            // build the polygon

        let x=new Uint16Array(totalPointCount);
        let y=new Uint16Array(totalPointCount);
        
        for (n=0;n!==totalPointCount;n++) {
            rad=(Math.PI*2.0)*(n/totalPointCount);

            fx=Math.sin(rad);
            x[n]=mx+Math.trunc(halfWid*fx);
            if (x[n]<0) x[n]=0;

            fy=Math.cos(rad);
            y[n]=my-Math.trunc(halfHigh*fy);
            if (y[n]<0) y[n]=0;
        }

            // randomize it

        for (n=0;n!==totalPointCount;n++) {
            add=genRandom.randomIndex(5);
            x[n]+=(x[n]<mx)?add:-add;
            add=genRandom.randomIndex(5);
            y[n]+=(y[n]<my)?add:-add;
        }

            // draw the edges

        bitmapCTX.lineWidth=2;
        normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the color outline

            darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);

            bitmapCTX.beginPath();
            bitmapCTX.moveTo(x[0],y[0]);

            for (k=1;k!==totalPointCount;k++) {
                bitmapCTX.lineTo(x[k],y[k]);
            }

            bitmapCTX.lineTo(x[0],y[0]);
            bitmapCTX.stroke();

                // the normals
                
            for (k=0;k!==totalPointCount;k++) {
                rad=(Math.PI*2.0)*(k/totalPointCount);
                normal=new PointClass(Math.sin(rad),Math.cos(rad),0.5);
                normal.normalize();
                normalCTX.strokeStyle=this.normalToRGBColor(normal);
                
                k2=k+1;
                if (k2===totalPointCount) k2=0;

                normalCTX.beginPath();
                normalCTX.moveTo(x[k],y[k]);
                normalCTX.lineTo(x[k2],y[k2]);
                normalCTX.stroke();
            }
            
                // reduce polygon

            for (k=0;k!==totalPointCount;k++) {
                x[k]+=(x[k]<mx)?1:-1;
                y[k]+=(y[k]<my)?1:-1;
            }
        }

        bitmapCTX.lineWidth=1;
        normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fill

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            bitmapCTX.lineTo(x[k],y[k]);
        }

        bitmapCTX.fill();
        
        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

        normalCTX.beginPath();
        normalCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            normalCTX.lineTo(x[k],y[k]);
        }

        normalCTX.fill();
    }
    
    drawLine2(ctx,imgWid,imgHigh,x,y,x2,y2,color)
    {
        let n,xLen,yLen,dif,dx,dy,slope,idx;
        let bitmapImgData,bitmapData;
        let r=Math.trunc(color.r*255.0);
        let g=Math.trunc(color.g*255.0);
        let b=Math.trunc(color.b*255.0);
        
            // get the image data

        bitmapImgData=ctx.getImageData(0,0,imgWid,imgHigh);
        bitmapData=bitmapImgData.data;
        
            // the line
            
        xLen=Math.abs(x2-x);
        yLen=Math.abs(y2-y);
            
        if (xLen>yLen) {
            slope=yLen/xLen;
            dif=x2-x;
            
            for (n=0;n!==xLen;n++) {
                dx=x+Math.trunc((dif*n)/xLen);
                dy=y+Math.trunc(slope*n);
                
                idx=((dy*imgWid)+dx)*4;
                bitmapData[idx]=r;
                bitmapData[idx+1]=g;
                bitmapData[idx+2]=b;
            }
        }
        else {
            slope=xLen/yLen;
            dif=y2-y;
            
            for (n=0;n!==yLen;n++) {
                dx=x+Math.trunc(slope*n);
                dy=y+Math.trunc((dif*n)/yLen);
                
                idx=((dy*imgWid)+dx)*4;
                bitmapData[idx]=r;
                bitmapData[idx+1]=g;
                bitmapData[idx+2]=b;
            }
        }
        
            // write all the data back

        ctx.putImageData(bitmapImgData,0,0);
    }

   
    drawLine(bitmapCTX,normalCTX,x,y,x2,y2,color,lightLine)
    {
        let horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
            // line itself
            
        bitmapCTX.strokeStyle=this.colorToRGBColor(color);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x,y);
        bitmapCTX.lineTo(x2,y2);
        bitmapCTX.stroke();
        
            // smoothing
  
        bitmapCTX.strokeStyle=this.colorToRGBAColor(color,0.5);

        if (horizontal) {
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(x,(y-1));
            bitmapCTX.lineTo(x2,(y2-1));
            bitmapCTX.stroke();
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(x,(y+1));
            bitmapCTX.lineTo(x2,(y2+1));
            bitmapCTX.stroke();
        }
        else {
            bitmapCTX.beginPath();
            bitmapCTX.moveTo((x-1),y);
            bitmapCTX.lineTo((x2-1),y2);
            bitmapCTX.stroke();
            bitmapCTX.beginPath();
            bitmapCTX.moveTo((x+1),y);
            bitmapCTX.lineTo((x2+1),y2);
            bitmapCTX.stroke();
        }

            // the normal change
            // flip as lines are inside

        if (normalCTX!==null) {
            if (horizontal) {
                normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-1));
                normalCTX.lineTo(x2,(y2-1));
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+1));
                normalCTX.lineTo(x2,(y2+1));
                normalCTX.stroke();
            }
            else {
                normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x-1),y);
                normalCTX.lineTo((x2-1),y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x+1),y);
                normalCTX.lineTo((x2+1),y2);
                normalCTX.stroke();
            }
        }
    }
    
    drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,clipLft,clipTop,clipRgt,clipBot,lineVariant,color,lightLine)
    {
        let n,sx,sy,ex,ey,r;
        let segCount=genRandom.randomInt(2,5);
        let horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
        let xAdd=Math.trunc((x2-x)/segCount);
        let yAdd=Math.trunc((y2-y)/segCount);
        
        sx=x;
        sy=y;
        
        for (n=0;n!==segCount;n++) {
            
            if ((n+1)===segCount) {
                ex=x2;
                ey=y2;
            }
            else {
                ex=sx+xAdd;
                ey=sy+yAdd;

                r=lineVariant-genRandom.randomIndex(lineVariant*2);

                if (horizontal) {
                    ey+=r;
                }
                else {
                    ex+=r;
                }
            }
            
            if (ex<clipLft) ex=clipLft;
            if (ex>clipRgt) ex=clipRgt;
            if (ey<clipTop) ey=clipTop;
            if (ey>clipBot) ey=clipBot;
            
            this.drawLine(bitmapCTX,normalCTX,sx,sy,ex,ey,color,lightLine);
            
            sx=ex;
            sy=ey;
        }
    }
    
    drawBumpLine(bitmapCTX,normalCTX,x,y,x2,y2,wid,color)
    {
        let n;
        let halfWid=Math.trunc(wid*0.5);
        let chunkOne=Math.trunc(wid*0.33);
        let chunkTwo=Math.trunc(wid*0.66);
        
        let darkColor=this.darkenColor(color,0.9);
        
        let horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
        if (!horizontal) {
            x-=halfWid;
            x2-=halfWid;
        }
        else {
            y-=halfWid;
            y2-=halfWid;
        }
        
            // the fade up
            
        bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
        for (n=0;n!==chunkOne;n++) {
            if (horizontal) {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();
                
                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();

                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
        
            // the level chunk
            
        bitmapCTX.strokeStyle=this.colorToRGBColor(color);
        normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        
        for (n=chunkOne;n!==chunkTwo;n++) {
            if (horizontal) {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();
                
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();

                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
            
            // the fade down
            
        bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
        for (n=chunkTwo;n!==wid;n++) {
            if (horizontal) {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();
                
                normalCTX.strokeStyle=this.normalToRGBColor((n===(wid-1))?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,y);
                bitmapCTX.lineTo(x2,y2);
                bitmapCTX.stroke();

                normalCTX.strokeStyle=this.normalToRGBColor((n===(wid-1))?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
    }
    
        //
        // slopes
        //
        
    drawSlope(bitmapCTX,normalCTX,lft,top,rgt,bot,color,up)
    {
        let y;
        let darkenFactor,darkColor;
        let high=bot-top;
        
        normalCTX.strokeStyle=this.normalToRGBColor(up?this.NORMAL_TOP_45:this.NORMAL_BOTTOM_45);
        
        for (y=top;y!==bot;y++) {
            
            darkenFactor=(((y-top)+1)/high)*0.2;
            if (up) darkenFactor=0.2-darkenFactor;
            darkenFactor+=0.8;
            darkColor=this.darkenColor(color,darkenFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
            bitmapCTX.beginPath();
            bitmapCTX.moveTo(lft,y);
            bitmapCTX.lineTo(rgt,y);
            bitmapCTX.stroke();
            
            normalCTX.beginPath();
            normalCTX.moveTo(lft,y);
            normalCTX.lineTo(rgt,y);
            normalCTX.stroke();
        }
    }
    
        //
        // particles
        //

    drawParticle(bitmapCTX,normalCTX,imgWid,imgHigh,lft,top,rgt,bot,ringCount,darkenFactor,pixelDensity,flipNormals)
    {
        let n,k,px,py,mx,my,idx;
        let rad,fx,fy,fsz;
        let col;
        let wid,high;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData;
        let ringWid,ringWidSub,ringHigh,ringHighSub;
        let listIdx,angList,sizeList;
        
        if ((lft>=rgt) || (top>=bot)) return;
        
        wid=rgt-lft;
        high=bot-top;
        
            // again, horrible chrome bug forces us to
            // run this as two separate writes because
            // it like to mix up the bitmaps
            
        angList=new Float32Array(ringCount*pixelDensity);
        sizeList=new Float32Array(ringCount*pixelDensity);
        
            // build the data
        
        listIdx=0;
        
        for (n=0;n!==ringCount;n++) {
            for (k=0;k!==pixelDensity;k++) {
                angList[listIdx]=(Math.PI*2.0)*genRandom.random();
                sizeList[listIdx]=genRandom.random();
                listIdx++;
            }
        }
        
            // get the center
            // remember this is a clip so
            // it always starts at 0,0

        mx=lft+Math.trunc(wid/2);
        my=top+Math.trunc(high/2);

            // do the bitmap data first
            
        bitmapImgData=bitmapCTX.getImageData(0,0,imgWid,imgHigh);
        bitmapData=bitmapImgData.data;

            // create the rings of
            // particles

        ringWid=wid;
        ringWidSub=Math.trunc(wid/(ringCount+1));

        ringHigh=high;
        ringHighSub=Math.trunc(high/(ringCount+1));

        listIdx=0;
        
        for (n=0;n!==ringCount;n++) {

                // the density of each ring

            for (k=0;k!==pixelDensity;k++) {

                    // get a random pixel

                rad=angList[listIdx];
                fx=Math.sin(rad);
                fy=Math.cos(rad);

                fsz=sizeList[listIdx];
                px=mx+Math.trunc((fsz*ringWid)*fx);
                py=my-Math.trunc((fsz*ringHigh)*fy);
                
                listIdx++;

                    // this can wrap

                if (px<0) px+=imgWid;
                if (px>=imgWid) px-=imgWid;
                if (py<0) py+=imgHigh;
                if (py>=imgHigh) py-=imgHigh;

                    // read the pixel and darken it

                idx=((py*imgWid)+px)*4;

                col=(bitmapData[idx]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx]=Math.trunc(col*255.0);

                col=(bitmapData[idx+1]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx+1]=Math.trunc(col*255.0);

                col=(bitmapData[idx+2]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx+2]=Math.trunc(col*255.0);
            }

                // next ring

            ringWid-=ringWidSub;
            ringHigh-=ringHighSub;
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,0,0);
        
            // now the normal data
            
        if (normalCTX===null) return;
            
        normalImgData=normalCTX.getImageData(0,0,imgWid,imgHigh);
        normalData=normalImgData.data;

            // create the rings of
            // particles

        ringWid=wid;
        ringHigh=high;

        listIdx=0;
        
        for (n=0;n!==ringCount;n++) {

                // the density of each ring

            for (k=0;k!==pixelDensity;k++) {

                    // get a random pixel

                rad=angList[listIdx];
                fx=Math.sin(rad);
                fy=Math.cos(rad);

                fsz=sizeList[listIdx];
                px=mx+Math.trunc((fsz*ringWid)*fx);
                py=my-Math.trunc((fsz*ringHigh)*fy);
                
                listIdx++;

                    // this can wrap

                if (px<0) px+=imgWid;
                if (px>=imgWid) px-=imgWid;
                if (py<0) py+=imgHigh;
                if (py>=imgHigh) py-=imgHigh;

                    // get a normal for the pixel change

                idx=((py*imgWid)+px)*4;

                if (!flipNormals) {
                    normalData[idx]=(fx+1.0)*127.0;
                    normalData[idx+1]=(fy+1.0)*127.0;
                }
                else {
                    normalData[idx]=(fy+1.0)*127.0;
                    normalData[idx+1]=(fx+1.0)*127.0;
                }
                normalData[idx+2]=(0.5+1.0)*127.0;        // just so we remember that we are focing the Z back to top
            }

                // next ring

            ringWid-=ringWidSub;
            ringHigh-=ringHighSub;
        }

            // write all the data back

        normalCTX.putImageData(normalImgData,0,0);
    }
    
        //
        // streaks
        //

    drawStreakMetal(bitmapCTX,imgWid,imgHigh,x,top,bot,streakWid,baseColor)
    {
        let n,lx,rx,y,idx;
        let bitmapImgData,bitmapData;
        let density,densityReduce;
        
        if (top>=bot) return;
        if (streakWid<=0) return;
        
            // since we draw the streaks from both sides,
            // we need to move the X into the middle and cut width in half
            
        streakWid=Math.trunc(streakWid*0.5);
            
        x+=streakWid;
        
            // get the image data

        bitmapImgData=bitmapCTX.getImageData(0,0,imgWid,imgHigh);
        bitmapData=bitmapImgData.data;
        
            // start with 100 density and reduce
            // as we go across the width
            
        density=100;
        densityReduce=Math.trunc(90/streakWid);
        
            // write the streaks
            
        for (n=0;n!==streakWid;n++) {
            
            lx=x-n;
            rx=x+n;
            
            for (y=top;y!==bot;y++) {
                
                if (genRandom.randomInt(0,100)<density) {
                    if ((lx>=0) && (lx<imgWid)) {
                        idx=((y*imgWid)+lx)*4;
                        bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                        bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                        bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
                
                if (genRandom.randomInt(0,100)<density) {
                    if ((rx>=0) && (rx<imgWid)) {
                        idx=((y*imgWid)+rx)*4;
                        bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                        bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                        bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
            
            }
            
            density-=densityReduce;
        }
        
            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,0,0);
    }
    
    drawStreakDirtSingle(bitmapCTX,lft,top,rgt,bot,reduceStreak,density,dirtColorAvg)
    {
        let lx,rx,xAdd,x,y,idx;
        let factor,lineDensity,dirtWidReduce;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        
        if ((wid<=0) || (high<=0)) return;
        
            // get the image data

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
            // random dirt reductions
        
        dirtWidReduce=0;
        if (reduceStreak) dirtWidReduce=(genRandom.random()*0.1)*wid;
        
            // draw the dirt
            
        for (y=0;y!==high;y++) {
            
            factor=1.0-(y/high);
            
                // the dirt works down to a point
                
            xAdd=Math.trunc((wid-(factor*dirtWidReduce))*0.48);
            lx=xAdd;
            rx=wid-xAdd;
            if (lx>=rx) break;
            
            lineDensity=density*factor;
            if (lineDensity<=0.2) lineDensity=0.2;
            
            for (x=lx;x!==rx;x++) {
                
                if (genRandom.randomPercentage(lineDensity)) {
                    idx=((y*wid)+x)*4;
                    bitmapData[idx]=Math.trunc((bitmapData[idx]+dirtColorAvg[0])*0.5);
                    bitmapData[idx+1]=Math.trunc((bitmapData[idx]+dirtColorAvg[1])*0.5);
                    bitmapData[idx+2]=Math.trunc((bitmapData[idx]+dirtColorAvg[2])*0.5);
                }
            }
        }
        
            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);
    }
    
    drawStreakDirt(bitmapCTX,lft,top,rgt,bot,additionalStreakCount,reduceStreak,density,color)
    {
        let n,sx,ex,ey;
        let dirtColorAvg;
        
            // get dirt color as ints
            
        dirtColorAvg=[Math.trunc(color.r*255.0),Math.trunc(color.g*255.0),Math.trunc(color.b*255.0)];
        
            // original streak
            
        this.drawStreakDirtSingle(bitmapCTX,lft,top,rgt,bot,reduceStreak,density,dirtColorAvg);
        
            // additional streaks
            
        for (n=0;n!==additionalStreakCount;n++) {
            sx=genRandom.randomInBetween(lft,rgt);
            ex=genRandom.randomInBetween(sx,rgt);
            if (sx>=ex) continue;
            
            ey=bot-genRandom.randomInt(0,Math.trunc((bot-top)*0.25));
            
            this.drawStreakDirtSingle(bitmapCTX,sx,top,ex,ey,reduceStreak,density,dirtColorAvg);
            
            lft=sx;     // always make sure the newest streaks are smaller and within the first one
            rgt=ex;
        }
    }
    
        //
        // gradients
        //
        
    drawVerticalGradient(bitmapCTX,lft,top,rgt,bot,topColor,botColor)
    {
        let x,y,idx;
        let rDif,gDif,bDif,factor,redByte,greenByte,blueByte;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;

            // get the image data

        if ((wid<1) || (high<1)) return;

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
        rDif=botColor.r-topColor.r;
        gDif=botColor.g-topColor.g;
        bDif=botColor.b-topColor.b;

            // write the stripe

        for (y=0;y!==high;y++) {

            factor=y/high;
            
            redByte=Math.trunc((topColor.r+(rDif*factor))*255.0);
            greenByte=Math.trunc((topColor.g+(gDif*factor))*255.0);
            blueByte=Math.trunc((topColor.b+(bDif*factor))*255.0);
            
            idx=(y*wid)*4;

            for (x=0;x!==wid;x++) {
                bitmapData[idx++]=redByte;
                bitmapData[idx++]=greenByte;
                bitmapData[idx++]=blueByte;
                bitmapData[idx++]=255;
            }
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);
    }

    drawColorStripeHorizontal(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        let x,y,nx,nz,idx;
        let color,redByte,greenByte,blueByte;
        let colors=this.createRandomColorStripeArray(factor,baseColor);
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData;

        if ((wid<1) || (high<1)) return;

            // chrome has a bizarre bug that will mix up
            // two image datas of the same size, so we do these
            // separately
            
        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;

        for (y=0;y!==high;y++) {

            color=colors[y%100];
            redByte=Math.trunc(color.r*255.0);
            greenByte=Math.trunc(color.g*255.0);
            blueByte=Math.trunc(color.b*255.0);

            idx=(y*wid)*4;

            for (x=0;x!==wid;x++) {
                bitmapData[idx]=redByte;
                bitmapData[idx+1]=greenByte;
                bitmapData[idx+2]=blueByte;

                idx+=4;
            }
        }

        bitmapCTX.putImageData(bitmapImgData,lft,top);        

            // the normal data
            
        normalImgData=normalCTX.getImageData(lft,top,wid,high);
        normalData=normalImgData.data;

        nx=Math.trunc((0.10+1.0)*127.0);
        nz=Math.trunc((0.90+1.0)*127.0);

            // write the stripe

        for (y=0;y!==high;y++) {

            idx=(y*wid)*4;

            for (x=0;x!==wid;x++) {
                normalData[idx]=nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;

                idx+=4;
            }

            nx=-nx;
        }

        normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeVertical(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        let x,y,nx,nz,idx;
        let color,redByte,greenByte,blueByte;
        let colors=this.createRandomColorStripeArray(factor,baseColor);
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData;

        if ((wid<1) || (high<1)) return;
        
            // chrome has a bizarre bug that will mix up
            // two image datas of the same size, so we do these
            // separately

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;

            // write the stripe

        for (x=0;x!==wid;x++) {

            color=colors[x%100];
            redByte=Math.trunc(color.r*255.0);
            greenByte=Math.trunc(color.g*255.0);
            blueByte=Math.trunc(color.b*255.0);

            for (y=0;y!==high;y++) {
                idx=((y*wid)+x)*4;
                bitmapData[idx]=redByte;
                bitmapData[idx+1]=greenByte;
                bitmapData[idx+2]=blueByte;
            }
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);
        
            // normal data
            
        normalImgData=normalCTX.getImageData(lft,top,wid,high);
        normalData=normalImgData.data;

        nx=Math.trunc((0.10+1.0)*127.0);
        nz=Math.trunc((0.90+1.0)*127.0);

            // write the stripe

        for (x=0;x!==wid;x++) {
            for (y=0;y!==high;y++) {
                idx=((y*wid)+x)*4;
                normalData[idx]=nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;
            }

            nx=-nx;
        }

        normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeSlant(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        let x,y,nx,nz,idx,cIdx;
        let color;
        let colors=this.createRandomColorStripeArray(factor,baseColor);
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData;

        if ((wid<1) || (high<1)) return;
        
            // chrome has a bizarre bug that will mix up
            // two image datas of the same size, so we do these
            // separately

        bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;

        for (y=0;y!==high;y++) {
            for (x=0;x!==wid;x++) {

                cIdx=(x+y)%100;
                color=colors[cIdx];
                
                idx=((y*wid)+x)*4;

                bitmapData[idx]=Math.trunc(color.r*255.0);
                bitmapData[idx+1]=Math.trunc(color.g*255.0);
                bitmapData[idx+2]=Math.trunc(color.b*255.0);
            }
        }

        bitmapCTX.putImageData(bitmapImgData,lft,top);        
        
            // normal data
            
        normalImgData=normalCTX.getImageData(lft,top,wid,high);
        normalData=normalImgData.data;

        nx=Math.trunc((0.10+1.0)*127.0);
        nz=Math.trunc((0.90+1.0)*127.0);

            // write the stripe

        for (y=0;y!==high;y++) {
            for (x=0;x!==wid;x++) {
                cIdx=(x+y)%100;
                idx=((y*wid)+x)*4;

                normalData[idx]=((cIdx&0x1)===0)?nx:-nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;
            }
        }

        normalCTX.putImageData(normalImgData,lft,top);
    }
    
        //
        // wood utilities
        //
        
    generateWoodDrawBoard(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,woodColor)
    {
        let col;
        
        col=this.darkenColor(woodColor,genRandom.randomFloat(0.8,0.2));
        
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,col,true);
        if ((bot-top)>(rgt-lft)) {
            this.drawColorStripeVertical(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        else {
            this.drawColorStripeHorizontal(bitmapCTX,normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        this.addNoiseRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }
    
        //
        // metal utilities
        //
    
    generateMetalStreakShine(bitmapCTX,lft,top,rgt,bot,wid,high,metalColor)
    {
        let x,streakWid,streakColor;
        let lite=genRandom.randomPercentage(0.5); 
        
        x=lft;
        
        while (true) {
            streakWid=genRandom.randomInt(20,50);
            if ((x+streakWid)>rgt) streakWid=rgt-x;
            
                // small % are no streak
                
            if (genRandom.randomPercentage(0.9)) {
                if (lite) {
                    streakColor=this.lightenColor(metalColor,genRandom.randomFloat(0.05,0.1))
                }
                else {
                    streakColor=this.darkenColor(metalColor,genRandom.randomFloat(0.5,0.5));
                }
                

                this.drawStreakMetal(bitmapCTX,wid,high,x,top,bot,streakWid,streakColor);
            }
            
            x+=(streakWid+genRandom.randomInt(15,30));
            if (x>=rgt) break;
        }
        
        this.blur(bitmapCTX,lft,top,rgt,bot,(lite?2:1),true);
    }
    
    generateMetalScrewsRandom(bitmapCTX,normalCTX,lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
    {
        let         n,x,y,lx,rx,ty,by;
        let         xCount,xOffset,yCount,yOffset;
        
        lx=lft+5;
        rx=(rgt-5)-screwSize;
        ty=top+5;
        by=(bot-5)-screwSize;
        
        xCount=Math.trunc(((rgt-lft)/(screwSize+5)))-2;     // always avoid corners
        xOffset=Math.trunc(((rgt-lft)-(xCount*(screwSize+5)))*0.5);
        
        yCount=Math.trunc(((bot-top)/(screwSize+5)))-2;
        yOffset=Math.trunc(((bot-top)-(yCount*(screwSize+5)))*0.5);
        
            // corners

        if (genRandom.randomPercentage(0.33)) {
            this.draw3DOval(bitmapCTX,normalCTX,lx,ty,(lx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,rx,ty,(rx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,lx,by,(lx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(bitmapCTX,normalCTX,rx,by,(rx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            return;
        }
        
            // left side
            
        if (genRandom.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(bitmapCTX,normalCTX,lx,y,(lx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // right side
            
        if (genRandom.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(bitmapCTX,normalCTX,rx,y,(rx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // top
            
        if (genRandom.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(bitmapCTX,normalCTX,x,ty,(x+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // bottom
            
        if (genRandom.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(bitmapCTX,normalCTX,x,by,(x+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
    }
    
    generateMetalScrewsHorizontal(bitmapCTX,normalCTX,lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
    {
        let         n,x,y;
        let         xCount,xOffset;
        
        y=Math.trunc(((top+bot)*0.5)-(screwSize*0.5));
        
        xCount=Math.trunc(((rgt-lft)/(screwSize+5)));
        xOffset=Math.trunc(((rgt-lft)-(xCount*(screwSize+5)))*0.5);
        
        for (n=0;n!==xCount;n++) {
            x=lft+(xOffset+(n*(screwSize+5)));
            this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
        }
    }
    
    generateMetalScrewsVertical(bitmapCTX,normalCTX,lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
    {
        let         n,x,y;
        let         yCount,yOffset;
        
        x=Math.trunc(((lft+rgt)*0.5)-(screwSize*0.5));
        
        yCount=Math.trunc(((bot-top)/(screwSize+5)));
        yOffset=Math.trunc(((bot-top)-(yCount*(screwSize+5)))*0.5);
        
        for (n=0;n!==yCount;n++) {
            y=lft+(yOffset+(n*(screwSize+5)));
            this.draw3DOval(bitmapCTX,normalCTX,x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
        }
    }
    
        //
        // cracks
        //
        
    drawSmallCrack(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeMargin,backColor)
    {
        let sx,ex,sy,ey;
        let lineColor,lineMargin;
        let tileWid,tileHigh;
        
        if (!genRandom.randomPercentage(0.10)) return;

        sx=lft+edgeMargin;
        ex=rgt-edgeMargin;
        sy=top+edgeMargin;
        ey=bot-edgeMargin;
        
        tileWid=rgt-lft;
        tileHigh=bot-top;

        if (genRandom.randomPercentage(0.50)) {
            lineMargin=Math.trunc(tileWid/5);
            sx=genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
            ex=genRandom.randomInBetween((lft+lineMargin),(rgt-lineMargin));
        }
        else {
            lineMargin=Math.trunc(tileHigh/5);
            sy=genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
            ey=genRandom.randomInBetween((top+lineMargin),(bot-lineMargin));
        }

        lineColor=this.darkenColor(backColor,0.9);
        this.drawRandomLine(bitmapCTX,normalCTX,sx,sy,ex,ey,lft,top,rgt,bot,20,lineColor,false);
    }
    
        //
        // face chunks
        //
        
    generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,x,top,bot,eyeColor)
    {
        this.draw3DOval(bitmapCTX,normalCTX,x,(top+80),(x+30),(top+90),0.0,1.0,1,0,this.whiteColor,this.blackColor);
        this.drawOval(bitmapCTX,(x+10),(top+81),(x+20),(top+89),eyeColor,null);
        this.drawOval(glowCTX,(x+10),(top+81),(x+20),(top+89),this.darkenColor(eyeColor,0.5),null);
    }
    
    generateFaceChunk(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot)
    {
        let eyeColor=this.getRandomColor();
        
        this.generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,480,top,bot,eyeColor);
        this.generateFaceChunkEye(bitmapCTX,normalCTX,glowCTX,430,top,bot,eyeColor);
    }
    
        //
        // testing
        //
    
    drawUVTest(bitmapCTX,lft,top,rgt,bot)
    {
        let xMid=Math.trunc((lft+rgt)/2);
        let yMid=Math.trunc((top+bot)/2);
        
        this.drawRect(bitmapCTX,lft,top,xMid,yMid,new ColorClass(1,1,0));
        this.drawRect(bitmapCTX,xMid,top,rgt,yMid,new ColorClass(1,0,0));
        this.drawRect(bitmapCTX,lft,yMid,xMid,bot,new ColorClass(0,1,0));
        this.drawRect(bitmapCTX,xMid,yMid,rgt,bot,new ColorClass(0,0,1));
    }
    
        //
        // generate mainline
        //
        
    generateInternal()
    {
    }

    generate(inDebug)
    {
        return(this.generateInternal(inDebug));
        
        // move bitmap setup here
        // move returns here
        // get rid of passing around bitmap etc
        
        /*
        this.bitmapCanvas=document.createElement('canvas');
        this.bitmapCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        this.bitmapCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        this.bitmapCTX=bitmapCanvas.getContext('2d');

        this.normalCanvas=document.createElement('canvas');
        this.normalCanvas.width=hasNormal?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.normalCanvas.height=hasNormal?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.normalCTX=normalCanvas.getContext('2d');

        this.specularCanvas=document.createElement('canvas');
        this.specularCanvas.width=hasSpecular?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.specularCanvas.height=hasSpecular?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.specularCTX=specularCanvas.getContext('2d');
        
        this.glowCanvas=document.createElement('canvas');
        this.glowCanvas.width=hasGlow?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.glowCanvas.height=hasGlow?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.glowCTX=glowCanvas.getContext('2d');
*/
    }
    
}
