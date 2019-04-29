//
// map movement list class
//

export default class MapMovementListClass
{
    constructor()
    {
        this.movements=[];
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
    add(movement)
    {
        this.movements.push(movement);
    }
    
        //
        // clear lights
        //

    clear()
    {
        this.movements=[];
    }

        //
        // run movements
        //
    
    run()
    {
        let n;
        let nMovement=this.movements.length;
        
        for (n=0;n!==nMovement;n++) {
            this.movements[n].run();
        }
    }
}
