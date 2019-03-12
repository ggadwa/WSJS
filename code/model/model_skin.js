import ModelJointClass from '../model/model_joint.js';

//
// model skin class
//

export default class ModelSkinClass
{
    static MAX_SKELETON_JOINT=128;
    
    constructor(skeleton)
    {
        this.skeleton=skeleton;
        
            // all the joints for this skin, this is
            // just a list of indexes into the node
            // list

        this.joints=[];
    }
    
        //
        // get the skeleton joint matrixes
        //
        
    getPoseJointMatrixArray()
    {
        let n,node,joint;
        let matrixArray=[];
        
            // calculate the joint matrixes
            // based on the animated node pose matrixes
            
        for (n=0;n!==this.joints.length;n++) {
            joint=this.joints[n];
            node=this.skeleton.nodes[joint.nodeIdx];
            
                // specs say this starts with inverse of global
                // changes to root node, but there are none

            joint.jointMatrix.setFromMultiply(node.curPoseMatrix,joint.inverseBindMatrix);
            
            matrixArray.push(joint.jointMatrix);
        }
        
        return(matrixArray);
    }
    
}

