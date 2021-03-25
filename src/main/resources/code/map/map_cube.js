//
// map cube class
//

export default class MapCubeClass
{
    constructor(cube,xBound,yBound,zBound,data)
    {
        this.cube=cube;
        this.xBound=xBound.copy();
        this.yBound=yBound.copy();
        this.zBound=zBound.copy();
        this.data=(data===undefined)?null:data;
    }
    
    entityInCube(entity)
    {
        if ((entity.position.x<this.xBound.min) || (entity.position.x>this.xBound.max)) return(false);
        if ((entity.position.y<this.yBound.min) || (entity.position.y>this.yBound.max)) return(false);
        return((entity.position.z>=this.zBound.min) && (entity.position.z<this.zBound.max));
    }
}
