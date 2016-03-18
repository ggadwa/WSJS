"use strict";

//
// input class
//

class InputClass
{
    constructor(view,entityList)
    {
        this.view=view;
        this.entityList=entityList;

            // input flags

        this.keyFlags=new Uint8Array(255);

        this.mouseFirstMove=true;
        this.mouseLastPos=new ws2DIntPoint(0,0);

        this.playerEntity=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize(playerEntity)
    {
        var n;
        
            // remember the player entity
            
        this.playerEntity=playerEntity;

            // clear the run input flags

        for (n=0;n!==255;n++) {
            this.keyFlags[n]=0;
        }

        this.mouseFirstMove=true;
        this.mouseLastPos=new ws2DIntPoint(0,0);

            // add the listeners

        document.addEventListener("keydown",this.keyDownEvent.bind(this),true);
        document.addEventListener("keyup",this.keyUpEvent.bind(this),true);
        // supergumba - use pointerlock here
    }

    release()
    { 
    }
    
        //
        // run input from main loop
        //

    run()
    {
        this.playerEntity.setTurnSpeed(0.0);
        this.playerEntity.setLookSpeed(0.0);
        this.playerEntity.setForwardSpeed(0.0);
        this.playerEntity.setSideSpeed(0.0);
        this.playerEntity.setVerticalSpeed(0.0);        // supergumba -- this is all temporary, we need to do start/stop here so acc/decl can take place
        
            // left arrow and right arrow
            // turning

        if (this.keyFlags[37]) this.playerEntity.setTurnSpeed(-3.0);
        if (this.keyFlags[39]) this.playerEntity.setTurnSpeed(3.0);

            // up arrow or W
            // down arrow or S
            // forward and backwards

        if ((this.keyFlags[38]) || (this.keyFlags[87])) this.playerEntity.setForwardSpeed(125.0);
        if ((this.keyFlags[40]) || (this.keyFlags[83])) this.playerEntity.setForwardSpeed(-125.0);

            // A and D
            // sidestep

        if (this.keyFlags[65]) this.playerEntity.setSideSpeed(-75.0);
        if (this.keyFlags[68]) this.playerEntity.setSideSpeed(75.0);
        
            // space jump
            
        if (this.keyFlags[32]) this.playerEntity.startJump();
        
            // q fire
            
        if (this.keyFlags[81]) this.playerEntity.fireCurrentWeapon(this.view,this.entityList);
        
            // m flips map on/off
            
        if (this.keyFlags[77]) {
            this.keyFlags[77]=0;        // force it up
            this.view.mapOverlayStateFlip();
        }

            // - and +
            // up or down

        if (this.keyFlags[61]) this.playerEntity.setVerticalSpeed(-125.0);
        if (this.keyFlags[173]) this.playerEntity.setVerticalSpeed(125.0);

            // [ and ]
            // look up or down

        if (this.keyFlags[219]) this.playerEntity.setLookSpeed(1.5);
        if (this.keyFlags[221]) this.playerEntity.setLookSpeed(-1.5); 
    }

        //
        // canvas key events
        //

    keyDownEvent(event)
    {
        this.keyFlags[event.keyCode]=1;
        return(false);
    }

    keyUpEvent(event)
    {
        this.keyFlags[event.keyCode]=0;
        return(false);
    }

}
