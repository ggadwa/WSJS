import config from '../main/config.js';
import main from '../main/main.js';

//
// startup UI configuring class
// this is probably temporary
//

export default class UIConfigClass
{
    constructor(gameClass)
    {
        this.gameClass=gameClass;
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
            if (ctrl===null) continue;          // skips all the combo lists and other items that don't have controls
            
                // set the config
                
            if (typeof(config[propList[n]])==='boolean') {
                config[propList[n]]=ctrl.checked;
            }
            else {
                if (ctrl.nodeName!=='SELECT') {
                    str=ctrl.value;
                    if (str.indexOf('.')===-1) {
                        config[propList[n]]=parseInt(str);
                    }
                    else {
                        config[propList[n]]=parseFloat(str);
                    }
                }
                else {
                    config[propList[n]]=ctrl.selectedIndex;
                }
            }
        }
                
            // remove all the HTML
       
        document.body.innerHTML='';
        
            // start game
            
        main.run(this.gameClass);
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
        let n,k,wrapperDiv,labelDiv,ctrl,comboArray,option,btn;
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
            if (propList[n].endsWith('_LIST')) continue;
            
                // the wrapper
                
            wrapperDiv=document.createElement('div');
            wrapperDiv.className='controlWrapper';
            
                // the label
                
            labelDiv=document.createElement('label');
            labelDiv.className='labelText';
            labelDiv.htmlFor='ctrl_'+propList[n];
            labelDiv.appendChild(document.createTextNode(propList[n]+':'));
            
            wrapperDiv.appendChild(labelDiv);
            
                // booleans
                
            if (typeof(config[propList[n]])==='boolean') {
                ctrl=document.createElement('input');
                ctrl.id='ctrl_'+propList[n];
                ctrl.type='checkbox';
                ctrl.checked=config[propList[n]];
                ctrl.className='controlCheckbox';
                wrapperDiv.appendChild(ctrl);
            }
            else {
                
                    // if there's a combo array, it's a combo

                comboArray=config[propList[n]+'_LIST'];
            
                    // the control

                if (comboArray===undefined) {    
                    ctrl=document.createElement('input');
                    ctrl.id='ctrl_'+propList[n];
                    ctrl.type='text';
                    ctrl.value=config[propList[n]];
                }
                else {
                    ctrl=document.createElement('select');
                    ctrl.id='ctrl_'+propList[n];

                    for (k=0;k!=comboArray.length;k++) {
                        option=document.createElement('option');
                        option.text=comboArray[k];
                        ctrl.add(option);
                    }

                    ctrl.selectedIndex=config[propList[n]];
                }

                ctrl.className='controlText';

                wrapperDiv.appendChild(ctrl);
            }
            
            leftColDiv.appendChild(wrapperDiv);
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
        this.createInstructionLine(instructDiv,'Right Mouse Button - Grenade');
        this.createInstructionLine(instructDiv,'Mouse Wheel / Number keys  - Change Weapon');

        document.body.appendChild(instructDiv);
        
            // links
            
        linkHeaderDiv=document.createElement('div');
        linkHeaderDiv.className='header';
        linkHeaderDiv.appendChild(document.createTextNode('Links'));
        document.body.appendChild(linkHeaderDiv);
        
        linkDiv=document.createElement('div');
        linkDiv.className='linkContainer';
        
        this.createLink(linkDiv,'https://twitter.com/ggadwa','@ggadwa');
        this.createLink(linkDiv,'https://github.com/ggadwa/WSJS','GitHub Source Code');
            
        document.body.appendChild(linkDiv);
    }
}
