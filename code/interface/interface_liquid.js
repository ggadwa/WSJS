import ColorClass from '../utility/color.js';
import RectClass from '../utility/rect.js';


//
// interface liquid class
//

export default class InterfaceLiquidClass
{
    constructor(core)
    {
        this.core=core;
        
        this.vertexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release
        //

    initialize()
    {
        let vertexArray;
        let gl=this.core.gl;
        
            // liquid tint vertexes
            // (two triangles so we can array draw)
            
        vertexArray=new Float32Array(2*6);
            
        vertexArray[0]=0;
        vertexArray[1]=0;
        vertexArray[2]=this.core.wid;
        vertexArray[3]=0;
        vertexArray[4]=this.core.wid;
        vertexArray[5]=this.core.high;
        
        vertexArray[6]=0;
        vertexArray[7]=0;
        vertexArray[8]=this.core.wid;
        vertexArray[9]=this.core.high;
        vertexArray[10]=0;
        vertexArray[11]=this.core.high;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        return(true);
    }

    release()
    {
        this.core.gl.deleteBuffer(this.vertexBuffer);
    }
    
        //
        // draw liquid
        //
        
    draw()
    {
        let liquidIdx,liquid;
        let player=this.core.game.map.entityList.getPlayer();
        let shader=this.core.shaderList.tintShader;
        let gl=this.core.gl;
        
            // setup tint
            
        liquidIdx=player.getUnderLiquidIndex();
        if (liquidIdx===-1) return;
        
        liquid=this.core.game.map.liquidList.liquids[liquidIdx];
        
            // draw tint
            
        shader.drawStart();
        gl.blendFunc(gl.ONE,gl.SRC_COLOR);
        
        gl.uniform4f(shader.colorUniform,liquid.tint.r,liquid.tint.g,liquid.tint.b,1.0);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the quad
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }
}
