export default class InterfaceTouchStickClass
{
    constructor(core,ringBitmapName,thumbBitmapName,ringSize)
    {
        this.TOUCH_CLICK_TICK=300;
        
        this.core=core;
        this.ringBitmapName=ringBitmapName;
        this.thumbBitmapName=thumbBitmapName;
        this.ringSize=ringSize;
        
        this.id=null;
        this.timestamp=0;
        
        this.x=0;
        this.y=0;
        this.thumbX=0;
        this.thumbY=0;
        this.show=false;
        
        this.ringRadius=Math.trunc(this.ringSize*0.5);
        this.thumbSize=Math.trunc(this.ringSize*0.4);
        this.thumbRadius=Math.trunc(this.thumbSize*0.5);
        
        this.vertexArray=new Float32Array(2*8);     // 2D, only 2 vertex coordinates, 2 quads
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
    }
    
    initialize()
    {
        let uvArray,indexArray;
        let gl=this.core.gl;
        
            // vertex buffer
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
            // always drawing two quads
            
        uvArray=new Float32Array(2*8);
        
        uvArray[0]=0;
        uvArray[1]=0;
        uvArray[2]=1;
        uvArray[3]=0;
        uvArray[4]=1;
        uvArray[5]=1;
        uvArray[6]=0;
        uvArray[7]=1;
        
        uvArray[8]=0;
        uvArray[9]=0;
        uvArray[10]=1;
        uvArray[11]=0;
        uvArray[12]=1;
        uvArray[13]=1;
        uvArray[14]=0;
        uvArray[15]=1;

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        indexArray=new Uint16Array(2*6);
        
        indexArray[0]=0;
        indexArray[1]=1;
        indexArray[2]=2;
        indexArray[3]=0;
        indexArray[4]=2;
        indexArray[5]=3;
        
        indexArray[6]=4;
        indexArray[7]=5;
        indexArray[8]=6;
        indexArray[9]=4;
        indexArray[10]=6;
        indexArray[11]=7;
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    touchDown(id,x,y)
    {
        this.id=id;
        this.x=x;
        this.y=y;
        this.thumbX=x;
        this.thumbY=y;
        
        this.timestamp=this.core.game.timestamp;
        this.show=true;
    }
    
    touchUp()
    {
        this.id=null;
        this.show=false;
        
        return((this.core.game.timestamp-this.timestamp)<=this.TOUCH_CLICK_TICK);        // return TRUE if this counts as a click
    }
    
    touchMove(x,y)
    {
        this.thumbX=x;
        this.thumbY=y;
        
        if ((this.thumbX-this.thumbRadius)<(this.x-this.ringRadius)) this.thumbX=((this.x-this.ringRadius)+this.thumbRadius);
        if ((this.thumbX+this.thumbRadius)>(this.x+this.ringRadius)) this.thumbX=((this.x+this.ringRadius)-this.thumbRadius);
        if ((this.thumbY-this.thumbRadius)<(this.y-this.ringRadius)) this.thumbY=((this.y-this.ringRadius)+this.thumbRadius);
        if ((this.thumbY+this.thumbRadius)>(this.y+this.ringRadius)) this.thumbY=((this.y+this.ringRadius)-this.thumbRadius);
    }
    
    getX()
    {
        if (!this.show) return(0);
        return((this.thumbX-this.x)/(this.ringRadius-this.thumbRadius));
    }
    
    getY()
    {
        if (!this.show) return(0);
        return((this.thumbY-this.y)/(this.ringRadius-this.thumbRadius));
    }
    
    draw()
    {
        let bitmap;
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        if (!this.show) return;
        if ((this.ringBitmapName===null) || (this.thumbBitmapName===null)) return;
        
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        
            // setup the drawing
            
        this.vertexArray[0]=this.vertexArray[6]=this.x-this.ringRadius;    // ring
        this.vertexArray[1]=this.vertexArray[3]=this.y-this.ringRadius;
        this.vertexArray[2]=this.vertexArray[4]=this.x+this.ringRadius;
        this.vertexArray[5]=this.vertexArray[7]=this.y+this.ringRadius;
        
        this.vertexArray[8]=this.vertexArray[14]=this.thumbX-this.thumbRadius;    // thumb
        this.vertexArray[9]=this.vertexArray[11]=this.thumbY-this.thumbRadius;
        this.vertexArray[10]=this.vertexArray[12]=this.thumbX+this.thumbRadius;
        this.vertexArray[13]=this.vertexArray[15]=this.thumbY+this.thumbRadius;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the outer ring
            
        bitmap=this.core.bitmapList.get(this.ringBitmapName);
        bitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
        bitmap=this.core.bitmapList.get(this.thumbBitmapName);
        bitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,(6*2));

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
    
}

