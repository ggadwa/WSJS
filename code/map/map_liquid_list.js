import PointClass from '../utility/point.js';

//
// map liquid list class
//

export default class MapLiquidListClass
{
    constructor(core)
    {
        this.core=core;

        this.liquids=[];
        
        this.tempEyePoint=new PointClass(0,0,0);

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
        // determine which point a liquid is in
        //
        
    getLiquidForPoint(pnt)
    {
        let n,liquid;
        
        for (n=0;n!==this.liquids.length;n++) {
            liquid=this.liquids[n];
            
            if ((pnt.x<liquid.xBound.min) || (pnt.x>liquid.xBound.max)) continue;
            if ((pnt.y<liquid.yBound.min) || (pnt.y>liquid.yBound.max)) continue;
            if ((pnt.z<liquid.zBound.min) || (pnt.z>liquid.zBound.max)) continue;
            
            return(n);
        }
        
        return(-1);
    }
    
    getLiquidForEyePoint(pnt,eyeOffset)
    {
        this.tempEyePoint.setFromValues(pnt.x,(pnt.y+eyeOffset),pnt.z);
        return(this.getLiquidForPoint(this.tempEyePoint));
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
        let shader=this.core.shaderList.mapMeshShader;
        let gl=this.core.gl;
        
            // change the blend
            
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        gl.depthMask(false);

        shader.drawStart();

            // setup liquid drawing

        currentBitmap=null;

            // draw the liquids

        for (n=0;n!==nLiquid;n++) {
            liquid=this.liquids[n];

                // skip if not in view frustum

            if (!this.core.game.boundBoxInFrustum(liquid.xBound,liquid.yBound,liquid.zBound)) continue;

                // time to change bitmap

            if (liquid.bitmap!==currentBitmap) {
                currentBitmap=liquid.bitmap;
                liquid.bitmap.attach(shader);
            }

                // draw the liquid

            liquid.updateBuffers();
            liquid.bindBuffers();
            liquid.draw();
        }
        
            // reset the blend
            
        shader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
    }
    
}
