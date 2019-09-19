import PointClass from '../../utility/point.js';
import RectClass from '../../utility/rect.js';
import ColorClass from '../../utility/color.js';
import BitmapClass from '../../bitmap/bitmap.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate bitmap base class
//

export default class GenerateBitmapBaseClass
{
    constructor(core,hasNormal,hasSpecular,hasGlow)
    {
        this.core=core;
        this.hasNormal=hasNormal;
        this.hasSpecular=hasSpecular;
        this.hasGlow=hasGlow;
        
            // defaults
            
        this.specularFactor=new ColorClass(5,5,5);
        this.glowFrequency=0;
        this.glowMin=0.0;
        this.glowMax=1.0;
        
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
        this.BITMAP_GRID_MIN_BLOCK_WIDTH=10;
        this.BITMAP_GRID_EXTRA_BLOCK_WIDTH=15;
        this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_WIDTH=12;
        this.BITMAP_GRID_MIN_BLOCK_HEIGHT=5;
        this.BITMAP_GRID_EXTRA_BLOCK_HEIGHT=10;
        this.BITMAP_GRID_ELIMINATE_BLOCK_MIN_HEIGHT=7;

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
        
            // the color, normal, specular, and glow
            
        this.colorCanvas=null;
        this.colorCTX=null;
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
    
    
    
    
    
    
    
    
    
    
    
    drawOval(lft,top,rgt,bot,startArc,endArc,xRoundFactor,yRoundFactor,edgeSize,color,mixNormals,noisePercentage,noiseMinDarken,noiseDarkenDif)
    {
        let n,x,y,mx,my,halfWid,halfHigh;
        let rad,fx,fy,darkFactor,idx;
        let normal,nFactor;
        let orgWid,orgHigh,wid,high,edgeCount;
        let bitmapImgData,bitmapData;
        let normalImgData,normalData,origNormalData;
        let col=new ColorClass(0,0,0);
        
            // start and end arc
            
        startArc=Math.trunc(startArc*1000);
        endArc=Math.trunc(endArc*1000);
        if (startArc>=endArc) return;
        
            // the drawing size
            
        orgWid=rgt-lft;
        orgHigh=bot-top;
        wid=orgWid-1;
        high=orgHigh-1;         // avoids clipping on bottom from being on wid,high
        mx=Math.trunc(wid*0.5);
        my=Math.trunc(high*0.5);

        bitmapImgData=this.colorCTX.getImageData(lft,top,orgWid,orgHigh);
        bitmapData=bitmapImgData.data;

        edgeCount=edgeSize;
        
            // fill the oval

        while ((wid>0) && (high>0)) {

            halfWid=wid*0.5;
            halfHigh=high*0.5;
            
            for (n=startArc;n<endArc;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                fx+=(fx*xRoundFactor);
                if (fx>1.0) fx=1.0;
                if (fx<-1.0) fx=-1.0;
                
                x=mx+Math.trunc(halfWid*fx);
                if ((x<0) || (x>=orgWid)) continue;

                fy=Math.cos(rad);
                fy+=(fy*yRoundFactor);
                if (fy>1.0) fy=1.0;
                if (fy<-1.0) fy=-1.0;
                
                y=my-Math.trunc(halfHigh*fy);
                if ((y<0) || (y>=orgHigh)) continue;
                
                    // clipping
                    
                if (this.clipLft!==-1) {
                    if (((x+lft)<this.clipLft) || ((x+lft)>=this.clipRgt)) continue;
                    if (((y+top)<this.clipTop) || ((y+top)>=this.clipBot)) continue;
                }
                
                    // any noise
                
                col.setFromColor(color);
                
                if (GenerateUtilityClass.randomPercentage(noisePercentage)) {
                    darkFactor=GenerateUtilityClass.randomFloat(noiseMinDarken,noiseDarkenDif);
                    col.r*=darkFactor;
                    col.g*=darkFactor;
                    col.b*=darkFactor;
                }

                    // the color pixel

                idx=((y*orgWid)+x)*4;

                bitmapData[idx]=Math.trunc(col.r*255.0);
                bitmapData[idx+1]=Math.trunc(col.g*255.0);
                bitmapData[idx+2]=Math.trunc(col.b*255.0);
                bitmapData[idx+3]=255;
            }

            if (edgeCount>0) edgeCount--;

            wid--;
            high--;
        }

        this.colorCTX.putImageData(bitmapImgData,lft,top);
        
            // chrome seems to be buggy here if we have to
            // image datas at once, so we do it separately
            
        normalImgData=this.normalCTX.getImageData(lft,top,orgWid,orgHigh);
        normalData=normalImgData.data;
        
        if (mixNormals) origNormalData=new Uint8Array(normalData);
        
        wid=orgWid-1;
        high=orgHigh-1;
        
        edgeCount=edgeSize;
        
        normal=new PointClass(0,0,0);
        
            // create the normals

        while ((wid>0) && (high>0)) {

            halfWid=wid*0.5;
            halfHigh=high*0.5;
            
            for (n=startArc;n<endArc;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                fx+=(fx*xRoundFactor);
                if (fx>1.0) fx=1.0;
                if (fx<-1.0) fx=-1.0;

                x=mx+Math.trunc(halfWid*fx);
                if ((x<0) || (x>=orgWid)) continue;
                
                fy=Math.cos(rad);
                fy+=(fy*yRoundFactor);
                if (fy>1.0) fy=1.0;
                if (fy<-1.0) fy=-1.0;

                y=my-Math.trunc(halfHigh*fy);
                if ((y<0) || (y>=orgHigh)) continue;
                
                    // clipping
                    
                if (this.clipLft!==-1) {
                    if (((x+lft)<this.clipLft) || ((x+lft)>=this.clipRgt)) continue;
                    if (((y+top)<this.clipTop) || ((y+top)>=this.clipBot)) continue;
                }

                    // get a normal for the pixel change
                    // if we are outside the edge, gradually fade it
                    // to the default pointing out normal

                idx=((y*orgWid)+x)*4;
                
                normal.x=0;
                normal.y=0;
                normal.z=1.0;
                
                if (edgeCount>0) {
                    nFactor=edgeCount/edgeSize;
                    normal.x=(fx*nFactor)+(normal.x*(1.0-nFactor));
                    normal.y=(fy*nFactor)+(normal.y*(1.0-nFactor));
                    normal.z=(0.5*nFactor)+(normal.z*(1.0-nFactor));
                }

                normal.normalize();
                
                if (mixNormals) {
                    normal.x=(((origNormalData[idx]/127.0)-1.0)+normal.x)*0.5;
                    normal.y=(((origNormalData[idx+1]/127.0)-1.0)+normal.y)*0.5;
                    normal.z=(((origNormalData[idx+2]/127.0)-1.0)+normal.z)*0.5;
                    normal.normalize();
                }
                
                normalData[idx]=(normal.x+1.0)*127.0;           // normals are -1...1 packed into a byte
                normalData[idx+1]=(normal.y+1.0)*127.0;
                normalData[idx+2]=(normal.z+1.0)*127.0;
            }
            
            if (edgeCount>0) edgeCount--;

            wid--;
            high--;
        }
        
        this.normalCTX.putImageData(normalImgData,lft,top);
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
        //
        // segmenting routines
        //

    createStackedSegments()
    {
        let x,y;
        let lft,top;
        let halfBrick;
        let segments=[];

        let xCount=this.BITMAP_STACKED_X_MIN_COUNT+Math.trunc(GenerateUtilityClass.random()*this.BITMAP_STACKED_X_EXTRA_COUNT);
        let wid=Math.trunc(this.colorCanvas.width/xCount);
        let halfWid=Math.trunc(wid/2);

        let yCount=this.BITMAP_STACKED_Y_MIN_COUNT+Math.trunc(GenerateUtilityClass.random()*this.BITMAP_STACKED_Y_EXTRA_COUNT);
        let high=Math.trunc(this.colorCanvas.height/yCount);

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

    createRandomSegments()
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

            startWid=GenerateUtilityClass.randomInt(this.BITMAP_GRID_MIN_BLOCK_WIDTH,this.BITMAP_GRID_EXTRA_BLOCK_WIDTH);
            if ((x+startWid)>=this.BITMAP_GRID_DIVISION) startWid=this.BITMAP_GRID_DIVISION-x;

            startHigh=GenerateUtilityClass.randomInt(this.BITMAP_GRID_MIN_BLOCK_HEIGHT,this.BITMAP_GRID_EXTRA_BLOCK_HEIGHT);
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

            lft=Math.trunc(x*(this.colorCanvas.width/this.BITMAP_GRID_DIVISION));
            top=Math.trunc(y*(this.colorCanvas.height/this.BITMAP_GRID_DIVISION));
            rgt=Math.trunc((x+wid)*(this.colorCanvas.width/this.BITMAP_GRID_DIVISION));
            bot=Math.trunc((y+high)*(this.colorCanvas.height/this.BITMAP_GRID_DIVISION));

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
        
    startClip(lft,top,rgt,bot)
    {
        this.colorCTX.save();
        this.colorCTX.rect(lft,top,(rgt-lft),(bot-top));
        this.colorCTX.clip();
        
        this.clipLft=lft;
        this.clipTop=top;
        this.clipRgt=rgt;
        this.clipBot=bot;
    }
    
    endClip()
    {
        this.colorCTX.restore();
        
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
        let col=this.primaryColorList[GenerateUtilityClass.randomIndex(this.primaryColorList.length)];
        let darken=0.1-(GenerateUtilityClass.random()*0.2);
        
        return(new ColorClass((col[0]-darken),(col[1]-darken),(col[2]-darken)));
    }
    
    getRandomGray(min,max)
    {
        let col=min+(GenerateUtilityClass.random()*(max-min));
        return(new ColorClass(col,col,col));
    }
    
    getRandomWoodColor()
    {
        return(new ColorClass(GenerateUtilityClass.randomFloat(0.6,0.2),GenerateUtilityClass.randomFloat(0.3,0.2),0.0));
    }
    
    getRandomGrassColor()
    {
        return(new ColorClass(GenerateUtilityClass.randomFloat(0.0,0.2),GenerateUtilityClass.randomFloat(0.8,0.2),GenerateUtilityClass.randomFloat(0.0,0.2)));
    }
    
    getRandomDirtColor()
    {
        return(new ColorClass(GenerateUtilityClass.randomFloat(0.6,0.2),GenerateUtilityClass.randomFloat(0.3,0.2),0.0));
    }
    
    getRandomMetalColor()
    {
        let f;
        
        if (GenerateUtilityClass.randomPercentage(0.5)) {      // blue-ish
            f=GenerateUtilityClass.randomFloat(0.2,0.3);
            return(new ColorClass(f,(f+0.4),1.0));
        }
        
        f=GenerateUtilityClass.randomFloat(0.7,0.2);           // silver-ish
        return(new ColorClass(f,f,(f+0.1)))
    }
    
    getRandomFurColor()
    {
        let f;
        
        switch (GenerateUtilityClass.randomIndex(5)) {
            
            case 0:         // blonde
                f=GenerateUtilityClass.randomFloat(0.5,0.2);
                return(new ColorClass(f,f,0.0));
                
            case 1:         // white
                f=GenerateUtilityClass.randomFloat(0.7,0.1);
                return(new ColorClass(f,f,f));
                
            case 2:         // black
                f=GenerateUtilityClass.randomFloat(0.2,0.2);
                return(new ColorClass(f,f,f));
                
            case 3:         // brown
                f=GenerateUtilityClass.randomFloat(0.3,0.2);
                return(new ColorClass((f+0.3),f,0.0));

            case 4:         // red
                f=GenerateUtilityClass.randomFloat(0.5,0.3);
                return(new ColorClass(f,0.2,0.2));

        }
    }
    
    getRandomScaleColor()
    {
        let f;
        
        if (GenerateUtilityClass.randomPercentage(0.5)) {      // green-ish
            f=GenerateUtilityClass.randomFloat(0.2,0.3);
            return(new ColorClass(f,1.0,f));
        }
        
        f=GenerateUtilityClass.randomFloat(0.7,0.2);           // purple-ish
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
                count=1+Math.trunc(GenerateUtilityClass.random()*3);

                f=1.0+((1.0-(GenerateUtilityClass.random()*2.0))*factor);

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

    clearNormalsRect(lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        this.normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        this.normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }
    
    clearGlowRect(lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        this.glowCTX.fillStyle='#000000';
        this.glowCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }

        //
        // noise routines
        //

    addNoiseRect(lft,top,rgt,bot,minDarken,maxDarken,percentage)
    {    
        let n,nPixel,idx;
        let col,fct;
        let wid=rgt-lft;
        let high=bot-top;    
        let darkenDif=maxDarken-minDarken;
        let bitmapImgData,bitmapData;

            // get the image data to add noise to
        
        if ((lft>=rgt) || (top>=bot)) return;

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;

            // get the image data to add noise to

        idx=0;
        nPixel=wid*high;

        for (n=0;n!==nPixel;n++) {

            if (GenerateUtilityClass.randomPercentage(percentage)) {

                    // the bitmap noise

                fct=minDarken+(darkenDif*GenerateUtilityClass.random());

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

        this.colorCTX.putImageData(bitmapImgData,lft,top);
    }
    
    addNormalNoiseRect(lft,top,rgt,bot,percentage)
    {    
        let n,nPixel,idx;
        let wid=rgt-lft;
        let high=bot-top;    
        let normalImgData,normalData;
        let normal;
        let normals=[this.NORMAL_LEFT_10,this.NORMAL_RIGHT_10,this.NORMAL_TOP_10,this.NORMAL_BOTTOM_10];

            // get the image data to add noise to

        if ((lft>=rgt) || (top>=bot)) return;

        normalImgData=this.normalCTX.getImageData(lft,top,wid,high);
        normalData=normalImgData.data;
        
            // get the image data to add noise to

        idx=0;
        nPixel=wid*high;

        for (n=0;n!==nPixel;n++) {

            if (GenerateUtilityClass.randomPercentage(percentage)) {

                    // the random normal

                normal=normals[GenerateUtilityClass.randomIndex(4)];

                normalData[idx]=Math.trunc(normal.x*255.0);
                normalData[idx+1]=Math.trunc(normal.y*255.0);
                normalData[idx+2]=Math.trunc(normal.z*255.0);
            }

                // next pixel

            idx+=4;
        }

        this.normalCTX.putImageData(normalImgData,lft,top);
    }
    
        //
        // blur routines
        //
        
    blur(lft,top,rgt,bot,blurCount,clamp)
    {
        let n,idx;
        let x,y,cx,cy,cxs,cxe,cys,cye,dx,dy;
        let r,g,b;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData,blurData;
        
        if ((wid<=0) || (high<=0)) return;

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
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
        
        this.colorCTX.putImageData(bitmapImgData,lft,top);
    }

        //
        // specular routines
        //

    createSpecularMap(clamp)
    {
        let n,idx,nPixel;
        let f,fMin,fMax,fDif;

        let bitmapImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        let bitmapData=bitmapImgData.data;

        let specularImgData=this.specularCTX.getImageData(0,0,this.specularCanvas.width,this.specularCanvas.height);
        let specularData=specularImgData.data;

        idx=0;
        nPixel=this.colorCanvas.width*this.colorCanvas.height;
        
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

        this.specularCTX.putImageData(specularImgData,0,0);
    }
    
        //
        // glow utility
        //

    createGlowMap(clamp)
    {
        let n,idx,nPixel;

        let bitmapImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        let bitmapData=bitmapImgData.data;

        let glowImgData=this.glowCTX.getImageData(0,0,this.glowCanvas.width,this.glowCanvas.height);
        let glowData=glowImgData.data;

            // transfer over the bitmap and
            // clamp it for the glow
            
        idx=0;
        nPixel=this.colorCanvas.width*this.colorCanvas.height;
        
        for (n=0;n!==nPixel;n++) {
            glowData[idx]=Math.trunc(bitmapData[idx]*clamp);
            glowData[idx+1]=Math.trunc(bitmapData[idx+1]*clamp);
            glowData[idx+2]=Math.trunc(bitmapData[idx+2]*clamp);
            glowData[idx+3]=0xFF;
            
            idx+=4;
        } 

        this.glowCTX.putImageData(glowImgData,0,0);
    }
    
        //
        // channel swaps
        //
        
    swapRedToAlpha(wid,high)
    {
        let n,nPixel,idx;
        
        let bitmapImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        let bitmapData=bitmapImgData.data;
        
        idx=0;
        nPixel=wid*high;
        
        for (n=0;n!==nPixel;n++) {
            bitmapData[idx+3]=bitmapData[idx];
            idx+=4;
        }
        
        this.colorCTX.putImageData(bitmapImgData,0,0);
    }


        //
        // rectangles, ovals, lines
        //

    drawRect(lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        this.colorCTX.fillStyle=this.colorToRGBColor(color);
        this.colorCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }
    
    drawGlowRect(lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        this.glowCTX.fillStyle=this.colorToRGBColor(this.darkenColor(color,0.5));
        this.glowCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }

    draw3DRect(lft,top,rgt,bot,edgeSize,color,faceOut)
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
            this.colorCTX.strokeStyle=this.colorToRGBColor(edgeColor);

                // the color

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lx,ty);
            this.colorCTX.lineTo(lx,by);
            this.colorCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(rx,ty);
            this.colorCTX.lineTo(rx,by);
            this.colorCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lx,ty);
            this.colorCTX.lineTo(rx,ty);
            this.colorCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lx,by);
            this.colorCTX.lineTo(rx,by);
            this.colorCTX.stroke();

                // the normal

            this.normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_LEFT_45:this.NORMAL_RIGHT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lx,ty);
            this.normalCTX.lineTo(lx,by);
            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_RIGHT_45:this.NORMAL_LEFT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(rx,ty);
            this.normalCTX.lineTo(rx,by);
            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_TOP_45:this.NORMAL_BOTTOM_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lx,ty);
            this.normalCTX.lineTo(rx,ty);
            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(faceOut?this.NORMAL_BOTTOM_45:this.NORMAL_TOP_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lx,by);
            this.normalCTX.lineTo(rx,by);
            this.normalCTX.stroke();

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

        this.drawRect((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),fillColor);

        this.clearNormalsRect((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize));
    }

    draw3DComplexRect(lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        let n,k,k2,add;
        let normalColor,darkenFactor,darkColor;

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
        
        add=GenerateUtilityClass.randomInt(5,5);
        x[0]+=add;
        y[0]+=add;
        add*=0.5;
        x[1]+=add;
        y[1]+=add;
        x[(sidePointCount*4)-1]+=add;
        y[(sidePointCount*4)-1]+=add;
        
        add=GenerateUtilityClass.randomInt(5,5);
        x[sidePointCount]-=add;
        y[sidePointCount]+=add;
        add*=0.5;
        x[sidePointCount-1]-=add;
        y[sidePointCount-1]+=add;
        x[sidePointCount+1]-=add;
        y[sidePointCount+1]+=add;

        add=GenerateUtilityClass.randomInt(5,5);
        x[sidePointCount*2]-=add;
        y[sidePointCount*2]-=add;
        add*=0.5;
        x[(sidePointCount*2)-1]-=add;
        y[(sidePointCount*2)-1]-=add;
        x[(sidePointCount*2)+1]-=add;
        y[(sidePointCount*2)+1]-=add;

        add=GenerateUtilityClass.randomInt(5,5);
        x[sidePointCount*3]+=add;
        y[sidePointCount*3]-=add;
        add*=0.5;
        x[(sidePointCount*3)-1]+=add;
        y[(sidePointCount*3)-1]-=add;
        x[(sidePointCount*3)+1]+=add;
        y[(sidePointCount*3)+1]-=add;

            // randomize it

        for (n=0;n!==totalPointCount;n++) {
            add=GenerateUtilityClass.randomIndex(5);
            x[n]+=(x[n]<mx)?add:-add;
            add=GenerateUtilityClass.randomIndex(5);
            y[n]+=(y[n]<my)?add:-add;
        }

            // draw the edges

        this.colorCTX.lineWidth=2;
        this.normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the color outline

            //darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            //darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            //this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);

            this.colorCTX.strokeStyle=this.colorToRGBColor(fillRGBColor);

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(x[0],y[0]);

            for (k=1;k!==totalPointCount;k++) {
                this.colorCTX.lineTo(x[k],y[k]);
            }

            this.colorCTX.lineTo(x[0],y[0]);
            this.colorCTX.stroke();

                // the normals

            normalColor=new PointClass(0,((0.60*(edgeSize-n))/edgeSize),1);
            normalColor.normalize();

            this.normalCTX.strokeStyle=this.normalToRGBColor(normalColor);
            this.normalCTX.beginPath();

            for (k=0;k!==sidePointCount;k++) {
                this.normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                this.normalCTX.lineTo(x[k2],y[k2]);
            }

            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_45);
            this.normalCTX.beginPath();

            for (k=sidePointCount;k!==(sidePointCount*2);k++) {
                this.normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                this.normalCTX.lineTo(x[k2],y[k2]);
            }

            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
            this.normalCTX.beginPath();

            for (k=(sidePointCount*2);k!==(sidePointCount*3);k++) {
                this.normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                this.normalCTX.lineTo(x[k2],y[k2]);
            }

            this.normalCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_45);
            this.normalCTX.beginPath();

            for (k=(sidePointCount*3);k!==(sidePointCount*4);k++) {
                this.normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                if (k2===totalPointCount) k2=0;
                this.normalCTX.lineTo(x[k2],y[k2]);
            }

            this.normalCTX.stroke();

                // reduce polygon

            for (k=0;k!==totalPointCount;k++) {
                x[k]+=(x[k]<mx)?1:-1;
                y[k]+=(y[k]<my)?1:-1;
            }
        }

        this.colorCTX.lineWidth=1;
        this.normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fill

        this.colorCTX.fillStyle=this.colorToRGBColor(fillRGBColor);

        this.colorCTX.beginPath();
        this.colorCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            this.colorCTX.lineTo(x[k],y[k]);
        }

        this.colorCTX.fill();

        this.normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

        this.normalCTX.beginPath();
        this.normalCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            this.normalCTX.lineTo(x[k],y[k]);
        }

        this.normalCTX.fill();
    }
    
    draw3DHexagon(wid,high,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
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
            
        this.colorCTX.lineWidth=2;
        this.normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the colors

            darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
                // top-left to top to top-right
            
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lx,my);
            this.colorCTX.lineTo(lft,top);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_LEFT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lx,my);
            this.normalCTX.lineTo(lft,top);
            this.normalCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lft,top);
            this.colorCTX.lineTo(rgt,top);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lft,top);
            this.normalCTX.lineTo(rgt,top);
            this.normalCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(rgt,top);
            this.colorCTX.lineTo(rx,my);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_RIGHT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(rgt,top);
            this.normalCTX.lineTo(rx,my);
            this.normalCTX.stroke();
            
                // bottom-right to bottom to bottom-left
            
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(rx,my);
            this.colorCTX.lineTo(rgt,bot);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_RIGHT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(rx,my);
            this.normalCTX.lineTo(rgt,bot);
            this.normalCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(rgt,bot);
            this.colorCTX.lineTo(lft,bot);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(rgt,bot);
            this.normalCTX.lineTo(lft,bot);
            this.normalCTX.stroke();

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lft,bot);
            this.colorCTX.lineTo(lx,my);
            this.colorCTX.stroke();

            this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_LEFT_45);
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lft,bot);
            this.normalCTX.lineTo(lx,my);
            this.normalCTX.stroke();
            
                // reduce it
                
            lx++;
            lft++;
            rx--;
            rgt--;
            top++;
            bot--;
        }
        
        this.colorCTX.lineWidth=1;
        this.normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fills
            // which we have to break up because canvases
            // get confused with offscreen coordinates

        this.colorCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        this.normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

            // the box
            
        this.colorCTX.fillRect(lft,top,(rgt-lft),(bot-top));
        this.normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
        
            // left triangle

        if (lft>=0) {
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lx,my);
            this.colorCTX.lineTo(lft,top);
            this.colorCTX.lineTo(lft,bot);
            this.colorCTX.fill();
           
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lx,my);
            this.normalCTX.lineTo(lft,top);
            this.normalCTX.lineTo(lft,bot);
            this.normalCTX.fill();
        }

        if (rgt<wid) {
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(rx,my);
            this.colorCTX.lineTo(rgt,top);
            this.colorCTX.lineTo(rgt,bot);
            this.colorCTX.fill();
           
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(rx,my);
            this.normalCTX.lineTo(rgt,top);
            this.normalCTX.lineTo(rgt,bot);
            this.normalCTX.fill();
        }
    }
    
    drawDiamond(lft,top,rgt,bot,fillRGBColor,borderRGBColor)
    {
        let mx,my;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);

        this.colorCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) this.colorCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);

        this.colorCTX.beginPath();
        this.colorCTX.moveTo(mx,top);
        this.colorCTX.lineTo(rgt,my);
        this.colorCTX.lineTo(mx,bot);
        this.colorCTX.lineTo(lft,my);
        this.colorCTX.lineTo(mx,top);
        this.colorCTX.fill();
        if (borderRGBColor!==null) this.colorCTX.stroke();
    }
    
    drawOval2(lft,top,rgt,bot,fillRGBColor,borderRGBColor)
    {
        let mx,my,xRadius,yRadius;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);
        
        xRadius=Math.trunc((rgt-lft)*0.5);
        yRadius=Math.trunc((bot-top)*0.5);

        this.colorCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) this.colorCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);
        
        this.colorCTX.beginPath();
        this.colorCTX.ellipse(mx,my,xRadius,yRadius,0.0,0.0,(Math.PI*2));
        this.colorCTX.fill();
        if (borderRGBColor!==null) this.colorCTX.stroke();
    }
    
    drawGlowOval(lft,top,rgt,bot,fillRGBColor,borderRGBColor)
    {
        let mx,my,xRadius,yRadius;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);
        
        xRadius=Math.trunc((rgt-lft)*0.5);
        yRadius=Math.trunc((bot-top)*0.5);

        this.glowCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) this.glowCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);
        
        this.glowCTX.beginPath();
        this.glowCTX.ellipse(mx,my,xRadius,yRadius,0.0,0.0,(Math.PI*2));
        this.glowCTX.fill();
        if (borderRGBColor!==null) this.glowCTX.stroke();
    }
    
    drawWrappedOval(lft,top,rgt,bot,wid,high,fillRGBColor,borderRGBColor)
    {
        let         x,y;
        
        this.drawOval(this.colorCTX,lft,top,rgt,bot,fillRGBColor,borderRGBColor);
        if (lft<0) {
            x=wid+lft;
            this.drawOval(this.colorCTX,x,top,(x+(rgt-lft)),bot,fillRGBColor,borderRGBColor);
        }
        if (rgt>wid) {
            x=-(rgt-wid);
            this.drawOval(this.colorCTX,x,top,(x+(rgt-lft)),bot,fillRGBColor,borderRGBColor);
        }
        if (top<0) {
            y=high+top;
            this.drawOval(this.colorCTX,lft,y,rgt,(y+(bot-top)),fillRGBColor,borderRGBColor);
        }
        if (bot>high) {
            y=-(bot-high);
            this.drawOval(this.colorCTX,lft,y,rgt,(y+(bot-top)),fillRGBColor,borderRGBColor);
        }
    }
    
    draw3DOval(lft,top,rgt,bot,startArc,endArc,edgeSize,flatInnerSize,fillRGBColor,edgeRGBColor)
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

        bitmapImgData=this.colorCTX.getImageData(lft,top,orgWid,orgHigh);
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

        this.colorCTX.putImageData(bitmapImgData,lft,top);
        
            // chrome has a really onbxious bug where it'll get
            // image data messed up and doing both of these at once
            // tends to get the normal written to the bitmap, so,
            // sigh, we do both these separately
            
        normalImgData=this.normalCTX.getImageData(lft,top,orgWid,orgHigh);
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
        
        this.normalCTX.putImageData(normalImgData,lft,top);
    }

    draw3DComplexOval(lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
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
            add=GenerateUtilityClass.randomIndex(5);
            x[n]+=(x[n]<mx)?add:-add;
            add=GenerateUtilityClass.randomIndex(5);
            y[n]+=(y[n]<my)?add:-add;
        }

            // draw the edges

        this.colorCTX.lineWidth=2;
        this.normalCTX.lineWidth=2;

        for (n=0;n!==edgeSize;n++) {

                // the color outline

            darkenFactor=(((n+1)/edgeSize)*0.2)+0.8;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);

            this.colorCTX.beginPath();
            this.colorCTX.moveTo(x[0],y[0]);

            for (k=1;k!==totalPointCount;k++) {
                this.colorCTX.lineTo(x[k],y[k]);
            }

            this.colorCTX.lineTo(x[0],y[0]);
            this.colorCTX.stroke();

                // the normals
                
            for (k=0;k!==totalPointCount;k++) {
                rad=(Math.PI*2.0)*(k/totalPointCount);
                normal=new PointClass(Math.sin(rad),Math.cos(rad),0.5);
                normal.normalize();
                this.normalCTX.strokeStyle=this.normalToRGBColor(normal);
                
                k2=k+1;
                if (k2===totalPointCount) k2=0;

                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x[k],y[k]);
                this.normalCTX.lineTo(x[k2],y[k2]);
                this.normalCTX.stroke();
            }
            
                // reduce polygon

            for (k=0;k!==totalPointCount;k++) {
                x[k]+=(x[k]<mx)?1:-1;
                y[k]+=(y[k]<my)?1:-1;
            }
        }

        this.colorCTX.lineWidth=1;
        this.normalCTX.lineWidth=1;
        
        if (fillRGBColor===null) return;

            // and the fill

        this.colorCTX.fillStyle=this.colorToRGBColor(fillRGBColor);

        this.colorCTX.beginPath();
        this.colorCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            this.colorCTX.lineTo(x[k],y[k]);
        }

        this.colorCTX.fill();
        
        this.normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

        this.normalCTX.beginPath();
        this.normalCTX.moveTo(x[0],y[0]);

        for (k=1;k!==totalPointCount;k++) {
            this.normalCTX.lineTo(x[k],y[k]);
        }

        this.normalCTX.fill();
    }
    
    drawLine2(ctx,x,y,x2,y2,color)
    {
        let xLen,yLen,sp,ep,dx,dy,slope,idx;
        let bitmapImgData,bitmapData,bitmapWid;
        let r=Math.trunc(color.r*255.0);
        let g=Math.trunc(color.g*255.0);
        let b=Math.trunc(color.b*255.0);
        
            // get the image data

        bitmapImgData=ctx.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        bitmapData=bitmapImgData.data;
        
        bitmapWid=this.colorCanvas.width;
        
            // the line
            
        xLen=Math.abs(x2-x);
        yLen=Math.abs(y2-y);
            
        if (xLen>yLen) {
            slope=yLen/xLen;
            
            if (x<x2) {
                sp=x;
                ep=x2;
            }
            else {
                sp=x2;
                ep=x;
            }
            
            dy=y;
            
            for (dx=sp;dx!==ep;dx++) {
                idx=((Math.trunc(dy)*bitmapWid)+dx)*4;
                bitmapData[idx]=r;
                bitmapData[idx+1]=g;
                bitmapData[idx+2]=b;
                
                dy+=slope;
            }
        }
        else {
            slope=xLen/yLen;
            
            if (y<y2) {
                sp=y;
                ep=y2;
            }
            else {
                sp=y2;
                ep=y;
            }
            
            dx=x;
            
            for (dy=sp;dy!==ep;dy++) {
                idx=((dy*bitmapWid)+Math.trunc(dx))*4;
                bitmapData[idx]=r;
                bitmapData[idx+1]=g;
                bitmapData[idx+2]=b;
                
                dx+=slope;
            }
        }
        
            // write all the data back

        ctx.putImageData(bitmapImgData,0,0);
    }

   
    drawLine(x,y,x2,y2,color,lightLine)
    {
        let horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
            // line itself
            
        this.colorCTX.strokeStyle=this.colorToRGBColor(color);

        this.colorCTX.beginPath();
        this.colorCTX.moveTo(x,y);
        this.colorCTX.lineTo(x2,y2);
        this.colorCTX.stroke();
        
            // smoothing
  
        this.colorCTX.strokeStyle=this.colorToRGBAColor(color,0.5);

        if (horizontal) {
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(x,(y-1));
            this.colorCTX.lineTo(x2,(y2-1));
            this.colorCTX.stroke();
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(x,(y+1));
            this.colorCTX.lineTo(x2,(y2+1));
            this.colorCTX.stroke();
        }
        else {
            this.colorCTX.beginPath();
            this.colorCTX.moveTo((x-1),y);
            this.colorCTX.lineTo((x2-1),y2);
            this.colorCTX.stroke();
            this.colorCTX.beginPath();
            this.colorCTX.moveTo((x+1),y);
            this.colorCTX.lineTo((x2+1),y2);
            this.colorCTX.stroke();
        }

            // the normal change
            // flip as lines are inside

        if (this.normalCTX!==null) {
            if (horizontal) {
                this.normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,(y-1));
                this.normalCTX.lineTo(x2,(y2-1));
                this.normalCTX.stroke();
                this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                this.normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,(y+1));
                this.normalCTX.lineTo(x2,(y2+1));
                this.normalCTX.stroke();
            }
            else {
                this.normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo((x-1),y);
                this.normalCTX.lineTo((x2-1),y2);
                this.normalCTX.stroke();
                this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                this.normalCTX.strokeStyle=this.normalToRGBColor(lightLine?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo((x+1),y);
                this.normalCTX.lineTo((x2+1),y2);
                this.normalCTX.stroke();
            }
        }
    }
    
    drawRandomLine(x,y,x2,y2,clipLft,clipTop,clipRgt,clipBot,lineVariant,color,lightLine)
    {
        let n,sx,sy,ex,ey,r;
        let segCount=GenerateUtilityClass.randomInt(2,5);
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

                r=lineVariant-GenerateUtilityClass.randomIndex(lineVariant*2);

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
            
            this.drawLine(sx,sy,ex,ey,color,lightLine);
            //this.drawLine2(this.colorCTX,sx,sy,ex,ey,color);
            
            sx=ex;
            sy=ey;
        }
    }
    
    drawBumpLine(x,y,x2,y2,wid,color)
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
            
        this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
        for (n=0;n!==chunkOne;n++) {
            if (horizontal) {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();
                
                this.normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();

                this.normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
        
            // the level chunk
            
        this.colorCTX.strokeStyle=this.colorToRGBColor(color);
        this.normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        
        for (n=chunkOne;n!==chunkTwo;n++) {
            if (horizontal) {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();
                
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();

                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
            
            // the fade down
            
        this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
        for (n=chunkTwo;n!==wid;n++) {
            if (horizontal) {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();
                
                this.normalCTX.strokeStyle=this.normalToRGBColor((n===(wid-1))?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                y++;
                y2++;
            }
            else {
                this.colorCTX.beginPath();
                this.colorCTX.moveTo(x,y);
                this.colorCTX.lineTo(x2,y2);
                this.colorCTX.stroke();

                this.normalCTX.strokeStyle=this.normalToRGBColor((n===(wid-1))?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
                this.normalCTX.beginPath();
                this.normalCTX.moveTo(x,y);
                this.normalCTX.lineTo(x2,y2);
                this.normalCTX.stroke();
                
                x++;
                x2++;
            }
        }
    }
    
        //
        // slopes
        //
        
    drawSlope(lft,top,rgt,bot,color,up)
    {
        let y;
        let darkenFactor,darkColor;
        let high=bot-top;
        
        this.normalCTX.strokeStyle=this.normalToRGBColor(up?this.NORMAL_TOP_45:this.NORMAL_BOTTOM_45);
        
        for (y=top;y!==bot;y++) {
            
            darkenFactor=(((y-top)+1)/high)*0.2;
            if (up) darkenFactor=0.2-darkenFactor;
            darkenFactor+=0.8;
            darkColor=this.darkenColor(color,darkenFactor);
            this.colorCTX.strokeStyle=this.colorToRGBColor(darkColor);
            
            this.colorCTX.beginPath();
            this.colorCTX.moveTo(lft,y);
            this.colorCTX.lineTo(rgt,y);
            this.colorCTX.stroke();
            
            this.normalCTX.beginPath();
            this.normalCTX.moveTo(lft,y);
            this.normalCTX.lineTo(rgt,y);
            this.normalCTX.stroke();
        }
    }
    
        //
        // particles
        //

    drawParticle(imgWid,imgHigh,lft,top,rgt,bot,ringCount,darkenFactor,pixelDensity,flipNormals)
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
                angList[listIdx]=(Math.PI*2.0)*GenerateUtilityClass.random();
                sizeList[listIdx]=GenerateUtilityClass.random();
                listIdx++;
            }
        }
        
            // get the center
            // remember this is a clip so
            // it always starts at 0,0

        mx=lft+Math.trunc(wid/2);
        my=top+Math.trunc(high/2);

            // do the bitmap data first
            
        bitmapImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
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

        this.colorCTX.putImageData(bitmapImgData,0,0);
        
            // now the normal data
            
        normalImgData=this.normalCTX.getImageData(0,0,this.normalCanvas.width,this.normalCanvas.height);
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

        this.normalCTX.putImageData(normalImgData,0,0);
    }
    
        //
        // streaks
        //

    drawStreakMetal(x,top,bot,streakWid,baseColor)
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

        bitmapImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
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
                
                if (GenerateUtilityClass.randomInt(0,100)<density) {
                    if ((lx>=0) && (lx<this.colorCanvas.width)) {
                        idx=((y*this.colorCanvas.width)+lx)*4;
                        bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                        bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                        bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
                
                if (GenerateUtilityClass.randomInt(0,100)<density) {
                    if ((rx>=0) && (rx<this.colorCanvas.width)) {
                        idx=((y*this.colorCanvas.width)+rx)*4;
                        bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                        bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                        bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
            
            }
            
            density-=densityReduce;
        }
        
            // write all the data back

        this.colorCTX.putImageData(bitmapImgData,0,0);
    }
    
    drawStreakDirtSingle(lft,top,rgt,bot,reduceStreak,density,dirtColorAvg)
    {
        let lx,rx,xAdd,x,y,idx;
        let factor,lineDensity,dirtWidReduce;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;
        
        if ((wid<=0) || (high<=0)) return;
        
            // get the image data

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
        bitmapData=bitmapImgData.data;
        
            // random dirt reductions
        
        dirtWidReduce=0;
        if (reduceStreak) dirtWidReduce=(GenerateUtilityClass.random()*0.1)*wid;
        
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
                
                if (GenerateUtilityClass.randomPercentage(lineDensity)) {
                    idx=((y*wid)+x)*4;
                    bitmapData[idx]=Math.trunc((bitmapData[idx]+dirtColorAvg[0])*0.5);
                    bitmapData[idx+1]=Math.trunc((bitmapData[idx]+dirtColorAvg[1])*0.5);
                    bitmapData[idx+2]=Math.trunc((bitmapData[idx]+dirtColorAvg[2])*0.5);
                }
            }
        }
        
            // write all the data back

        this.colorCTX.putImageData(bitmapImgData,lft,top);
    }
    
    drawStreakDirt(lft,top,rgt,bot,additionalStreakCount,reduceStreak,density,color)
    {
        let n,sx,ex,ey;
        let dirtColorAvg;
        
            // get dirt color as ints
            
        dirtColorAvg=[Math.trunc(color.r*255.0),Math.trunc(color.g*255.0),Math.trunc(color.b*255.0)];
        
            // original streak
            
        this.drawStreakDirtSingle(lft,top,rgt,bot,reduceStreak,density,dirtColorAvg);
        
            // additional streaks
            
        for (n=0;n!==additionalStreakCount;n++) {
            sx=GenerateUtilityClass.randomInBetween(lft,rgt);
            ex=GenerateUtilityClass.randomInBetween(sx,rgt);
            if (sx>=ex) continue;
            
            ey=bot-GenerateUtilityClass.randomInt(0,Math.trunc((bot-top)*0.25));
            
            this.drawStreakDirtSingle(sx,top,ex,ey,reduceStreak,density,dirtColorAvg);
            
            lft=sx;     // always make sure the newest streaks are smaller and within the first one
            rgt=ex;
        }
    }
    
        //
        // gradients
        //
        
    drawVerticalGradient(lft,top,rgt,bot,topColor,botColor)
    {
        let x,y,idx;
        let rDif,gDif,bDif,factor,redByte,greenByte,blueByte;
        let wid=rgt-lft;
        let high=bot-top;
        let bitmapImgData,bitmapData;

            // get the image data

        if ((wid<1) || (high<1)) return;

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
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

        this.colorCTX.putImageData(bitmapImgData,lft,top);
    }

    drawColorStripeHorizontal(lft,top,rgt,bot,factor,baseColor)
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
            
        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
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

        this.colorCTX.putImageData(bitmapImgData,lft,top);        

            // the normal data
            
        normalImgData=this.normalCTX.getImageData(lft,top,wid,high);
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

        this.normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeVertical(lft,top,rgt,bot,factor,baseColor)
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

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
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

        this.colorCTX.putImageData(bitmapImgData,lft,top);
        
            // normal data
            
        normalImgData=this.normalCTX.getImageData(lft,top,wid,high);
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

        this.normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeSlant(lft,top,rgt,bot,factor,baseColor)
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

        bitmapImgData=this.colorCTX.getImageData(lft,top,wid,high);
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

        this.colorCTX.putImageData(bitmapImgData,lft,top);        
        
            // normal data
            
        normalImgData=this.normalCTX.getImageData(lft,top,wid,high);
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

        this.normalCTX.putImageData(normalImgData,lft,top);
    }
    
        //
        // wood utilities
        //
        
    generateWoodDrawBoard(lft,top,rgt,bot,edgeSize,woodColor)
    {
        let col;
        
        col=this.darkenColor(woodColor,GenerateUtilityClass.randomFloat(0.8,0.2));
        
        this.draw3DRect(lft,top,rgt,bot,edgeSize,col,true);
        if ((bot-top)>(rgt-lft)) {
            this.drawColorStripeVertical((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        else {
            this.drawColorStripeHorizontal((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.1,col);
        }
        this.addNoiseRect((lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),0.9,0.95,0.8);
    }
    
        //
        // metal utilities
        //
    
    generateMetalStreakShine(lft,top,rgt,bot,metalColor)
    {
        let x,streakWid,streakColor;
        let lite=GenerateUtilityClass.randomPercentage(0.5); 
        
        x=lft;
        
        while (true) {
            streakWid=GenerateUtilityClass.randomInt(20,50);
            if ((x+streakWid)>rgt) streakWid=rgt-x;
            
                // small % are no streak
                
            if (GenerateUtilityClass.randomPercentage(0.9)) {
                if (lite) {
                    streakColor=this.lightenColor(metalColor,GenerateUtilityClass.randomFloat(0.05,0.1))
                }
                else {
                    streakColor=this.darkenColor(metalColor,GenerateUtilityClass.randomFloat(0.5,0.5));
                }
                

                this.drawStreakMetal(x,top,bot,streakWid,streakColor);
            }
            
            x+=(streakWid+GenerateUtilityClass.randomInt(15,30));
            if (x>=rgt) break;
        }
        
        this.blur(lft,top,rgt,bot,(lite?2:1),true);
    }
    
    generateMetalScrewsRandom(lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
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

        if (GenerateUtilityClass.randomPercentage(0.33)) {
            this.draw3DOval(lx,ty,(lx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(rx,ty,(rx+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(lx,by,(lx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            this.draw3DOval(rx,by,(rx+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            return;
        }
        
            // left side
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(lx,y,(lx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // right side
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==yCount;n++) {
                y=top+(yOffset+(n*(screwSize+5)));
                this.draw3DOval(rx,y,(rx+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // top
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(x,ty,(x+screwSize),(ty+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
        
            // bottom
            
        if (GenerateUtilityClass.randomPercentage(0.33)) {
            for (n=0;n!==xCount;n++) {
                x=lft+(xOffset+(n*(screwSize+5)));
                this.draw3DOval(x,by,(x+screwSize),(by+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
        }
    }
    
    generateMetalScrewsHorizontal(lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
    {
        let         n,x,y,boltStyle;
        let         xCount,xOffset;
        
        y=Math.trunc(((top+bot)*0.5)-(screwSize*0.5));
        
        xCount=Math.trunc(((rgt-lft)/(screwSize+5)));
        xOffset=Math.trunc(((rgt-lft)-(xCount*(screwSize+5)))*0.5);
        
        boltStyle=GenerateUtilityClass.randomIndex(4);
        
        for (n=0;n!==xCount;n++) {
            x=lft+(xOffset+(n*(screwSize+5)));
            
            if ((boltStyle==0)||((boltStyle==2)&&((n%4)===0))||((boltStyle==3)&&((n%4)!==0))) {
                this.draw3DOval(x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
            else {
                this.draw3DRect(x,y,(x+screwSize),(y+screwSize),screwInnerSize,screwColor,true);
            }
        }
    }
    
    generateMetalScrewsVertical(lft,top,rgt,bot,screwColor,screwSize,screwInnerSize)
    {
        let         n,x,y,boltStyle;
        let         yCount,yOffset;
        
        x=Math.trunc(((lft+rgt)*0.5)-(screwSize*0.5));
        
        yCount=Math.trunc(((bot-top)/(screwSize+5)));
        yOffset=Math.trunc(((bot-top)-(yCount*(screwSize+5)))*0.5);
        
        boltStyle=GenerateUtilityClass.randomIndex(4);
        
        for (n=0;n!==yCount;n++) {
            y=lft+(yOffset+(n*(screwSize+5)));
            
            if ((boltStyle==0)||((boltStyle==2)&&((n%4)===0))||((boltStyle==3)&&((n%4)!==0))) {
                this.draw3DOval(x,y,(x+screwSize),(y+screwSize),0.0,1.0,2,screwInnerSize,screwColor,this.blackColor);
            }
            else {
                this.draw3DRect(x,y,(x+screwSize),(y+screwSize),screwInnerSize,screwColor,true);
            }
        }
    }
    
        //
        // cracks
        //
        
    drawSmallCrack(lft,top,rgt,bot,edgeMargin,backColor)
    {
        let sx,ex,sy,ey;
        let lineColor,lineMargin;
        let tileWid,tileHigh;
        
        if (!GenerateUtilityClass.randomPercentage(0.10)) return;

        sx=lft+edgeMargin;
        ex=rgt-edgeMargin;
        sy=top+edgeMargin;
        ey=bot-edgeMargin;
        
        tileWid=rgt-lft;
        tileHigh=bot-top;

        if (GenerateUtilityClass.randomPercentage(0.50)) {
            lineMargin=Math.trunc(tileWid/5);
            sx=GenerateUtilityClass.randomInBetween((lft+lineMargin),(rgt-lineMargin));
            ex=GenerateUtilityClass.randomInBetween((lft+lineMargin),(rgt-lineMargin));
        }
        else {
            lineMargin=Math.trunc(tileHigh/5);
            sy=GenerateUtilityClass.randomInBetween((top+lineMargin),(bot-lineMargin));
            ey=GenerateUtilityClass.randomInBetween((top+lineMargin),(bot-lineMargin));
        }

        lineColor=this.darkenColor(backColor,0.9);
        this.drawRandomLine(sx,sy,ex,ey,lft,top,rgt,bot,20,lineColor,false);
    }
    
        //
        // face chunks
        //
        
    generateFaceChunkEye(x,top,bot,eyeColor)
    {
        this.draw3DOval(this.normalCTX,x,(top+80),(x+30),(top+90),0.0,1.0,1,0,this.whiteColor,this.blackColor);
        this.drawOval((x+10),(top+81),(x+20),(top+89),eyeColor,null);
        this.drawGlowOval((x+10),(top+81),(x+20),(top+89),this.darkenColor(eyeColor,0.5),null);
    }
    
    generateFaceChunk(lft,top,rgt,bot)
    {
        let eyeColor=this.getRandomColor();
        
        this.generateFaceChunkEye(480,top,bot,eyeColor);
        this.generateFaceChunkEye(430,top,bot,eyeColor);
    }
    
        //
        // clear canvases
        //
        
    clearCanvases(canvas,ctx,r,g,b,a)
    {
        let n,len;
        let imgData,data;
        
        len=(canvas.width*4)*canvas.height;
        
        imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
        data=imgData.data;
        
        for (n=0;n!==len;n+=4) {
            data[n]=r;
            data[n+1]=g;
            data[n+2]=b;
            data[n+3]=a;
        }
        
        ctx.putImageData(imgData,0,0);
    }
    
        //
        // for testing
        //
        
    test()
    {
        GenerateUtilityClass.setRandomSeed(Date.now());
        
            // setup all the bitmap parts
            
        this.colorCanvas=document.getElementById('color');
        this.colorCTX=this.colorCanvas.getContext('2d');
        
        this.normalCanvas=document.getElementById('normal');
        this.normalCTX=this.normalCanvas.getContext('2d');

        this.specularCanvas=document.getElementById('specular');
        this.specularCTX=this.specularCanvas.getContext('2d');
        
        this.glowCanvas=document.getElementById('glow');
        this.glowCTX=this.glowCanvas.getContext('2d');
        
        this.clearCanvases(this.colorCanvas,this.colorCTX,255,255,255,255);
        this.clearCanvases(this.normalCanvas,this.normalCTX,0,0,255,255);
        this.clearCanvases(this.specularCanvas,this.specularCTX,0,0,0,255);
        this.clearCanvases(this.glowCanvas,this.glowCTX,0,0,0,255);

            // run the internal generator

        this.generateInternal();
    }
    
        //
        // generate mainline
        //
        
    generateInternal()
    {
        let xMid=Math.trunc(this.colorCanvas.width*0.5);       // default internal is just the UV test
        let yMid=Math.trunc(this.colorCanvas.height*0.5);
        
        this.drawRect(0,0,xMid,yMid,new ColorClass(1,1,0));
        this.drawRect(xMid,0,this.colorCanvas.width,yMid,new ColorClass(1,0,0));
        this.drawRect(0,yMid,xMid,this.colorCanvas.height,new ColorClass(0,1,0));
        this.drawRect(xMid,yMid,this.colorCanvas.width,this.colorCanvas.height,new ColorClass(0,0,1));
    }
    
    generate()
    {
            // setup all the bitmap parts
            
        this.colorCanvas=document.createElement('canvas');
        this.colorCanvas.width=this.BITMAP_MAP_TEXTURE_SIZE;
        this.colorCanvas.height=this.BITMAP_MAP_TEXTURE_SIZE;
        this.colorCTX=this.colorCanvas.getContext('2d');
        
        this.normalCanvas=document.createElement('canvas');
        this.normalCanvas.width=this.hasNormal?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.normalCanvas.height=this.hasNormal?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.normalCTX=this.normalCanvas.getContext('2d');

        this.specularCanvas=document.createElement('canvas');
        this.specularCanvas.width=this.hasSpecular?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.specularCanvas.height=this.hasSpecular?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.specularCTX=this.specularCanvas.getContext('2d');
        
        this.glowCanvas=document.createElement('canvas');
        this.glowCanvas.width=this.hasGlow?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.glowCanvas.height=this.hasGlow?this.BITMAP_MAP_TEXTURE_SIZE:2;
        this.glowCTX=this.glowCanvas.getContext('2d');
        
        this.clearCanvases(this.colorCanvas,this.colorCTX,255,255,255,255);
        this.clearCanvases(this.normalCanvas,this.normalCTX,0,0,255,255);
        this.clearCanvases(this.specularCanvas,this.specularCTX,0,0,0,255);
        this.clearCanvases(this.glowCanvas,this.glowCTX,0,0,0,255);

            // run the internal generator

        this.generateInternal();
        
            // add the bitmap object
            
        return(this.core.bitmapList.addGenerated(this.colorCanvas,this.normalCanvas,this.specularCanvas,this.specularFactor,this.glowCanvas,this.glowFrequency,this.glowMin,this.glowMax));
    }
    
}
