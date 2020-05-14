import SetupClass from '../main/setup.js';

export default class DialogBaseClass
{
    constructor(core)
    {
        this.core=core;
        
        this.DIALOG_TAB_WIDTH=150;
        
        this.tabList=null;
        
        this.progressFadeDiv=null;
        this.progressFrameDiv=null;
        this.progressDiv=null;
        this.progressTitleDiv=null;
        
        this.messageDiv=null;
        this.messageTimeout=null;
    }
    
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
}
