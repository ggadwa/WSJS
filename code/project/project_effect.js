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
    
    addBitmap(name)
    {
        this.view.bitmapList.add(name,true);
    }
    
    getBitmap(name)
    {
        return(this.view.bitmapList.get(name));
    }
    
    addBillboardQuadToGLList(centerPnt,u,v,uSize,vSize,halfWid,halfHigh,vIdx,vertices,uvIdx,uvs,iIdx,indexes,elementIdx)
    {
            // top left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        vertices[vIdx++]=this.tempPoint.x+centerPnt.x;
        vertices[vIdx++]=this.tempPoint.y+centerPnt.y;
        vertices[vIdx++]=this.tempPoint.z+centerPnt.z;

        uvs[uvIdx++]=u;
        uvs[uvIdx++]=v;

            // top right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        vertices[vIdx++]=this.tempPoint.x+centerPnt.x;
        vertices[vIdx++]=this.tempPoint.y+centerPnt.y;
        vertices[vIdx++]=this.tempPoint.z+centerPnt.z;

        uvs[uvIdx++]=u+uSize;
        uvs[uvIdx++]=v;

            // bottom right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        vertices[vIdx++]=this.tempPoint.x+centerPnt.x;
        vertices[vIdx++]=this.tempPoint.y+centerPnt.y;
        vertices[vIdx++]=this.tempPoint.z+centerPnt.z;

        uvs[uvIdx++]=u+uSize;
        uvs[uvIdx++]=v+vSize;

            // bottom left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardXMatrix);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.view.billboardYMatrix);

        vertices[vIdx++]=this.tempPoint.x+centerPnt.x;
        vertices[vIdx++]=this.tempPoint.y+centerPnt.y;
        vertices[vIdx++]=this.tempPoint.z+centerPnt.z;

        uvs[uvIdx++]=u;
        uvs[uvIdx++]=v+vSize;

            // build the triangles

        indexes[iIdx++]=elementIdx;     // triangle 1
        indexes[iIdx++]=elementIdx+1;
        indexes[iIdx++]=elementIdx+2;

        indexes[iIdx++]=elementIdx;     // triangle 2
        indexes[iIdx++]=elementIdx+2;
        indexes[iIdx++]=elementIdx+3;
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
