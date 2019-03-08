import PointClass from '../utility/point.js';

export default class ProjectEffectClass
{
    constructor(view,map,position,data)
    {
        this.view=view;
        this.map=map;
        this.position=position;
        this.data=data;
        
        this.show=true;
        
        this.billboardQuadVertexes=null;
        this.billboardQuadUVs=null;
        this.billboardQuadIndexes=null;
        
        this.billboardQuadVertexIdx=0;
        this.billboardQuadUVIdx=0;
        this.billboardQuadIndexIdx=0;
        
        this.tempPoint=new PointClass(0,0,0);
    }
    
    initialize()
    {
        this.show=true;
        
        return(true);
    }
    
    release()
    {
    }
    
    addBitmap(colorURL,normalURL,specularURL,specularFactor,glowURL)
    {
        this.view.bitmapList.add(colorURL,normalURL,specularURL,specularFactor,glowURL,null);
    }
    
    getBitmap(colorURL)
    {
        return(this.view.bitmapList.get(colorURL));
    }
    
        //
        // utilities to build billboarded quads
        // mostly used for effects
        //
        
    startBillboardQuads(vertexes,uvs,indexes)
    {
        this.billboardQuadVertexes=vertexes;
        this.billboardQuadUVs=uvs;
        this.billboardQuadIndexes=indexes;
        
        this.billboardQuadVertexIdx=0;
        this.billboardQuadUVIdx=0;
        this.billboardQuadIndexIdx=0;
    }
    
    addBillboardQuad(centerPnt,u,v,uSize,vSize,halfWid,halfHigh,rot)
    {
        let elementIdx=Math.trunc(this.billboardQuadVertexIdx/3);
        
            // top left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.billboardQuadUVs[this.billboardQuadUVIdx++]=u;
        this.billboardQuadUVs[this.billboardQuadUVIdx++]=v;

            // top right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.billboardQuadUVs[this.billboardQuadUVIdx++]=u+uSize;
        this.billboardQuadUVs[this.billboardQuadUVIdx++]=v;

            // bottom right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.billboardQuadUVs[this.billboardQuadUVIdx++]=u+uSize;
        this.billboardQuadUVs[this.billboardQuadUVIdx++]=v+vSize;

            // bottom left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.billboardQuadVertexes[this.billboardQuadVertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.billboardQuadUVs[this.billboardQuadUVIdx++]=u;
        this.billboardQuadUVs[this.billboardQuadUVIdx++]=v+vSize;

            // build the triangles

        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx;     // triangle 1
        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx+1;
        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx+2;

        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx;     // triangle 2
        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx+2;
        this.billboardQuadIndexes[this.billboardQuadIndexIdx++]=elementIdx+3;
    }
    
        //
        // override this if the effect projects and
        // light.  Return a lightclass (type to precalc if you
        // can.)  Default retuns NULL, which means no light
        //
        
    getLight()
    {
        return(null);
    }
    
        //
        // override this for any draw setup, after this isInView
        // is called to check to see if effect is in view, and then
        // it's draw with a call to draw()
        // 
        
    drawSetup()
    {
    }
    
        //
        // override this to return TRUE if effect is in
        // view, the default is TRUE, you should always
        // override this to improve performance
        //
        
    isInView()
    {
        return(true);
    }
    
        //
        // override this to draw the effect into
        // the frame
        //
        
    draw()
    {
    }
}
