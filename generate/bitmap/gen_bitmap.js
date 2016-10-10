"use strict";

//
// generate bitmap class
//

class GenBitmapClass
{
    constructor()
    {
            // some precalced normals

        this.NORMAL_CLEAR=new wsPoint(0.0,0.0,1.0);

        this.NORMAL_LEFT_45=new wsPoint(-0.60,0.02,0.70);
        this.NORMAL_RIGHT_45=new wsPoint(0.60,-0.02,0.70);
        this.NORMAL_TOP_45=new wsPoint(-0.02,0.60,0.70);
        this.NORMAL_BOTTOM_45=new wsPoint(0.02,-0.60,0.70);

        this.NORMAL_LEFT_10=new wsPoint(-0.1,0.0,0.90);
        this.NORMAL_RIGHT_10=new wsPoint(0.1,0.0,0.90);
        this.NORMAL_TOP_10=new wsPoint(0.0,0.1,0.90);
        this.NORMAL_BOTTOM_10=new wsPoint(0.0,-0.1,0.90);
        
        this.NORMAL_TOP_LEFT_45=new wsPoint(-0.30,0.30,0.70);
        this.NORMAL_TOP_RIGHT_45=new wsPoint(0.30,0.30,0.70);
        this.NORMAL_BOTTOM_LEFT_45=new wsPoint(-0.30,-0.30,0.70);
        this.NORMAL_BOTTOM_RIGHT_45=new wsPoint(0.30,-0.30,0.70);
        
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
                    [0.8,0.5,0.5],      // dull red
                ];
                
            // we have a default primary color for every instance
            // so things created with this have the same color scheme
            
        this.defaultPrimaryColorIdx=genRandom.randomInt(0,this.primaryColorList.length);

        // can't seal as this is a parent class
    }
    
        //
        // segmenting routines
        //

    createStackedSegments(cvsWid,cvsHigh)
    {
        var x,y;
        var lft,top;
        var halfBrick;
        var segments=[];

        var xCount=BITMAP_STACKED_X_MIN_COUNT+Math.trunc(genRandom.random()*BITMAP_STACKED_X_EXTRA_COUNT);
        var wid=Math.trunc(cvsWid/xCount);
        var halfWid=Math.trunc(wid/2);

        var yCount=BITMAP_STACKED_Y_MIN_COUNT+Math.trunc(genRandom.random()*BITMAP_STACKED_Y_EXTRA_COUNT);
        var high=Math.trunc(cvsHigh/yCount);

        top=0;
        halfBrick=false;

        for (y=0;y!==yCount;y++) {

            lft=halfBrick?-halfWid:0;

            for (x=0;x!==xCount;x++) {
                segments.push(new wsRect(lft,top,(lft+wid),(top+high)));
                lft+=wid;
            }

            if (halfWid) segments.push(new wsRect(lft,top,(lft+wid),(top+high)));

            top+=high;
            halfBrick=!halfBrick;
        }

        return(segments);
    }

    createRandomSegments(cvsWid,cvsHigh)
    {
        var x,y,x2,y2,hit;
        var wid,high,startWid,startHigh;
        var top,lft,bot,rgt;
        var segments=[];

            // create a grid to
            // build segments in
            // typed arrays initialize to 0

        var grid=new Uint16Array(BITMAP_GRID_DIVISION*BITMAP_GRID_DIVISION);

            // start making the segments

        while (true) {

                // find first open spot

            x=y=0;
            hit=false;

            while (true) {
                if (grid[(y*BITMAP_GRID_DIVISION)+x]===0) {
                    hit=true;
                    break;
                }
                x++;
                if (x===BITMAP_GRID_DIVISION) {
                    x=0;
                    y++;
                    if (y===BITMAP_GRID_DIVISION) break;
                }
            }

                // no more open spots!

            if (!hit) break;

                // random size

            startWid=BITMAP_GRID_MIN_BLOCK_WIDTH+Math.trunc(genRandom.random()*BITMAP_GRID_EXTRA_BLOCK_WIDTH);
            if ((x+startWid)>=BITMAP_GRID_DIVISION) startWid=BITMAP_GRID_DIVISION-x;

            startHigh=BITMAP_GRID_MIN_BLOCK_HEIGHT+Math.trunc(genRandom.random()*BITMAP_GRID_EXTRA_BLOCK_HEIGHT);
            if ((y+startHigh)>=BITMAP_GRID_DIVISION) startHigh=BITMAP_GRID_DIVISION-y;

                // make sure we aren't leaving a little sliver
                // at the end

            if (((x+startWid)+BITMAP_GRID_MIN_BLOCK_WIDTH)>=BITMAP_GRID_DIVISION) startWid=BITMAP_GRID_DIVISION-x;
            if (((y+startHigh)+BITMAP_GRID_MIN_BLOCK_HEIGHT)>=BITMAP_GRID_DIVISION) startHigh=BITMAP_GRID_DIVISION-y;

                // determine what can fit

            wid=1;

            while (wid<startWid) {
                if (grid[(y*BITMAP_GRID_DIVISION)+(x+wid)]!==0) break;
                wid++;
            }

            high=1;

            while (high<startHigh) {
                if (grid[((y+high)*BITMAP_GRID_DIVISION)+x]!==0) break;
                high++;
            }

                // if segment is too small, just block off
                // the single grid item and try again

            if ((wid<BITMAP_GRID_ELIMINATE_BLOCK_MIN_WIDTH) || (high<BITMAP_GRID_ELIMINATE_BLOCK_MIN_HEIGHT)) {
                grid[(y*BITMAP_GRID_DIVISION)+x]=1;
                continue;
            }

                // create the segment and block off
                // the grid

            lft=Math.trunc(x*(cvsWid/BITMAP_GRID_DIVISION));
            top=Math.trunc(y*(cvsHigh/BITMAP_GRID_DIVISION));
            rgt=Math.trunc((x+wid)*(cvsWid/BITMAP_GRID_DIVISION));
            bot=Math.trunc((y+high)*(cvsHigh/BITMAP_GRID_DIVISION));

            segments.push(new wsRect(lft,top,rgt,bot));

            for (y2=0;y2!==high;y2++) {
                for (x2=0;x2!==wid;x2++) {
                    grid[((y+y2)*BITMAP_GRID_DIVISION)+(x+x2)]=1;
                }
            }
        }

        return(segments);
    }

        //
        // color routines
        //

    getDefaultPrimaryColor()
    {
        var col=this.primaryColorList[this.defaultPrimaryColorIdx];
        var darken=0.1-(genRandom.random()*0.2);
        
        return(new wsColor((col[0]-darken),(col[1]-darken),(col[2]-darken)));
    }
    
    getRandomColor()
    {
        var col=this.primaryColorList[genRandom.randomIndex(this.primaryColorList.length)];
        var darken=0.1-(genRandom.random()*0.2);
        
        return(new wsColor((col[0]-darken),(col[1]-darken),(col[2]-darken)));
    }
    
    darkenColor(color,darkenFactor)
    {
        return(new wsColor((color.r*darkenFactor),(color.g*darkenFactor),(color.b*darkenFactor)));
    }
    
    lightenColor(color,lightenFactor)
    {
        return(new wsColor((color.r+(color.r*lightenFactor)),(color.g+(color.g*lightenFactor)),(color.b+(color.b*lightenFactor))));
    }
    
    boostColor(color,boostAdd)
    {
        return(new wsColor((color.r+boostAdd),(color.g+boostAdd),(color.b+boostAdd)));
    }
    
    dullColor(color,dullFactor)
    {
            // find the midpoint
            
        var midPoint=(color.r+color.g+color.b)/3.0;
        
            // move towards it
            
        var r=color.r+(midPoint-color.r)*dullFactor;
        var g=color.g+(midPoint-color.g)*dullFactor;
        var b=color.b+(midPoint-color.b)*dullFactor;

        return(new wsColor(r,g,b));
    }

    colorToRGBColor(color)
    {
        var colorStr='rgb(';
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
        var colorStr='rgba(';
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
        var colorStr='rgb(';
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
        var n,f,count;
        var r,g,b,color;
        var colors=[];

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
                
                color=new wsColor(r,g,b);
            }

            colors.push(color);
        }    

        return(colors);
    }

        //
        // normal clearing
        //

    clearNormalsRect(normalCTX,lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    }

        //
        // noise routines
        //

    addNoiseRect(bitmapCTX,lft,top,rgt,bot,minDarken,maxDarken,percentage)
    {    
        if ((lft>=rgt) || (top>=bot)) return;
        
        var n,nPixel,idx;
        var col,fct;
        var wid=rgt-lft;
        var high=bot-top;    
        var darkenDif=maxDarken-minDarken;

            // get the image data to add noise to

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;

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
        if ((lft>=rgt) || (top>=bot)) return;
        
        var n,nPixel,idx;
        var wid=rgt-lft;
        var high=bot-top;    
        
        var normal;
        var normals=[this.NORMAL_LEFT_10,this.NORMAL_RIGHT_10,this.NORMAL_TOP_10,this.NORMAL_BOTTOM_10];

            // get the image data to add noise to

        var normalImgData=normalCTX.getImageData(lft,top,wid,high);
        var normalData=normalImgData.data;

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
        
    blur(bitmapCTX,lft,top,rgt,bot,blurCount)
    {
        var n,idx;
        var x,y,cx,cy,cxs,cxe,cys,cye,dx,dy;
        var r,g,b;
        var wid=rgt-lft;
        var high=bot-top;
        
        if ((wid<=0) || (high<=0)) return;
        
        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;
        
        var blurData=new Uint8ClampedArray(bitmapData.length);
        
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
                        if (dy<0) dy=high+dy;
                        if (dy>=high) dy=dy-high;
                                
                        for (cx=cxs;cx!==cxe;cx++) {
                            if ((cy===y) && (cx===x)) continue;       // ignore self
                            
                            dx=cx;
                            if (dx<0) dx=wid+dx;
                            if (dx>=wid) dx=dx-wid;

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
        var n,idx,nPixel;
        var f,fMin,fMax,fDif;

        var bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        var bitmapData=bitmapImgData.data;

        var specularImgData=specularCTX.getImageData(0,0,wid,high);
        var specularData=specularImgData.data;

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
        // channel swaps
        //
        
    swapRedToAlpha(bitmapCTX,wid,high)
    {
        var n,nPixel,idx;
        
        var bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        var bitmapData=bitmapImgData.data;
        
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

    drawRect(ctx,lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        ctx.fillStyle=this.colorToRGBColor(color);
        ctx.fillRect(lft,top,(rgt-lft),(bot-top));
    }

    draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,color,faceOut)
    {
        var n,lx,rx,ty,by;
        var colFactor,edgeColor,fillColor;

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
        var n,k,k2,add;
        var darkenFactor,darkColor;

        var wid=rgt-lft;
        var high=bot-top;

        var mx=Math.trunc((lft+rgt)/2);
        var my=Math.trunc((top+bot)/2);
        
        var sidePointCount=15;
        var totalPointCount=sidePointCount*4;

            // build the polygon

        var x=new Uint16Array(totalPointCount);
        var y=new Uint16Array(totalPointCount);
        
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
        var n,lx,rx,my,xAdd;
        var darkenFactor,darkColor;

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
        var mx,my;

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
        var mx,my,radius;

        mx=Math.trunc((lft+rgt)/2);
        my=Math.trunc((top+bot)/2);
        
        radius=Math.trunc((rgt-lft)/2);

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor);
        if (borderRGBColor!==null) bitmapCTX.strokeStyle=this.colorToRGBColor(borderRGBColor);
        
        bitmapCTX.beginPath();
        bitmapCTX.arc(mx,my,radius,0.0,(Math.PI*2));
        bitmapCTX.fill();
        if (borderRGBColor!==null) bitmapCTX.stroke();
    }

    draw3DOval(bitmapCTX,normalCTX,lft,top,rgt,bot,startArc,endArc,edgeSize,flatInnerSize,fillRGBColor,edgeRGBColor)
    {
        var n,x,y,halfWid,halfHigh;
        var rad,fx,fy,col,idx;
        
            // start and end arc
            
        startArc=Math.trunc(startArc*1000);
        endArc=Math.trunc(endArc*1000);
        if (startArc>=endArc) return;
        
            // the drawing size
            
        var orgWid=rgt-lft;
        var orgHigh=bot-top;
        var wid=orgWid-1;
        var high=orgHigh-1;         // avoids clipping on bottom from being on wid,high
        var mx=Math.trunc(wid/2);
        var my=Math.trunc(high/2);

        var bitmapImgData=bitmapCTX.getImageData(lft,top,orgWid,orgHigh);
        var bitmapData=bitmapImgData.data;

        var normalImgData=normalCTX.getImageData(lft,top,orgWid,orgHigh);
        var normalData=normalImgData.data;

        var edgeCount=edgeSize;
        
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

                    // the color pixel

                idx=((y*orgWid)+x)*4;

                bitmapData[idx]=Math.trunc(col.r*255.0);
                bitmapData[idx+1]=Math.trunc(col.g*255.0);
                bitmapData[idx+2]=Math.trunc(col.b*255.0);

                    // get a normal for the pixel change
                    // if within the flat inner circle, just point the z out
                    // otherwise calculate from radius

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

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);
        normalCTX.putImageData(normalImgData,lft,top);
    }
    
    drawLine(bitmapCTX,normalCTX,x,y,x2,y2,color,lightLine)
    {
        var horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
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
    
    drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y2,lineVariant,color,lightLine)
    {
        var n,sx,sy,ex,ey,r;
        var segCount=genRandom.randomInt(2,5);
        var horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
        var xAdd=Math.trunc((x2-x)/segCount);
        var yAdd=Math.trunc((y2-y)/segCount);
        
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

                r=10-genRandom.randomIndex(lineVariant);

                if (horizontal) {
                    ey+=r;
                }
                else {
                    ex+=r;
                }
            }
            
            this.drawLine(bitmapCTX,normalCTX,sx,sy,ex,ey,color,lightLine);
            
            sx=ex;
            sy=ey;
        }
    }
    
    drawBumpLine(bitmapCTX,normalCTX,x,y,x2,y2,wid,color)
    {
        var n;
        var halfWid=Math.trunc(wid*0.5);
        var chunkOne=Math.trunc(wid*0.33);
        var chunkTwo=Math.trunc(wid*0.66);
        
        var darkColor=this.darkenColor(color,0.9);
        
        var horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
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
        var y;
        var darkenFactor,darkColor;
        var high=bot-top;
        
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
        if ((lft>=rgt) || (top>=bot)) return;

        var n,k,px,py,idx;
        var rad,fx,fy,fsz;
        var col;

            // get the image data
            // note - particles always get the entire image
            // because they might need to wrap around edges

        var wid=rgt-lft;
        var high=bot-top;

        var bitmapImgData=bitmapCTX.getImageData(0,0,imgWid,imgHigh);
        var bitmapData=bitmapImgData.data;

        if (normalCTX!==null) {
            var normalImgData=normalCTX.getImageData(0,0,imgWid,imgHigh);
            var normalData=normalImgData.data;
        }
            // get the center
            // remember this is a clip so
            // it always starts at 0,0

        var mx=lft+Math.trunc(wid/2);
        var my=top+Math.trunc(high/2);

            // create the rings of
            // particles

        var ringWid=wid;
        var ringWidSub=Math.trunc(wid/(ringCount+1));

        var ringHigh=high;
        var ringHighSub=Math.trunc(high/(ringCount+1));

        for (n=0;n!==ringCount;n++) {

                // the density of each ring

            for (k=0;k!==pixelDensity;k++) {

                    // get a random pixel

                rad=(Math.PI*2.0)*genRandom.random();
                fx=Math.sin(rad);
                fy=Math.cos(rad);

                fsz=genRandom.random();
                px=mx+Math.trunc((fsz*ringWid)*fx);
                py=my-Math.trunc((fsz*ringHigh)*fy);

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

                    // get a normal for the pixel change

                if (normalCTX!==null) {
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
            }

                // next ring

            ringWid-=ringWidSub;
            ringHigh-=ringHighSub;
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,0,0);
        if (normalCTX!==null) normalCTX.putImageData(normalImgData,0,0);
    }
    
        //
        // streaks
        //

    drawStreakMetal(bitmapCTX,imgWid,imgHigh,x,top,bot,streakWid,baseColor)
    {
        var n,lx,rx,y,idx;
        
        if (top>=bot) return;
        if (streakWid<=0) return;
        
            // get the image data

        var bitmapImgData=bitmapCTX.getImageData(0,0,imgWid,imgHigh);
        var bitmapData=bitmapImgData.data;
        
            // start with 100 density and reduce
            // as we go across the width
            
        var density=100;
        var densityReduce=Math.trunc(90/streakWid);
        
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
        var lx,rx,xAdd,x,y,idx;
        var factor,lineDensity,dirtWidReduce;
        var wid=rgt-lft;
        var high=bot-top;
        
        if ((wid<=0) || (high<=0)) return;
        
            // get the image data

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;
        
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
        var n,sx,ex,ey;
        var dirtColorAvg;
        
            // get dirt color as ints
            
        dirtColorAvg=[Math.trunc(color.r*255.0),Math.trunc(color.g*255.0),Math.trunc(color.b*255.0)];
        
            // original streak
            
        this.drawStreakDirtSingle(bitmapCTX,lft,top,rgt,bot,reduceStreak,density,dirtColorAvg);
        
            // additional streaks
            
        for (n=0;n!=additionalStreakCount;n++) {
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
        var x,y,idx;
        var colorDif,factor,redByte,greenByte,blueByte;

            // get the image data

        var wid=rgt-lft;
        var high=bot-top;
        if ((wid<1) || (high<1)) return;

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;
        
        colorDif=new wsColor((botColor.r-topColor.r),(botColor.g-topColor.g),(botColor.b-topColor.b));

            // write the stripe

        for (y=0;y!==high;y++) {

            factor=y/high;
            
            redByte=Math.trunc((topColor.r+(colorDif.r*factor))*255.0);
            greenByte=Math.trunc((topColor.g+(colorDif.g*factor))*255.0);
            blueByte=Math.trunc((topColor.b+(colorDif.b*factor))*255.0);
            
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
        var x,y,idx;
        var color,redByte,greenByte,blueByte;
        var colors=this.createRandomColorStripeArray(factor,baseColor);

            // get the image data

        var wid=rgt-lft;
        var high=bot-top;
        if ((wid<1) || (high<1)) return;

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;

        var normalImgData=normalCTX.getImageData(lft,top,wid,high);
        var normalData=normalImgData.data;

        var nx=Math.trunc((0.10+1.0)*127.0);
        var nz=Math.trunc((0.90+1.0)*127.0);

            // write the stripe

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

                normalData[idx]=nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;

                idx+=4;
            }

            nx=-nx;
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);        
        normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeVertical(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        var x,y,idx;
        var color,redByte,greenByte,blueByte;
        var colors=this.createRandomColorStripeArray(factor,baseColor);

            // get the image data

        var wid=rgt-lft;
        var high=bot-top;
        if ((wid<1) || (high<1)) return;

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;

        var normalImgData=normalCTX.getImageData(lft,top,wid,high);
        var normalData=normalImgData.data;

        var nx=Math.trunc((0.10+1.0)*127.0);
        var nz=Math.trunc((0.90+1.0)*127.0);

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

                normalData[idx]=nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;
            }

            nx=-nx;
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);
        normalCTX.putImageData(normalImgData,lft,top);
    }

    drawColorStripeSlant(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        var x,y,idx,cIdx;
        var color;
        var colors=this.createRandomColorStripeArray(factor,baseColor);

            // get the image data

        var wid=rgt-lft;
        var high=bot-top;
        if ((wid<1) || (high<1)) return;

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;

        var normalImgData=normalCTX.getImageData(lft,top,wid,high);
        var normalData=normalImgData.data;

        var nx=Math.trunc((0.10+1.0)*127.0);
        var nz=Math.trunc((0.90+1.0)*127.0);

            // write the stripe

        for (y=0;y!==high;y++) {
            for (x=0;x!==wid;x++) {

                cIdx=(x+y)%100;
                color=colors[cIdx];
                
                idx=((y*wid)+x)*4;

                bitmapData[idx]=Math.trunc(color.r*255.0);
                bitmapData[idx+1]=Math.trunc(color.g*255.0);
                bitmapData[idx+2]=Math.trunc(color.b*255.0);

                normalData[idx]=((cIdx&0x1)===0)?nx:-nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;
            }
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);        
        normalCTX.putImageData(normalImgData,lft,top);
    }
    
    //
    // testing
    //
    
    drawUVTest(bitmapCTX,lft,top,rgt,bot)
    {
        var xMid=Math.trunc((lft+rgt)/2);
        var yMid=Math.trunc((top+bot)/2);
        
        this.drawRect(bitmapCTX,lft,top,xMid,yMid,new wsColor(1,1,0));
        this.drawRect(bitmapCTX,xMid,top,rgt,yMid,new wsColor(1,0,0));
        this.drawRect(bitmapCTX,lft,yMid,xMid,bot,new wsColor(0,1,0));
        this.drawRect(bitmapCTX,xMid,yMid,rgt,bot,new wsColor(0,0,1));
    }
}
