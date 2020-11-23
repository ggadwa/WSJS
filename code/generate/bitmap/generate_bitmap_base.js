import PointClass from '../../utility/point.js';
import RectClass from '../../utility/rect.js';
import ColorClass from '../../utility/color.js';
import BitmapGeneratedClass from '../../bitmap/bitmap_generated.js';
import CoreClass from '../../main/core.js';

//
// generate bitmap base class
//

export default class GenerateBitmapBaseClass
{
    constructor(core,colorScheme)
    {
        this.COLOR_SCHEME_RANDOM=0;
        this.COLOR_SCHEME_DOOM=1;
        this.COLOR_SCHEME_GRAY=2;
        this.COLOR_SCHEME_PASTEL=3;
    
        this.COLOR_SCHEME_COUNT=4;
    
        this.core=core;
        this.colorScheme=colorScheme;
        
            // will be reset in children classes
           
        this.bitmapTextureSize=512;
        this.hasNormal=true;
        this.hasSpecular=true;
        this.hasGlow=false;
        
            // defaults
            
        this.specularFactor=new ColorClass(5,5,5);
        this.emissiveFactor=new ColorClass(1,1,1);

            // some precalced normals

        this.NORMAL_CLEAR=new PointClass(0.0,0.0,1.0);

        this.NORMAL_LEFT_45=new PointClass(-0.65,0.02,0.75);
        this.NORMAL_RIGHT_45=new PointClass(0.65,-0.02,0.75);
        this.NORMAL_TOP_45=new PointClass(-0.02,0.65,0.75);
        this.NORMAL_BOTTOM_45=new PointClass(0.02,-0.65,0.75);

        this.NORMAL_LEFT_10=new PointClass(-0.1,0.0,0.90);
        this.NORMAL_RIGHT_10=new PointClass(0.1,0.0,0.90);
        this.NORMAL_TOP_10=new PointClass(0.0,0.1,0.90);
        this.NORMAL_BOTTOM_10=new PointClass(0.0,-0.1,0.90);
        
        this.NORMAL_TOP_LEFT_45=new PointClass(-0.48,0.48,0.72);
        this.NORMAL_TOP_RIGHT_45=new PointClass(0.48,0.48,0.72);
        this.NORMAL_BOTTOM_LEFT_45=new PointClass(-0.48,-0.48,0.72);
        this.NORMAL_BOTTOM_RIGHT_45=new PointClass(0.48,-0.48,0.72);
        
            // the color, normal, specular, and glow
            
        this.colorCanvas=null;
        this.colorCTX=null;
        this.colorImgData=null;
        
        this.normalCanvas=null;
        this.normalCTX=null;
        this.normalImgData=null;
        
        this.specularCanvas=null;
        this.specularCTX=null;
        this.specularImgData=null;
        
        this.glowCanvas=null;
        this.glowCTX=null;
        this.glowImgData=null;
        
            // noise
            
        this.perlinNoiseColorFactor=null;
        this.noiseNormals=null;
        
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
        // colors
        //
        
    getRandomColor()
    {
        let col,darken;
        let color,midPoint;
        
        switch (this.colorScheme) {
            
                // random primary colors
                
            case this.COLOR_SCHEME_RANDOM:
                col=this.primaryColorList[this.core.randomIndex(this.primaryColorList.length)];
                darken=0.1-(this.core.random()*0.2);
                return(new ColorClass((col[0]-darken),(col[1]-darken),(col[2]-darken)));
                
                // doom browns and green
                
            case this.COLOR_SCHEME_DOOM:
                if (this.core.randomPercentage(0.5)) {
                    color=new ColorClass(0.6,0.3,0.0);
                    this.adjustColorRandom(color,0.7,1,0);
                }
                else {
                    col=this.core.randomFloat(0.0,0.1);
                    color=new ColorClass(col,this.core.randomFloat(0.4,0.2),col);
                }
                return(color);
            
                // black and white
                
            case this.COLOR_SCHEME_GRAY:
                col=this.core.randomFloat(0.3,0.7);
                return(new ColorClass(col,col,col));
                
                // pastel primary colors
                
            case this.COLOR_SCHEME_PASTEL:
                col=this.primaryColorList[this.core.randomIndex(this.primaryColorList.length)];
                midPoint=(col[0]+col[1]+col[2])/3.0;
                color=new ColorClass((col[0]+(midPoint-col[0])*0.8),(col[1]+(midPoint-col[1])*0.8),(col[2]+(midPoint-col[2])*0.8));
                color.fixOverflow();
                return(color);
                
        }
    }
    
    getRandomColorDull(dullFactor)
    {
        let color=this.getRandomColor();
        
            // find the midpoint
            
        let midPoint=(color.r+color.g+color.b)/3.0;
        
            // move towards it
            
        color.r=color.r+(midPoint-color.r)*dullFactor;
        color.g=color.g+(midPoint-color.g)*dullFactor;
        color.b=color.b+(midPoint-color.b)*dullFactor;

        return(color);
    }
    
    getRandomGray(minFactor,maxFactor)
    {
        let col=this.core.randomFloat(minFactor,(maxFactor-minFactor));
        return(new ColorClass(col,col,col));
    }
    
    adjustColor(color,factor)
    {
        let col=new ColorClass((color.r*factor),(color.g*factor),(color.b*factor));
        
        col.fixOverflow();
        return(col);
    }
    
    adjustColorRandom(color,minFactor,maxFactor)
    {
        let f=this.core.randomFloat(minFactor,(maxFactor-minFactor));
        let col=new ColorClass((color.r*f),(color.g*f),(color.b*f));
        
        col.fixOverflow();
        return(col);
    }

        //
        // blur
        //

    blur(data,lft,top,rgt,bot,blurCount,clamp)
    {
        let n,idx;
        let x,y,cx,cy,cxs,cxe,cys,cye,dx,dy;
        let r,g,b;
        let blurData;
        
        if ((lft>=rgt) || (top>=bot)) return;
        
        blurData=new Uint8ClampedArray(data.length);
        
            // blur pixels to count

        for (n=0;n!==blurCount;n++) {
            
            for (y=top;y!==bot;y++) {

                cys=y-1;
                cye=y+2;

                for (x=lft;x!==rgt;x++) {

                        // get blur from 8 surrounding pixels

                    r=g=b=0;

                    cxs=x-1;
                    cxe=x+2;

                    for (cy=cys;cy!==cye;cy++) {
                        
                        dy=cy;
                        if (!clamp) {
                            if (dy<top) dy=bot+(top-dy);
                            if (dy>=bot) dy=top+(dy-bot);
                        }
                        else {
                            if (dy<top) dy=top;
                            if (dy>=bot) dy=bot-1;
                        }
                        
                        for (cx=cxs;cx!==cxe;cx++) {
                            if ((cy===y) && (cx===x)) continue;       // ignore self
                            
                            dx=cx;
                            if (!clamp) {
                                if (dx<lft) dx=rgt+(lft-dx);
                                if (dx>=rgt) dx=lft+(dx-rgt);
                            }
                            else {
                                if (dx<lft) dx=lft;
                                if (dx>=rgt) dx=rgt-1;
                            }
                            
                                // add up blur from the
                                // original pixels

                            idx=((dy*this.colorImgData.width)+dx)*4;

                            r+=data[idx];
                            g+=data[idx+1];
                            b+=data[idx+2];
                        }
                    }
                    
                    idx=((y*this.colorImgData.width)+x)*4;

                    blurData[idx]=r*0.125;
                    blurData[idx+1]=g*0.125;
                    blurData[idx+2]=b*0.125;
                }
            }

                // transfer over the changed pixels

            for (y=top;y!==bot;y++) {
                idx=((y*this.colorImgData.width)+lft)*4;
                for (x=lft;x!==rgt;x++) {       
                    data[idx]=blurData[idx];
                    data[idx+1]=blurData[idx+1];
                    data[idx+2]=blurData[idx+2];
                    idx+=4;
                }
            }
        } 
    }
    
        //
        // noise
        //
    
    getDotGridVector(vectors,gridX,gridY,gridWid,gridHigh,x,y)
    {
        let dx=(x-(gridX*gridWid))/gridWid;
        let dy=(y-(gridY*gridHigh))/gridHigh;
        
        return((dx*vectors[gridY][gridX].x)+(dy*vectors[gridY][gridX].y));
    }
    
    lerp(a,b,w)
    {
        let f=(Math.pow(w,2)*3)-(Math.pow(w,3)*2);
        return(((1.0-f)*a)+(f*b));
    }
    
    createPerlinNoiseData(gridXSize,gridYSize)
    {
        let x,y,ix0,ix1,sx,sy;
        let gridWid,gridHigh,gridX0,gridX1,gridY0,gridY1;
        let vectors,rowVectors,normal;
        let n0,n1,idx,k;
        let gridDist;
        
            // the grid
            // it must be evenly divisible
            
        if (((this.colorImgData.width%gridXSize)!==0) || ((this.colorImgData.height%gridYSize)!==0)) {
            console.log('perlin noise grid must be divisible by texture size');
            return;
        }
            
        gridWid=Math.trunc(this.colorImgData.width/gridXSize);
        gridHigh=Math.trunc(this.colorImgData.height/gridYSize);
        gridDist=Math.sqrt((gridWid*gridWid)+(gridHigh*gridHigh));
        
            // noise data arrays
            
        this.perlinNoiseColorFactor=new Float32Array(this.colorImgData.width*this.colorImgData.height);
        
            // generate the random grid vectors
            
        vectors=[];
        
        for (y=0;y!==gridYSize;y++) {
            
            rowVectors=[];
            
            for (x=0;x!==gridXSize;x++) {
                normal=new PointClass(this.core.randomNegativeOneToOne(),this.core.randomNegativeOneToOne(),0);
                normal.normalize2D();
                rowVectors.push(normal);
            }
            
            rowVectors.push(rowVectors[0]);     // wrap around
            
            vectors.push(rowVectors);
        }
        
        vectors.push(vectors[0]);           // wrap around
        
        vectors[gridYSize][gridXSize].setFromPoint(vectors[0][0]);      // final wrap around from top-left to top-right

            // create the noise arrays
            
        gridY0=0;
        normal=new PointClass(0,0,0);
        
        for (y=0;y!==this.colorCanvas.height;y++) {
            
            gridY0=Math.trunc(y/gridHigh);
            gridY1=gridY0+1;
            
            for (x=0;x!==this.colorCanvas.width;x++) {
                idx=((y*this.colorCanvas.width)+x)*4;
                
                gridX0=Math.trunc(x/gridWid);
                gridX1=gridX0+1;
                
                    // interpolate the grid normals and take
                    // the dot product to get a -1->1 elevation
                    
                sx=(x-(gridX0*gridWid))/gridWid;
                sy=(y-(gridY0*gridHigh))/gridHigh;
                
                n0=this.getDotGridVector(vectors,gridX0,gridY0,gridWid,gridHigh,x,y);
                n1=this.getDotGridVector(vectors,gridX1,gridY0,gridWid,gridHigh,x,y);
                ix0=this.lerp(n0,n1,sx);
                
                n0=this.getDotGridVector(vectors,gridX0,gridY1,gridWid,gridHigh,x,y);
                n1=this.getDotGridVector(vectors,gridX1,gridY1,gridWid,gridHigh,x,y);
                ix1=this.lerp(n0,n1,sx);
                
                    // turn this into a color factor for the base color
                
                this.perlinNoiseColorFactor[(y*this.colorCanvas.width)+x]=(this.lerp(ix0,ix1,sy)+1.0)*0.5;      // get it in 0..1
            }
        }
    }
    
    getPerlineColorFactorForPosition(x,y)
    {
        return(this.perlinNoiseColorFactor[(y*this.colorCanvas.width)+x]);
    }
    
    drawPerlinNoiseRect(lft,top,rgt,bot,colorFactorMin,colorFactorMax)
    {
        let x,y,idx,colFactor;
        let colorFactorAdd=colorFactorMax-colorFactorMin;
        let colorData=this.colorImgData.data;
       
        for (y=top;y!==bot;y++) {
            for (x=lft;x!==rgt;x++) {
                
                    // the perlin color factor (a single float)
                    
                idx=(y*this.colorCanvas.width)+x;
                colFactor=colorFactorMin+(colorFactorAdd*this.perlinNoiseColorFactor[(y*this.colorCanvas.width)+x]);
                
                idx*=4;
                
                    // now merge with bitmap color
                    
                colorData[idx]=colorData[idx]*colFactor;
                colorData[idx+1]=colorData[idx+1]*colFactor;
                colorData[idx+2]=colorData[idx+2]*colFactor;
            }
        }
    }
    
    drawStaticNoiseRect(lft,top,rgt,bot,colorFactorMin,colorFactorMax)
    {
        let x,y,idx,colFactor;
        let colorFactorAdd=colorFactorMax-colorFactorMin;
        let colorData=this.colorImgData.data;

        for (y=top;y!==bot;y++) {
            for (x=lft;x!==rgt;x++) {
                
                    // the static random color factor
                    
                colFactor=colorFactorMin+(colorFactorAdd*this.core.random());

                idx=((y*this.colorCanvas.width)+x)*4;
                
                colorData[idx]=colorData[idx]*colFactor;
                colorData[idx+1]=colorData[idx+1]*colFactor;
                colorData[idx+2]=colorData[idx+2]*colFactor;
             }
        }
    }
    
    createNormalNoiseDataSinglePolygonLine(x,y,x2,y2,normal)
    {
        let xLen,yLen,sp,ep,dx,dy,wx,wy,slope,idx;
        let normalData=this.noiseNormals;
        let r=Math.trunc((normal.x+1.0)*127.0);
        let g=Math.trunc((normal.y+1.0)*127.0);
        let b=Math.trunc((normal.z+1.0)*127.0);
        
            // the line
            
        xLen=Math.abs(x2-x);
        yLen=Math.abs(y2-y);
        
        if ((xLen===0) && (yLen===0)) return;
            
        if (xLen>yLen) {
            slope=yLen/xLen;
            
            if (x<x2) {
                sp=x;
                ep=x2;
                dy=y;
                slope*=Math.sign(y2-y);
            }
            else {
                sp=x2;
                ep=x;
                dy=y2;
                slope*=Math.sign(y-y2);
            }
            
            for (dx=sp;dx!==ep;dx++) {
                wx=dx;
                if (wx<0) wx=this.colorImgData.width+wx;
                if (wx>=this.colorImgData.width) wx-=this.colorImgData.width;        // wrap around

                wy=dy;
                if (wy<0) wy=this.colorImgData.height+wy;
                if (wy>=this.colorImgData.height) wy-=this.colorImgData.height;        // wrap around

                idx=((Math.trunc(wy)*this.colorImgData.width)+wx)*4;
                normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                
                dy+=slope;
            }
        }
        else {
            slope=xLen/yLen;
            
            if (y<y2) {
                sp=y;
                ep=y2;
                dx=x;
                slope*=Math.sign(x2-x);
            }
            else {
                sp=y2;
                ep=y;
                dx=x2;
                slope*=Math.sign(x-x2);
            }
            
            for (dy=sp;dy!==ep;dy++) {
                wx=dx;
                if (wx<0) wx=this.colorImgData.width+wx;
                if (wx>=this.colorImgData.width) wx-=this.colorImgData.width;        // wrap around

                wy=dy;
                if (wy<0) wy=this.colorImgData.height+wy;
                if (wy>=this.colorImgData.height) wy-=this.colorImgData.height;        // wrap around

                idx=((wy*this.colorImgData.width)+Math.trunc(wx))*4;
                normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                
                dx+=slope;
            }
        }
    }
    
    createNormalNoiseDataSinglePolygon(lft,top,rgt,bot,normalZFactor,flipNormals)
    {
        let n,k,x,y,sx,sy,lx,ly,fx,fy,rad,idx;
        let normal,nFactor;
        let mx=Math.trunc((lft+rgt)*0.5);
        let my=Math.trunc((top+bot)*0.5);
        let halfWid=Math.trunc((rgt-lft)*0.5);
        let halfHigh=Math.trunc((bot-top)*0.5);
        let startArc,endArc,lineSize;
        let rx=new Int32Array(36);
        let ry=new Int32Array(36);
        
        if ((rgt<=lft) || (bot<=top)) return;
        
            // random settings
            
        lineSize=this.core.randomInt(2,3);
        startArc=this.core.randomInt(0,36);
        endArc=this.core.randomInt(startArc,36);
        
            // create randomized points
            // for oval
            
        for (n=0;n!=36;n++) {
            rx[n]=this.core.randomInt(0,20)-10;
            ry[n]=this.core.randomInt(0,20)-10;
        }

            // build the polygon/oval
            
        normal=new PointClass(0,0,0);
        
        for (n=0;n!=lineSize;n++) {
            
            for (k=startArc;k<endArc;k++) {
                idx=k%36;
                rad=(Math.PI*2.0)*(idx/36);

                fx=Math.sin(rad);
                x=(mx+Math.trunc(halfWid*fx))+rx[idx];

                fy=Math.cos(rad);
                y=(my-Math.trunc(halfHigh*fy))+ry[idx];
                
                nFactor=1.0-(n/lineSize);
                normal.x=(fx*nFactor)+(normal.x*(1.0-nFactor));
                normal.y=(fy*nFactor)+(normal.y*(1.0-nFactor));
                normal.z=(normalZFactor*nFactor)+(normal.z*(1.0-nFactor));
                if (flipNormals) {
                    normal.x=-normal.x;
                    normal.y=-normal.y;
                }

                normal.normalize();

                if (k!==startArc) {
                    this.createNormalNoiseDataSinglePolygonLine(lx,ly,x,y,normal);
                }
                else {
                    sx=x;
                    sy=y;
                }

                lx=x;
                ly=y;
            }
            
            halfWid--;
            if (halfWid===0) break;

            halfHigh--;
            if (halfHigh===0) break;
        }
    }
    
    createNormalNoiseData(density,normalZFactor)
    {
        let n,x,y,wid,high,pixelSize,idx;
        let nCount;
        
            // initialize the noise data
            
        pixelSize=this.colorImgData.height*this.colorImgData.width;
        this.noiseNormals=new Uint8ClampedArray(pixelSize*4);
        
        idx=0;
        
        for (n=0;n!==pixelSize;n++) {
            this.noiseNormals[idx]=127;
            this.noiseNormals[idx+1]=127;
            this.noiseNormals[idx+2]=255;
            idx+=4;
        }
        
            // create the random normal chunks
            
        nCount=Math.trunc((this.colorImgData.width*0.5)*density);
        
        for (n=0;n!==nCount;n++) {
            x=this.core.randomInt(0,(this.colorImgData.width-1));
            y=this.core.randomInt(0,(this.colorImgData.height-1));
            wid=this.core.randomInt(20,40);
            high=this.core.randomInt(20,40);
            
            this.createNormalNoiseDataSinglePolygon(x,y,(x+wid),(y+high),normalZFactor,this.core.randomPercentage(0.5));
        }
        
            // blur to fix any missing pixels and make the
            // height change not as drastic
            
        this.blur(this.noiseNormals,0,0,this.colorImgData.width,this.colorImgData.height,5,false);
    }
    
    drawNormalNoiseRect(lft,top,rgt,bot)
    {
        let x,y,idx;
        let normalData=this.normalImgData.data;

        for (y=top;y!==bot;y++) {
            for (x=lft;x!==rgt;x++) {
                idx=((y*this.colorCanvas.width)+x)*4;
                
                normalData[idx]=this.noiseNormals[idx];
                normalData[idx+1]=this.noiseNormals[idx+1];
                normalData[idx+2]=this.noiseNormals[idx+2];
             }
        }
    }
    
        //
        // distortions
        //
    
    gravityDistortEdges(lft,top,rgt,bot,distortCount,distortRadius,distortSize)
    {
        let n,x,y,d,dx,dy,gx,gy;
        let sx,sy,idx,idx2;
        let colorData=this.colorImgData.data;
        let colorDataCopy=new Uint8Array(colorData);
        let normalData=this.normalImgData.data;
        let normalDataCopy=new Uint8Array(normalData);
        
            // run a number of gravity distortions
            
        for (n=0;n!==distortCount;n++) {

                // find a gravity point on an edge

            switch (this.core.randomIndex(4)) {
                case 0:
                    gx=lft+distortSize;
                    gy=this.core.randomInBetween(top,bot);
                    break;
                case 1:
                    gx=rgt-distortSize;
                    gy=this.core.randomInBetween(top,bot);
                    break;
                case 2:
                    gx=this.core.randomInBetween(lft,rgt);
                    gy=top+distortSize;
                    break;
                default:
                    gx=this.core.randomInBetween(lft,rgt);
                    gy=bot-distortSize;
                    break;
            }
        
                // distort bitmap
                
            for (y=top;y!==bot;y++) {
                for (x=lft;x!==rgt;x++) {

                    sx=x;
                    sy=y;
                        
                    dx=gx-x;
                    dy=gy-y;
                    d=Math.sqrt((dx*dx)+(dy*dy));

                    if (d<distortRadius) {
                        d=1.0-(d/distortRadius);
                        sx=sx-Math.trunc((Math.sign(dx)*distortSize)*d);
                        sy=sy-Math.trunc((Math.sign(dy)*distortSize)*d);
                        
                        if (sx<0) sx=this.colorImgData.width+sx;
                        if (sx>=this.colorImgData.width) sx=this.colorImgData.width-sx;
                        if (sy<0) sy=this.colorImgData.height+sy;
                        if (sy>=this.colorImgData.height) sy=this.colorImgData.height-sy;
                    }
                
                        // shift the pixels

                    idx=((y*this.colorImgData.width)+x)*4;
                    idx2=((sy*this.colorImgData.width)+sx)*4;

                    colorData[idx]=colorDataCopy[idx2];
                    colorData[idx+1]=colorDataCopy[idx2+1];
                    colorData[idx+2]=colorDataCopy[idx2+2];

                    normalData[idx]=normalDataCopy[idx2];
                    normalData[idx+1]=normalDataCopy[idx2+1];
                    normalData[idx+2]=normalDataCopy[idx2+2];
                }
            }
        }
    }

        //
        // shape drawing
        //

    drawRect(lft,top,rgt,bot,color)
    {
        let x,y,idx;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;
        
        if ((lft>=rgt) || (top>=bot)) return;

        for (y=top;y<=bot;y++) {
            if ((y<0) || (y>=this.colorImgData.height)) continue;
            
            for (x=lft;x<=rgt;x++) {
                if ((x<0) || (x>=this.colorImgData.width)) continue;
                
                idx=((y*this.colorImgData.width)+x)*4;
                
                colorData[idx]=color.r*255.0;
                colorData[idx+1]=color.g*255.0;
                colorData[idx+2]=color.b*255.0;

                normalData[idx]=(this.NORMAL_CLEAR.x+1.0)*127.0;
                normalData[idx+1]=(this.NORMAL_CLEAR.y+1.0)*127.0;
                normalData[idx+2]=(this.NORMAL_CLEAR.z+1.0)*127.0;
            }
        }
    }
    
    drawRectGlow(lft,top,rgt,bot,color)
    {
        let x,y,idx;
        let glowData=this.glowImgData.data;
        
        if ((lft>=rgt) || (top>=bot)) return;

        for (y=top;y<=bot;y++) {
            if ((y<0) || (y>=this.glowImgData.height)) continue;
            
            for (x=lft;x<=rgt;x++) {
                if ((x<0) || (x>=this.glowImgData.width)) continue;
                
                idx=((y*this.glowImgData.width)+x)*4;
                
                glowData[idx]=color.r*255.0;
                glowData[idx+1]=color.g*255.0;
                glowData[idx+2]=color.b*255.0;
            }
        }
    }
    
    draw3DFrameRect(lft,top,rgt,bot,size,color,faceOut)
    {
        let n,x,y,idx;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;
        
        if ((lft>=rgt) || (top>=bot)) return;
        
            // draw the edges

        for (n=0;n<=size;n++) {
            
            for (x=lft;x<=rgt;x++) {
                if ((x<0) || (x>=this.colorImgData.width)) continue;
                
                if ((top>=0) && (top<this.colorImgData.height)) {
                    idx=((top*this.colorImgData.width)+x)*4;
                    colorData[idx]=color.r*255.0;
                    colorData[idx+1]=color.g*255.0;
                    colorData[idx+2]=color.b*255.0;

                    normalData[idx]=((faceOut?this.NORMAL_TOP_45.x:this.NORMAL_BOTTOM_45.x)+1.0)*127.0;
                    normalData[idx+1]=((faceOut?this.NORMAL_TOP_45.y:this.NORMAL_BOTTOM_45.y)+1.0)*127.0;
                    normalData[idx+2]=((faceOut?this.NORMAL_TOP_45.z:this.NORMAL_BOTTOM_45.z)+1.0)*127.0;
                }
                
                if ((bot>=0) && (bot<this.colorImgData.height)) {
                    idx=((bot*this.colorImgData.width)+x)*4;
                    colorData[idx]=color.r*255.0;
                    colorData[idx+1]=color.g*255.0;
                    colorData[idx+2]=color.b*255.0;

                    normalData[idx]=((faceOut?this.NORMAL_BOTTOM_45.x:this.NORMAL_TOP_45.x)+1.0)*127.0;
                    normalData[idx+1]=((faceOut?this.NORMAL_BOTTOM_45.y:this.NORMAL_TOP_45.y)+1.0)*127.0;
                    normalData[idx+2]=((faceOut?this.NORMAL_BOTTOM_45.z:this.NORMAL_TOP_45.z)+1.0)*127.0;
                }
            }
            
            for (y=top;y<=bot;y++) {
                if ((y<0) || (y>=this.colorImgData.height)) continue;
                
                if ((lft>=0) && (lft<this.colorImgData.width)) {
                    idx=((y*this.colorImgData.width)+lft)*4;
                    colorData[idx]=color.r*255.0;
                    colorData[idx+1]=color.g*255.0;
                    colorData[idx+2]=color.b*255.0;

                    normalData[idx]=((faceOut?this.NORMAL_LEFT_45.x:this.NORMAL_RIGHT_45.x)+1.0)*127.0;
                    normalData[idx+1]=((faceOut?this.NORMAL_LEFT_45.y:this.NORMAL_RIGHT_45.y)+1.0)*127.0;
                    normalData[idx+2]=((faceOut?this.NORMAL_LEFT_45.z:this.NORMAL_RIGHT_45.z)+1.0)*127.0;
                }
                
                if ((rgt>=0) && (rgt<this.colorImgData.width)) {
                    idx=((y*this.colorImgData.width)+rgt)*4;
                    colorData[idx]=color.r*255.0;
                    colorData[idx+1]=color.g*255.0;
                    colorData[idx+2]=color.b*255.0;

                    normalData[idx]=((faceOut?this.NORMAL_RIGHT_45.x:this.NORMAL_LEFT_45.x)+1.0)*127.0;
                    normalData[idx+1]=((faceOut?this.NORMAL_RIGHT_45.y:this.NORMAL_LEFT_45.y)+1.0)*127.0;
                    normalData[idx+2]=((faceOut?this.NORMAL_RIGHT_45.z:this.NORMAL_LEFT_45.z)+1.0)*127.0;
                }
            }
                // next edge

            lft++;
            rgt--;
            top++;
            bot--;
        }
    }
        
    drawOval(lft,top,rgt,bot,startArc,endArc,xRoundFactor,yRoundFactor,edgeSize,edgeColorFactor,color,outlineColor,normalZFactor,flipNormals,addNoise,colorFactorMin,colorFactorMax)
    {
        let n,x,y,mx,my,halfWid,halfHigh;
        let rad,fx,fy,idx;
        let nFactor;
        let wid,high,edgeCount;
        let origNormalData;
        let colorFactorAdd=colorFactorMax-colorFactorMin;
        let normal=new PointClass(0,0,0);
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;
        let perlinColorData=this.perlinNoiseColorFactor;
        let noiseNormalData=this.noiseNormals;
        let colFactor;
        let col=new ColorClass(0,0,0);
        
        if ((lft>=rgt) || (top>=bot)) return;
        
            // start and end arc
            
        startArc=Math.trunc(startArc*1000);
        endArc=Math.trunc(endArc*1000);
        if (startArc>=endArc) return;
        
            // the drawing size
            
        wid=(rgt-lft)-1;
        high=(bot-top)-1;         // avoids clipping on bottom from being on wid,high
        mx=lft+Math.trunc(wid*0.5);
        my=top+Math.trunc(high*0.5);

        origNormalData=new Uint8Array(normalData);

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
                if ((x<0) || (x>=this.colorImgData.width)) continue;

                fy=Math.cos(rad);
                fy+=(fy*yRoundFactor);
                if (fy>1.0) fy=1.0;
                if (fy<-1.0) fy=-1.0;
                
                y=my-Math.trunc(halfHigh*fy);
                if ((y<0) || (y>=this.colorImgData.height)) continue;
                
                    // edge darkening
                    
                col.setFromColor(color);
                
                if (edgeCount>0) {
                    colFactor=edgeColorFactor+((1.0-(edgeCount/edgeSize))*(1.0-edgeColorFactor));
                    col.factor(colFactor);
                }
                
                if (addNoise) {
                    colFactor=colorFactorMin+(colorFactorAdd*perlinColorData[(y*this.colorImgData.width)+x]);
                    col.factor(colFactor);
                }

                    // the color
                
                idx=((y*this.colorImgData.width)+x)*4;
                
                colorData[idx]=Math.trunc(col.r*255.0);
                colorData[idx+1]=Math.trunc(col.g*255.0);
                colorData[idx+2]=Math.trunc(col.b*255.0);
                colorData[idx+3]=255;

                    // get a normal for the pixel change
                    // if we are outside the edge, gradually fade it
                    // to the default pointing out normal

                normal.x=0;
                normal.y=0;
                normal.z=1.0;
                
                if (edgeCount>0) {
                    nFactor=edgeCount/edgeSize;
                    normal.x=(fx*nFactor)+(normal.x*(1.0-nFactor));
                    normal.y=(fy*nFactor)+(normal.y*(1.0-nFactor));
                    normal.z=(normalZFactor*nFactor)+(normal.z*(1.0-nFactor));
                    if (flipNormals) {
                        normal.x=-normal.x;
                        normal.y=-normal.y;
                    }
                }
              
                    // add in noise normal
                    
                if (addNoise) {
                    normal.x=(((noiseNormalData[idx]/127.0)-1.0)*0.4)+(normal.x*0.6);
                    normal.y=(((noiseNormalData[idx+1]/127.0)-1.0)*0.4)+(normal.y*0.6);
                    normal.z=(((noiseNormalData[idx+2]/127.0)-1.0)*0.4)+(normal.z*0.6);
                }
                
                normal.normalize();

                normalData[idx]=(normal.x+1.0)*127.0;           // normals are -1...1 packed into a byte
                normalData[idx+1]=(normal.y+1.0)*127.0;
                normalData[idx+2]=(normal.z+1.0)*127.0;
            }

            if (edgeCount>0) edgeCount--;

            wid--;
            high--;
        }
        
            // any outline
            
        if (outlineColor!==null) {
            wid=(rgt-lft)-1;
            high=(bot-top)-1;         // avoids clipping on bottom from being on wid,high

            halfWid=wid*0.5;
            halfHigh=high*0.5;
            
            for (n=startArc;n<endArc;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                fx+=(fx*xRoundFactor);
                if (fx>1.0) fx=1.0;
                if (fx<-1.0) fx=-1.0;
                
                x=mx+Math.trunc(halfWid*fx);
                if ((x<0) || (x>=this.colorImgData.width)) continue;

                fy=Math.cos(rad);
                fy+=(fy*yRoundFactor);
                if (fy>1.0) fy=1.0;
                if (fy<-1.0) fy=-1.0;
                
                y=my-Math.trunc(halfHigh*fy);
                if ((y<0) || (y>=this.colorImgData.height)) continue;
                
                    // the color pixel

                idx=((y*this.colorImgData.width)+x)*4;

                colorData[idx]=Math.trunc(outlineColor.r*255.0);
                colorData[idx+1]=Math.trunc(outlineColor.g*255.0);
                colorData[idx+2]=Math.trunc(outlineColor.b*255.0);
                colorData[idx+3]=255;
            }
        }
    }
    
    drawOvalGlow(lft,top,rgt,bot,color)
    {
        let n,x,y,mx,my,halfWid,halfHigh;
        let rad,fx,fy,idx;
        let wid,high;
        let glowData=this.glowImgData.data;
        
        if ((lft>=rgt) || (top>=bot)) return;
        
            // the drawing size
            
        wid=(rgt-lft)-1;
        high=(bot-top)-1;         // avoids clipping on bottom from being on wid,high
        mx=lft+Math.trunc(wid*0.5);
        my=top+Math.trunc(high*0.5);
        
            // fill the oval

        while ((wid>0) && (high>0)) {

            halfWid=wid*0.5;
            halfHigh=high*0.5;
            
            for (n=0;n<1000;n++) {
                rad=(Math.PI*2.0)*(n*0.001);

                fx=Math.sin(rad);
                if (fx>1.0) fx=1.0;
                if (fx<-1.0) fx=-1.0;
                
                x=mx+Math.trunc(halfWid*fx);
                if ((x<0) || (x>=this.glowImgData.width)) continue;

                fy=Math.cos(rad);
                if (fy>1.0) fy=1.0;
                if (fy<-1.0) fy=-1.0;
                
                y=my-Math.trunc(halfHigh*fy);
                if ((y<0) || (y>=this.glowImgData.height)) continue;

                    // the color
                
                idx=((y*this.glowImgData.width)+x)*4;
                
                glowData[idx]=Math.trunc(color.r*255.0);
                glowData[idx+1]=Math.trunc(color.g*255.0);
                glowData[idx+2]=Math.trunc(color.b*255.0);
            }

            wid--;
            high--;
        }
    }
    
    drawDiamond(lft,top,rgt,bot,color)
    {
        let x,y,lx,rx,f,idx;
        let mx,my,halfWid;
        let colorData=this.colorImgData.data;
        let frameColor;
        
        if ((lft>=rgt) || (top>=bot)) return;
        
            // the fill

        mx=Math.trunc((lft+rgt)*0.5);
        my=Math.trunc((top+bot)*0.5);
        halfWid=Math.trunc((rgt-lft)*0.5);
        
        for (y=top;y!==bot;y++) {
            
            if (y<my) {
                f=1.0-((my-y)/(my-top));
                lx=mx-Math.trunc(halfWid*f);
                rx=mx+Math.trunc(halfWid*f);
            }
            else {
                f=1.0-((y-my)/(my-top));
                lx=mx-Math.trunc(halfWid*f);
                rx=mx+Math.trunc(halfWid*f);
            }
            
            if (lx>=rx) continue;
            
            for (x=lx;x!==rx;x++) {
                idx=((y*this.colorImgData.width)+x)*4;
                
                colorData[idx]=color.r*255.0;
                colorData[idx+1]=color.g*255.0;
                colorData[idx+2]=color.b*255.0;
            }
        }
        
            // the border
            
        frameColor=this.adjustColorRandom(color,0.85,0.95);
        
        this.drawLineColor((mx+1),top,(lft+1),my,frameColor);
        this.drawLineColor(mx,top,lft,my,frameColor);
        this.drawLineNormal((mx+1),top,(lft+1),my,this.NORMAL_TOP_LEFT_45);
        this.drawLineNormal(mx,top,lft,my,this.NORMAL_TOP_LEFT_45);

        this.drawLineColor((mx-1),top,(rgt-1),my,frameColor);
        this.drawLineColor(mx,top,rgt,my,frameColor);
        this.drawLineNormal((mx-1),top,(rgt-1),my,this.NORMAL_TOP_RIGHT_45);
        this.drawLineNormal(mx,top,rgt,my,this.NORMAL_TOP_RIGHT_45);
        
        this.drawLineColor((lft+1),my,(mx+1),bot,frameColor);
        this.drawLineColor(lft,my,mx,bot,frameColor);
        this.drawLineNormal((lft+1),my,(mx+1),bot,this.NORMAL_BOTTOM_LEFT_45);
        this.drawLineNormal(lft,my,mx,bot,this.NORMAL_TOP_LEFT_45);

        this.drawLineColor((rgt-1),my,(mx-1),bot,frameColor);
        this.drawLineColor(lft,my,mx,bot,frameColor);
        this.drawLineNormal((rgt-1),my,(mx-1),bot,this.NORMAL_BOTTOM_RIGHT_45);
        this.drawLineNormal(rgt,my,mx,bot,this.NORMAL_TOP_RIGHT_45);
    }
    
    drawTriangle(x0,y0,x1,y1,x2,y2,color)
    {
        let y,ty,my,by;
        let x,lx,rx,tyX,myX,byX;
        let idx;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;
        
        if ((y0<=y1) && (y0<=y2)) {
            ty=y0;
            tyX=x0;
            if (y1<y2) {
                my=y1;
                myX=x1;
                by=y2;
                byX=x2;
            }
            else {
                my=y2;
                myX=y2;
                by=y1;
                byX=x1;
            }
        }
        else {
            if ((y1<=y0) && (y1<=y2)) {
                ty=y1;
                tyX=x1;
                if (y0<y2) {
                    my=y0;
                    myX=x0;
                    by=y2;
                    byX=x2;
                }
                else {
                    my=y2;
                    myX=x2;
                    by=y0;
                    byX=x0;
                }
            }
            else {
                ty=y2;
                tyX=x2;
                if (y0<y1) {
                    my=y0;
                    myX=x0;
                    by=y1;
                    byX=x1;
                }
                else {
                    my=y1;
                    myX=x1;
                    by=y0;
                    byX=x0;
                }
            }
        }
        
            // top half

        for (y=ty;y<my;y++) {
            if ((y<0) || (y>this.colorImgData.height)) continue;
            
            if (myX<tyX) {
                lx=tyX+Math.trunc(((myX-tyX)*(y-ty))/(my-ty));
                rx=tyX+Math.trunc(((byX-tyX)*(y-ty))/(by-ty));
            }
            else {
                lx=tyX+Math.trunc(((byX-tyX)*(y-ty))/(by-ty));
                rx=tyX+Math.trunc(((myX-tyX)*(y-ty))/(my-ty));
            }
            
            if (lx<0) lx=0;
            if (rx>this.colorImgData.width) rx=this.colorImgData.width;
            if (lx>rx) continue;
            
            idx=((y*this.colorImgData.width)+lx)*4;
                
            for (x=lx;x<rx;x++) {
                colorData[idx]=color.r*255.0;
                colorData[idx+1]=color.g*255.0;
                colorData[idx+2]=color.b*255.0;
                
                normalData[idx]=(this.NORMAL_CLEAR.x+1.0)*127.0;
                normalData[idx+1]=(this.NORMAL_CLEAR.y+1.0)*127.0;
                normalData[idx+2]=(this.NORMAL_CLEAR.z+1.0)*127.0;
                
                idx+=4;
            }
        }
        
            // bottom half
        
        for (y=my;y<by;y++) {
            if ((y<0) || (y>this.colorImgData.height)) continue;
            
            if (myX<tyX) {
                lx=myX+Math.trunc(((byX-myX)*(y-my))/(by-my));
                rx=tyX+Math.trunc(((byX-tyX)*(y-ty))/(by-ty));
            }
            else {
                lx=tyX+Math.trunc(((byX-tyX)*(y-ty))/(by-ty));
                rx=myX+Math.trunc(((byX-myX)*(y-my))/(by-my));
            }
            
            if (lx<0) lx=0;
            if (rx>this.colorImgData.width) rx=this.colorImgData.width;
            if (lx>rx) continue;
            
            idx=((y*this.colorImgData.width)+lx)*4;
                
            for (x=lx;x<rx;x++) {
                colorData[idx]=color.r*255.0;
                colorData[idx+1]=color.g*255.0;
                colorData[idx+2]=color.b*255.0;
                
                normalData[idx]=(this.NORMAL_CLEAR.x+1.0)*127.0;
                normalData[idx+1]=(this.NORMAL_CLEAR.y+1.0)*127.0;
                normalData[idx+2]=(this.NORMAL_CLEAR.z+1.0)*127.0;
                
                idx+=4;
            }
        }
    }
    
    drawHexagon(lft,top,rgt,bot,pointSize,edgeSize,color)
    {
        let n,lx,rx,my;
        let darkenFactor,darkColor;

            // build the hexagon

        my=Math.trunc((top+bot)*0.5);
        
        lx=lft;
        rx=rgt;
        lft-=pointSize;
        rgt+=pointSize;
        
        if (lft>=rgt) return;
        
            // fill the hexagon
            
        if (color!==null) {
            this.drawRect(lx,top,rx,bot,color);
            this.drawTriangle(lx,top,lft,my,lx,bot,color);
            this.drawTriangle(rx,top,rgt,my,rx,bot,color);
        }    
        
            // draw the edges
            
        for (n=0;n!==edgeSize;n++) {

                // the colors

            darkenFactor=(((n+1)/edgeSize)*0.3)+0.7;
            darkColor=this.adjustColor(color,darkenFactor);
            
                // top-left to top to top-right

            this.drawLineColor((lft+n),my,(lx+n),(top+n),darkColor);
            this.drawLineNormal((lft+n),my,(lx+n),(top+n),this.NORMAL_TOP_LEFT_45);

            this.drawLineColor((lx+n),(top+n),(rx-n),(top+n),darkColor);
            this.drawLineNormal((lx+n),(top+n),(rx-n),(top+n),this.NORMAL_TOP_45);

            this.drawLineColor((rx-n),(top+n),(rgt-n),my,darkColor);
            this.drawLineNormal((rx-n),(top+n),(rgt-n),my,this.NORMAL_TOP_RIGHT_45);

                // bottom-right to bottom to bottom-left

            this.drawLineColor((lft+n),my,(lx+n),(bot-n),darkColor);
            this.drawLineNormal((lft+n),my,(lx+n),(bot-n),this.NORMAL_BOTTOM_LEFT_45);
                
            this.drawLineColor((lx+n),(bot-n),(rx-n),(bot-n),darkColor);
            this.drawLineNormal((lx+n),(bot-n),(rx-n),(bot-n),this.NORMAL_BOTTOM_45);

            this.drawLineColor((rx-n),(bot-n),(rgt-n),my,darkColor);
            this.drawLineNormal((rx-n),(bot-n),(rgt-n),my,this.NORMAL_BOTTOM_RIGHT_45);
        }
    }
    
        //
        // metals
        //
        
    drawMetalShineLine(x,top,bot,shineWid,baseColor)
    {
        let n,lx,rx,y,idx;
        let colorData=this.colorImgData.data;
        let density,densityReduce;
        
        if (top>=bot) return;
        if (shineWid<=0) return;
        
            // since we draw the shines from both sides,
            // we need to move the X into the middle and cut width in half
            
        shineWid=Math.trunc(shineWid*0.5);
            
        x+=shineWid;
        
            // start with 100 density and reduce
            // as we go across the width
            
        density=100;
        densityReduce=Math.trunc(90/shineWid);
        
            // write the shine lines
            
        for (n=0;n!==shineWid;n++) {
            
            lx=x-n;
            rx=x+n;
            
            for (y=top;y!==bot;y++) {
                
                if (this.core.randomInt(0,100)<density) {
                    if ((lx>=0) && (lx<this.colorImgData.width)) {
                        idx=((y*this.colorImgData.width)+lx)*4;
                        colorData[idx]=Math.trunc(baseColor.r*255.0);
                        colorData[idx+1]=Math.trunc(baseColor.g*255.0);
                        colorData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
                
                if (this.core.randomInt(0,100)<density) {
                    if ((rx>=0) && (rx<this.colorImgData.width)) {
                        idx=((y*this.colorImgData.width)+rx)*4;
                        colorData[idx]=Math.trunc(baseColor.r*255.0);
                        colorData[idx+1]=Math.trunc(baseColor.g*255.0);
                        colorData[idx+2]=Math.trunc(baseColor.b*255.0);
                    }
                }
            
            }
            
            density-=densityReduce;
        }
    }
    
    drawMetalShine(lft,top,rgt,bot,metalColor)
    {
        let x,shineWid,shineColor;
        let wid=rgt-lft;
        
        x=lft;
        
        while (true) {
            shineWid=this.core.randomInt(Math.trunc(wid*0.035),Math.trunc(wid*0.15));
            if ((x+shineWid)>rgt) shineWid=rgt-x;
            
                // small % are no lines
                
            if (this.core.randomPercentage(0.9)) {
                shineColor=this.adjustColorRandom(metalColor,0.7,1.3);
                this.drawMetalShineLine(x,top,bot,shineWid,shineColor);
            }
            
            x+=(shineWid+this.core.randomInt(Math.trunc(wid*0.03),Math.trunc(wid*0.05)));
            if (x>=rgt) break;
        }
        
        this.blur(this.colorImgData.data,lft,top,rgt,bot,3,true);
    }
    
        //
        // streaks
        //
        
    drawStreakDirtSingle(lft,top,rgt,bot,minMix,addMix,color,minXReduce)
    {
        let x,y,flx,frx,lx,rx,xAdd,idx;
        let r,g,b;
        let factor;
        let wid=rgt-lft;
        let high=bot-top;
        let colorData=this.colorImgData.data;
        
        if ((wid<=0) || (high<=0)) return;
        
            // random shrink
            
        xAdd=this.core.random()*minXReduce;
        
            // draw the dirt
            
        flx=lft;
        frx=rgt;
            
        for (y=top;y!==bot;y++) {
            factor=(bot-y)/high;
            
            lx=Math.trunc(flx);
            rx=Math.trunc(frx);
            if (lx>=rx) break;
            
            for (x=lx;x!==rx;x++) {
                factor=this.core.randomFloat(minMix,addMix);

                idx=((y*this.colorImgData.width)+x)*4;
                r=colorData[idx]/255.0;
                g=colorData[idx+1]/255.0;
                b=colorData[idx+2]/255.0;
                colorData[idx]=(((1.0-factor)*r)+(color.r*factor))*255.0;
                colorData[idx+1]=(((1.0-factor)*g)+(color.g*factor))*255.0;
                colorData[idx+2]=(((1.0-factor)*b)+(color.b*factor))*255.0;
            }
            
            flx+=xAdd;
            frx-=xAdd;
        }
    }
    
    drawStreakDirt(lft,top,rgt,bot,additionalStreakCount,minMix,maxMix,color)
    {
        let n,sx,ex;
        let minWid;
        let addMix=maxMix-minMix;
        
            // original streak
            
        this.drawStreakDirtSingle(lft,top,rgt,bot,minMix,addMix,color,0.25);
        
            // additional streaks
            
        minWid=Math.trunc((rgt-lft)*0.1);
        
        for (n=0;n!==additionalStreakCount;n++) {
            sx=this.core.randomInBetween(lft,(rgt-minWid));
            ex=this.core.randomInBetween((sx+minWid),rgt);
            if (sx>=ex) continue;
            
            this.drawStreakDirtSingle(sx,top,ex,bot,minMix,addMix,color,0.1);
        }
    }
    
        //
        // color stripes, gradients, waves
        //
        
    drawColorStripeHorizontal(lft,top,rgt,bot,factor,baseColor)
    {
        let x,y,nx,ny,nz,idx;
        let f,r,g,b,count,normal;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;

        if ((rgt<=lft) || (bot<=top)) return;
        
            // the rotating normal
            
        normal=new PointClass(0,0.1,1.0);
        normal.normalize();
        
        nx=(normal.x+1.0)*127.0;
        ny=(normal.y+1.0)*127.0;
        nz=(normal.z+1.0)*127.0;
        
            // write the stripes
            
        count=1;

        for (y=top;y!==bot;y++) {

            count--;
            if (count<=0) {
                count=this.core.randomInt(2,4);
                
                f=1.0+((1.0-(this.core.random()*2.0))*factor);
                
                r=Math.trunc((baseColor.r*f)*255.0);
                g=Math.trunc((baseColor.g*f)*255.0);
                b=Math.trunc((baseColor.b*f)*255.0);
                
                ny=(ny/127.0)-1.0;
                ny=(1.0-ny)*127.0;
            }

            idx=((y*this.colorImgData.width)+lft)*4;

            for (x=lft;x!==rgt;x++) {
                colorData[idx]=r;
                colorData[idx+1]=g;
                colorData[idx+2]=b;

                normalData[idx]=nx;
                normalData[idx+1]=ny;
                normalData[idx+2]=nz;

                idx+=4;
            }
        }
    }

    drawColorStripeVertical(lft,top,rgt,bot,factor,baseColor)
    {
        let x,y,nx,ny,nz,idx;
        let f,r,g,b,count,normal;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;

        if ((rgt<=lft) || (bot<=top)) return;
        
            // the rotating normal
            
        normal=new PointClass(0.1,0,1.0);
        normal.normalize();
        
        nx=(normal.x+1.0)*127.0;
        ny=(normal.y+1.0)*127.0;
        nz=(normal.z+1.0)*127.0;
        
            // write the stripes
            
        count=1;
            
        for (x=lft;x!==rgt;x++) {
            
            count--;
            if (count<=0) {
                count=this.core.randomInt(2,4);
                
                f=1.0+((1.0-(this.core.random()*2.0))*factor);
                
                r=Math.trunc((baseColor.r*f)*255.0);
                g=Math.trunc((baseColor.g*f)*255.0);
                b=Math.trunc((baseColor.b*f)*255.0);
                
                nx=(nx/127.0)-1.0;
                nx=(1.0-nx)*127.0;
            }

            for (y=top;y!==bot;y++) {
                idx=((y*this.colorImgData.width)+x)*4;
                colorData[idx]=r;
                colorData[idx+1]=g;
                colorData[idx+2]=b;

                normalData[idx]=nx;
                normalData[idx+1]=ny;
                normalData[idx+2]=nz;
            }
        }
    }
    
    drawNormalWaveHorizontal(lft,top,rgt,bot,color,lineColor,waveCount)
    {
        let x,y,idx;
        let waveIdx,wavePos,waveAdd;
        let xb,yb,zb;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;

        if ((rgt<=lft) || (bot<=top)) return;
        
            // the waves
            
        waveAdd=Math.trunc((rgt-lft)/waveCount);
        waveIdx=0;
        wavePos=0;
        
        for (x=lft;x!==rgt;x++) {
            
            switch(waveIdx) {
                case 0:
                    xb=(this.NORMAL_RIGHT_45.x+1.0)*127.0;
                    yb=(this.NORMAL_RIGHT_45.y+1.0)*127.0;
                    zb=(this.NORMAL_RIGHT_45.z+1.0)*127.0;
                    break;
                case 1:
                    xb=(this.NORMAL_CLEAR.x+1.0)*127.0;
                    yb=(this.NORMAL_CLEAR.y+1.0)*127.0;
                    zb=(this.NORMAL_CLEAR.z+1.0)*127.0;
                    break;
                case 2:
                    xb=(this.NORMAL_LEFT_45.x+1.0)*127.0;
                    yb=(this.NORMAL_LEFT_45.y+1.0)*127.0;
                    zb=(this.NORMAL_LEFT_45.z+1.0)*127.0;
                    break;
            }
            
            for (y=top;y!==bot;y++) {
                idx=((y*this.colorImgData.width)+x)*4;
                normalData[idx]=xb;
                normalData[idx+1]=yb;
                normalData[idx+2]=zb;
            }
            
            wavePos++;
            if (wavePos>=waveAdd) {
                wavePos=0;
                waveIdx=(waveIdx+1)%3;
            }
        }
        
            // extra lines
        
        waveAdd*=3;
        
        for (x=lft;x<rgt;x+=waveAdd) {
            for (y=top;y!==bot;y++) {
                idx=((y*this.colorImgData.width)+x)*4;
                normalData[idx]=(this.NORMAL_CLEAR.x+1.0)*127.0;
                normalData[idx+1]=(this.NORMAL_CLEAR.y+1.0)*127.0;
                normalData[idx+2]=(this.NORMAL_CLEAR.z+1.0)*127.0;
                
                colorData[idx]=lineColor.r*255.0;
                colorData[idx+1]=lineColor.g*255.0;
                colorData[idx+2]=lineColor.b*255.0;
            }
        }
    }
    
    drawNormalWaveVertical(lft,top,rgt,bot,color,lineColor,waveCount)
    {
        let x,y,idx;
        let waveIdx,wavePos,waveAdd;
        let xb,yb,zb;
        let colorData=this.colorImgData.data;
        let normalData=this.normalImgData.data;

        if ((rgt<=lft) || (bot<=top)) return;
        
            // the waves
        
        waveAdd=Math.trunc((bot-top)/waveCount);
        waveIdx=0;
        wavePos=0;
        
        for (y=top;y!==bot;y++) {
            
            switch(waveIdx) {
                case 0:
                    xb=(this.NORMAL_BOTTOM_45.x+1.0)*127.0;
                    yb=(this.NORMAL_BOTTOM_45.y+1.0)*127.0;
                    zb=(this.NORMAL_BOTTOM_45.z+1.0)*127.0;
                    break;
                case 1:
                    xb=(this.NORMAL_CLEAR.x+1.0)*127.0;
                    yb=(this.NORMAL_CLEAR.y+1.0)*127.0;
                    zb=(this.NORMAL_CLEAR.z+1.0)*127.0;
                    break;
                case 2:
                    xb=(this.NORMAL_TOP_45.x+1.0)*127.0;
                    yb=(this.NORMAL_TOP_45.y+1.0)*127.0;
                    zb=(this.NORMAL_TOP_45.z+1.0)*127.0;
                    break;
            }
            
            for (x=lft;x!==rgt;x++) {
                idx=((y*this.colorImgData.width)+x)*4;
                normalData[idx]=xb;
                normalData[idx+1]=yb;
                normalData[idx+2]=zb;
            }
            
            wavePos++;
            if (wavePos>=waveAdd) {
                wavePos=0;
                waveIdx=(waveIdx+1)%3;
            }
        }
        
            // extra lines
        
        waveAdd*=3;
        
        for (y=top;y<bot;y+=waveAdd) {
            for (x=lft;x!==rgt;x++) {
                idx=((y*this.colorImgData.width)+x)*4;
                normalData[idx]=(this.NORMAL_CLEAR.x+1.0)*127.0;
                normalData[idx+1]=(this.NORMAL_CLEAR.y+1.0)*127.0;
                normalData[idx+2]=(this.NORMAL_CLEAR.z+1.0)*127.0;
                
                colorData[idx]=lineColor.r*255.0;
                colorData[idx+1]=lineColor.g*255.0;
                colorData[idx+2]=lineColor.b*255.0;
            }
        }   
    }

        //
        // line drawings
        //
        
    drawLineColor(x,y,x2,y2,color)
    {
        let xLen,yLen,sp,ep,dx,dy,slope,idx;
        let curX,curY,prevX,prevY;
        let colorData=this.colorImgData.data;
        let r=Math.trunc(color.r*255.0);
        let g=Math.trunc(color.g*255.0);
        let b=Math.trunc(color.b*255.0);
        
            // the line
            
        xLen=Math.abs(x2-x);
        yLen=Math.abs(y2-y);
        
        if ((xLen===0) && (yLen===0)) return;
            
        if (xLen>yLen) {
            slope=yLen/xLen;
            
            if (x<x2) {
                sp=x;
                ep=x2;
                dy=y;
                slope*=Math.sign(y2-y);
            }
            else {
                sp=x2;
                ep=x;
                dy=y2;
                slope*=Math.sign(y-y2);
            }
            
            prevY=-1;
            
            for (dx=sp;dx<ep;dx++) {
                if ((dx>=0) && (dx<this.colorImgData.width) && (dy>=0) && (dy<this.colorImgData.height)) {
                    
                    curY=Math.trunc(dy);
                    
                    idx=((curY*this.colorImgData.width)+dx)*4;
                    colorData[idx]=r;
                    colorData[idx+1]=g;
                    colorData[idx+2]=b;
                
                    if (prevY!==-1) {
                        if (curY!==prevY) {
                            idx=((prevY*this.colorImgData.width)+dx)*4;
                            colorData[idx]=(colorData[idx]*0.5)+(r*0.5);
                            colorData[idx+1]=(colorData[idx+1]*0.5)+(g*0.5);
                            colorData[idx+2]=(colorData[idx+2]*0.5)+(b*0.5);
                        }
                    }
                    
                    prevY=curY;
                }
                
                dy+=slope;
            }
        }
        else {
            slope=xLen/yLen;
            
            if (y<y2) {
                sp=y;
                ep=y2;
                dx=x;
                slope*=Math.sign(x2-x);
            }
            else {
                sp=y2;
                ep=y;
                dx=x2;
                slope*=Math.sign(x-x2);
            }
            
            prevX=-1;
            
            for (dy=sp;dy<ep;dy++) {
                if ((dx>=0) && (dx<this.colorImgData.width) && (dy>=0) && (dy<this.colorImgData.height)) {
                    
                    curX=Math.trunc(dx);

                    idx=((dy*this.colorImgData.width)+curX)*4;
                    colorData[idx]=r;
                    colorData[idx+1]=g;
                    colorData[idx+2]=b;
                
                    if (prevX!==-1) {
                        if (curX!==prevX) {
                            idx=((dy*this.colorImgData.width)+prevX)*4;
                            colorData[idx]=(colorData[idx]*0.5)+(r*0.5);
                            colorData[idx+1]=(colorData[idx+1]*0.5)+(g*0.5);
                            colorData[idx+2]=(colorData[idx+2]*0.5)+(b*0.5);
                        }
                    }
                    
                    prevX=curX;
                }
                
                dx+=slope;
            }
        }
    }
    
    drawLineNormal(x,y,x2,y2,normal)
    {
        let xLen,yLen,sp,ep,dx,dy,slope,idx;
        let curX,curY,prevX,prevY;
        let normalData=this.normalImgData.data;
        let r=Math.trunc((normal.x+1.0)*127.0);
        let g=Math.trunc((normal.y+1.0)*127.0);
        let b=Math.trunc((normal.z+1.0)*127.0);
        
            // the line
            
        xLen=Math.abs(x2-x);
        yLen=Math.abs(y2-y);
        
        if ((xLen===0) && (yLen===0)) return;
            
        if (xLen>yLen) {
            slope=yLen/xLen;
            
            if (x<x2) {
                sp=x;
                ep=x2;
                dy=y;
                slope*=Math.sign(y2-y);
            }
            else {
                sp=x2;
                ep=x;
                dy=y2;
                slope*=Math.sign(y-y2);
            }
            
            prevY=-1;
            
            for (dx=sp;dx<ep;dx++) {
                if ((dx>=0) && (dx<this.colorImgData.width) && (dy>=0) && (dy<this.colorImgData.height)) {
                    
                    curY=Math.trunc(dy);
                    
                    idx=((curY*this.colorImgData.width)+dx)*4;
                    normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                    normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                    normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                    
                    if (prevY!==-1) {
                        if (curY!==prevY) {
                            idx=((prevY*this.colorImgData.width)+dx)*4;
                            normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                            normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                            normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                        }
                    }
                    
                    prevY=curY;
                }
                
                dy+=slope;
            }
        }
        else {
            slope=xLen/yLen;
            
            if (y<y2) {
                sp=y;
                ep=y2;
                dx=x;
                slope*=Math.sign(x2-x);
            }
            else {
                sp=y2;
                ep=y;
                dx=x2;
                slope*=Math.sign(x-x2);
            }
            
            prevX=-1;
            
            for (dy=sp;dy<ep;dy++) {
                if ((dx>=0) && (dx<this.colorImgData.width) && (dy>=0) && (dy<this.colorImgData.height)) {
                    
                    curX=Math.trunc(dx);
                    
                    idx=((dy*this.colorImgData.width)+curX)*4;
                    normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                    normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                    normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                    
                    if (prevX!==-1) {
                        if (curX!==prevX) {
                            idx=((dy*this.colorImgData.width)+prevX)*4;
                            normalData[idx]=(normalData[idx]*0.5)+(r*0.5);
                            normalData[idx+1]=(normalData[idx+1]*0.5)+(g*0.5);
                            normalData[idx+2]=(normalData[idx+2]*0.5)+(b*0.5);
                        }
                    }
                    
                    prevX=curX;

                }
                
                dx+=slope;
            }
        }
    }
    
    drawRandomLine(x,y,x2,y2,clipLft,clipTop,clipRgt,clipBot,lineVariant,color,antiAlias)
    {
        let n,sx,sy,ex,ey,r;
        let aliasColor;
        let segCount=this.core.randomInt(2,5);
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

                if ((n&0x1)===0) {      // straighten out line every other variation
                    r=lineVariant-this.core.randomIndex(lineVariant*2);

                    if (horizontal) {
                        ey+=r;
                    }
                    else {
                        ex+=r;
                    }
                }
            }
            
            if (ex<clipLft) ex=clipLft;
            if (ex>clipRgt) ex=clipRgt;
            if (ey<clipTop) ey=clipTop;
            if (ey>clipBot) ey=clipBot;
            
            this.drawLineColor(sx,sy,ex,ey,color);
            
            if (horizontal) {
                this.drawLineNormal(sx,sy,ex,ey,this.NORMAL_CLEAR);
                if (antiAlias) {
                    aliasColor=this.adjustColor(color,0.9);
                    this.drawLineColor(sx,(sy-1),ex,(ey-1),aliasColor);
                    this.drawLineColor(sx,(sy+1),ex,(ey+1),aliasColor);
                    this.drawLineNormal(sx,(sy-1),ex,(ey-1),this.NORMAL_BOTTOM_45);
                    this.drawLineNormal(sx,(sy+1),ex,(ey+1),this.NORMAL_TOP_45);
                }
            }
            else {
                this.drawLineNormal(sx,sy,ex,ey,this.NORMAL_CLEAR);
                if (antiAlias) {
                    aliasColor=this.adjustColor(color,0.9);
                    this.drawLineColor((sx-1),sy,(ex-1),ey,aliasColor);
                    this.drawLineColor((sx+1),sy,(ex+1),ey,aliasColor);
                    this.drawLineNormal((sx-1),sy,(ex-1),ey,this.NORMAL_RIGHT_45);
                    this.drawLineNormal((sx+1),sy,(ex+1),ey,this.NORMAL_LEFT_45);
                }
            }
            
            sx=ex;
            sy=ey;
        }
    }
    
    drawHorizontalCrack(y,x,x2,clipTop,clipBot,lineDir,lineVariant,color,canSplit)
    {
        let n,sx,sy,ex,ey;
        let segCount=this.core.randomInt(2,5);
        let xAdd=Math.trunc((x2-x)/segCount);
        
        sx=x;
        sy=y;
        
        for (n=0;n!==segCount;n++) {
            
            if ((n+1)===segCount) {
                ex=x2;
            }
            else {
                ey=sy+(this.core.randomIndex(lineVariant)*lineDir);
                ex=sx+xAdd;
            }
            
            if (ey<clipTop) ey=clipTop;
            if (ey>clipBot) ey=clipBot;
            
            if (sx===ex) return;
            
            this.drawLineColor(sx,sy,ex,ey,color);
            this.drawLineNormal(sx,sy,ex,ey,this.NORMAL_CLEAR);
            this.drawLineNormal(sx,(sy-1),ex,(ey-1),this.NORMAL_BOTTOM_45);
            this.drawLineNormal(sx,(sy+1),ex,(ey+1),this.NORMAL_TOP_45);
            
            if ((ey===clipTop) || (ey===clipBot)) break;
            
            if ((canSplit) && (this.core.randomPercentage(0.5))) {
                if (lineDir>0) {
                    this.drawHorizontalCrack(ey,ex,x2,clipTop,clipBot,-lineDir,lineVariant,color,false);
                }
                else {
                    this.drawHorizontalCrack(ey,ex,x2,clipTop,clipBot,-lineDir,lineVariant,color,false);
                }
                
                canSplit=false;
            }
            
            sx=ex;
            sy=ey;
        }
    }
            
    drawVerticalCrack(x,y,y2,clipLft,clipRgt,lineDir,lineVariant,color,canSplit)
    {
        let n,sx,sy,ex,ey;
        let segCount=this.core.randomInt(2,5);
        let yAdd=Math.trunc((y2-y)/segCount);
        
        sx=x;
        sy=y;
        
        for (n=0;n!==segCount;n++) {
            
            if ((n+1)===segCount) {
                ey=y2;
            }
            else {
                ex=sx+(this.core.randomIndex(lineVariant)*lineDir);
                ey=sy+yAdd;
            }
            
            if (ex<clipLft) ex=clipLft;
            if (ex>clipRgt) ex=clipRgt;
            
            if (sy===ey) return;
            
            this.drawLineColor(sx,sy,ex,ey,color);
            this.drawLineNormal(sx,sy,ex,ey,this.NORMAL_CLEAR);
            this.drawLineNormal((sx-1),sy,(ex-1),ey,this.NORMAL_RIGHT_45);
            this.drawLineNormal((sx+1),sy,(ex+1),ey,this.NORMAL_LEFT_45);
            
            if ((ex===clipLft) || (ex===clipRgt)) break;
            
            if ((canSplit) && (this.core.randomPercentage(0.5))) {
                if (lineDir>0) {
                    this.drawVerticalCrack(ex,ey,y2,clipLft,clipRgt,-lineDir,lineVariant,color,false);
                }
                else {
                    this.drawVerticalCrack(ex,ey,y2,clipLft,clipRgt,-lineDir,lineVariant,color,false);
                }
                
                canSplit=false;
            }
            
            sx=ex;
            sy=ey;
        }
    }
    
    drawSimpleCrack(sx,sy,ex,ey,segCount,lineXVariant,lineYVarient,color)
    {
        let n,dx,dy,dx2,dy2;
        
        dx=sx;
        dy=sy;
        
        for (n=0;n!==segCount;n++) {
            
            if ((n+1)===segCount) {
                dx2=ex;
                dy2=ey;
            }
            else {
                dx2=Math.trunc(sx+(((ex-sx)*(n+1))/segCount))+this.core.randomInt(0,lineXVariant);
                dy2=Math.trunc(sy+(((ey-sy)*(n+1))/segCount))+this.core.randomInt(0,lineYVarient);
            }
            
            this.drawLineColor(dx,dy,dx2,dy2,color);
            this.drawLineNormal(dx,dy,dx2,dy2,this.NORMAL_CLEAR);
            this.drawLineNormal((dx-1),dy,(dx2-1),dy2,this.NORMAL_RIGHT_45);
            this.drawLineNormal((dx+1),dy,(dx2+1),dy2,this.NORMAL_LEFT_45);
             
            dx=dx2;
            dy=dy2;
        }
    }
    
        //
        // specular routines
        //

    createSpecularMap(contrast,clamp)
    {
        let n,idx,nPixel;
        let f,i,min,max,expandFactor,contrastFactor;
        let colorData=this.colorImgData.data;
        let specularData=this.specularImgData.data;
        
        nPixel=this.colorImgData.width*this.colorImgData.height;
        
            // get the contrast factor
            
        contrastFactor=(259*(contrast+255))/(255*(259-contrast));
        
            // find a min-max across the entire map, we do this
            // so we can readjust the contrast to be 0..1
            
        min=max=(colorData[0]+colorData[1]+colorData[2])*0.33

        idx=0;
        
        for (n=0;n!==nPixel;n++) {
            f=(colorData[idx]+colorData[idx+1]+colorData[idx+2])*0.33;
            if (f<min) min=f;
            if (f>max) max=f;

            idx+=4;
        }
        
        if (min>=max) {
            expandFactor=0;
            min=0;
        }
        else {
            expandFactor=255.0/(max-min);
        }
        
            // now run the contrast
            
        idx=0;
        
        for (n=0;n!==nPixel;n++) {
            
                // get the pixel back into 0..1
                
            f=(colorData[idx]+colorData[idx+1]+colorData[idx+2])*0.33;
            f=(f-min)*expandFactor;
            
                // apply the contrast and
                // clamp it
                
            f=((contrastFactor*(f-128))+128);
            if (f<0) f=0;
            if (f>255) f=255;
            
            i=Math.trunc(f*clamp);
                    
            specularData[idx++]=i;
            specularData[idx++]=i;
            specularData[idx++]=i;
            specularData[idx++]=255;
        } 
    }
        
        //
        // clear canvases
        //
        
    clearImageData(imgData,r,g,b,a)
    {
        let n,len;
        let data=imgData.data;
        
        len=(imgData.height*imgData.width)*4;
        
        for (n=0;n!==len;n+=4) {
            data[n]=r;
            data[n+1]=g;
            data[n+2]=b;
            data[n+3]=a;
        }
    }
    
        //
        // for testing
        //
        
    test(variationMode)
    {
        this.core=new CoreClass();  // just so we can have the random # generator
        this.core.setRandomSeed(Date.now());
        
            // setup all the bitmap parts
            
        this.colorCanvas=document.getElementById('color');
        this.colorCTX=this.colorCanvas.getContext('2d');
        this.colorImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        this.clearImageData(this.colorImgData,255,255,255,255);
        
        this.normalCanvas=document.getElementById('normal');
        this.normalCTX=this.normalCanvas.getContext('2d');
        this.normalImgData=this.normalCTX.getImageData(0,0,this.normalCanvas.width,this.normalCanvas.height);
        this.clearImageData(this.normalImgData,0,0,255,255);

        this.specularCanvas=document.getElementById('specular');
        this.specularCTX=this.specularCanvas.getContext('2d');
        this.specularImgData=this.specularCTX.getImageData(0,0,this.specularCanvas.width,this.specularCanvas.height);
        this.clearImageData(this.specularImgData,0,0,0,255);
        
        this.glowCanvas=document.getElementById('glow');
        this.glowCTX=this.glowCanvas.getContext('2d');
        this.glowImgData=this.glowCTX.getImageData(0,0,this.glowCanvas.width,this.glowCanvas.height);
        this.clearImageData(this.glowImgData,0,0,0,255);

            // run the internal generator

        this.generateInternal(variationMode);
        
            // write out the bitmaps
            
        this.colorCTX.putImageData(this.colorImgData,0,0);
        this.normalCTX.putImageData(this.normalImgData,0,0);
        this.specularCTX.putImageData(this.specularImgData,0,0);
        this.glowCTX.putImageData(this.glowImgData,0,0);
    }
    
        //
        // generate mainline
        //
        
    generateInternalPiece(lft,top,rgt,bot)
    {
        let xMid=Math.trunc((lft+rgt)*0.5);
        let yMid=Math.trunc((top+bot)*0.5);
        
        this.drawRect(lft,top,xMid,yMid,new ColorClass(1,1,0));
        this.drawRect(xMid,top,rgt,yMid,new ColorClass(1,0,0));
        this.drawRect(lft,yMid,xMid,bot,new ColorClass(0,1,0));
        this.drawRect(xMid,yMid,rgt,bot,new ColorClass(0,0,1));
    }
        
    generateInternal(variationMode)
    {
        let mx=Math.trunc(this.colorImgData.width*0.5);       // default internal is just the UV test, repeated 4 times for textures that have parts
        let my=Math.trunc(this.colorImgData.height*0.5);
        
        this.generateInternalPiece(0,0,mx,my);
        this.generateInternalPiece(mx,0,this.colorImgData.width,my);
        this.generateInternalPiece(0,my,mx,this.colorImgData.height);
        this.generateInternalPiece(mx,my,this.colorImgData.width,this.colorImgData.height);
    }
    
    generate(variationMode)
    {
        let bitmap;
        
            // setup all the bitmap parts
            // and get the image bytes for drawing
            
        this.colorCanvas=document.createElement('canvas');
        this.colorCanvas.width=this.bitmapTextureSize;
        this.colorCanvas.height=this.bitmapTextureSize;
        this.colorCTX=this.colorCanvas.getContext('2d');
        this.colorImgData=this.colorCTX.getImageData(0,0,this.colorCanvas.width,this.colorCanvas.height);
        this.clearImageData(this.colorImgData,255,255,255,255);
        
        this.normalCanvas=document.createElement('canvas');
        this.normalCanvas.width=this.hasNormal?this.bitmapTextureSize:2;
        this.normalCanvas.height=this.hasNormal?this.bitmapTextureSize:2;
        this.normalCTX=this.normalCanvas.getContext('2d');
        this.normalImgData=this.normalCTX.getImageData(0,0,this.normalCanvas.width,this.normalCanvas.height);
        this.clearImageData(this.normalImgData,0,0,255,255);

        this.specularCanvas=document.createElement('canvas');
        this.specularCanvas.width=this.hasSpecular?this.bitmapTextureSize:2;
        this.specularCanvas.height=this.hasSpecular?this.bitmapTextureSize:2;
        this.specularCTX=this.specularCanvas.getContext('2d');
        this.specularImgData=this.specularCTX.getImageData(0,0,this.specularCanvas.width,this.specularCanvas.height);
        this.clearImageData(this.specularImgData,0,0,0,255);
        
        this.glowCanvas=document.createElement('canvas');
        this.glowCanvas.width=this.hasGlow?this.bitmapTextureSize:2;
        this.glowCanvas.height=this.hasGlow?this.bitmapTextureSize:2;
        this.glowCTX=this.glowCanvas.getContext('2d');
        this.glowImgData=this.glowCTX.getImageData(0,0,this.glowCanvas.width,this.glowCanvas.height);
        this.clearImageData(this.glowImgData,0,0,0,255);

            // run the internal generator

        this.generateInternal(variationMode);
        
            // write out the bitmaps
            
        this.colorCTX.putImageData(this.colorImgData,0,0);
        this.normalCTX.putImageData(this.normalImgData,0,0);
        this.specularCTX.putImageData(this.specularImgData,0,0);
        this.glowCTX.putImageData(this.glowImgData,0,0);
        
            // add the bitmap object
            
        bitmap=new BitmapGeneratedClass(this.core,('generated_'+this.constructor.name),this.colorCanvas,this.normalCanvas,this.specularCanvas,this.glowCanvas,this.emissiveFactor);
        //this.core.bitmapList.add(bitmap);
        
        return(bitmap);
    }
    
}
