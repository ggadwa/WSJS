//
// generic shader light class
//

export default class ShaderLightClass
{
    constructor()
    {
        this.positionIntensityUniform=null;
        this.colorExponentUniform=null;
        
        Object.seal(this);
    }
}
