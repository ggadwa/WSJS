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
    
    run(view,soundList,map,entityList)
    {
        var n;
        var nMovement=this.movements.length;
        
        for (n=0;n!==nMovement;n++) {
            this.movements[n].run(view,soundList,map,entityList);
        }
    }
}
