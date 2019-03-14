import Matrix4Class from '../utility/matrix4.js';

//
// model skin class
//

export default class ModelEntityAlterSkinClass
{
    constructor(jointCount)
    {
        let n;
        
            // these are matrixes that contain the
            // final movement of the joint, in a separate
            // list outside of the shared models

        this.jointMatrixes=[];
        
        for (n=0;n!==jointCount;n++) {
            this.jointMatrixes.push(new Matrix4Class());
        }
        
        Object.seal(this);
    }
}

