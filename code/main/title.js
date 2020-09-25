import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class TitleClass
{
    constructor(core,data)
    {
        this.CURSOR_WIDTH=32;
        this.CURSOR_HEIGHT=32;
        
        this.core=core;
        this.data=data;
        
        this.titleBitmap=null;
        this.cursorBitmap=null;
        
        this.vertexArray=new Float32Array(2*4);     // 2D, only 2 vertex coordinates
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.cursorX=0;
        this.cursorY=0;
        
        this.runGame=false;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let uvArray,indexArray;
        let gl=this.core.gl;
        
            // any bitmaps
            
        this.titleBitmap=new BitmapInterfaceClass(this.core,'textures/title.png');
        if (!(await this.titleBitmap.load())) return(false);
        
        this.cursorBitmap=new BitmapInterfaceClass(this.core,'textures/cursor.png');
        if (!(await this.cursorBitmap.load())) return(false);
        
            // vertex array
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
            // index array
            
        uvArray=new Float32Array(8);
        
        uvArray[0]=0;
        uvArray[1]=0;
        uvArray[2]=1;
        uvArray[3]=0;
        uvArray[4]=1;
        uvArray[5]=1;
        uvArray[6]=0;
        uvArray[7]=1;

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // always drawing a single quad
            
        indexArray=new Uint16Array(6);
        indexArray[0]=0;
        indexArray[1]=1;
        indexArray[2]=2;
        indexArray[3]=0;
        indexArray[4]=2;
        indexArray[5]=3;
        
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
        
        if (this.titleBitmap!==null) this.titleBitmap.release();
        if (this.cursorBitmap!==null) this.cursorBitmap.release();
    }
    
        //
        // start and stop title loop
        //
        
    startTitleLoop()
    {
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.cursorX=Math.trunc(this.core.wid*0.5);
        this.cursorY=Math.trunc(this.core.high*0.5);
        
        this.runGame=false;
        
        window.requestAnimationFrame(titleMainLoop);
    }
    
        //
        // click events
        //
        
        //
        // running
        //
        
    run()
    {
        let input=this.core.input;
        
        this.cursorX+=input.getMouseMoveX();
        if (this.cursorX<0) this.cursorX=0;
        if (this.cursorX>=this.core.wid) this.cursorX=this.core.wid-1;
        
        this.cursorY+=input.getMouseMoveY();
        if (this.cursorY<0) this.cursorY=0;
        if (this.cursorY>=this.core.high) this.cursorY=this.core.high-1;
        
        if (input.mouseButtonFlags[0]) {
            this.runGame=true;
        }
    }
    
        //
        // drawing
        //
        
    drawBitmap(bitmap,lft,top,rgt,bot)
    {
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        
            // setup the drawing
            
        this.vertexArray[0]=this.vertexArray[6]=lft;
        this.vertexArray[1]=this.vertexArray[3]=top;
        this.vertexArray[2]=this.vertexArray[4]=rgt;
        this.vertexArray[5]=this.vertexArray[7]=bot;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the button
            
        bitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

    draw()
    {
        let gl=this.core.gl;
        
            // only need the othro matrix for this
            
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
            // draw all the elements
            
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);            
        
        this.core.shaderList.interfaceShader.drawStart();
        
        this.drawBitmap(this.titleBitmap,0,0,this.core.wid,this.core.high);
        this.drawBitmap(this.cursorBitmap,this.cursorX,this.cursorY,(this.cursorX+this.CURSOR_WIDTH),(this.cursorY+this.CURSOR_HEIGHT));
        
        this.core.shaderList.interfaceShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
}

//
// title main loop
//

const RUN_MILLISECONDS=32;
const DRAW_MILLISECONDS=32;
const BAIL_MILLISECONDS=5000;

function titleMainLoop(timestamp)
{
    let systemTick;
    let core=window.main.core;
    let title=core.title;
    
        // loop uses it's own tick (so it
        // can be paused, etc) and calculates
        // it from the system tick
        
    systemTick=Math.trunc(window.performance.now());
    title.timestamp+=(systemTick-title.lastSystemTimestamp);
    title.lastSystemTimestamp=systemTick;
    
        // cursor movement
    
    title.runTick=title.timestamp-title.lastRunTimestamp;

    if (title.runTick>RUN_MILLISECONDS) {

        if (title.runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (title.runTick>RUN_MILLISECONDS) {
                title.runTick-=RUN_MILLISECONDS;
                title.lastRunTimestamp+=RUN_MILLISECONDS;

                title.run();
            }
        }
        else {
            title.lastRunTimestamp=title.timestamp;
        }
    }
    
        // exiting to run game
        
    if (title.runGame) {
        setTimeout(window.main.core.game.startGameLoop.bind(window.main.core.game),1);  // always force it to start on next go around
        return;
    }
    
        // drawing
        
    title.drawTick=title.timestamp-title.lastDrawTimestamp;
    
    if (title.drawTick>DRAW_MILLISECONDS) {
        title.lastDrawTimestamp=title.timestamp; 

        title.draw();
    }
    
        // next frame
        
    window.requestAnimationFrame(titleMainLoop);
}
