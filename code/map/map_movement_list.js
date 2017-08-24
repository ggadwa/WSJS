//
// map movement list class
//

export default class MapMovementListClass
{
    constructor()
    {
        this.movements=[];
    }
    
    addMovement(movement)
    {
        this.movements.push(movement);
    }
    
    run(view,map)
    {
        let n;
        let nMovement=this.movements.length;
        
        for (n=0;n!==nMovement;n++) {
            this.movements[n].run(view,map);
        }
    }
}
