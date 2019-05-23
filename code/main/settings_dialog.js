import SetupClass from '../main/setup.js';

export default class SettingsDialogClass
{
    static DIALOG_WIDTH=1000;
    static DIALOG_HEIGHT=500;
    static DIALOG_BACKGROUND='#EEEEEE';
    static DIALOG_BACKGROUND_DIM='#777777';
    static DIALOG_OPACITY=0.9;
    static DIALOG_OUTLINE_COLOR='#000033';
    static TAB_WIDTH=150;
    static TAB_HEIGHT=30;
    static DIALOG_BUTTON_COLOR='#7777AA';
    static DIALOG_BUTTON_COLOR_HIGHLIGHT='#8888FF';
    
    core=null;
    
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // scripts
        //
        
    switchTab(name)
    {
        document.getElementById('tab_Profile').style.backgroundColor=(name==='Profile')?SettingsDialogClass.DIALOG_BACKGROUND:SettingsDialogClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('tab_Multiplayer').style.backgroundColor=(name==='Multiplayer')?SettingsDialogClass.DIALOG_BACKGROUND:SettingsDialogClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('tab_Movement').style.backgroundColor=(name==='Movement')?SettingsDialogClass.DIALOG_BACKGROUND:SettingsDialogClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('tab_Sound').style.backgroundColor=(name==='Sound')?SettingsDialogClass.DIALOG_BACKGROUND:SettingsDialogClass.DIALOG_BACKGROUND_DIM;
        document.getElementById('view_Profile').style.display=(name==='Profile')?'':'none';
        document.getElementById('view_Multiplayer').style.display=(name==='Multiplayer')?'':'none';
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
        tabDiv.style.width=SettingsDialogClass.TAB_WIDTH+'px';
        tabDiv.style.height=SettingsDialogClass.TAB_HEIGHT+'px';
        tabDiv.style.fontFamily='Arial';
        tabDiv.style.fontSize='14pt';
        tabDiv.style.fontWeight='bold';
        tabDiv.style.paddingLeft='6px';
        tabDiv.style.paddingTop='4px';
        tabDiv.style.backgroundColor=highlighted?SettingsDialogClass.DIALOG_BACKGROUND:SettingsDialogClass.DIALOG_BACKGROUND_DIM;
        tabDiv.style.borderTop='1px solid '+SettingsDialogClass.DIALOG_OUTLINE_COLOR;
        tabDiv.style.borderLeft='1px solid '+SettingsDialogClass.DIALOG_OUTLINE_COLOR;
        tabDiv.style.borderRight='1px solid '+SettingsDialogClass.DIALOG_OUTLINE_COLOR;
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
        viewDiv.style.top=(SettingsDialogClass.TAB_HEIGHT-1)+'px';
        viewDiv.style.width=(SettingsDialogClass.DIALOG_WIDTH-0)+'px';
        viewDiv.style.height=(SettingsDialogClass.DIALOG_HEIGHT-SettingsDialogClass.TAB_HEIGHT)+'px';
        viewDiv.style.padding='25px';
        viewDiv.style.backgroundColor=SettingsDialogClass.DIALOG_BACKGROUND;
        viewDiv.style.border='1px solid '+SettingsDialogClass.DIALOG_OUTLINE_COLOR;
        viewDiv.style.zIndex=100;
        
        parentDiv.appendChild(viewDiv);
        
        return(viewDiv);
    }
    
    addGoButton(parentDiv)
    {
        let buttonDiv=document.createElement('div');
        
        buttonDiv.id='go';    
        buttonDiv.style.boxSizing='border-box';
        buttonDiv.style.position='absolute';
        buttonDiv.style.left=(SettingsDialogClass.DIALOG_WIDTH-SettingsDialogClass.TAB_WIDTH)+'px';
        buttonDiv.style.top='0px';
        buttonDiv.style.width=SettingsDialogClass.TAB_WIDTH+'px';
        buttonDiv.style.height=(SettingsDialogClass.TAB_HEIGHT-4)+'px';
        buttonDiv.style.fontFamily='Arial';
        buttonDiv.style.fontSize='14pt';
        buttonDiv.style.fontWeight='bold';
        buttonDiv.style.textAlign='center';
        buttonDiv.style.paddingTop='3px';
        buttonDiv.style.backgroundColor=SettingsDialogClass.DIALOG_BUTTON_COLOR;
        buttonDiv.style.border='1px solid '+SettingsDialogClass.DIALOG_OUTLINE_COLOR;
        buttonDiv.style.borderRadius='4px';
        buttonDiv.style.cursor='pointer';
        buttonDiv.style.userSelect='none';
        
        buttonDiv.onclick=this.core.setPauseState.bind(this.core,false,false);
        buttonDiv.onmouseover=new Function('this.style.backgroundColor=\''+SettingsDialogClass.DIALOG_BUTTON_COLOR_HIGHLIGHT+'\'');
        buttonDiv.onmouseout=new Function('this.style.backgroundColor=\''+SettingsDialogClass.DIALOG_BUTTON_COLOR+'\'');
        
        buttonDiv.appendChild(document.createTextNode('Go'));
        
        parentDiv.appendChild(buttonDiv);
    }
    
        //
        // view panes
        //
        
    addInput(parentDiv,id,name,ctrlType,list,value,onChange)
    {
        let n;
        let rowDiv=document.createElement('div');
        let leftDiv=document.createElement('div');
        let rightDiv=document.createElement('div');
        let label=document.createElement('label');
        let input=null;
        
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

            // text, range, and checkbox
            
        if (ctrlType!=='select') {
            input=document.createElement('input');
            input.id=id;
            input.type=ctrlType;
            input.style.opacity=1.0;

            switch (ctrlType) {
                case 'text':
                    input.value=value;
                    input.style.fontFamily='Arial';
                    input.style.fontSize='12pt';
                    input.style.fontWeight='normal';
                    input.style.width='200px';
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
        }
        
            // select
            
        else {
            input=document.createElement('select');
            input.id=id;
            input.style.opacity=1.0;
            input.style.fontFamily='Arial';
            input.style.fontSize='12pt';
            input.style.fontWeight='normal';
            input.style.width='200px';

            for (n=0;n!==list.length;n++) {
                input.add(new Option(list[n],list[n]));
            }
            
            input.selectedIndex=value;
            
            if (onChange!==null) input.onchange=onChange;
        }
        
            // add row
            
        rowDiv.appendChild(leftDiv);
        leftDiv.appendChild(label);
        rowDiv.appendChild(rightDiv);
        rightDiv.appendChild(input);
        
        parentDiv.appendChild(rowDiv);
    }
    
    addProfileControls(viewDiv)
    {
        this.addInput(viewDiv,'name','Name:','text',null,this.core.setup.name,null);
    }
    
    addMultiplayerControls(viewDiv)
    {
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLLIst','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        this.addInput(viewDiv,'botCount','Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
    }
    
    addMovementControls(viewDiv)
    {
        this.addInput(viewDiv,'mouseXSensitivity','Mouse X Sensitivity:','range',null,Math.trunc(this.core.setup.mouseXSensitivity*100),null);
        this.addInput(viewDiv,'mouseXAcceleration','Mouse X Acceleration:','range',null,Math.trunc(this.core.setup.mouseXAcceleration*100),null);
        this.addInput(viewDiv,'mouseXInvert','Invert Mouse X:','checkbox',null,this.core.setup.mouseXInvert,null);
        this.addInput(viewDiv,'mouseYSensitivity','Mouse Y Sensitivity:','range',null,Math.trunc(this.core.setup.mouseYSensitivity*100),null);
        this.addInput(viewDiv,'mouseYAcceleration','Mouse X Acceleration:','range',null,Math.trunc(this.core.setup.mouseYAcceleration*100),null);
        this.addInput(viewDiv,'mouseYInvert','Invert Mouse Y:','checkbox',null,this.core.setup.mouseYInvert,null);
    }
    
    addSoundControls(viewDiv)
    {
        this.addInput(viewDiv,'soundVolume','Sound Volume:','range',null,Math.trunc(this.core.setup.soundVolume*100),null);
        this.addInput(viewDiv,'musicVolume','Music Volume:','range',null,Math.trunc(this.core.setup.musicVolume*100),null);
    }
    
        //
        // misc control events
        //
        
    savedServerListPick()
    {
        document.getElementById('serverURL').value=document.getElementById('savedServerURLLIst').value;
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
        div.style.left='calc(50% - '+Math.trunc(SettingsDialogClass.DIALOG_WIDTH*0.5)+'px)';
        div.style.top='calc(50% - '+Math.trunc(SettingsDialogClass.DIALOG_HEIGHT*0.5)+'px)';
        div.style.width=SettingsDialogClass.DIALOG_WIDTH+'px';
        div.style.height=SettingsDialogClass.DIALOG_HEIGHT+'px';
        div.style.opacity=SettingsDialogClass.DIALOG_OPACITY;
        
            // the tabs and views

        this.addTab(div,0,'Profile',true);
        view=this.addView(div,'Profile',true);
        this.addProfileControls(view);
        
        this.addTab(div,SettingsDialogClass.TAB_WIDTH,'Multiplayer',false);
        view=this.addView(div,'Multiplayer',false);
        this.addMultiplayerControls(view,false);
        
        this.addTab(div,(SettingsDialogClass.TAB_WIDTH*2),'Movement',false);
        view=this.addView(div,'Movement',false);
        this.addMovementControls(view,false);
        
        this.addTab(div,(SettingsDialogClass.TAB_WIDTH*3),'Sound',false);
        view=this.addView(div,'Sound',false);
        this.addSoundControls(view,false);

            // the go button
            
        this.addGoButton(div);
        
        document.body.appendChild(div);
    }
    
    close()
    {
            // change the setup and save
            
        this.core.setup.name=document.getElementById('name').value;
        
        this.core.setup.serverURL=document.getElementById('serverURL').value;
        if (this.core.setup.savedServerURLList.indexOf(this.core.setup.serverURL)===-1) this.core.setup.savedServerURLList.splice(0,0,this.core.setup.serverURL);
        this.core.setup.botCount=document.getElementById('botCount').selectedIndex;
        this.core.setup.botSkill=document.getElementById('botSkill').selectedIndex;
        
        this.core.setup.mouseXSensitivity=document.getElementById('mouseXSensitivity').value/100.0;
        this.core.setup.mouseXAcceleration=document.getElementById('mouseXAcceleration').value/100.0;
        this.core.setup.mouseXInvert=document.getElementById('mouseXInvert').checked;
        this.core.setup.mouseYSensitivity=document.getElementById('mouseYSensitivity').value/100.0;
        this.core.setup.mouseYAcceleration=document.getElementById('mouseYAcceleration').value/100.0;
        this.core.setup.mouseYInvert=document.getElementById('mouseYInvert').checked;

        this.core.setup.soundVolume=document.getElementById('soundVolume').value/100.0;
        this.core.setup.musicVolume=document.getElementById('musicVolume').value/100.0;
        
        SetupClass.save(this.core,this.core.setup);
        
            // close the dialog
            
        document.body.removeChild(document.getElementById('settingPane'));
    }

}
