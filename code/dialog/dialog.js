import SetupClass from '../main/setup.js';

export default class DialogClass
{
    constructor(core)
    {
        this.core=core;
        
        this.CURSOR_WIDTH=32;
        this.CURSOR_HEIGHT=32;
        
        this.core=core;
        
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
    }
    
    
    /*
        //
        // scripts
        //
        
    switchTab(name)
    {
        let tabName;
        
        for (tabName of this.tabList) {
            document.getElementById('tab_'+tabName).className=(tabName===name)?'dialogTabSelected':'dialogTab';
            document.getElementById('view_'+tabName).style.display=(tabName===name)?'':'none';
        }
    }
    
        //
        // components
        //
        
    createDialog(tabArray,selectedTabIdx,buttonOnClick)
    {
        let n,name,selected;
        let x;
        let dialogDiv,tabDiv,viewDiv,buttonDiv;
        
            // save the tab array
            
        this.tabList=tabArray;
        
            // the main dialog div
            
        dialogDiv=document.createElement('div');
        dialogDiv.id='dialog';
        dialogDiv.className='dialogFrame';
        
            // the tabs
            
        x=0;
        
        for (n=0;n!==this.tabList.length;n++) {
            name=this.tabList[n];
            selected=(n===selectedTabIdx);
            
            tabDiv=document.createElement('div');
            
            tabDiv.id='tab_'+name;
            tabDiv.className=selected?'dialogTabSelected':'dialogTab';
            tabDiv.style.left=x+'px';
            tabDiv.onclick=this.switchTab.bind(this,name);

            tabDiv.appendChild(document.createTextNode(name));

                // the view
                
            viewDiv=document.createElement('div');

            viewDiv.id='view_'+name;
            viewDiv.className='dialogTabView';
            viewDiv.style.display=selected?'':'none';

                // add to html

            dialogDiv.appendChild(tabDiv);
            dialogDiv.appendChild(viewDiv);
            
            x+=this.DIALOG_TAB_WIDTH;
        }
        
            // go button
            
        buttonDiv=document.createElement('div');
        
        buttonDiv.id='go';
        buttonDiv.className='dialogGoButton';        
        buttonDiv.onclick=buttonOnClick;
        
        buttonDiv.appendChild(document.createTextNode('Go'));
        
        dialogDiv.appendChild(buttonDiv);
        
            // add dialog to body
            
        document.body.appendChild(dialogDiv);
    }
    
    removeDialog()
    {
        document.body.removeChild(document.getElementById('dialog'));
    }
    
        //
        // view panes
        //
        
    getView(name)
    {
        return(document.getElementById('view_'+name));
    }
    
    addInput(parentDiv,id,name,ctrlType,list,value,onChange)
    {
        let n;
        let rowDiv=document.createElement('div');
        let leftDiv=document.createElement('div');
        let rightDiv=document.createElement('div');
        let label=document.createElement('label');
        let input=null;
        
        rowDiv.className='dialogControlRow';
        leftDiv.className='dialogControlLeftCol';
        rightDiv.className='dialogControlRightCol';
        
        label.appendChild(document.createTextNode(name));
        label.for=id;
        label.className='dialogControlLabel';

            // text, range, and checkbox
            
        if (ctrlType!=='select') {
            input=document.createElement('input');
            input.id=id;
            input.type=ctrlType;

            switch (ctrlType) {
                case 'text':
                    input.className='dialogControlInputText';
                    input.value=value;
                    break;
                case 'range':
                    input.className='dialogControlInputRange';
                    input.value=value;
                    input.min=0;
                    input.max=100;
                    input.height='55px';
                    break;
                case 'checkbox':
                    input.className='dialogControlInputCheckbox';
                    input.checked=value;
                    break;
            }
        }
        
            // select
            
        else {
            input=document.createElement('select');
            input.id=id;
            input.className='dialogControlInputSelect';

            for (n=0;n!==list.length;n++) {
                input.add(new Option(list[n],list[n]));
            }
            
            input.selectedIndex=value;
        }
            
            // any onchange
            
        if (onChange!==null) input.onchange=onChange;
        
            // add row
            
        rowDiv.appendChild(leftDiv);
        leftDiv.appendChild(label);
        rowDiv.appendChild(rightDiv);
        rightDiv.appendChild(input);
        
        parentDiv.appendChild(rowDiv);
    }
    
    addButton(parentDiv,id,title,onClick)
    {
        let rowDiv=document.createElement('div');
        let buttonDiv=document.createElement('div');
        
        rowDiv.className='dialogControlRow';
        
        buttonDiv.id=id;
        buttonDiv.className='dialogControlButton';
        buttonDiv.onclick=onClick;
        
        buttonDiv.appendChild(document.createTextNode(title));
        
            // add row
            
        rowDiv.appendChild(buttonDiv);        
        parentDiv.appendChild(rowDiv);
    }
    
        //
        // messages
        //
        
    displayMessage(message)
    {
            // already in a message or new message
            
        if (this.messageDiv!==null) {
            clearTimeout(this.messageTimeout);
            
            this.messageDiv.innerText=message;
        }
        else {
            this.messageDiv=document.createElement('div');
            this.messageDiv.className='dialogMessage';
            
            this.messageDiv.innerText=message;
            
            document.body.appendChild(this.messageDiv);
        }
        
            // clear timeout
        
        this.messageTimeout=setTimeout(this.displayMessageClear.bind(this),5000);
    }
    
    displayMessageClear()
    {
        document.body.removeChild(this.messageDiv);
        
        this.messageDiv=null;
    }

        //
        // progress
        //
        
    startProgress()
    {
        this.progressFadeDiv=document.createElement('div');
        this.progressFrameDiv=document.createElement('div');
        this.progressDiv=document.createElement('div');
        this.progressTitleDiv=document.createElement('div');
        
        this.progressFadeDiv.className='dialogFade';
        this.progressFrameDiv.className='dialogProgressFrame';
        this.progressDiv.className='dialogProgress';
        this.progressTitleDiv.className='dialogProgressTitle';
        
        this.progressFrameDiv.appendChild(this.progressDiv);
        this.progressFrameDiv.appendChild(this.progressTitleDiv);
        this.progressFadeDiv.appendChild(this.progressFrameDiv);
        
        document.body.appendChild(this.progressFadeDiv);
    }
    
    updateProgress(percent,title)
    {
        this.progressDiv.style.width=percent+'%';
        this.progressTitleDiv.innerText=title;
    }
    
    stopProgress()
    {
        document.body.removeChild(this.progressFadeDiv);
        
        this.progressFadeDiv=null;
        this.progressFrameDiv=null;
        this.progressDiv=null;
        this.progressTitleDiv=null;
    }






*/



        //
        // initialize and release
        //
    
    async initialize()
    {
        /*
        let uvArray,indexArray;
        let lft,top,rgt,bot;
        let gl=this.core.gl;
        
            // any bitmaps
            
        this.titleBitmap=new BitmapInterfaceClass(this.core,'textures/ui_title.png');
        if (!(await this.titleBitmap.load())) return(false);
        
        this.cursorBitmap=new BitmapInterfaceClass(this.core,'textures/ui_cursor.png');
        if (!(await this.cursorBitmap.load())) return(false);
        
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
*/
        return(true);
    }
    
    release()
    {
        /*
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
        
        this.optionButton.release();
        this.playButton.release();
        
        this.titleBitmap.release();
        this.cursorBitmap.release();
             * 
         */
    }
    
        //
        // start and stop dialog loop
        //
        
    startLoop()
    {
        this.core.currentLoop=this.core.DIALOG_LOOP;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.cursorX=Math.trunc(this.core.wid*0.5);
        this.cursorY=Math.trunc(this.core.high*0.5);
        
        window.requestAnimationFrame(dialogMainLoop);
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
                /*
                if (this.optionButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runSettings=true;
                    return;
                }
                if (this.playButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runGame=true;
                    return;
                }
                     * 
                 */
            }
        }
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let cursor=this.core.interface.cursor;
        let gl=this.core.gl;
        
            // clear to black
            
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
            // only need the othro matrix for this
            
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
            // draw all the elements
            
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);            
        
        this.core.shaderList.interfaceShader.drawStart();
        
        //this.drawBitmap(this.titleBitmap,0,0,this.core.wid,this.core.high);
        //this.optionButton.draw(this.cursorX,this.cursorY);
        //this.playButton.draw(this.cursorX,this.cursorY);
        
        if (!this.core.input.hasTouch) cursor.draw();
        
        this.core.shaderList.interfaceShader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        
            // any paused text
            
        if (this.core.input.paused) this.core.interface.drawPauseMessage();
    }
    
}

//
// dialog main loop
//

const RUN_MILLISECONDS=32;
const DRAW_MILLISECONDS=32;
const BAIL_MILLISECONDS=5000;

function dialogMainLoop(timestamp)
{
    let systemTick;
    let core=window.main.core;
    let dialog=core.dialog;
    
        // loop uses it's own tick (so it
        // can be paused, etc) and calculates
        // it from the system tick
        
    systemTick=Math.trunc(window.performance.now());
    dialog.timestamp+=(systemTick-dialog.lastSystemTimestamp);
    dialog.lastSystemTimestamp=systemTick;
    
        // cursor movement
    
    dialog.runTick=dialog.timestamp-dialog.lastRunTimestamp;

    if (dialog.runTick>RUN_MILLISECONDS) {

        if (dialog.runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (dialog.runTick>RUN_MILLISECONDS) {
                dialog.runTick-=RUN_MILLISECONDS;
                dialog.lastRunTimestamp+=RUN_MILLISECONDS;

                dialog.run();
            }
        }
        else {
            dialog.lastRunTimestamp=dialog.timestamp;
        }
    }
    
        // exiting to run game
        
    if (dialog.runGame) {
        setTimeout(window.main.core.game.startLoop.bind(window.main.core.game),1);  // always force it to start on next go around
        return;
    }
    
        // drawing
        
    dialog.drawTick=dialog.timestamp-dialog.lastDrawTimestamp;
    
    if (dialog.drawTick>DRAW_MILLISECONDS) {
        dialog.lastDrawTimestamp=dialog.timestamp; 

        dialog.draw();
    }
    
        // next frame
        
    window.requestAnimationFrame(dialogMainLoop);
}

