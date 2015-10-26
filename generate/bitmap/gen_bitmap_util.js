"use strict";

//
// generate bitmap utility class
//

function GenBitmapUtilityObject(genRandom)
{
        // constants
        
    this.STACKED_X_MIN_COUNT=1;
    this.STACKED_X_EXTRA_COUNT=4;
    this.STACKED_Y_MIN_COUNT=3;
    this.STACKED_Y_EXTRA_COUNT=4;

    this.GRID_DIVISION=100;
    this.GRID_MIN_BLOCK_WIDTH=30;
    this.GRID_EXTRA_BLOCK_WIDTH=10;
    this.GRID_ELIMINATE_BLOCK_MIN_WIDTH=20;
    this.GRID_MIN_BLOCK_HEIGHT=10;
    this.GRID_EXTRA_BLOCK_HEIGHT=15;
    this.GRID_ELIMINATE_BLOCK_MIN_HEIGHT=10;
    
        // normals
    
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

        var xCount=this.STACKED_X_MIN_COUNT+Math.floor(this.genRandom.random()*this.STACKED_X_EXTRA_COUNT);
        var wid=Math.floor(cvsWid/xCount);
        var halfWid=Math.floor(wid/2);

        var yCount=this.STACKED_Y_MIN_COUNT+Math.floor(this.genRandom.random()*this.STACKED_Y_EXTRA_COUNT);
        var high=Math.floor(cvsHigh/yCount);

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

        var grid=new Uint16Array(this.GRID_DIVISION*this.GRID_DIVISION);

            // start making the segments

        while (true) {

                // find first open spot

            x=y=0;
            hit=false;

            while (true) {
                if (grid[(y*this.GRID_DIVISION)+x]===0) {
                    hit=true;
                    break;
                }
                x++;
                if (x===this.GRID_DIVISION) {
                    x=0;
                    y++;
                    if (y===this.GRID_DIVISION) break;
                }
            }

                // no more open spots!

            if (!hit) break;

                // random size

            startWid=this.GRID_MIN_BLOCK_WIDTH+Math.floor(this.genRandom.random()*this.GRID_EXTRA_BLOCK_WIDTH);
            if ((x+startWid)>=this.GRID_DIVISION) startWid=this.GRID_DIVISION-x;

            startHigh=this.GRID_MIN_BLOCK_HEIGHT+Math.floor(this.genRandom.random()*this.GRID_EXTRA_BLOCK_HEIGHT);
            if ((y+startHigh)>=this.GRID_DIVISION) startHigh=this.GRID_DIVISION-y;

                // make sure we aren't leaving a little sliver
                // at the end

            if (((x+startWid)+this.GRID_MIN_BLOCK_WIDTH)>=this.GRID_DIVISION) startWid=this.GRID_DIVISION-x;
            if (((y+startHigh)+this.GRID_MIN_BLOCK_HEIGHT)>=this.GRID_DIVISION) startHigh=this.GRID_DIVISION-y;

                // determine what can fit

            wid=1;

            while (wid<startWid) {
                if (grid[(y*this.GRID_DIVISION)+(x+wid)]!==0) break;
                wid++;
            }

            high=1;

            while (high<startHigh) {
                if (grid[((y+high)*this.GRID_DIVISION)+x]!==0) break;
                high++;
            }

                // if segment is too small, just block off
                // the single grid item and try again

            if ((wid<this.GRID_ELIMINATE_BLOCK_MIN_WIDTH) || (high<this.GRID_ELIMINATE_BLOCK_MIN_HEIGHT)) {
                grid[(y*this.GRID_DIVISION)+x]=1;
                continue;
            }

                // create the segment and block off
                // the grid

            lft=Math.floor(x*(cvsWid/this.GRID_DIVISION));
            top=Math.floor(y*(cvsHigh/this.GRID_DIVISION));
            rgt=Math.floor((x+wid)*(cvsWid/this.GRID_DIVISION));
            bot=Math.floor((y+high)*(cvsHigh/this.GRID_DIVISION));

            segments.push(new wsRect(lft,top,rgt,bot));

            for (y2=0;y2!==high;y2++) {
                for (x2=0;x2!==wid;x2++) {
                    grid[((y+y2)*this.GRID_DIVISION)+(x+x2)]=1;
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

    this.getRandomGreyColor=function(greyMin,greyMax)
    {
        var r=greyMin+((greyMax-greyMin)*this.genRandom.random());
        return(new wsColor(r,r,r));
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
        colorStr+=Math.floor(color.r*255.0);
        colorStr+=',';
        colorStr+=Math.floor(color.g*255.0);
        colorStr+=',';
        colorStr+=Math.floor(color.b*255.0);
        colorStr+=')';

        return(colorStr);
    };
    
    this.colorToRGBAColor=function(color,alpha)
    {
        var colorStr='rgba(';
        colorStr+=Math.floor(color.r*255.0);
        colorStr+=',';
        colorStr+=Math.floor(color.g*255.0);
        colorStr+=',';
        colorStr+=Math.floor(color.b*255.0);
        colorStr+=',';
        colorStr+=Math.floor(alpha*255.0);
        colorStr+=')';

        return(colorStr);
    };

    this.normalToRGBColor=function(normal)
    {
        var colorStr='rgb(';
        colorStr+=Math.floor((normal.x+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.floor((normal.y+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.floor((normal.z+1.0)*127.0);
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
                count=1+Math.floor(this.genRandom.random()*3);

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

            if (this.genRandom.random()<=percentage) {

                    // the bitmap noise

                fct=minDarken+(darkenDif*this.genRandom.random());

                    // darken the pixel

                col=(bitmapData[idx]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx]=Math.floor(col*255.0);

                col=(bitmapData[idx+1]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx+1]=Math.floor(col*255.0);

                col=(bitmapData[idx+2]/255.0)*fct;
                if (col>1.0) col=1.0;
                bitmapData[idx+2]=Math.floor(col*255.0);
            }

                // next pixel

            idx+=4;
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

        var mx=Math.floor((lft+rgt)/2);
        var my=Math.floor((top+bot)/2);

            // build the polygon

        var x=new Uint16Array(40);
        var y=new Uint16Array(40);

        for (n=0;n!==10;n++) {
            add=Math.floor((wid/10)*n);
            x[n]=lft+add;
            y[n]=top;
            x[n+20]=rgt-add;
            y[n+20]=bot;
        }

        for (n=0;n!==10;n++) {
            add=Math.floor((high/10)*n);
            x[n+10]=rgt;
            y[n+10]=top+add;
            x[n+30]=lft;
            y[n+30]=bot-add;
        }

            // randomize it

        for (n=0;n!==40;n++) {
            add=this.genRandom.randomInt(0,10);
            x[n]+=(x[n]<mx)?add:-add;
            add=this.genRandom.randomInt(0,10);
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

            for (k=1;k!==40;k++) {
                bitmapCTX.lineTo(x[k],y[k]);
            }

            bitmapCTX.lineTo(x[0],y[0]);
            bitmapCTX.stroke();

                // the normals

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
            normalCTX.beginPath();

            for (k=0;k!==10;k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_45);
            normalCTX.beginPath();

            for (k=10;k!==20;k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
            normalCTX.beginPath();

            for (k=20;k!==30;k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_45);
            normalCTX.beginPath();

            for (k=30;k!==40;k++) {
                normalCTX.moveTo(x[k],y[k]);
                k2=k+1;
                if (k2===40) k2=0;
                normalCTX.lineTo(x[k2],y[k2]);
            }

            normalCTX.stroke();

                // reduce polygon

            for (k=0;k!==40;k++) {
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

        for (k=1;k!==40;k++) {
            bitmapCTX.lineTo(x[k],y[k]);
        }

        bitmapCTX.fill();
        
        normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_CLEAR);

        normalCTX.beginPath();
        normalCTX.moveTo(x[0],y[0]);

        for (k=1;k!==40;k++) {
            normalCTX.lineTo(x[k],y[k]);
        }

        normalCTX.fill();
    };

    this.draw3DOval=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,flatInnerSize,fillRGBColor,edgeRGBColor)
    {
        var n,x,y,halfWid,halfHigh;
        var rad,fx,fy,col,idx;

        var orgWid=rgt-lft;
        var orgHigh=bot-top;
        var wid=orgWid-1;
        var high=orgHigh-1;         // avoids clipping on bottom from being on wid,high
        var mx=Math.floor(wid/2);
        var my=Math.floor(high/2);

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

            for (n=0;n!==1000;n++) {
                rad=(Math.PI*2.0)*(n/1000.0);

                fx=Math.sin(rad);
                x=mx+Math.floor(halfWid*fx);
                if (x<0) x=0;

                fy=Math.cos(rad);
                y=my-Math.floor(halfHigh*fy);
                if (y<0) y=0;

                    // the color pixel

                idx=((y*orgWid)+x)*4;

                bitmapData[idx]=Math.floor(col.r*255.0);
                bitmapData[idx+1]=Math.floor(col.g*255.0);
                bitmapData[idx+2]=Math.floor(col.b*255.0);

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
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_10);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-1));
                normalCTX.lineTo(x2,(y2-1));
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_10);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+1));
                normalCTX.lineTo(x2,(y2+1));
                normalCTX.stroke();
            }
            else {
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_10);
                normalCTX.beginPath();
                normalCTX.moveTo((x-1),y);
                normalCTX.lineTo((x2-1),y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_CLEAR);
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_10);
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
        
        var xAdd=Math.floor((x2-x)/segCount);
        var yAdd=Math.floor((y2-y)/segCount);
        
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

                r=10-this.genRandom.randomInt(0,lineVariant);

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
            
        for (n=1;n!==4;n++) {
            if (horizontal) {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,(y-n));
                bitmapCTX.lineTo(x2,(y2-n));
                bitmapCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor((n!==1)?this.NORMAL_TOP_10:this.NORMAL_TOP_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-n));
                normalCTX.lineTo(x2,(y2-n));
                normalCTX.stroke();
            }
            else {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo((x-n),y);
                bitmapCTX.lineTo((x2-n),y2);
                bitmapCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor((n!==1)?this.NORMAL_LEFT_10:this.NORMAL_LEFT_45);
                normalCTX.beginPath();
                normalCTX.moveTo((x-n),y);
                normalCTX.lineTo((x2-n),y2);
                normalCTX.stroke();
            }
        }
        
        for (n=1;n!==4;n++) {
            if (horizontal) {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo(x,(y+n));
                bitmapCTX.lineTo(x2,(y2+n));
                bitmapCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor((n!==1)?this.NORMAL_BOTTOM_10:this.NORMAL_BOTTOM_45);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+n));
                normalCTX.lineTo(x2,(y2+n));
                normalCTX.stroke();
            }
            else {
                bitmapCTX.beginPath();
                bitmapCTX.moveTo((x+n),y);
                bitmapCTX.lineTo((x2+n),y2);
                bitmapCTX.stroke();
                normalCTX.strokeStyle=this.normalToRGBColor((n!==1)?this.NORMAL_RIGHT_10:this.NORMAL_RIGHT_45);
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

        var mx=lft+Math.floor(wid/2);
        var my=top+Math.floor(high/2);

            // create the rings of
            // particles

        var ringWid=wid;
        var ringWidSub=Math.floor(wid/(ringCount+1));

        var ringHigh=high;
        var ringHighSub=Math.floor(high/(ringCount+1));

        for (n=0;n!==ringCount;n++) {

                // the density of each ring

            for (k=0;k!==pixelDensity;k++) {

                    // get a random pixel

                rad=(Math.PI*2.0)*this.genRandom.random();
                fx=Math.sin(rad);
                fy=Math.cos(rad);

                fsz=this.genRandom.random();
                px=mx+Math.floor((fsz*ringWid)*fx);
                py=my-Math.floor((fsz*ringHigh)*fy);

                    // this can wrap

                if (px<0) px+=imgWid;
                if (px>=imgWid) px-=imgWid;
                if (py<0) py+=imgHigh;
                if (py>=imgHigh) py-=imgHigh;

                    // read the pixel and darken it

                idx=((py*imgWid)+px)*4;

                col=(bitmapData[idx]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx]=Math.floor(col*255.0);

                col=(bitmapData[idx+1]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx+1]=Math.floor(col*255.0);

                col=(bitmapData[idx+2]/255.0)*darkenFactor;
                if (col>1.0) col=1.0;
                bitmapData[idx+2]=Math.floor(col*255.0);

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
        var densityReduce=Math.floor(90/streakWid);
        
            // write the streaks
            
        for (n=0;n!==streakWid;n++) {
            
            lx=x-n;
            rx=x+n;
            
            for (y=top;y!==bot;y++) {
                
                if (this.genRandom.randomInt(0,100)<density) {
                    idx=((y*imgWid)+lx)*4;
                    bitmapData[idx]=Math.floor(baseColor.r*255.0);
                    bitmapData[idx+1]=Math.floor(baseColor.g*255.0);
                    bitmapData[idx+2]=Math.floor(baseColor.b*255.0);
                }
                
                if (this.genRandom.randomInt(0,100)<density) {
                    idx=((y*imgWid)+rx)*4;
                    bitmapData[idx]=Math.floor(baseColor.r*255.0);
                    bitmapData[idx+1]=Math.floor(baseColor.g*255.0);
                    bitmapData[idx+2]=Math.floor(baseColor.b*255.0);
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

        var nx=Math.floor((0.10+1.0)*127.0);
        var nz=Math.floor((0.90+1.0)*127.0);

            // write the stripe

        for (y=0;y!==high;y++) {

            color=colors[y%100];
            redByte=Math.floor(color.r*256.0);
            greenByte=Math.floor(color.g*256.0);
            blueByte=Math.floor(color.b*256.0);

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

        var nx=Math.floor((0.10+1.0)*127.0);
        var nz=Math.floor((0.90+1.0)*127.0);

            // write the stripe

        for (x=0;x!==wid;x++) {

            color=colors[x%100];
            redByte=Math.floor(color.r*256.0);
            greenByte=Math.floor(color.g*256.0);
            blueByte=Math.floor(color.b*256.0);

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

        var nx=Math.floor((0.10+1.0)*127.0);
        var nz=Math.floor((0.90+1.0)*127.0);

            // write the stripe

        for (y=0;y!==high;y++) {
            for (x=0;x!==wid;x++) {

                cIdx=(x+y)%100;
                color=colors[cIdx];
                
                idx=((y*wid)+x)*4;

                bitmapData[idx]=Math.floor(color.r*256.0);
                bitmapData[idx+1]=Math.floor(color.g*256.0);
                bitmapData[idx+2]=Math.floor(color.b*256.0);

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
        var xMid=Math.floor((lft+rgt)/2);
        var yMid=Math.floor((top+bot)/2);
        
        this.drawRect(bitmapCTX,lft,top,xMid,yMid,new wsColor(1,1,0));
        this.drawRect(bitmapCTX,xMid,top,rgt,yMid,new wsColor(1,0,0));
        this.drawRect(bitmapCTX,lft,yMid,xMid,bot,new wsColor(0,1,0));
        this.drawRect(bitmapCTX,xMid,yMid,rgt,bot,new wsColor(0,0,1));
    };

}
