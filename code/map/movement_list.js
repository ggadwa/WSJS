"use strict";

//
// movement list class
//

class MovementListClass
{
    constructor()
    {
        this.movements=[];
    }
    
    addMovement(movement)
    {
        this.movements.push(movement);
    }
    
    run()
    {
        let n;
        let nMovement=this.movements.length;
        
        for (n=0;n!==nMovement;n++) {
            this.movements[n].run();
        }
    }
}
