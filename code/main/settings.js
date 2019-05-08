import SetupClass from '../main/setup.js';

export default class SettingsClass
{
    static DIALOG_WIDTH=1000;
    static DIALOG_HEIGHT=500;
    static DIALOG_BACKGROUND='#EEEEEE';
    static DIALOG_BACKGROUND_DIM='#777777';
    static DIALOG_OPACITY=0.9;
    static DIALOG_OUTLINE_COLOR='#2200CC';
    static TAB_WIDTH=150;
    static TAB_HEIGHT=30;
    static DIALOG_BUTTON_COLOR='#FF00CC';
    
    core=null;
    setup=null;
    
    constructor(core)
    {
        let jsonStr;
        
        this.core=core;
        
            // load or default setup
            
        jsonStr=window.localStorage.getItem('wsjs_setup');
        if (jsonStr!==null) {
            this.setup=JSON.parse(jsonStr);
        }
        else {
            this.setup=new SetupClass();
        }
    }
    
        //
        // scripts
        //
        
    switchTab(name)
    {
        document.getElementById('tab_Profile').style.backgroundColor=(name==='Profile')?SettingsClass.DIALOG_BACKGROUND:SettingsClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('tab_Movement').style.backgroundColor=(name==='Movement')?SettingsClass.DIALOG_BACKGROUND:SettingsClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('tab_Sound').style.backgroundColor=(name==='Sound')?SettingsClass.DIALOG_BACKGROUND:SettingsClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('view_Profile').style.display=(name==='Profile')?'':'none';
        document.getElementById('view_Movement').style.display=(name==='Movement')?'':'none';
        document.getElementById('view_Sound').style.display=(name==='Sound')?'':'none';
    }
    
        //
        // components
        //
        
    addTab(parentDiv,left,name,highlighted)
    {
        let tabDiv=document.createElement('div');
        
            // the tab
            
        tabDiv.id='tab_'+name;
        tabDiv.style.boxSizing='border-box';
        tabDiv.style.position='absolute';
        tabDiv.style.left=left+'px';
        tabDiv.style.top='0px';
        tabDiv.style.width=SettingsClass.TAB_WIDTH+'px';
        tabDiv.style.height=SettingsClass.TAB_HEIGHT+'px';
        tabDiv.style.fontFamily='Arial';
        tabDiv.style.fontSize='14pt';
        tabDiv.style.fontWeight='bold';
        tabDiv.style.paddingLeft='6px';
        tabDiv.style.paddingTop='4px';
        tabDiv.style.backgroundColor=highlighted?SettingsClass.DIALOG_BACKGROUND:SettingsClass.DIALOG_BACKGROUND_DIM;
        tabDiv.style.borderTop='1px solid '+SettingsClass.DIALOG_OUTLINE_COLOR;
        tabDiv.style.borderLeft='1px solid '+SettingsClass.DIALOG_OUTLINE_COLOR;
        tabDiv.style.borderRight='1px solid '+SettingsClass.DIALOG_OUTLINE_COLOR;
        tabDiv.style.borderTopRightRadius='8px';
        tabDiv.style.cursor='pointer';
        tabDiv.style.userSelect='none';
        tabDiv.style.zIndex=101;        // tab to be slightly over view so it knocks out border of view
        
        tabDiv.onclick=this.switchTab.bind(this,name);
        
        tabDiv.appendChild(document.createTextNode(name));
        
        parentDiv.appendChild(tabDiv);
    }
    
    addView(parentDiv,name,highlighted)
    {
        let viewDiv=document.createElement('div');
        
            // the view
            
        viewDiv.id='view_'+name;
        viewDiv.style.display=highlighted?'':'none';
        viewDiv.style.boxSizing='border-box';
        viewDiv.style.position='absolute';
        viewDiv.style.left='0px';
        viewDiv.style.top=(SettingsClass.TAB_HEIGHT-1)+'px';
        viewDiv.style.width=(SettingsClass.DIALOG_WIDTH-0)+'px';
        viewDiv.style.height=(SettingsClass.DIALOG_HEIGHT-SettingsClass.TAB_HEIGHT)+'px';
        viewDiv.style.padding='25px';
        viewDiv.style.backgroundColor=SettingsClass.DIALOG_BACKGROUND;
        viewDiv.style.border='1px solid '+SettingsClass.DIALOG_OUTLINE_COLOR;
        viewDiv.style.zIndex=100;
        
        parentDiv.appendChild(viewDiv);
        
        return(viewDiv);
    }
    
    addGoButton(parentDiv)
    {
        let buttonDiv=document.createElement('div');
        
            // the tab
            
        buttonDiv.style.boxSizing='border-box';
        buttonDiv.style.position='absolute';
        buttonDiv.style.left=(SettingsClass.DIALOG_WIDTH-SettingsClass.TAB_WIDTH)+'px';
        buttonDiv.style.top='0px';
        buttonDiv.style.width=SettingsClass.TAB_WIDTH+'px';
        buttonDiv.style.height=(SettingsClass.TAB_HEIGHT-4)+'px';
        buttonDiv.style.fontFamily='Arial';
        buttonDiv.style.fontSize='14pt';
        buttonDiv.style.fontWeight='bold';
        buttonDiv.style.textAlign='center';
        buttonDiv.style.paddingTop='3px';
        buttonDiv.style.backgroundColor=SettingsClass.DIALOG_BUTTON_COLOR;
        buttonDiv.style.border='1px solid '+SettingsClass.DIALOG_OUTLINE_COLOR;
        buttonDiv.style.borderRadius='4px';
        buttonDiv.style.cursor='pointer';
        buttonDiv.style.userSelect='none';
        
        buttonDiv.onclick=this.core.setPauseState.bind(this.core,false,false);
        
        buttonDiv.appendChild(document.createTextNode('Go'));
        
        parentDiv.appendChild(buttonDiv);
    }
    
        //
        // view panes
        //
        
    addInput(parentDiv,id,name,ctrlType,value)
    {
        let rowDiv=document.createElement('div');
        let leftDiv=document.createElement('div');
        let rightDiv=document.createElement('div');
        let label=document.createElement('label');
        let input=document.createElement('input');
        
        rowDiv.style.width='100%';
        rowDiv.style.height='35px';
        
        leftDiv.style.float='left';
        leftDiv.style.width='calc(50% - 5px)';
        leftDiv.style.textAlign='right';
        leftDiv.style.paddingRight='5px';
        leftDiv.style.paddingTop='2px';
        
        rightDiv.style.float='left';
        rightDiv.style.width='calc(50% - 5px)';
        rightDiv.style.paddingLeft='5px';
        
        label.appendChild(document.createTextNode(name));
        label.for=id;
        label.style.opacity=1.0;
        label.style.fontFamily='Arial';
        label.style.fontSize='12pt';
        label.style.fontWeight='normal';

        input.id=id;
        input.type=ctrlType;
        input.style.opacity=1.0;
        
        switch (ctrlType) {
            case 'text':
                input.value=value;
                input.style.fontFamily='Arial';
                input.style.fontSize='12pt';
                input.style.fontWeight='normal';
                break;
            case 'range':
                input.value=value;
                input.min=0;
                input.max=100;
                break;
            case 'checkbox':
                input.checked=value;
                break;
        }
        
        rowDiv.appendChild(leftDiv);
        leftDiv.appendChild(label);
        rowDiv.appendChild(rightDiv);
        rightDiv.appendChild(input);
        
        parentDiv.appendChild(rowDiv);
    }
    
    addProfileControls(viewDiv)
    {
        this.addInput(viewDiv,'name','Name:','text',this.setup.name);
    }
    
    addMovementControls(viewDiv)
    {
        this.addInput(viewDiv,'mouseXSensitivity','Mouse X Sensitivity:','range',Math.trunc(this.setup.mouseXSensitivity*100));
        this.addInput(viewDiv,'mouseXAcceleration','Mouse X Acceleration:','range',Math.trunc(this.setup.mouseXAcceleration*100));
        this.addInput(viewDiv,'mouseXInvert','Invert Mouse X:','checkbox',this.setup.mouseXInvert);
        this.addInput(viewDiv,'mouseYSensitivity','Mouse Y Sensitivity:','range',Math.trunc(this.setup.mouseYSensitivity*100));
        this.addInput(viewDiv,'mouseYAcceleration','Mouse X Acceleration:','range',Math.trunc(this.setup.mouseYAcceleration*100));
        this.addInput(viewDiv,'mouseYInvert','Invert Mouse Y:','checkbox',this.setup.mouseYInvert);
    }
    
    addSoundControls(viewDiv)
    {
        this.addInput(viewDiv,'soundVolume','Sound Volume:','range',Math.trunc(this.setup.soundVolume*100));
        this.addInput(viewDiv,'musicVolume','Music Volume:','range',Math.trunc(this.setup.musicVolume*100));
    }

        //
        // main settings
        //
    
    open()
    {
        let div,view;
        
            // the main dialog div
            
        div=document.createElement('div');
        div.id='settingPane';
        div.style.boxSizing='border-box';
        div.style.position='absolute';
        div.style.left='calc(50% - '+Math.trunc(SettingsClass.DIALOG_WIDTH*0.5)+'px)';
        div.style.top='calc(50% - '+Math.trunc(SettingsClass.DIALOG_HEIGHT*0.5)+'px)';
        div.style.width=SettingsClass.DIALOG_WIDTH+'px';
        div.style.height=SettingsClass.DIALOG_HEIGHT+'px';
        div.style.opacity=SettingsClass.DIALOG_OPACITY;
        
            // the tabs and views

        this.addTab(div,0,'Profile',true);
        view=this.addView(div,'Profile',true);
        this.addProfileControls(view);
        
        this.addTab(div,SettingsClass.TAB_WIDTH,'Movement',false);
        view=this.addView(div,'Movement',false);
        this.addMovementControls(view,false);
        
        this.addTab(div,(SettingsClass.TAB_WIDTH*2),'Sound',false);
        view=this.addView(div,'Sound',false);
        this.addSoundControls(view,false);

            // the go button
            
        this.addGoButton(div);
        
        document.body.appendChild(div);
    }
    
    close()
    {
            // change the setup and save
            
        this.setup.name=document.getElementById('name').value;

        this.setup.mouseXSensitivity=document.getElementById('mouseXSensitivity').value/100.0;
        this.setup.mouseXAcceleration=document.getElementById('mouseXAcceleration').value/100.0;
        this.setup.mouseXInvert=document.getElementById('mouseXInvert').checked;
        this.setup.mouseYSensitivity=document.getElementById('mouseYSensitivity').value/100.0;
        this.setup.mouseYAcceleration=document.getElementById('mouseYAcceleration').value/100.0;
        this.setup.mouseYInvert=document.getElementById('mouseYInvert').checked;

        this.setup.soundVolume=document.getElementById('soundVolume').value/100.0;
        this.setup.musicVolume=document.getElementById('musicVolume').value/100.0;
        
        window.localStorage.setItem('wsjs_setup',JSON.stringify(this.setup));
        
            // close the dialog
            
        document.body.removeChild(document.getElementById('settingPane'));
    }

}
