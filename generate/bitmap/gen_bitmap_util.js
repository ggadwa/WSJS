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
    
    this.NORMAL_CLEAR=[-1.0,-1.0,1.0];
    
    this.NORMAL_LEFT_45=[-0.60,0.02,0.70];
    this.NORMAL_RIGHT_45=[0.60,-0.02,0.70];
    this.NORMAL_TOP_45=[-0.02,0.60,0.70];
    this.NORMAL_BOTTOM_45=[0.02,-0.60,0.70];
    
    this.NORMAL_LEFT_10=[-0.90,-1.0,0.95];
    this.NORMAL_RIGHT_10=[-0.95,-1.0,0.90];
    this.NORMAL_TOP_10=[-1.0,-0.95,0.90];
    this.NORMAL_BOTTOM_10=[-1.0,-0.90,0.95];

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
        var color=new Float32Array(3);

        color[0]=colorMin[0]+((colorMax[0]-colorMin[0])*this.genRandom.random());
        color[1]=colorMin[1]+((colorMax[1]-colorMin[1])*this.genRandom.random());
        color[2]=colorMin[2]+((colorMax[2]-colorMin[2])*this.genRandom.random());
        return(color);
    };

    this.getRandomGreyColor=function(greyMin,greyMax)
    {
        var color=new Float32Array(3);
        var r=greyMin+((greyMax-greyMin)*this.genRandom.random());

        color[0]=color[1]=color[2]=r;
        return(color);
    };

    this.darkenColor=function(color,darkenFactor)
    {
        var darkColor=new Float32Array(3);
        darkColor[0]=color[0]*darkenFactor;
        darkColor[1]=color[1]*darkenFactor;
        darkColor[2]=color[2]*darkenFactor;

        return(darkColor);
    };

    this.colorToRGBColor=function(color,darkenFactor)
    {
        var colorStr='rgb(';
        colorStr+=Math.floor((color[0]*255.0)*darkenFactor);
        colorStr+=',';
        colorStr+=Math.floor((color[1]*255.0)*darkenFactor);
        colorStr+=',';
        colorStr+=Math.floor((color[2]*255.0)*darkenFactor);
        colorStr+=')';

        return(colorStr);
    };

    this.normalToRGBColor=function(normal)
    {
        var colorStr='rgb(';
        colorStr+=Math.floor((normal[0]+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.floor((normal[1]+1.0)*127.0);
        colorStr+=',';
        colorStr+=Math.floor((normal[2]+1.0)*127.0);
        colorStr+=')';

        return(colorStr);
    };

    this.createRandomColorStripeArray=function(factor,baseColor)
    {
        var n,f,count;
        var redCol,greenCol,blueCol,cIdx;
        var colors=new Float32Array(100*3);

            // make stripes of varying sizes and colors

        cIdx=0;
        count=0;

        for (n=0;n!==100;n++) {
            count--;

            if (count<=0) {
                count=1+Math.floor(this.genRandom.random()*3);

                f=1.0+((1.0-(this.genRandom.random()*2.0))*factor);

                redCol=baseColor[0]*f;
                if (redCol<0.0) redCol=0.0;
                if (redCol>1.0) redCol=1.0;

                greenCol=baseColor[1]*f;
                if (greenCol<0.0) greenCol=0.0;
                if (greenCol>1.0) greenCol=1.0;

                blueCol=baseColor[2]*f;
                if (blueCol<0.0) blueCol=0.0;
                if (blueCol>1.0) blueCol=1.0;
            }

            colors[cIdx++]=redCol;
            colors[cIdx++]=greenCol;
            colors[cIdx++]=blueCol;
        }    

        return(colors);
    };

        //
        // normal clearing
        //

    this.clearNormalsRect=function(ctx,lft,top,rgt,bot)
    {
        this.drawRect(ctx,lft,top,rgt,bot,this.normalToRGBColor(this.NORMAL_CLEAR));
    };

        //
        // noise routines
        //

    this.addNoiseRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,minDarken,maxDarken,percentage)
    {    
        if ((lft>=rgt) || (top>=bot)) return;
        
            // currently not using the normalCTX, might in the future

        var n,nPixel,idx;
        var col,fct,randNormal;
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

    this.createSpecularMap=function(bitmapCTX,specularCTX,wid,high,specularFactor)
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

                // add in the contrast

            f=((f-0.5)*specularFactor)+f;
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

    this.drawRect=function(ctx,lft,top,rgt,bot,rgbColor)
    {
        if ((lft>=rgt) || (top>=bot)) return;

        ctx.fillStyle=rgbColor;
        ctx.fillRect(lft,top,(rgt-lft),(bot-top));
    };

    this.draw3DRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        var n,lx,rx,ty,by;
        var darkenFactor;

            // draw the edges

        lx=lft;
        rx=rgt;
        ty=top;
        by=bot;

        for (n=0;n!==edgeSize;n++) {
            darkenFactor=(((n+1)/edgeSize)*0.5)+0.5;
            bitmapCTX.strokeStyle=this.colorToRGBColor(edgeRGBColor,darkenFactor);

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

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_LEFT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,ty);
            normalCTX.lineTo(lx,by);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_RIGHT_45);
            normalCTX.beginPath();
            normalCTX.moveTo(rx,ty);
            normalCTX.lineTo(rx,by);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_TOP_45);
            normalCTX.beginPath();
            normalCTX.moveTo(lx,ty);
            normalCTX.lineTo(rx,ty);
            normalCTX.stroke();

            normalCTX.strokeStyle=this.normalToRGBColor(this.NORMAL_BOTTOM_45);
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

        this.drawRect(bitmapCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),this.colorToRGBColor(fillRGBColor,1.0));

        this.drawRect(normalCTX,(lft+edgeSize),(top+edgeSize),(rgt-edgeSize),(bot-edgeSize),this.normalToRGBColor([-1.0,-1.0,1.0]));
    };

    this.draw3DComplexRect=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        var n,k,k2,add,darkenFactor;

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
            bitmapCTX.strokeStyle=this.colorToRGBColor(edgeRGBColor,darkenFactor);

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

            // and the fill

        bitmapCTX.fillStyle=this.colorToRGBColor(fillRGBColor,1.0);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x[0],y[0]);

        for (k=1;k!==40;k++) {
            bitmapCTX.lineTo(x[k],y[k]);
        }

        bitmapCTX.fill();
    };

    this.draw3DOval=function(bitmapCTX,normalCTX,lft,top,rgt,bot,edgeSize,fillRGBColor,edgeRGBColor)
    {
        var n,x,y,halfWid,halfHigh;
        var rad,fx,fy,col,idx;

        var orgWid=rgt-lft;
        var wid=orgWid;
        var high=bot-top;   
        var mx=Math.floor(wid/2);
        var my=Math.floor(high/2);

        var bitmapImgData=bitmapCTX.getImageData(lft,top,wid,high);
        var bitmapData=bitmapImgData.data;

        var normalImgData=normalCTX.getImageData(lft,top,wid,high);
        var normalData=normalImgData.data;

        var edgeCount=edgeSize;

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

                fy=Math.cos(rad);
                y=my-Math.floor(halfHigh*fy);

                    // the color pixel

                idx=((y*orgWid)+x)*4;

                bitmapData[idx]=Math.floor(col[0]*255.0);
                bitmapData[idx+1]=Math.floor(col[1]*255.0);
                bitmapData[idx+2]=Math.floor(col[2]*255.0);

                    // get a normal for the pixel change

                normalData[idx]=(fx+1.0)*127.0;
                normalData[idx+1]=(fy+1.0)*127.0;
                normalData[idx+2]=(0.5+1.0)*127.0;        // just so we remember that we are focing the Z back to top
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
            
        bitmapCTX.fillStyle=this.colorToRGBColor(color,1.0);

        bitmapCTX.beginPath();
        bitmapCTX.moveTo(x,y);
        bitmapCTX.lineTo(x2,y2);
        bitmapCTX.stroke();
        
            // smoothing
            
        bitmapCTX.fillStyle=this.colorToRGBColor(color,1.5);

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
                normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_TOP_10);
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y-1));
                normalCTX.lineTo(x2,(y2-1));
                normalCTX.stroke();
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.beginPath();
                normalCTX.moveTo(x,(y+1));
                normalCTX.lineTo(x2,(y2+1));
                normalCTX.stroke();
            }
            else {
                normalCTX.fillStyle=this.normalToRGBColor(this.NORMAL_LEFT_10);
                normalCTX.beginPath();
                normalCTX.moveTo((x-1),y);
                normalCTX.lineTo((x2-1),y2);
                normalCTX.stroke();
                normalCTX.beginPath();
                normalCTX.moveTo(x,y);
                normalCTX.lineTo(x2,y2);
                normalCTX.stroke();
                normalCTX.beginPath();
                normalCTX.moveTo((x+1),y);
                normalCTX.lineTo((x2+1),y2);
                normalCTX.stroke();
            }
        }
    };
    
    this.drawRandomLine=function(bitmapCTX,normalCTX,x,y,x2,y2,color)
    {
        var n,sx,sy,ex,ey,r;
        var segCount=this.genRandom.randomInt(2,5);
        var horizontal=Math.abs(x2-x)>Math.abs(y2-y);
        
        var xAdd=Math.floor((x2-x)/segCount);
        var yAdd=Math.floor((y2-y)/segCount);
        
        sx=x;
        sy=y;
        
        for (n=0;n!==segCount;n++) {
            ex=sx+xAdd;
            ey=sy+yAdd;
            
            r=10-this.genRandom.randomInt(0,20);
            
            if (horizontal) {
                ey+=r;
            }
            else {
                ex+=r;
            }
            
            this.drawLine(bitmapCTX,normalCTX,sx,sy,ex,ey,color);
            
            sx=ex;
            sy=ey;
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
        // gradients
        //

    this.drawColorStripeHorizontal=function(bitmapCTX,normalCTX,lft,top,rgt,bot,factor,baseColor)
    {
        var x,y,idx,cIdx;
        var redByte,greenByte,blueByte;
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

            cIdx=(y%100)*3;
            redByte=Math.floor(colors[cIdx]*256.0);
            greenByte=Math.floor(colors[cIdx+1]*256.0);
            blueByte=Math.floor(colors[cIdx+2]*256.0);

            idx=(y*wid)*4;

            for (x=0;x!==wid;x++) {
                bitmapData[idx]=redByte;
                bitmapData[idx+1]=greenByte;
                bitmapData[idx+2]=blueByte;

                normalData[idx]=nx;
                normalData[idx+1]=0;
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
        var x,y,idx,cIdx;
        var redByte,greenByte,blueByte;
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

            cIdx=(x%100)*3;
            redByte=Math.floor(colors[cIdx]*256.0);
            greenByte=Math.floor(colors[cIdx+1]*256.0);
            blueByte=Math.floor(colors[cIdx+2]*256.0);

            for (y=0;y!==high;y++) {
                idx=((y*wid)+x)*4;
                bitmapData[idx]=redByte;
                bitmapData[idx+1]=greenByte;
                bitmapData[idx+2]=blueByte;

                normalData[idx]=nx;
                normalData[idx+1]=0;
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

                cIdx=((x+y)%100)*3;
                idx=((y*wid)+x)*4;

                bitmapData[idx]=Math.floor(colors[cIdx]*256.0);
                bitmapData[idx+1]=Math.floor(colors[cIdx+1]*256.0);
                bitmapData[idx+2]=Math.floor(colors[cIdx+2]*256.0);

                normalData[idx]=((cIdx&0x1)===0)?nx:-nx;
                normalData[idx+1]=0;
                normalData[idx+2]=nz;
            }
        }

            // write all the data back

        bitmapCTX.putImageData(bitmapImgData,lft,top);        
        normalCTX.putImageData(normalImgData,lft,top);
    };

}
