import SetupClass from '../main/setup.js';

export default class DialogBaseClass
{
    constructor(core)
    {
        this.DIALOG_WIDTH=1000;
        this.DIALOG_HEIGHT=500;
        this.DIALOG_BACKGROUND='#EEEEEE';
        this.DIALOG_BACKGROUND_DIM='#777777';
        this.DIALOG_OPACITY=0.9;
        this.DIALOG_OUTLINE_COLOR='#000033';
        this.DIALOG_TAB_WIDTH=150;
        this.DIALOG_TAB_HEIGHT=30;
        this.DIALOG_BUTTON_COLOR='#7777AA';
        this.DIALOG_BUTTON_COLOR_HIGHLIGHT='#8888FF';
        
        this.core=core;
        
        this.tabList=null;
    }
    
        //
        // scripts
        //
        
    switchTab(name)
    {
        let tabName;
        
        for (tabName of this.tabList) {
            document.getElementById('tab_'+tabName).style.backgroundColor=(tabName===name)?this.DIALOG_BACKGROUND:this.DIALOG_BACKGROUND_DIM;
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
        dialogDiv.style.left='calc(50% - '+Math.trunc(this.DIALOG_WIDTH*0.5)+'px)';
        dialogDiv.style.top='calc(50% - '+Math.trunc(this.DIALOG_HEIGHT*0.5)+'px)';
        dialogDiv.style.width=this.DIALOG_WIDTH+'px';
        dialogDiv.style.height=this.DIALOG_HEIGHT+'px';
        dialogDiv.style.opacity=this.DIALOG_OPACITY;
        
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
            tabDiv.style.width=this.DIALOG_TAB_WIDTH+'px';
            tabDiv.style.height=this.DIALOG_TAB_HEIGHT+'px';
            tabDiv.style.fontFamily='Arial';
            tabDiv.style.fontSize='14pt';
            tabDiv.style.fontWeight='bold';
            tabDiv.style.paddingLeft='6px';
            tabDiv.style.paddingTop='4px';
            tabDiv.style.backgroundColor=selected?this.DIALOG_BACKGROUND:this.DIALOG_BACKGROUND_DIM;
            tabDiv.style.borderTop='1px solid '+this.DIALOG_OUTLINE_COLOR;
            tabDiv.style.borderLeft='1px solid '+this.DIALOG_OUTLINE_COLOR;
            tabDiv.style.borderRight='1px solid '+this.DIALOG_OUTLINE_COLOR;
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
            viewDiv.style.top=(this.DIALOG_TAB_HEIGHT-1)+'px';
            viewDiv.style.width=(this.DIALOG_WIDTH-0)+'px';
            viewDiv.style.height=(this.DIALOG_HEIGHT-this.DIALOG_TAB_HEIGHT)+'px';
            viewDiv.style.padding='25px';
            viewDiv.style.backgroundColor=this.DIALOG_BACKGROUND;
            viewDiv.style.border='1px solid '+this.DIALOG_OUTLINE_COLOR;
            viewDiv.style.zIndex=100;

                // add to html

            dialogDiv.appendChild(tabDiv);
            dialogDiv.appendChild(viewDiv);
            
            x+=this.DIALOG_TAB_WIDTH;
        }
        
            // go button
            
        buttonDiv=document.createElement('div');
        
        buttonDiv.id='go';    
        buttonDiv.style.boxSizing='border-box';
        buttonDiv.style.position='absolute';
        buttonDiv.style.left=(this.DIALOG_WIDTH-this.DIALOG_TAB_WIDTH)+'px';
        buttonDiv.style.top='0px';
        buttonDiv.style.width=this.DIALOG_TAB_WIDTH+'px';
        buttonDiv.style.height=(this.DIALOG_TAB_HEIGHT-4)+'px';
        buttonDiv.style.fontFamily='Arial';
        buttonDiv.style.fontSize='14pt';
        buttonDiv.style.fontWeight='bold';
        buttonDiv.style.textAlign='center';
        buttonDiv.style.paddingTop='3px';
        buttonDiv.style.backgroundColor=this.DIALOG_BUTTON_COLOR;
        buttonDiv.style.border='1px solid '+this.DIALOG_OUTLINE_COLOR;
        buttonDiv.style.borderRadius='4px';
        buttonDiv.style.cursor='pointer';
        buttonDiv.style.userSelect='none';
        
        buttonDiv.onclick=buttonOnClick;
        buttonDiv.onmouseover=new Function('this.style.backgroundColor=\''+this.DIALOG_BUTTON_COLOR_HIGHLIGHT+'\'');
        buttonDiv.onmouseout=new Function('this.style.backgroundColor=\''+this.DIALOG_BUTTON_COLOR+'\'');
        
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
