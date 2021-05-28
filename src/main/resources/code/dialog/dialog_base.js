import SetupClass from '../main/setup.js';
import DialogTabClass from '../dialog/dialog_tab.js';
import DialogButtonClass from '../dialog/dialog_button.js';
import DialogControlStaticClass from '../dialog/dialog_control_static.js';
import DialogControlTextClass from '../dialog/dialog_control_text.js';
import DialogControlCheckboxClass from '../dialog/dialog_control_checkbox.js';
import DialogControlRangeClass from '../dialog/dialog_control_range.js';
import DialogControlListClass from '../dialog/dialog_control_list.js';
import DialogControlCharacterPickerClass from '../dialog/dialog_control_character_picker.js';
import DialogControlKeyboardClass from '../dialog/dialog_control_keyboard.js';

export default class DialogBaseClass
{
    constructor(core)
    {
        this.core=core;
        
        this.DIALOG_CONTROL_TOP_MARGIN=55;
        this.DIALOG_CONTROL_BOTTOM_MARGIN=10;
        this.DIALOG_CONTROL_LEFT_MARGIN=10;
        this.DIALOG_CONTROL_RIGHT_MARGIN=10;
        this.DIALOG_BUTTON_MARGIN=10;
        
        this.DIALOG_CONTROL_MARGIN=5;
        this.DIALOG_BUTTON_SMALL_WIDTH=150;
        this.DIALOG_BUTTON_LARGE_WIDTH=250;
        this.DIALOG_BUTTON_HIGH=40;
        
        this.PICKER_SIZE=128;           // needs to be outside so dialogs can calc some stuff
        
        this.MAX_TEXT_LENGTH=32;
        
        this.LEGAL_TEXT_CHARACTERS=' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890._-/';
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
                
        this.tabs=new Map();
        this.controls=new Map();
        this.buttons=new Map();
        
        this.currentMouseDown=false;
        this.selectedTabId=null;
        this.defButtonId=null;
        
        this.pickerMode=false;
        this.pickerControlId=null;
        this.pickerControlAllowBlank=false;
        
        this.currentTextInputControl=null;      // current text input in dialog
        this.currentClickingControlKey=null;    // current control being clicked
        
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
        
        this.currentMouseDown=false;
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
        
    addDialogControlStatic(dialog,tabId,id,x,y)
    {
        let control,high;
        
        control=new DialogControlStaticClass(this.core,dialog,tabId,x,y);
        high=control.initialize();
        this.controls.set(id,control);
        
        return(high+this.DIALOG_CONTROL_MARGIN);
    }
        
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
    
    addDialogControlKeyboard(dialog,tabId,id,x,y)
    {
        let control,high;
        
        control=new DialogControlKeyboardClass(this.core,dialog,tabId,x,y);
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
        
        this.currentMouseDown=false;
        
        this.currentClickingControlKey=null;
        
            // stop music/looping sounds
            
        this.core.audio.ambientStop();
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
        
        this.currentMouseDown=false;
    }
    
        //
        // special add for keyboard controls
        //
        
    addCharacterToTextInputValue(id,key)
    {
        let control;
        
        control=this.controls.get(id);
        
            // < represents delete
          
        if (key==='<') {
            if (control.value.length>0) control.value=control.value.substring(0,(control.value.length-1));
            return;
        }
        
            // everything else is a regular key
            
        control.value+=key;
        if (control.value.length>this.MAX_TEXT_LENGTH) control.value=control.value.substring(0,this.MAX_TEXT_LENGTH);
    }
    
        //
        // running
        //
        
    runInternal()
    {
        let key,tab,control,button;
        let hadKey,mouseDown,mouseUp;
        
            // keyboard
            
        if (this.currentTextInputControl!==null) {
            
            hadKey=false;
            
            while (true) {
                key=this.core.input.keyGetLastRaw();
                if (key===null) break;
                
                hadKey=true;

                if (key.toLowerCase()==='enter') return(this.defButtonId);   // enter key can exit dialog
                
                if (key.toLowerCase()==='backspace') {
                    if (this.currentTextInputControl.value.length>0) {
                        this.currentTextInputControl.value=this.currentTextInputControl.value.substring(0,(this.currentTextInputControl.value.length-1));
                    }
                    continue;
                }
                
                if (key.length===1) {
                    if (this.LEGAL_TEXT_CHARACTERS.indexOf(key)!==-1) {
                        this.currentTextInputControl.value+=key;
                        if (this.currentTextInputControl.value.length>this.MAX_TEXT_LENGTH) this.currentTextInputControl.value=this.currentTextInputControl.value.substring(0,this.MAX_TEXT_LENGTH);
                    }
                }
            }
            
            if (hadKey) return(null);
        }

            // cursor clicking
            
        mouseDown=false;
        mouseUp=false;
        
        if (this.core.cursor.run()) {
            this.currentMouseDown=true;
            mouseDown=true;
        }
        else {
            if (this.currentMouseDown) {
                this.currentMouseDown=false;
                mouseUp=true;
            }
        }
        
            // are we currently clicking in a control
            
        if (this.currentClickingControlKey!==null) {
            
            control=this.controls.get(this.currentClickingControlKey);
            
                // dragging
                
            if (mouseDown) {
                control.clickDrag();
                return(null);
            }
            
                // mouse going up?
                
            if (mouseUp) {
                key=this.currentClickingControlKey;
                this.currentClickingControlKey=null;
                
                if (control.clicked()) {
                   this.core.audio.soundStartUI(this.core.title.selectSound);
                   this.currentTextInputControl=(control instanceof DialogControlTextClass)?control:null;
                   this.core.input.keyClearLastRaw();
                   return(key);
                }
                
                return(null);
            }
        }

            // tabs

        if ((!this.pickerMode) && (this.currentClickingControlKey===null) && (mouseUp)) {
            for ([key,tab] of this.tabs) {
                if (tab.cursorIn()) {
                    this.core.audio.soundStartUI(this.core.title.clickSound);
                    this.selectedTabId=key;
                    this.currentTextInputControl=null;
                    this.core.input.keyClearLastRaw();
                    return(null);
                }
            }
        }
        
            // controls

        if (mouseDown) {
            for ([key,control] of this.controls) {
                
                    // if no touch, skip any keyboard controls
                    
                if (control instanceof DialogControlKeyboardClass) {
                    if (!this.core.input.hasTouch) continue;
                }

                    // is this control in this tab?

                if (!this.pickerMode) {
                    if (control.tabId===null) continue;
                    if (control.tabId!==this.selectedTabId) continue;
                }
                else {
                    if (control.tabId!==null) continue;
                }

                    // are we in the control?

                if (control.cursorIn()) {
                    this.currentClickingControlKey=key;
                    return(null);
                }
            }
        }
        
            // buttons

        if ((!this.pickerMode) && (this.currentClickingControlKey===null) && (mouseUp)) {
            for ([key,button] of this.buttons) {
                if (!button.show) continue;

                if (button.cursorIn()) {
                    this.core.audio.soundStartUI(this.core.title.clickSound);
                    this.currentTextInputControl=null;
                    this.core.input.keyClearLastRaw();
                    return(key);
                }
            }
        }
        
        return(null);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let key,tab,control,button;
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
         
        if (!this.pickerMode) {
            for ([key,tab] of this.tabs) {
                tab.draw((key===this.selectedTabId),(tab.cursorIn()&&(this.currentClickingControlKey===null)));
            }
        }
        
            // controls
   
        for ([key,control] of this.controls) {
            
                // if no touch, skip any keyboard controls

            if (control instanceof DialogControlKeyboardClass) {
                if (!this.core.input.hasTouch) continue;
            }
            
            if (!this.pickerMode) {
                if (control.tabId===null) continue;
                if (control.tabId!==this.selectedTabId) continue;
            }
            else {
                if (control.tabId!==null) continue;
            }
            
            if (this.currentClickingControlKey!==null) {
                control.draw(key===this.currentClickingControlKey);
            }
            else {
                control.draw(control.cursorIn());
            }
        }
       
            // buttons
            
        if (!this.pickerMode) {
            for ([key,button] of this.buttons) {
                if (button.show) button.draw(button.cursorIn()&&(this.currentClickingControlKey===null));
            }
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
        const RUN_MILLISECONDS=16;
        const DRAW_MILLISECONDS=16;
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
