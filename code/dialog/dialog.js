import SetupClass from '../main/setup.js';

export default class DialogClass
{
    constructor(core)
    {
        this.core=core;
        
        this.MODE_OPTIONS=0;
        
        this.core=core;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.runTitle=false;
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
        return(true);
    }
    
    release()
    {
    }
    
        //
        // start and stop dialog loop
        //
        
    startLoop(mode)
    {
        this.core.currentLoop=this.core.DIALOG_LOOP;
        
        this.mode=mode;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.runTick=0;
        this.drawTick=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.core.interface.resetOpenHeader();
        this.core.interface.cursor.center();
        
        this.runTitle=false;
        
        window.requestAnimationFrame(dialogMainLoop);
    }
    
    endLoopToTitle()
    {
        setTimeout(this.core.title.startLoop.bind(this.core.title),1);
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

                if (this.core.interface.cancelButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runTitle=true;
                    return;
                }
                if (this.core.interface.okButton.cursorInButton(cursor.x,cursor.y)) {
                    this.runTitle=true;
                    return;
                }
            }
        }
    }
    
        //
        // drawing
        //
        
    draw()
    {
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        this.core.interface.drawUI(true);
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
    
        // exiting to run title
        
    if (dialog.runTitle) {
        setTimeout(dialog.endLoopToTitle.bind(dialog),1);
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

