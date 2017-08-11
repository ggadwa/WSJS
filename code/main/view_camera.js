import PointClass from '../../code/utility/point.js';

//
// view camera class
//

export default class ViewCameraClass
{
    constructor()
    {
        this.position=new PointClass(0.0,0.0,0.0);
        this.angle=new PointClass(0.0,0.0,0.0);
        
        Object.seal(this);
    }
    
        //
        // set camera to entity
        //
        
    setToEntity(entity,eyeHigh)
    {
        this.position.setFromPoint(entity.position);
        this.position.y-=eyeHigh;
        this.angle.setFromPoint(entity.angle);
    }
    
}
