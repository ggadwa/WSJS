"use strict";

//
// startup UI configuring class
// this is probably temporary
//

class UIConfigClass
{
    constructor()
    {
    }
    
    createLinkTextDiv(url,str)
    {
        let aDiv,textSpan;
        
        if (url!==null) {
            aDiv=document.createElement('a');
            aDiv.style.float='left';
            aDiv.href=url;
        }
        
        textSpan=document.createElement('span');
        if (url===null) textSpan.style.float='left';
        textSpan.style.paddingRight='5px';
        textSpan.appendChild(document.createTextNode(str));
        if (url===null) return(textSpan);
        
        aDiv.appendChild(textSpan);
        return(aDiv);
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
            
        mainRun();
    }
    
    run()
    {
        let n,wrapperDiv,nameDiv,ctrl,btn,isCheck;
        let mainDiv,headerDiv,leftColDiv,rightColDiv;

        let propList=Object.getOwnPropertyNames(config);
        let nProp=propList.length;
        
            // header
            
        headerDiv=document.createElement('div');
        headerDiv.id='header';
        headerDiv.style.width='100%';
        headerDiv.style.height='40px';
        headerDiv.style.backgroundColor='#CCCCFF';
        headerDiv.style.fontFamily='Arial';
        headerDiv.style.fontSize='16pt';
        headerDiv.style.whiteSpace='nowrap';
        headerDiv.style.paddingLeft='4px';
        headerDiv.style.paddingRight='4px';
        headerDiv.style.paddingTop='4px';
        headerDiv.style.boxSizing='border-box';
        
        headerDiv.appendChild(this.createLinkTextDiv(null,'WSJS - '));
        headerDiv.appendChild(this.createLinkTextDiv('http://klinksoftware.net/forum/index.php','Klink! Software Forum'));
        headerDiv.appendChild(this.createLinkTextDiv(null,' - '));
        headerDiv.appendChild(this.createLinkTextDiv('https://github.com/ggadwa/WSJS','GitHub Source Code'));
            
        document.body.appendChild(headerDiv);
        
            // start button
            
        btn=document.createElement('div');
        btn.style.float='right';
        btn.style.right='5px';
        btn.style.width='100px';
        btn.style.height='30px';
        btn.style.margin='1px';
        btn.style.backgroundColor='#CCCCDD';
        btn.style.border='1px solid #555555';
        btn.style.boxSizing='border-box';
        btn.style.fontFamily='Arial';
        btn.style.fontSize='18pt';
        btn.style.textAlign='center';
        btn.style.cursor='pointer';
        btn.appendChild(document.createTextNode('START'));
        
        btn.onclick=this.startGame.bind(this);
        
        headerDiv.appendChild(btn);
        
            // setup main div
            
        mainDiv=document.createElement('div');
        mainDiv.id='main';
        mainDiv.style.float='left';
        mainDiv.style.width='100%';
        mainDiv.style.backgroundColor='#DDDDFF';
        mainDiv.style.fontFamily='Arial';
        mainDiv.style.fontSize='12pt';
        mainDiv.style.boxSizing='border-box';
        
        leftColDiv=document.createElement('div');
        leftColDiv.id='leftCol';
        leftColDiv.style.float='left';
        leftColDiv.style.width='calc(50% - 10px)';
        leftColDiv.style.margin='4px';
        leftColDiv.style.backgroundColor='#EEEEFF';
        leftColDiv.style.fontFamily='Arial';
        leftColDiv.style.fontSize='12pt';
        leftColDiv.style.boxSizing='border-box';
        
        mainDiv.appendChild(leftColDiv);
        
        rightColDiv=document.createElement('div');
        rightColDiv.id='leftCol';
        rightColDiv.style.float='left';
        rightColDiv.style.width='calc(50% - 10px)';
        rightColDiv.style.margin='4px';
        rightColDiv.style.backgroundColor='#EEEEFF';
        rightColDiv.style.fontFamily='Arial';
        rightColDiv.style.fontSize='12pt';
        rightColDiv.style.boxSizing='border-box';
        
        mainDiv.appendChild(rightColDiv);
        
            // add the controls
        
        for (n=0;n!==nProp;n++) {
            
            isCheck=(typeof(config[propList[n]])==='boolean');
            
                // the wrapper
                
            wrapperDiv=document.createElement('div');
            wrapperDiv.style.width='100%';
            wrapperDiv.style.height='25px';
            wrapperDiv.style.paddingLeft='2px';
            wrapperDiv.style.paddingRight='2px';
            
            if (isCheck) {
                leftColDiv.appendChild(wrapperDiv);
            }
            else {
                rightColDiv.appendChild(wrapperDiv);
            }
            
                // the name
                
            nameDiv=document.createElement('div');
            nameDiv.style.float='left';
            nameDiv.style.width='80%';
            nameDiv.style.paddingRight='4px';
            nameDiv.style.textAlign='right';
            nameDiv.appendChild(document.createTextNode(propList[n]+':'));
            
            wrapperDiv.appendChild(nameDiv);
            
                // the control
                
            ctrl=document.createElement('input');
            ctrl.id='ctrl_'+propList[n];
            ctrl.style.float='left';
            
            if (isCheck) {
                ctrl.type='checkbox';
                ctrl.checked=config[propList[n]];
            }
            else {
                ctrl.type='text';
                ctrl.value=config[propList[n]];
                ctrl.style.width='calc(20% - 14px)';
            }
            
            wrapperDiv.appendChild(ctrl);
        }
        
        document.body.appendChild(mainDiv);
        
    }
}

function uiConfigRun()
{
    let uiConfig=new UIConfigClass();
    uiConfig.run();
}
