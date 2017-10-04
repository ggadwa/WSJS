import * as constants from '../../code/main/constants.js';

//
// map liquid list class
//

export default class MapLiquidListClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.fileCache=this.fileCache;

        this.liquids=[];

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
        //
        // clear liquid list
        //

    clear()
    {
        let n;
        let nLiquid=this.liquids.length;

        for (n=0;n!==nLiquid;n++) {
            this.liquids[n].close();
        }

        this.liquids=[];
    }

        //
        // liquid items
        //

    add(liquid)
    {
        this.liquids.push(liquid);
        return(this.liquids.length-1);
    }
    
    get(idx)
    {
        return(this.liquids[idx]);
    }
        
        //
        // setup liquid buffers
        //

    setupBuffers()
    {
        let n;
        let nLiquid=this.liquids.length;

        for (n=0;n!==nLiquid;n++) {
            this.liquids[n].setupBuffers();
        }
    }
    
        //
        // draw map liquids
        //

    draw()
    {
        let n,liquid;
        let nLiquid=this.liquids.length;
        let currentBitmap;
        let gl=this.view.gl;
        
            // change the blend
            
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        gl.depthMask(false);

        this.view.shaderList.mapLiquidShader.drawStart();

            // setup liquid drawing

        currentBitmap=null;

            // draw the liquids

        for (n=0;n!==nLiquid;n++) {
            liquid=this.liquids[n];

                // skip if not in view frustum

            if (!this.view.boundBoxInFrustum(liquid.xBound,liquid.yBound,liquid.zBound)) continue;

                // time to change bitmap

            if (liquid.bitmap!==currentBitmap) {
                currentBitmap=liquid.bitmap;
                liquid.bitmap.attachAsLiquid(this.view.shaderList.mapLiquidShader);
            }

                // draw the liquid

            liquid.updateBuffers();
            liquid.bindBuffers();
            liquid.draw();
        }
        
            // reset the blend
            
        this.view.shaderList.mapLiquidShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
    }
    
}
