import PointClass from '../../code/utility/point.js';
import Point2DClass from '../../code/utility/2D_point.js';

//
// map mesh vertex
//

export default class MapMeshVertexClass
{
    constructor()
    {
        this.position=new PointClass(0,0,0);
        this.normal=new PointClass(0.0,0.0,0.0);
        this.tangent=new PointClass(0.0,0.0,0.0);
        this.uv=new Point2DClass(0.0,0.0);
        
        Object.seal(this);
    }
}
