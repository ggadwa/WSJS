import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';
import InterfaceTextClass from '../interface/interface_text.js';
import DialogButtonClass from '../dialog/dialog_button.js';

export default class TitleClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.titleBitmap=null;
        
        this.optionButton=null;
        this.playButton=null;
        
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
        
        this.clickDown=false;
        
        this.runSettings=false;
        this.runGame=false;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let uvArray,indexArray;
        let lft,top,rgt,bot;
        let gl=this.core.gl;
        
            // title bitmap
            
        this.titleBitmap=new BitmapInterfaceClass(this.core,'textures/ui_title.png');
        if (!(await this.titleBitmap.load())) return(false);
        
            // buttons
            
        lft=Math.trunc(this.core.wid*0.79);
        rgt=lft+Math.trunc(this.core.wid*0.2);
        top=Math.trunc(this.core.high*0.75);
        bot=top+Math.trunc(this.core.high*0.1);
        
        this.optionButton=new DialogButtonClass(this.core,lft,top,rgt,bot,'textures/ui_button_options.png','textures/ui_button_options_highlight.png');
        if (!(await this.optionButton.initialize())) return(false);
        
        top+=Math.trunc(this.core.high*0.11);
        bot=top+Math.trunc(this.core.high*0.1);
        
        this.playButton=new DialogButtonClass(this.core,lft,top,rgt,bot,'textures/ui_button_play.png','textures/ui_button_play_highlight.png');
        if (!(await this.playButton.initialize())) return(false);
        
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
        
        this.optionButton.release();
        this.playButton.release();
        
        this.titleBitmap.release();
    }
    
        //
        // start and stop title loop
        //
        
    startLoop()
    {
        this.core.currentLoop=this.core.TITLE_LOOP;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.cursor.center();
        
        this.clickDown=false;
        
        this.runSettings=false;
        this.runGame=false;
        
        window.requestAnimationFrame(titleMainLoop);
    }
    
        //
        // running
        //
        
    run()
    {
        let cursor=this.core.interface.cursor;
        
            // mouse move cursor
            
        if (cursor.run()) {
            this.clickDown=true;
        }
        else {
            if (this.clickDown) {
                this.clickDown=false;
                
                if (this.optionButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runSettings=true;
                    return;
                }
                if (this.playButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runGame=true;
                    return;
                }
            }
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
        let cursor=this.core.interface.cursor;
        let gl=this.core.gl;
        
            // only need the othro matrix for this
            
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
            // draw all the elements
            
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);            
        
        this.core.shaderList.interfaceShader.drawStart();
        
        this.drawBitmap(this.titleBitmap,0,0,this.core.wid,this.core.high);
        this.optionButton.draw(cursor.x,cursor.y);
        this.playButton.draw(cursor.x,cursor.y);
        
        if (!this.core.input.hasTouch) cursor.draw();
        
        this.core.shaderList.interfaceShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        
            // any paused text
            
        if (this.core.input.paused) this.core.interface.drawPauseMessage();
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
    
        // exiting this loop
        // always force it to start on next go around
        
    if (title.runSettings) {
        setTimeout(window.main.core.dialog.startLoop.bind(window.main.core.dialog),1);  
        return;
    }
        
    if (title.runGame) {
        setTimeout(window.main.core.game.startLoop.bind(window.main.core.game),1);
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
