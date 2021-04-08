export default class MapSpotClass
{
    constructor(position,data)
    {
        this.position=position;
        this.data=data;
        
        this.used=false;
        
        Object.seal(this);
    }

}
