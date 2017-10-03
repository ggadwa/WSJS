import config from '../../code/main/config.js';
import main from '../../code/main/main.js';

//
// startup UI configuring class
// this is probably temporary
//

export default class UIConfigClass
{
    constructor()
    {
    }
        
    startGame()
    {
        let n,ctrl,str;

        let propList=Object.getOwnPropertyNames(config);
        let nProp=propList.length;
        
            // reset the config

        for (n=0;n!==nProp;n++) {
            
                // get the control
                
            ctrl=document.getElementById('ctrl_'+propList[n]);
            
                // set the config
                
            if (typeof(config[propList[n]])==='boolean') {
                config[propList[n]]=ctrl.checked;
            }
            else {
                str=ctrl.value;
                if (str.indexOf('.')===-1) {
                    config[propList[n]]=parseInt(str);
                }
                else {
                    config[propList[n]]=parseFloat(str);
                }
            }
            
        }
                
            // remove all the HTML
       
        document.body.innerHTML='';
        
            // start game
            
        main.run();
    }
    
    createInstructionLine(div,str)
    {
        div.appendChild(document.createTextNode(str));
        div.appendChild(document.createElement('br'));
    }
    
    createLink(div,url,str)
    {
        let ahref;
        
        ahref=document.createElement('a');
        ahref.style.float='left';
        ahref.href=url;
        ahref.appendChild(document.createTextNode(str));
        div.appendChild(ahref);
        
        div.appendChild(document.createElement('br'));
    }
    
    
    run()
    {
        let n,wrapperDiv,labelDiv,ctrl,btn;
        let mainDiv,headerDiv,leftColDiv,rightColDiv;
        let instructHeaderDiv,instructDiv;
        let linkHeaderDiv,linkDiv;

        let propList=Object.getOwnPropertyNames(config);
        let nProp=propList.length;
        
            // header
            
        headerDiv=document.createElement('div');
        headerDiv.className='header';
        headerDiv.appendChild(document.createTextNode('Configuration'));
        document.body.appendChild(headerDiv);
        
            // start button
            
        btn=document.createElement('div');
        btn.className='button';
        btn.appendChild(document.createTextNode('START'));
        btn.onclick=this.startGame.bind(this);
        headerDiv.appendChild(btn);
        
            // setup main div
            
        mainDiv=document.createElement('div');
        mainDiv.className='configContainer';
        
        leftColDiv=document.createElement('div');
        leftColDiv.className='configColumn';
        mainDiv.appendChild(leftColDiv);
        
        rightColDiv=document.createElement('div');
        rightColDiv.className='configColumn';
        mainDiv.appendChild(rightColDiv);
        
            // add in left controls (booleans)
        
        for (n=0;n!==nProp;n++) {
            if (!(typeof(config[propList[n]])==='boolean')) continue;
            
                // the wrapper
                
            wrapperDiv=document.createElement('div');
            wrapperDiv.className='controlWrapper';
            
                // the control
                
            ctrl=document.createElement('input');
            ctrl.id='ctrl_'+propList[n];
            ctrl.type='checkbox';
            ctrl.checked=config[propList[n]];
            ctrl.className='controlCheckbox';
            wrapperDiv.appendChild(ctrl);
             
                // the label
                
            labelDiv=document.createElement('label');
            labelDiv.className='labelCheckbox';
            labelDiv.htmlFor='ctrl_'+propList[n];
            labelDiv.appendChild(document.createTextNode(propList[n]));
            wrapperDiv.appendChild(labelDiv);
            
            leftColDiv.appendChild(wrapperDiv);
        }
        
            // add in right controls (text)
        
        for (n=0;n!==nProp;n++) {
            if (typeof(config[propList[n]])==='boolean') continue;
            
                // the wrapper
                
            wrapperDiv=document.createElement('div');
            wrapperDiv.className='controlWrapper';
            
                // the label
                
            labelDiv=document.createElement('label');
            labelDiv.className='labelText';
            labelDiv.htmlFor='ctrl_'+propList[n];
            labelDiv.appendChild(document.createTextNode(propList[n]+':'));
            
            wrapperDiv.appendChild(labelDiv);
            
                // the control
                
            ctrl=document.createElement('input');
            ctrl.id='ctrl_'+propList[n];
            ctrl.type='text';
            ctrl.value=config[propList[n]];
            ctrl.className='controlText';
            
            wrapperDiv.appendChild(ctrl);
            
            rightColDiv.appendChild(wrapperDiv);
        }
        
        document.body.appendChild(mainDiv);
        
            // instructions
            
        instructHeaderDiv=document.createElement('div');
        instructHeaderDiv.className='header';
        instructHeaderDiv.appendChild(document.createTextNode('Instructions'));
        document.body.appendChild(instructHeaderDiv);
            
        instructDiv=document.createElement('div');
        instructDiv.className='instructContainer';
        
        this.createInstructionLine(instructDiv,'Esc - Pause');
        this.createInstructionLine(instructDiv,'AWSD - Movement');
        this.createInstructionLine(instructDiv,'Space - Jump');
        this.createInstructionLine(instructDiv,'Left Mouse Button - Fire');
        this.createInstructionLine(instructDiv,'Right Mouse Button - Alt Fire');
        this.createInstructionLine(instructDiv,'Mouse Wheel - Change Weapon');
        this.createInstructionLine(instructDiv,'M - Map');

        document.body.appendChild(instructDiv);
        
            // links
            
        linkHeaderDiv=document.createElement('div');
        linkHeaderDiv.className='header';
        linkHeaderDiv.appendChild(document.createTextNode('Links'));
        document.body.appendChild(linkHeaderDiv);
        
        linkDiv=document.createElement('div');
        linkDiv.className='linkContainer';
        
        this.createLink(linkDiv,'http://klinksoftware.net/forum/index.php','Klink! Software Forum');
        this.createLink(linkDiv,'https://github.com/ggadwa/WSJS','GitHub Source Code');
            
        document.body.appendChild(linkDiv);
    }
}
