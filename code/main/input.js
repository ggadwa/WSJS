"use strict";

//
// input class
//

function InputObject()
{
        // input flags
        
    this.keyFlags=new Uint16Array(255);

    this.mouseFirstMove=true;
    this.mouseLastPos=new ws2DPoint(0,0);
    
    this.playerEntity=null;
    
        //
        // initialize/release input
        //

    this.initialize=function(view,playerEntity)
    {
        var n;
        
            // remember the player entity
            
        this.playerEntity=playerEntity;

            // clear the run input flags

        for (n=0;n!==255;n++) {
            this.keyFlags[n]=0;
        }

        this.mouseFirstMove=true;
        this.mouseLastPos=new ws2DPoint(0,0);

            // add the listeners

        document.addEventListener("keydown",this.keyDownEvent.bind(this),true);
        document.addEventListener("keyup",this.keyUpEvent.bind(this),true);
        // TODO - use pointerlock here
    };

    this.release=function()
    { 
    };
    
        //
        // run input from main loop
        //

    this.run=function()
    {
        this.playerEntity.turnSpeed=0.0;
        this.playerEntity.lookSpeed=0.0;
        this.playerEntity.forwardSpeed=0.0;
        this.playerEntity.sideSpeed=0.0;
        this.playerEntity.verticalSpeed=0.0;        // supergumba -- this is all temporary, we need to do start/stop here so acc/decl can take place
        
            // left arrow and right arrow
            // turning

        if (this.keyFlags[37]) this.playerEntity.turnSpeed=-3.0;
        if (this.keyFlags[39]) this.playerEntity.turnSpeed=3.0;

            // up arrow or W
            // down arrow or S
            // forward and backwards

        if ((this.keyFlags[38]) || (this.keyFlags[87])) this.playerEntity.forwardSpeed=125.0;
        if ((this.keyFlags[40]) || (this.keyFlags[83])) this.playerEntity.forwardSpeed=-125.0;

            // A and D
            // sidestep

        if (this.keyFlags[65]) this.playerEntity.sideSpeed=-75.0;
        if (this.keyFlags[68]) this.playerEntity.sideSpeed=75.0;

            // insert/home, delete/end
            // up or down

        if ((this.keyFlags[45]) || (this.keyFlags[36])) this.playerEntity.verticalSpeed=-125.0;
        if ((this.keyFlags[46]) || (this.keyFlags[35])) this.playerEntity.verticalSpeed=125.0;

            // page up, page down
            // look up or down

        if (this.keyFlags[33]) this.playerEntity.lookSpeed=1.5;
        if (this.keyFlags[34]) this.playerEntity.lookSpeed=-1.5; 
    };

        //
        // canvas key events
        //

    this.keyDownEvent=function(event)
    {
        this.keyFlags[event.keyCode]=1;
        return(false);
    };

    this.keyUpEvent=function(event)
    {
        this.keyFlags[event.keyCode]=0;
        return(false);
    };

}
