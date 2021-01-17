import SetupClass from '../main/setup.js';
import DialogTabClass from '../dialog/dialog_tab.js';
import DialogButtonClass from '../dialog/dialog_button.js';
import DialogControlTextClass from '../dialog/dialog_control_text.js';
import DialogControlCheckboxClass from '../dialog/dialog_control_checkbox.js';
import DialogControlRangeClass from '../dialog/dialog_control_range.js';
import DialogControlListClass from '../dialog/dialog_control_list.js';
import DialogControlCharacterPickerClass from '../dialog/dialog_control_character_picker.js';

export default class DialogBaseClass
{
    constructor(core)
    {
        this.core=core;
        
        this.DIALOG_CONTROL_TOP_MARGIN=50;
        this.DIALOG_CONTROL_MARGIN=5;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
                
        this.tabs=new Map();
        this.controls=new Map();
        this.buttons=new Map();
        
        this.clickDown=false;
        this.selectedTabId=null;
        this.defButtonId=null;
        
        this.currentTextInputControl=null;      // current text input in dialog
        
        // no seal, base class
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        this.tabs.clear();
        this.controls.clear();
        this.buttons.clear();
        
        this.clickDown=false;
        this.selectedTabId=null;
        this.defButtonId=null;
        
        return(true);
    }
    
    release()
    {
        let tab,control,button;
        
            // tabs
            
        for (tab of this.tabs.values()) {
            tab.release();
        }
        
            // controls
            
        for (control of this.controls.values()) {
            control.release();
        }
        
            // buttons
            
        for (button of this.buttons.values()) {
            button.release();
        }
    }
    
        //
        // dialog tabs
        //
        
    addDialogTab(id,title,selectedTab)
    {
        let tab;
        
        tab=new DialogTabClass(this.core,this.tabs.size,title);
        tab.initialize();
        this.tabs.set(id,tab);
        
        if (selectedTab) this.selectedTabId=id;
    }
    
        //
        // dialog controls
        //
        
    addDialogControlText(dialog,tabId,id,x,y,title)
    {
        let control,high;
        
        control=new DialogControlTextClass(this.core,dialog,tabId,x,y,title);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
    
    addDialogControlCheckbox(dialog,tabId,id,x,y,title)
    {
        let control,high;
        
        control=new DialogControlCheckboxClass(this.core,dialog,tabId,x,y,title);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
    
    addDialogControlRange(dialog,tabId,id,x,y,title)
    {
        let control,high;
        
        control=new DialogControlRangeClass(this.core,dialog,tabId,x,y,title);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
    
    addDialogControlList(dialog,tabId,id,x,y,title,list)
    {
        let control,high;
        
        control=new DialogControlListClass(this.core,dialog,tabId,x,y,title,list);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
    
    addDialogControlCharacterPicker(dialog,tabId,id,x,y)
    {
        let control,high;
        
        control=new DialogControlCharacterPickerClass(this.core,dialog,tabId,x,y);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
    
    setDialogControl(id,value)
    {
        this.controls.get(id).value=value;
    }
    
    getDialogControl(id)
    {
        return(this.controls.get(id).value);
    }
    
    loadDialogControls()
    {
    }
    
    saveDialogControls()
    {
    }
    
        //
        // dialog buttons
        //
        
    addDialogButton(id,x,y,wid,high,title,defButton)
    {
        let button;
        
        button=new DialogButtonClass(this.core,x,y,wid,high,title);
        button.initialize();
        this.buttons.set(id,button);
        
        if (defButton) this.defButtonId=id;
    }
    
    setDialogButtonShow(id,show)
    {
        return(this.buttons.get(id).show=show);
    }
    
        //
        // start and stop dialog loop
        //
        
    startLoop()
    {
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.clickDown=false;
        
            // stop music/looping sounds
            
        this.core.audio.musicStop();
        this.core.audio.soundPauseAllLooping();
        
            // prepare the dialog
            
        this.loadDialogControls();
        this.core.cursor.center();
        this.core.input.keyClear();
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.clickDown=false;
    }
    
        //
        // running
        //
        
    runInternal()
    {
        let key,tab,control,button,show;
        
            // keyboard
            
        if (this.currentTextInputControl!==null) {
            key=this.core.input.keyGetLastRaw();
            if (key!==null) {

                if (key.toLowerCase()==='enter') return(this.defButtonId);   // enter key can exit dialog
                
                if (key.toLowerCase()==='backspace') {
                    if (this.currentTextInputControl.value.length>0) {
                        this.currentTextInputControl.value=this.currentTextInputControl.value.substring(0,(this.currentTextInputControl.value.length-1));
                    }
                    return(null);
                }

                if (key.length>1) return(null);

                if (((key>='a') && (key<='z')) || ((key>='A') && (key<='Z')) || ((key>='0') && (key<='9'))) {
                    this.currentTextInputControl.value+=key;
                    return(null);
                }
            }
        }

            // mouse clicking
            
        if (this.core.cursor.run()) {
            this.clickDown=true;
            return(null);
        }
        
        if (!this.clickDown) return(null);
        this.clickDown=false;

            // tabs

        for ([key,tab] of this.tabs) {
            if (tab.cursorInTab()) {
                this.core.audio.soundStartUI(this.core.title.clickSound);
                this.selectedTabId=key;
                return(null);
            }
        }
        
            // controls

        show=false;

        for ([key,control] of this.controls) {
            if (control.tabId!==this.selectedTabId) continue;
            
            if (control.click()) {
                this.core.audio.soundStartUI(this.core.title.selectSound);
                return(null);
            }
        }

            // buttons

        for ([key,button] of this.buttons) {
            if (button.cursorInButton()) {
                this.core.audio.soundStartUI(this.core.title.clickSound);
                return(key);
            }
        }
        
        return(null);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let key,tab,control,button,show;
        let gl=this.core.gl;
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.canvas.width,this.core.canvas.height,-1.0,1.0);
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // NOTE: These set shaders on each draw because
            // we don't need the speed boost here and UI has
            // multiple different shaders
        
            // background
         
        this.core.background.draw(true);
        
            // tabs
            
        for ([key,tab] of this.tabs) {
            tab.draw(key===this.selectedTabId);
        }
                    
            // controls
   
        show=false;

        for ([key,control] of this.controls) {
            if (control.tabId===this.selectedTabId) control.draw();
        }
       
            // buttons
            
        for ([key,button] of this.buttons) {
            button.draw();
        }
        
            // cursor
        
        if (!this.core.input.hasTouch) this.core.cursor.draw();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // loop
        //
        
    loop()
    {
        const RUN_MILLISECONDS=32;
        const DRAW_MILLISECONDS=32;
        const BAIL_MILLISECONDS=5000;

        let systemTick,runTick;

            // loop uses it's own tick (so it
            // can be paused, etc) and calculates
            // it from the system tick

        systemTick=Math.trunc(window.performance.now());
        this.timestamp+=(systemTick-this.lastSystemTimestamp);
        this.lastSystemTimestamp=systemTick;

            // cursor movement

        runTick=this.timestamp-this.lastRunTimestamp;

        if (runTick>RUN_MILLISECONDS) {

            if (runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (runTick>RUN_MILLISECONDS) {
                    runTick-=RUN_MILLISECONDS;
                    this.lastRunTimestamp+=RUN_MILLISECONDS;

                    if (!this.run()) return;        // returns false when changing loop
                }
            }
            else {
                this.lastRunTimestamp=this.timestamp;
            }
        }

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 
            this.draw();
        }
    }

}
