"use strict";

//
// generate bitmap utility class
//

function GenBitmapUtilityObject(genRandom)
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

        // random generator

    this.genRandom=genRandom;

        //
        // segmenting routines
        //

    this.createStackedSegments=function(cvsWid,cvsHigh)
    {
        var x,y;
        var lft,top;
        var halfBrick;
        var segments=[];

        var xCount=BITMAP_STACKED_X_MIN_COUNT+Math.trunc(this.genRandom.random()*BITMAP_STACKED_X_EXTRA_COUNT);
        var wid=Math.trunc(cvsWid/xCount);
        var halfWid=Math.trunc(wid/2);

        var yCount=BITMAP_STACKED_Y_MIN_COUNT+Math.trunc(this.genRandom.random()*BITMAP_STACKED_Y_EXTRA_COUNT);
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
    };

    this.createRandomSegments=function(cvsWid,cvsHigh)
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

            startWid=BITMAP_GRID_MIN_BLOCK_WIDTH+Math.trunc(this.genRandom.random()*BITMAP_GRID_EXTRA_BLOCK_WIDTH);
            if ((x+startWid)>=BITMAP_GRID_DIVISION) startWid=BITMAP_GRID_DIVISION-x;

            startHigh=BITMAP_GRID_MIN_BLOCK_HEIGHT+Math.trunc(this.genRandom.random()*BITMAP_GRID_EXTRA_BLOCK_HEIGHT);
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
    };

        //
        // color routines
        //

    this.getRandomColor=function(colorMin,colorMax)
    {
        var r=colorMin[0]+((colorMax[0]-colorMin[0])*this.genRandom.random());
        var g=colorMin[1]+((colorMax[1]-colorMin[1])*this.genRandom.random());
        var b=colorMin[2]+((colorMax[2]-colorMin[2])*this.genRandom.random());
        
        return(new wsColor(r,g,b));
    };
    
    this.getRandomPrimaryColor=function(min,max)
    {
        var r,g,b;
        var value=min+((max-min)*this.genRandom.random());
        
        switch (this.genRandom.randomIndex(6)) {
            case 0:
                r=1.0;
                g=value;
                b=value;
                break;
            case 1:
                r=value;
                g=1.0;
                b=value;
                break;
            case 2:
                r=value;
                g=value;
                b=1.0;
                break;
            case 3:
                r=1.0;
                g=1.0;
                b=value;
                break;
            case 4:
                r=1.0;
                g=value;
                b=1.0;
                break;
            case 5:
                r=value;
                g=1.0;
                b=1.0;
                break;
        }
        
        return(new wsColor(r,g,b));
    };

    this.getRandomGreyColor=function(greyMin,greyMax)
    {
        var r=greyMin+((greyMax-greyMin)*this.genRandom.random());
        return(new wsColor(r,r,r));
    };
    
    this.getRandomBlueColor=function(greyMin,greyMax)
    {
        var r=greyMin+((greyMax-greyMin)*this.genRandom.random());
        var b=r+0.5;
        if (b>1.0) b=1.0;
        return(new wsColor(r,r,b));
    };

    this.darkenColor=function(color,darkenFactor)
    {
        return(new wsColor((color.r*darkenFactor),(color.g*darkenFactor),(color.b*darkenFactor)));
    };
    
    this.boostColor=function(color,boostAdd)
    {
        return(new wsColor((color.r+boostAdd),(color.g+boostAdd),(color.b+boostAdd)));
    };

    this.colorToRGBColor=function(color)
    {
        var colorStr='rgb(';
        colorStr+=Math.trunc(color.r*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.g*255.0);
        colorStr+=',';
        colorStr+=Math.trunc(color.b*255.0);
        colorStr+=')';

        return(colorStr);
    };
    
    this.colorToRGBAColor=function(color,alpha)
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
    };

    this.normalToRGBColor=function(normal)
    {
        var colorStr='rgb(';
        colorStr+=Math.trunc((normal.x+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.trunc((normal.y+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.trunc((normal.z+1.0)*127.0);
        colorStr+=')';

        return(colorStr);
    };

    this.createRandomColorStripeArray=function(factor,baseColor)
    {
        var n,f,count;
        var r,g,b,color;
        var colors=[];

            // make stripes of varying sizes and colors

        count=0;

        for (n=0;n!==100;n++) {
            count--;

            if (count<=0) {
                count=1+Math.trunc(this.genRandom.random()*3);

                f=1.0+((1.0-(this.genRandom.random()*2.0))*factor);

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
    };

        //
        // normal clearing
        //

    this.clearNormalsRect=function(normalCTX,lft,top,rgt,bot)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        normalCTX.fillRect(lft,top,(rgt-lft),(bot-top));
    };

        //
        // noise routines
        //

    this.addNoiseRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,minDarken,maxDarken,percentage)
    {    
        if ((lft>=rgt) || (top>=bot)) return;
        
            // currently not using the normalCTX, might in the future

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

            if (this.genRandom.randomPercentage(percentage)) {

                    // the bitmap noise

                fct=minDarken+(darkenDif*this.genRandom.random());

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
    };
    
        //
        // blur routines
        //
        
    this.blur=function(bitmapCTX,lft,top,rgt,bot,blurCount)
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
                    
                    r=Math.trunc(r/8);
                    g=Math.trunc(g/8);
                    b=Math.trunc(b/8);

                    idx=((y*wid)+x)*4;

                    blurData[idx]=r;
                    blurData[idx+1]=g;
                    blurData[idx+2]=b;
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
    };

        //
        // specular routines
        //

    this.createSpecularMap=function(bitmapCTX,specularCTX,wid,high,contrastFactor,brightnessAdd)
    {
        var n,idx,nPixel;
        var f;

        var bitmapImgData=bitmapCTX.getImageData(0,0,wid,high);
        var bitmapData=bitmapImgData.data;

        var specularImgData=specularCTX.getImageData(0,0,wid,high);
        var specularData=specularImgData.data;

        idx=0;
        nPixel=wid*high;

        for (n=0;n!==nPixel;n++) {

                // get max color

            f=bitmapData[idx];
            if (bitmapData[idx+1]>f) f=bitmapData[idx+1];
            if (bitmapData[idx+2]>f) f=bitmapData[idx+2];

            f/=255.0;

                // calculate the contrast + brightness

            f=(((f-0.5)*contrastFactor)+0.5)+brightnessAdd;
            if (f<0.0) f=0.0;
            if (f>1.0) f=1.0;

                // write to specular

            f*=255.0;

            specularData[idx]=f;
            specularData[idx+1]=f;
            specularData[idx+2]=f;
            specularData[idx+3]=0xFF;

                // next pixel

            idx+=4;
        }

        specularCTX.putImageData(specularImgData,0,0);
    };

        //
        // rectangles, ovals, lines
        //

    this.drawRect=function(ctx,lft,top,rgt,bot,color)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        ctx.fillStyle=this.colorToRGBColor(color);
        ctx.fillRect(lft,top,(rgt-lft),(bot-top));
    };

    this.draw3DRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor,faceOut)
    {
        var n,lx,rx,ty,by;
        var darkenFactor,darkColor;

            // draw the edges

        lx=lft;
        rx=rgt;
        ty=top;
        by=bot;

        for (n=0;n!==edgeSize;n++) {
            darkenFactor=(((n+1)/edgeSize)*0.5)+0.5;
            darkColor=this.darkenColor(edgeRGBColor,darkenFactor);
            bitmapCTX.strokeStyle=this.colorToRGBColor(darkColor);

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

            // draw the inner fill

        this.drawRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),fillRGBColor);

        this.clearNormalsRect(normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize));
    };

    this.draw3DComplexRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
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
        
        add=this.genRandom.randomInt(5,5);
        x[0]+=add;
        y[0]+=add;
        add*=0.5;
        x[1]+=add;
        y[1]+=add;
        x[(sidePointCount*4)-1]+=add;
        y[(sidePointCount*4)-1]+=add;
        
        add=this.genRandom.randomInt(5,5);
        x[sidePointCount]-=add;
        y[sidePointCount]+=add;
        add*=0.5;
        x[sidePointCount-1]-=add;
        y[sidePointCount-1]+=add;
        x[sidePointCount+1]-=add;
        y[sidePointCount+1]+=add;

        add=this.genRandom.randomInt(5,5);
        x[sidePointCount*2]-=add;
        y[sidePointCount*2]-=add;
        add*=0.5;
        x[(sidePointCount*2)-1]-=add;
        y[(sidePointCount*2)-1]-=add;
        x[(sidePointCount*2)+1]-=add;
        y[(sidePointCount*2)+1]-=add;

        add=this.genRandom.randomInt(5,5);
        x[sidePointCount*3]+=add;
        y[sidePointCount*3]-=add;
        add*=0.5;
        x[(sidePointCount*3)-1]+=add;
        y[(sidePointCount*3)-1]-=add;
        x[(sidePointCount*3)+1]+=add;
        y[(sidePointCount*3)+1]-=add;

            // randomize it

        for (n=0;n!==totalPointCount;n++) {
            add=this.genRandom.randomIndex(5);
            x[n]+=(x[n]<mx)?add:-add;
            add=this.genRandom.randomIndex(5);
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
    };

    this.draw3DOval=function(bitmapCTX,normalCTX,lft,top,rgt,bot,startArc,endArc,edgeSize,flatInnerSize,fillRGBColor,edgeRGBColor)
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
    };
    
    this.drawLine=function(bitmapCTX,normalCTX,x,y,x2,y2,color)
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
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-1));
                normalCTX.lineTo(x2,(y2-1));
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+1));
                normalCTX.lineTo(x2,(y2+1));
                normalCTX.stroke();
            }
            else {
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x-1),y);
                normalCTX.lineTo((x2-1),y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x+1),y);
                normalCTX.lineTo((x2+1),y2);
                normalCTX.stroke();
            }
        }
    };
    
    this.drawRandomLine=function(bitmapCTX,normalCTX,x,y,x2,y2,lineVariant,color)
    {
        var n,sx,sy,ex,ey,r;
        var segCount=this.genRandom.randomInt(2,5);
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

                r=10-this.genRandom.randomIndex(lineVariant);

                if (horizontal) {
                    ey+=r;
                }
                else {
                    ex+=r;
                }
            }
            
            this.drawLine(bitmapCTX,normalCTX,sx,sy,ex,ey,color);
            
            sx=ex;
            sy=ey;
        }
    };
    
    this.drawBumpLine=function(bitmapCTX,normalCTX,x,y,x2,y2,color)
    {
        var n;
        var horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
            // the bump line
            
        bitmapCTX.strokeStyle=this.colorToRGBColor(color);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x,y);
        bitmapCTX.lineTo(x2,y2);
        bitmapCTX.stroke();
        
        normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
        
        normalCTX.beginPath();
        normalCTX.moveTo(x,y);
        normalCTX.lineTo(x2,y2);
        normalCTX.stroke();
        
            // fade of bump
            
        for (n=0;n!==4;n++) {
            if (horizontal) {
                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-n));
                normalCTX.lineTo(x2,(y2-n));
                normalCTX.stroke();
            }
            else {
                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x-n),y);
                normalCTX.lineTo((x2-n),y2);
                normalCTX.stroke();
            }
        }
        
        for (n=0;n!==4;n++) {
            if (horizontal) {
                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+n));
                normalCTX.lineTo(x2,(y2+n));
                normalCTX.stroke();
            }
            else {
                normalCTX.strokeStyle=this.normalToRGBColor((n===0)?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x+n),y);
                normalCTX.lineTo((x2+n),y2);
                normalCTX.stroke();
            }
        }
    };
    
        //
        // particles
        //

    this.drawParticle=function(bitmapCTX,normalCTX,imgWid,imgHigh,lft,top,rgt,bot,ringCount,darkenFactor,pixelDensity,flipNormals)
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

        var normalImgData=normalCTX.getImageData(0,0,imgWid,imgHigh);
        var normalData=normalImgData.data;

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

                rad=(Math.PI*2.0)*this.genRandom.random();
                fx=Math.sin(rad);
                fy=Math.cos(rad);

                fsz=this.genRandom.random();
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

        bitmapCTX.putImageData(bitmapImgData,0,0);
        normalCTX.putImageData(normalImgData,0,0);
    };
    
        //
        // streaks
        //

    this.drawStreakVertical=function(bitmapCTX,imgWid,imgHigh,x,top,bot,streakWid,baseColor)
    {
        var n,lx,rx,y,idx;
        
        if (top>=bot) return;
        
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
                
                if (this.genRandom.randomInt(0,100)<density) {
                    idx=((y*imgWid)+lx)*4;
                    bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                    bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                    bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                }
                
                if (this.genRandom.randomInt(0,100)<density) {
                    idx=((y*imgWid)+rx)*4;
                    bitmapData[idx]=Math.trunc(baseColor.r*255.0);
                    bitmapData[idx+1]=Math.trunc(baseColor.g*255.0);
                    bitmapData[idx+2]=Math.trunc(baseColor.b*255.0);
                }
            
            }
            
            density-=densityReduce;
        }
        
            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,0,0);
    };
    
        //
        // gradients
        //

    this.drawColorStripeHorizontal=function(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
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
            redByte=Math.trunc(color.r*256.0);
            greenByte=Math.trunc(color.g*256.0);
            blueByte=Math.trunc(color.b*256.0);

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
    };

    this.drawColorStripeVertical=function(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
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
            redByte=Math.trunc(color.r*256.0);
            greenByte=Math.trunc(color.g*256.0);
            blueByte=Math.trunc(color.b*256.0);

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
    };

    this.drawColorStripeSlant=function(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
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

                bitmapData[idx]=Math.trunc(color.r*256.0);
                bitmapData[idx+1]=Math.trunc(color.g*256.0);
                bitmapData[idx+2]=Math.trunc(color.b*256.0);

                normalData[idx]=((cIdx&0x1)===0)?nx:-nx;
                normalData[idx+1]=127.0;
                normalData[idx+2]=nz;
            }
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);        
        normalCTX.putImageData(normalImgData,lft,top);
    };
    
    //
    // testing
    //
    
    this.drawUVTest=function(bitmapCTX,lft,top,rgt,bot)
    {
        var xMid=Math.trunc((lft+rgt)/2);
        var yMid=Math.trunc((top+bot)/2);
        
        this.drawRect(bitmapCTX,lft,top,xMid,yMid,new wsColor(1,1,0));
        this.drawRect(bitmapCTX,xMid,top,rgt,yMid,new wsColor(1,0,0));
        this.drawRect(bitmapCTX,lft,yMid,xMid,bot,new wsColor(0,1,0));
        this.drawRect(bitmapCTX,xMid,yMid,rgt,bot,new wsColor(0,0,1));
    };

}
