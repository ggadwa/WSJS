import ColorClass from '../utility/color.js';
import RectClass from '../../../code/utility/rect.js';
import InterfaceHitClass from '../interface/interface_hit.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceCountClass from '../interface/interface_count.js';
import InterfaceTextClass from '../interface/interface_text.js';
import TouchStickClass from '../interface/interface_touch_stick.js';

//
// interface liquid class
//

export default class InterfaceLiquidClass
{
    constructor(core)
    {
        this.core=core;
        
        this.liquidTintVertexArray=new Float32Array(2*6);     // 2D, only 2 vertex coordinates
        this.liquidTintVertexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release
        //

    initialize()
    {
        let gl=this.core.gl;
        
            // liquid tint vertexes
            // (two triangles so we can array draw)
            
        this.liquidTintVertexArray[0]=0;
        this.liquidTintVertexArray[1]=0;
        this.liquidTintVertexArray[2]=this.core.wid;
        this.liquidTintVertexArray[3]=0;
        this.liquidTintVertexArray[4]=this.core.wid;
        this.liquidTintVertexArray[5]=this.core.high;
        
        this.liquidTintVertexArray[6]=0;
        this.liquidTintVertexArray[7]=0;
        this.liquidTintVertexArray[8]=this.core.wid;
        this.liquidTintVertexArray[9]=this.core.high;
        this.liquidTintVertexArray[10]=0;
        this.liquidTintVertexArray[11]=this.core.high;
            
        this.liquidTintVertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.liquidTintVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.liquidTintVertexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        return(true);
    }

    release()
    {
        this.core.gl.deleteBuffer(this.liquidTintVertexBuffer);
    }
    
        //
        // draw liquid
        //
        
    draw()
    {
        let liquidIdx,liquid;
        let player=this.core.map.entityList.getPlayer();
        let shader=this.core.shaderList.tintShader;
        let gl=this.core.gl;
        
            // setup tint
            
        liquidIdx=player.getUnderLiquidIndex();
        if (liquidIdx===-1) return;
        
        liquid=this.core.map.liquidList.liquids[liquidIdx];
        
            // draw tint
            
        gl.blendFunc(gl.ONE,gl.SRC_COLOR);
        
        shader.drawStart();
        
        gl.uniform4f(shader.colorUniform,liquid.tint.r,liquid.tint.g,liquid.tint.b,1.0);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.liquidTintVertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the quad
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }
}
