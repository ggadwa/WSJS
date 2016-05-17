"use strict";

//
// startup UI configuring class
// this is probably temporary
//

class UIConfigClass
{
    constructor()
    {
        this.configConsts=  [
                                'ROOM_MAX_RECURSION_DEPTH',
                                'ROOM_MAX_CONNECTION_COUNT',
                                'ROOM_CLOSETS',
                                'ROOM_PLATFORMS',
                                'ROOM_LEDGES',
                                'ROOM_LIQUIDS',
                                'ROOM_PILLARS',
                                'ROOM_DECORATIONS',
                                'ROOM_DOOR_PERCENTAGE',
                                'ROOM_LEVEL_CHANGE_PERCENTAGE',
                                'ROOM_LIQUID_PERCENTAGE',
                                'MAP_GENERATE_LIGHTMAP',
                                'MONSTER_TYPE_COUNT',
                                'MONSTER_ENTITY_COUNT',
                                'MONSTER_AI_ON',
                                'MOUSE_TURN_SENSITIVITY',
                                'MOUSE_LOOK_SENSITIVITY',
                                'PLAYER_CLIP_WALLS',
                                'PLAYER_FLY',
                                'DEBUG_DRAW_MAP_MESH_LINES',
                                'DEBUG_DRAW_MAP_MESH_NORMALS',
                                'DEBUG_DRAW_MAP_MESH_TANGENTS',
                                'DEBUG_DRAW_MODEL_HITBOX',
                                'DEBUG_DRAW_MODEL_SKELETON',
                                'DEBUG_DRAW_MODEL_MESH_LINES',
                                'DEBUG_DRAW_MODEL_MESH_NORMALS',
                                'DEBUG_DRAW_MODEL_MESH_TANGENTS',
                            ];
    }
    
    createLinkTextDiv(url,str)
    {
        if (url!==null) {
            var aDiv=document.createElement('a');
            aDiv.href=url;
        }
        
        var textSpan=document.createElement('span');
        textSpan.appendChild(document.createTextNode(str));
        if (url===null) return(textSpan);
        
        aDiv.appendChild(textSpan);
        return(aDiv);
    }
    
    startGame()
    {
        var n,ctrl,str;
        var nControl=this.configConsts.length;
        
            // reset the config

        for (n=0;n!==nControl;n++) {
            
                // get the control
                
            ctrl=document.getElementById('ctrl_'+n);
            
                // set the config
                
            if (typeof(config[this.configConsts[n]])==='boolean') {
                config[this.configConsts[n]]=ctrl.checked;
            }
            else {
                str=ctrl.value;
                if (str.indexOf('.')===-1) {
                    config[this.configConsts[n]]=parseInt(str);
                }
                else {
                    config[this.configConsts[n]]=parseFloat(str);
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
        var n,nameDiv,ctrl;
        var y=5;
        var nControl=this.configConsts.length;
        
            // header
            
        var headerDiv=document.createElement('div');
        headerDiv.id='header';
        headerDiv.style.position='absolute';
        headerDiv.style.left='5px';
        headerDiv.style.top='5px';
        headerDiv.style.width='800px';
        headerDiv.style.height='30px';
        headerDiv.style.backgroundColor='#CCCCFF';
        headerDiv.style.fontFamily='Arial';
        headerDiv.style.fontSize='16pt';
        headerDiv.style.whiteSpace='nowrap';
        headerDiv.style.paddingLeft='4px';
        headerDiv.style.boxSizing='border-box';
        
        headerDiv.appendChild(this.createLinkTextDiv(null,'WSJS - '));
        headerDiv.appendChild(this.createLinkTextDiv('http://klinksoftware.net/forum/index.php','Klink! Software Forum'));
        headerDiv.appendChild(this.createLinkTextDiv(null,' - '));
        headerDiv.appendChild(this.createLinkTextDiv('https://github.com/ggadwa/WSJS','GitHub Source Code'));
            
        document.body.appendChild(headerDiv);
        
            // button bar
            
        var barDiv=document.createElement('div');
        barDiv.id='bar';
        barDiv.style.position='absolute';
        barDiv.style.left='5px';
        barDiv.style.top='35px';
        barDiv.style.width='800px';
        barDiv.style.height='40px';
        barDiv.style.backgroundColor='#DDDDFF';
        barDiv.style.boxSizing='border-box';
        
        var btn=document.createElement('div');
        btn.style.position='absolute';
        btn.style.left='690px';
        btn.style.top='5px';
        btn.style.width='100px';
        btn.style.height='30px';
        btn.style.backgroundColor='#CCCCDD';
        btn.style.border='1px solid #555555';
        btn.style.boxSizing='border-box';
        btn.style.fontFamily='Arial';
        btn.style.fontSize='18pt';
        btn.style.textAlign='center';
        btn.style.cursor='pointer';
        btn.appendChild(document.createTextNode('START'));
        
        btn.onclick=this.startGame.bind(this);
        
        barDiv.appendChild(btn);
        document.body.appendChild(barDiv);
        
            // setup main div
            
        var mainDiv=document.createElement('div');
        mainDiv.id='main';
        mainDiv.style.position='absolute';
        mainDiv.style.left='5px';
        mainDiv.style.top='75px';
        mainDiv.style.width='800px';
        mainDiv.style.height=((nControl*25)+10)+'px';
        mainDiv.style.backgroundColor='#EEEEFF';
        mainDiv.style.fontFamily='Arial';
        mainDiv.style.fontSize='12pt';
        mainDiv.style.boxSizing='border-box';
        
            // add the controls
        
        for (n=0;n!==nControl;n++) {
            
                // the name
                
            nameDiv=document.createElement('div');
            nameDiv.style.position='absolute';
            nameDiv.style.left='5px';
            nameDiv.style.top=y+'px';
            nameDiv.style.width='400px';
            nameDiv.style.textAlign='right';
            nameDiv.appendChild(document.createTextNode(this.configConsts[n]));
            
            mainDiv.appendChild(nameDiv);
            
                // the control
                
            ctrl=document.createElement('input');
            ctrl.id='ctrl_'+n;
            ctrl.style.position='absolute';
            ctrl.style.left='415px';
            ctrl.style.top=y+'px';
            
            if (typeof(config[this.configConsts[n]])==='boolean') {
                ctrl.type='checkbox';
                ctrl.checked=config[this.configConsts[n]];
            }
            else {
                ctrl.type='text';
                ctrl.value=config[this.configConsts[n]];
                ctrl.style.width='300px';
            }
            
            mainDiv.appendChild(ctrl);
            
            y+=25;
        }
        
        document.body.appendChild(mainDiv);
        
    }
}

function uiConfigRun()
{
    var uiConfig=new UIConfigClass();
    uiConfig.run();
}
