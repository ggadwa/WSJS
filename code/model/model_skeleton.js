import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import genRandom from '../../generate/utility/random.js';

//
// model skeleton class
//

export default class ModelSkeletonClass
{
    constructor(view)
    {
        this.view=view;
        
            // bones
            
        this.baseBoneIdx=0;
        this.bones=[];

            // lists of bones that are
            // used for animation and
            // mesh building

        this.limbs=[];
        
        Object.seal(this);
    }
    
        //
        // close skeleton
        //

    close()
    {
        this.bones=[];
    }
    
        //
        // clone
        //
        
    clone()
    {
        let bone;
        
        let skeleton=new ModelSkeletonClass(this.view);
        
        for (bone of this.bones) {
            skeleton.bones.push(new ModelBoneClass(bone.name,bone.parentBoneIdx,bone.position));
        }
        
            // these list can just be copied,
            // they are read only
        
        skeleton.limbs=this.limbs;
        
            // recalc the bone animation values
            
        skeleton.precalcAnimationValues();
        
        return(skeleton);
    }
    
        //
        // find bone
        //
        
    findBoneIndex(name)
    {
        let n;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    findBone(name)
    {
        let idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    }
    
    getDistanceBetweenBones(name1,name2)
    {
        let bone1=this.findBone(name1);
        let bone2=this.findBone(name2);
        
        if ((bone1===null) || (bone2===null)) return(null);
        return(new PointClass(Math.abs(bone1.position.x-bone2.position.x),Math.abs(bone1.position.y-bone2.position.y),Math.abs(bone1.position.z-bone2.position.z)));
    }
    
    getBoneLimbType(boneIdx)
    {
        let n,limb;
        let nLimb=this.limbs.length;
        
        if (boneIdx===-1) return(-1);
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            if (limb.boneIndexes.indexOf(boneIdx)!==-1) return(limb.limbType);
        }
        
        return(-1);
    }
    
        //
        // bounds and center
        //
        
    getBounds(xBound,yBound,zBound)
    {
        let n,pos;
        let nBone=this.bones.length;
        
        xBound.min=xBound.max=0;
        yBound.min=yBound.max=0;
        zBound.min=zBound.max=0;
        
        for (n=0;n!==nBone;n++) {
            pos=this.bones[n].position;
            xBound.adjust(pos.x);
            yBound.adjust(pos.y);
            zBound.adjust(pos.z);
        }
    }
    
    getCenter()
    {
        let n;
        let nBone=this.bones.length;
        
        let pt=new PointClass(0,0,0);
        
        for (n=0;n!==nBone;n++) {
            pt.addPoint(this.bones[n].position);
        }
        
        if (nBone===0) return(pt);
        
        pt.x=Math.trunc(pt.x/nBone);
        pt.y=Math.trunc(pt.y/nBone);
        pt.z=Math.trunc(pt.z/nBone);
        
        return(pt);
    }
    
        //
        // this runs a number of pre-calcs to setup
        // the skeleton for animation
        //
        
    precalcAnimationValues()
    {
        let n,k,bone,parentBone;
        let nBone=this.bones.length;
        
            // get the base bone
            
        this.baseBoneIdx=this.findBoneIndex('Base');
        if (this.baseBoneIdx===-1) this.baseBoneIdx=0;
        
            // build the vectors and children
            // lists
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            
                // vector to parent
                
            if (bone.parentBoneIdx!==-1) {
                parentBone=this.bones[bone.parentBoneIdx];
                bone.vectorFromParent.setFromSubPoint(bone.position,parentBone.position);
            }
            
                // children
                
            for (k=0;k!==nBone;k++) {
                if (n!==k) {
                    if (this.bones[k].parentBoneIdx===n) bone.childBoneIndexes.push(k);
                }
            }
        }
    }
    

}
