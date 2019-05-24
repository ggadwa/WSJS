import SetupClass from '../main/setup.js';

export default class DialogBaseClass
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
    tabList=null;
    
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // scripts
        //
        
    switchTab(name)
    {
        let tabName;
        
        for (tabName of this.tabList) {
            document.getElementById('tab_'+tabName).style.backgroundColor=(tabName===name)?DialogBaseClass.DIALOG_BACKGROUND:DialogBaseClass.DIALOG_BACKGROUND_DIM;
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
        dialogDiv.style.boxSizing='border-box';
        dialogDiv.style.position='absolute';
        dialogDiv.style.left='calc(50% - '+Math.trunc(DialogBaseClass.DIALOG_WIDTH*0.5)+'px)';
        dialogDiv.style.top='calc(50% - '+Math.trunc(DialogBaseClass.DIALOG_HEIGHT*0.5)+'px)';
        dialogDiv.style.width=DialogBaseClass.DIALOG_WIDTH+'px';
        dialogDiv.style.height=DialogBaseClass.DIALOG_HEIGHT+'px';
        dialogDiv.style.opacity=DialogBaseClass.DIALOG_OPACITY;
        
            // the tabs
            
        x=0;
        
        for (n=0;n!==this.tabList.length;n++) {
            name=this.tabList[n];
            selected=(n===selectedTabIdx);
            
            tabDiv=document.createElement('div');
            
            tabDiv.id='tab_'+name;
            tabDiv.style.boxSizing='border-box';
            tabDiv.style.position='absolute';
            tabDiv.style.left=x+'px';
            tabDiv.style.top='0px';
            tabDiv.style.width=DialogBaseClass.TAB_WIDTH+'px';
            tabDiv.style.height=DialogBaseClass.TAB_HEIGHT+'px';
            tabDiv.style.fontFamily='Arial';
            tabDiv.style.fontSize='14pt';
            tabDiv.style.fontWeight='bold';
            tabDiv.style.paddingLeft='6px';
            tabDiv.style.paddingTop='4px';
            tabDiv.style.backgroundColor=selected?DialogBaseClass.DIALOG_BACKGROUND:DialogBaseClass.DIALOG_BACKGROUND_DIM;
            tabDiv.style.borderTop='1px solid '+DialogBaseClass.DIALOG_OUTLINE_COLOR;
            tabDiv.style.borderLeft='1px solid '+DialogBaseClass.DIALOG_OUTLINE_COLOR;
            tabDiv.style.borderRight='1px solid '+DialogBaseClass.DIALOG_OUTLINE_COLOR;
            tabDiv.style.borderTopRightRadius='8px';
            tabDiv.style.cursor='pointer';
            tabDiv.style.userSelect='none';
            tabDiv.style.zIndex=101;        // tab to be slightly over view so it knocks out border of view

            tabDiv.onclick=this.switchTab.bind(this,name);

            tabDiv.appendChild(document.createTextNode(name));

                // the view
                
            viewDiv=document.createElement('div');

            viewDiv.id='view_'+name;
            viewDiv.style.display=selected?'':'none';
            viewDiv.style.boxSizing='border-box';
            viewDiv.style.position='absolute';
            viewDiv.style.left='0px';
            viewDiv.style.top=(DialogBaseClass.TAB_HEIGHT-1)+'px';
            viewDiv.style.width=(DialogBaseClass.DIALOG_WIDTH-0)+'px';
            viewDiv.style.height=(DialogBaseClass.DIALOG_HEIGHT-DialogBaseClass.TAB_HEIGHT)+'px';
            viewDiv.style.padding='25px';
            viewDiv.style.backgroundColor=DialogBaseClass.DIALOG_BACKGROUND;
            viewDiv.style.border='1px solid '+DialogBaseClass.DIALOG_OUTLINE_COLOR;
            viewDiv.style.zIndex=100;

                // add to html

            dialogDiv.appendChild(tabDiv);
            dialogDiv.appendChild(viewDiv);
            
            x+=DialogBaseClass.TAB_WIDTH;
        }
        
            // go button
            
        buttonDiv=document.createElement('div');
        
        buttonDiv.id='go';    
        buttonDiv.style.boxSizing='border-box';
        buttonDiv.style.position='absolute';
        buttonDiv.style.left=(DialogBaseClass.DIALOG_WIDTH-DialogBaseClass.TAB_WIDTH)+'px';
        buttonDiv.style.top='0px';
        buttonDiv.style.width=DialogBaseClass.TAB_WIDTH+'px';
        buttonDiv.style.height=(DialogBaseClass.TAB_HEIGHT-4)+'px';
        buttonDiv.style.fontFamily='Arial';
        buttonDiv.style.fontSize='14pt';
        buttonDiv.style.fontWeight='bold';
        buttonDiv.style.textAlign='center';
        buttonDiv.style.paddingTop='3px';
        buttonDiv.style.backgroundColor=DialogBaseClass.DIALOG_BUTTON_COLOR;
        buttonDiv.style.border='1px solid '+DialogBaseClass.DIALOG_OUTLINE_COLOR;
        buttonDiv.style.borderRadius='4px';
        buttonDiv.style.cursor='pointer';
        buttonDiv.style.userSelect='none';
        
        buttonDiv.onclick=buttonOnClick;
        buttonDiv.onmouseover=new Function('this.style.backgroundColor=\''+DialogBaseClass.DIALOG_BUTTON_COLOR_HIGHLIGHT+'\'');
        buttonDiv.onmouseout=new Function('this.style.backgroundColor=\''+DialogBaseClass.DIALOG_BUTTON_COLOR+'\'');
        
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

}
