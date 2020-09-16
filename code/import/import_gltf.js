import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import MeshClass from '../mesh/mesh.js';
import LightClass from '../light/light.js';
import MeshMoveClass from '../mesh/mesh_move.js';
import MeshMovementClass from '../mesh/mesh_movement.js';
import MapCubeClass from '../map/map_cube.js';
import MapLiquidClass from '../map/map_liquid.js';
import EffectClass from '../project/effect.js';
import ModelNodeClass from '../model/model_node.js';
import ModelSkinClass from '../model/model_skin.js';
import ModelJointClass from '../model/model_joint.js';
import ModelAnimationClass from '../model/model_animation.js';
import ModelAnimationChannelClass from '../model/model_animation_channel.js';
import ModelAnimationChannelPoseClass from '../model/model_animation_channel_pose.js';
import ModelSkeletonClass from '../model/model_skeleton.js';
import BitmapPBRClass from '../bitmap/bitmap_pbr.js';
import BitmapColorClass from '../bitmap/bitmap_color.js';

export default class ImportGLTFClass
{
    constructor(core,name)
    {
        this.core=core;
        this.name=name;
        
        this.mapImportScale=1;
        
        this.MESH_INFORMATIONAL_KEEP=0;
        this.MESH_INFORMATIONAL_REMOVE=1;
        this.MESH_INFORMATIONAL_ERROR=2;
        
        this.jsonData=null;
        this.binData=null;
        
        Object.seal(this);
    }
    
        //
        // async gltf and bin loader
        //
        
    async loadGLTFJson()
    {
        let resp;
        let url='../models/'+this.name+'/'+this.name+'.gltf';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
    async loadGLTFBin()
    {
        let resp;
        let url='../models/'+this.name+'/'+this.jsonData.buffers[0].uri;     // right now assume a single buffer, this isn't necessarly true though TODO on this
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.arrayBuffer());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
        //
        // buffer utilities
        //
        
    decodeBuffer(accessorIdx,arrayVecSize)
    {
        let n,k,arrayIdx,byteIdx;
        let dataView,array,count,vecType,componentType,internalVecSize;
        let accessorNode,bufferViewNode;
        let byteOffset,byteLength,byteStride;
        
            // start at the accessor
            
        accessorNode=this.jsonData.accessors[accessorIdx];
        byteOffset=(accessorNode.byteOffset===undefined)?0:accessorNode.byteOffset;
        vecType=accessorNode.type;
        componentType=accessorNode.componentType;
        count=accessorNode.count;
        
            // if there's a bigger size than we need
            // (this happens for tangents) then we need to
            // figure this out in case the strides are missing
            // and only pass back the data we need
            
        internalVecSize=arrayVecSize;
        if (vecType==='VEC2') internalVecSize=2;
        if (vecType==='VEC3') internalVecSize=3;
        if (vecType==='VEC4') internalVecSize=4;
        if (vecType==='MAT4') internalVecSize=16;
        
            // now to the buffer view
            
        bufferViewNode=this.jsonData.bufferViews[accessorNode.bufferView];
        if (bufferViewNode.byteOffset!==undefined) byteOffset+=bufferViewNode.byteOffset;
        byteLength=bufferViewNode.byteLength;
        
            // I have seen gltf files where the byteoffset + bytelength
            // is greater than total bytes, fix this
            
        if ((byteOffset+byteLength)>this.binData.byteLength) byteLength=this.binData.byteLength-byteOffset;
        
            // and finally the buffer
            // we assume one bin file here so we just read from that
            
        dataView=new DataView(this.binData,byteOffset,byteLength);
        
            // turn into an typed array
            
        switch (componentType) {
            
            case this.core.gl.FLOAT:
                byteStride=(bufferViewNode.byteStride===undefined)?(4*internalVecSize):bufferViewNode.byteStride;
                array=new Float32Array(count*arrayVecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==count;n++) {
                    for (k=0;k!==arrayVecSize;k++) {
                        array[arrayIdx]=dataView.getFloat32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.core.gl.UNSIGNED_INT:
                byteStride=(bufferViewNode.byteStride===undefined)?(4*internalVecSize):bufferViewNode.byteStride;
                array=new Uint32Array(count*arrayVecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==count;n++) {
                    for (k=0;k!==arrayVecSize;k++) {
                        array[arrayIdx]=dataView.getUint32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.core.gl.INT:
                byteStride=(bufferViewNode.byteStride===undefined)?(4*internalVecSize):bufferViewNode.byteStride;
                array=new Int32Array(count*arrayVecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==count;n++) {
                    for (k=0;k!==arrayVecSize;k++) {
                        array[arrayIdx]=dataView.getInt32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.core.gl.UNSIGNED_SHORT:
                byteStride=(bufferViewNode.byteStride===undefined)?(2*internalVecSize):bufferViewNode.byteStride;
                array=new Uint16Array(count*arrayVecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==count;n++) {
                    for (k=0;k!==arrayVecSize;k++) {
                        array[arrayIdx]=dataView.getUint16((byteIdx+(k*2)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
                
            case this.core.gl.SHORT:
                byteStride=(bufferViewNode.byteStride===undefined)?(2*internalVecSize):bufferViewNode.byteStride;
                array=new Int16Array(count*arrayVecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==count;n++) {
                    for (k=0;k!==arrayVecSize;k++) {
                        array[arrayIdx]=dataView.getInt16((byteIdx+(k*2)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
        }

        return(null);
    }
    
        //
        // rebuild missing tangents
        //

    buildTangents(vertexArray,uvArray,indexArray)
    {
        let n,nTrig,trigIdx,vIdx,uvIdx;
        let u10,u20,v10,v20;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertexes against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        let v0=new PointClass(0,0,0);
        let v1=new PointClass(0,0,0);
        let v2=new PointClass(0,0,0);
        let uv0=new PointClass(0,0,0);
        let uv1=new PointClass(0,0,0);
        let uv2=new PointClass(0,0,0);
        let p10=new PointClass(0.0,0.0,0.0);
        let p20=new PointClass(0.0,0.0,0.0);
        let vLeft=new PointClass(0.0,0.0,0.0);
        let vRight=new PointClass(0.0,0.0,0.0);
        let vNum=new PointClass(0.0,0.0,0.0);
        let denom;
        let tangent=new PointClass(0.0,0.0,0.0);
        
        let tangentArray=new Float32Array(vertexArray.length);

        nTrig=Math.trunc(indexArray.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            vIdx=indexArray[trigIdx]*3;
            v0.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            vIdx=indexArray[trigIdx+1]*3;
            v1.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            vIdx=indexArray[trigIdx+2]*3;
            v2.setFromValues(vertexArray[vIdx],vertexArray[vIdx+1],vertexArray[vIdx+2]);
            
            uvIdx=indexArray[trigIdx]*2;
            uv0.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);
            uvIdx=indexArray[trigIdx+1]*2;
            uv1.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);
            uvIdx=indexArray[trigIdx+2]*2;
            uv2.setFromValues(uvArray[uvIdx],uvArray[uvIdx+1]);

                // create vectors

            p10.setFromSubPoint(v1,v0);
            p20.setFromSubPoint(v2,v0);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)

            u10=uv1.x-uv0.x;        // x component
            u20=uv2.x-uv0.x;
            v10=uv1.y-uv0.y;        // y component
            v20=uv2.y-uv0.y;

                // calculate the tangent
                // (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh tangent
                // to all vertexes in this trig

            vIdx=indexArray[trigIdx]*3;
            tangentArray[vIdx]=tangent.x;
            tangentArray[vIdx+1]=tangent.y;
            tangentArray[vIdx+2]=tangent.z;
            vIdx=indexArray[trigIdx+1]*3;
            tangentArray[vIdx]=tangent.x;
            tangentArray[vIdx+1]=tangent.y;
            tangentArray[vIdx+2]=tangent.z;
            vIdx=indexArray[trigIdx+2]*3;
            tangentArray[vIdx]=tangent.x;
            tangentArray[vIdx+1]=tangent.y;
            tangentArray[vIdx+2]=tangent.z;
        }
        
        return(tangentArray);
    }
    
        //
        // node utilities
        //
        
    findNodeIndexInSkeletonChildIndexes(skeleton,nodeIdx)
    {
        let n,k,node;

        for (n=0;n!==skeleton.nodes.length;n++) {
            if (n===nodeIdx) continue;
            node=skeleton.nodes[n];
            
            for (k=0;k!==node.childNodeIdxs.length;k++) {
                if (node.childNodeIdxs[k]===nodeIdx) return(n);
            }
        }
        
        return(-1);
    }
    
    findNodeIndexInDataForMeshIndex(meshIdx)
    {
        let n,nodes;

        nodes=this.jsonData.nodes;
        
        for (n=0;n!==nodes.length;n++) {
            if ((nodes[n].mesh!==undefined) && (nodes[n].mesh===meshIdx)) return(n);
        }
        
        return(-1);
    }
    
    findSkinIndexInDataForMeshIndex(meshIdx)
    {
        let node,nodeIdx;
        
        nodeIdx=this.findNodeIndexInDataForMeshIndex(meshIdx);
        if (nodeIdx===-1) return(-1);
        
        node=this.jsonData.nodes[nodeIdx];
        if (node.skin===undefined) return(-1);
        
        return(node.skin);
    }
    
    findParentNodeIndexInDataForNodeIdx(nodeIdx)
    {
        let n,k,node,nodes;
        
        nodes=this.jsonData.nodes;

        for (n=0;n!==nodes.length;n++) {
            if (n===nodeIdx) continue;
            
            node=nodes[n];
            if (node.children===undefined) continue;
            
            for (k=0;k!==node.children.length;k++) {
                if (node.children[k]===nodeIdx) return(n);
            }
        }
        
        return(-1);
    }
        
    getCumulativeNodeMatrixForMesh(meshIdx)
    {
        let n,node,nodeIdx,nodeParentIdx;
        let translationProp,rotationProp,scaleProp;
        let mat,mat2,mat3,translation,rotation,scale;
        let nodeStack=[];
        
            // if no node, then it's the identity
            
        nodeIdx=this.findNodeIndexInDataForMeshIndex(meshIdx);
        if (nodeIdx===-1) return(new Matrix4Class());
        
            // if not, make a stack of parent nodes
        
        while (true) {
            nodeStack.push(nodeIdx);
            
            nodeParentIdx=this.findParentNodeIndexInDataForNodeIdx(nodeIdx);
            if (nodeParentIdx===-1) break;
            
            nodeIdx=nodeParentIdx;
        }
        
            // now reverse build the matrixes
            
        translation=new PointClass(0,0,0);
        rotation=new QuaternionClass(0,0,0,1);
        scale=new PointClass(1,1,1);
        mat=new Matrix4Class();
        mat2=new Matrix4Class();
        mat3=new Matrix4Class();
        
        for (n=(nodeStack.length-1);n>=0;n--) {
            node=this.jsonData.nodes[nodeStack[n]];
            
                // get matrix or TRS to matrix
                
            if (node.matrix!==undefined) {
                mat2.fromArray(node.matrix);
            }
            else {
                mat2.setIdentity();
                
                translationProp=node.translation;
                if (translationProp!==undefined) {
                    translation.setFromValues(translationProp[0],translationProp[1],translationProp[2]);
                    mat3.setTranslationFromPoint(translation);
                    mat2.multiply(mat3);
                }
                
                rotationProp=node.rotation;
                if (rotationProp!==undefined) {
                    rotation.setFromValues(rotationProp[0],rotationProp[1],rotationProp[2],rotationProp[3]);
                    mat3.setRotationFromQuaternion(rotation);
                    mat2.multiply(mat3);
                }
                
                scaleProp=node.scale;
                if (scaleProp!==undefined) {
                    scale.setFromValues(scaleProp[0],scaleProp[1],scaleProp[2]);
                    mat3.setScaleFromPoint(scale);
                    mat2.multiply(mat3);
                }
            }
            
            mat.multiply(mat2);
        }
        
        return(mat);
    }
    
    getRotationForMeshNodeParent(meshIdx)
    {
        let node,nodeIdx;
        let rotationProp,rotation,ang;
        
            // this is used for wsjsEntity meshes
            // so we can grab the rotation from the
            // first node
            
        ang=new PointClass(0,0,0);
        
            // if no node, then no rotation
            
        nodeIdx=this.findNodeIndexInDataForMeshIndex(meshIdx);
        if (nodeIdx===-1) return(ang);
        
            // we only look at TRS matrix at this point
            // this will probably need to be improved in
            // the future

        node=this.jsonData.nodes[nodeIdx];

        rotationProp=node.rotation;
        if (rotationProp!==undefined) {
            rotation=new QuaternionClass(rotationProp[0],rotationProp[1],rotationProp[2],rotationProp[3]);
            rotation.getEulerAngle(ang);
        }
        
            // we can get some wacky results,
            // like negative angles, so fix them
            
        ang.angleFix();
        
        return(ang);
    }
    
        //
        // decode skeleton
        //
    
    decodeNode(nodeIdx)
    {
        let node;
        let translationProp,rotationProp,scaleProp;
        let mat,translation,rotation,scale;
        
        node=this.jsonData.nodes[nodeIdx];
        
            // find this nodes TRS
            
        translation=new PointClass(0,0,0);
        rotation=new QuaternionClass(0,0,0,1);
        scale=new PointClass(1,1,1);
        
            // check for matrixes first
            
        if (node.matrix!==undefined) {
            mat=new Matrix4Class();
            mat.fromArray(node.matrix);

                // decompose to TRS

            translation.setFromValues(mat.data[12],mat.data[13],mat.data[14]);
            rotation.fromMatrix(mat);
            scale.scaleFromMatrix(mat);
        }
        
            // else get TRS
            
        else {
            translationProp=node.translation;
            if (translationProp!==undefined) translation.setFromValues(translationProp[0],translationProp[1],translationProp[2]);
            
            rotationProp=node.rotation;
            if (rotationProp!==undefined) rotation.setFromValues(rotationProp[0],rotationProp[1],rotationProp[2],rotationProp[3]);
            
            scaleProp=node.scale;
            if (scaleProp!==undefined) scale.setFromValues(scaleProp[0],scaleProp[1],scaleProp[2]);
        }
        
            // setup the node
        
        return(new ModelNodeClass(node.name,((node.children!==undefined)?node.children:[]),translation,rotation,scale));
    }
    
    decodeSkeleton(skeleton)
    {
        let n,k,nodes,skin,skeletonSkin,joints;
        let mat,inverseBindMatrixFloatArray;
        
            // we have to load every node
            // because even though they aren't part of
            // the skeleton they have important TRS data
         
        nodes=this.jsonData.nodes;
        
        for (n=0;n!==nodes.length;n++) {
            skeleton.nodes.push(this.decodeNode(n));
        }
        
            // and reverse lookup all the node parents
            
        for (n=0;n!==skeleton.nodes.length;n++) {
            skeleton.nodes[n].parentNodeIdx=this.findNodeIndexInSkeletonChildIndexes(skeleton,n);
        }
        
            // if there is a skin, then
            // get the joint indexes for this skeleton
            // because of shader limits, we need to 
            // error out if too many joints
        
        if (this.jsonData.skins!==undefined) {
            
            for (n=0;n!==this.jsonData.skins.length;n++) {
                skin=this.jsonData.skins[n];
                joints=skin.joints;

                if (joints.length>this.core.MAX_SKELETON_JOINT) {
                    console.log('too many joints in skeleton ('+joints.length+' out of '+this.core.MAX_SKELETON_JOINT+' in model '+this.name);
                    return(false);
                }

                skeletonSkin=new ModelSkinClass();
                skeleton.skins.push(skeletonSkin);

                inverseBindMatrixFloatArray=this.decodeBuffer(skin.inverseBindMatrices,16);

                for (k=0;k!==joints.length;k++) {
                    mat=new Matrix4Class();
                    mat.fromArrayOffset(inverseBindMatrixFloatArray,(k*16));
                    skeletonSkin.joints.push(new ModelJointClass(joints[k],mat));
                }
            }
        }
        
            // finally we determine a root node (we assume
            // a single skeleton)  Default is 0 (which most impoters
            // put it but I've seen it in different places)  We
            // determine by a node that has children but no parent.
            
        skeleton.rootNodeIdx=0;
        
        for (n=0;n!=skeleton.nodes.length;n++) {
            if ((skeleton.nodes[n].parentNodeIdx===-1) && (skeleton.nodes[n].childNodeIdxs.length!==0)) {
                skeleton.rootNodeIdx=n;
                break;
            }
        }
        
        return(true);
    }
    
        //
        // decode materials
        //
    
    findMaterialForMesh(meshNode,primitiveNode)
    {
        let bitmap,uri;
        let baseColorTexture,metallicRoughnessTexture,emissiveTexture;
        let colorURL=null;
        let colorBase=null;
        let normalURL=null;
        let metallicRoughnessURL=null;
        let emissiveURL=null;
        let emissiveFactor=null;
        let scale=null;
        let prefixURL='models/'+this.name+'/';
        let materialNode=this.jsonData.materials[primitiveNode.material];
        
            // no material at all
            
        if (materialNode===undefined) {
            console.log('Mesh '+meshNode.name+' has no material.');
            return(null);
        }
        
            // first find any normal texture
            
        if (materialNode.normalTexture!==undefined) {
            uri=this.jsonData.images[this.jsonData.textures[materialNode.normalTexture.index].source].uri;
            normalURL=uri.startsWith('data:image')?uri:(prefixURL+uri);
        }
        
            // default emissive
            
        emissiveFactor=new ColorClass(1,1,1);
                
            // we only use metallicRoughness
            
        if (materialNode.pbrMetallicRoughness===undefined) {
            console.log('Mesh '+meshNode.name+' in material '+materialNode.name+' is not pbrMetallicRoughness type.');
            return(null);
        }
        
            // the base color
            
        if (materialNode.pbrMetallicRoughness.baseColorTexture!==undefined) {
            baseColorTexture=materialNode.pbrMetallicRoughness.baseColorTexture;

            uri=this.jsonData.images[this.jsonData.textures[baseColorTexture.index].source].uri;
            colorURL=uri.startsWith('data:image')?uri:(prefixURL+uri);

                // check for scale

            if (baseColorTexture.extensions!==undefined) {
                if (baseColorTexture.extensions.KHR_texture_transform!==undefined) {
                    if (baseColorTexture.extensions.KHR_texture_transform.scale!==undefined) {
                        scale=baseColorTexture.extensions.KHR_texture_transform.scale;
                    }
                }
            }
        }
        else {
            if (materialNode.pbrMetallicRoughness.baseColorFactor!==undefined) {
                colorBase=new ColorClass(materialNode.pbrMetallicRoughness.baseColorFactor[0],materialNode.pbrMetallicRoughness.baseColorFactor[1],materialNode.pbrMetallicRoughness.baseColorFactor[2]);
            }
        }

            // the metallic/roughness

        metallicRoughnessTexture=materialNode.pbrMetallicRoughness.metallicRoughnessTexture;
        if (metallicRoughnessTexture!==undefined) {
            uri=this.jsonData.images[this.jsonData.textures[metallicRoughnessTexture.index].source].uri;
            metallicRoughnessURL=uri.startsWith('data:image')?uri:(prefixURL+uri);
        }
        
            // emissives
            
        if (materialNode.emissiveTexture!==undefined) {    
            emissiveTexture=materialNode.emissiveTexture;
            uri=this.jsonData.images[this.jsonData.textures[emissiveTexture.index].source].uri;
            emissiveURL=uri.startsWith('data:image')?uri:(prefixURL+uri);
            
            if (materialNode.emissiveFactor!==undefined) emissiveFactor.setFromValues(materialNode.emissiveFactor[0],materialNode.emissiveFactor[1],materialNode.emissiveFactor[2]);
        }
        
            // create the bitmap and
            // add to list to be loaded later
            
        if (colorURL!==null) {
            bitmap=this.core.bitmapList.get(colorURL);
            if (bitmap===undefined) {
                bitmap=new BitmapPBRClass(this.core,colorURL,normalURL,metallicRoughnessURL,emissiveURL,emissiveFactor,scale);
                this.core.bitmapList.add(bitmap);
            }
        }
        else {
            if (colorBase!==null) {
                bitmap=this.core.bitmapList.get(materialNode.name);
                if (bitmap===undefined) {
                    bitmap=new BitmapColorClass(this.core,materialNode.name,colorBase);
                    this.core.bitmapList.add(bitmap);
                }
            }
            else {
                console.log('Could not find texture for mesh '+meshNode.name+' in material '+materialNode.name+' in '+this.name);
                return(null);
            }
        }
        
            // return the bitmap

        return(bitmap);
    }
    
        //
        // custom property lookup
        //
        
    getCustomProperty(materialNode,meshNode,propName)
    {
        if (materialNode!==null) {
            if (materialNode.extras!==undefined) {
                if (materialNode.extras[propName]!==undefined) return(materialNode.extras[propName]);
            }
        }
        if (meshNode.extras!==undefined) {
            if (meshNode.extras[propName]!==undefined) return(meshNode.extras[propName]);
        }
        
        return(null);
    }
    
        //
        // special informational meshes
        // 
        // we can create meshes that have custom properities (extras)
        // that turn into different objects, like liquids or skyboxes, or
        // just contain logic that is used elsewhere in the engine
        //
        
    decideMapMeshInformationalParseJSON(meshNode,value)
    {
        try {
            return(JSON.parse(value));
        }
        catch (e) {
            console.log('Error in map JSON for mesh '+meshNode.name+':'+value+':'+e);
            return(null);
        }
    }
    
    decodeMapMeshInformational(map,materialNode,meshNode,mesh,meshIdx)
    {
        let n,value,obj;
        let moveDef,movePoint,moveRotate,rotateOffset;
        let pos,ang;
        
            // map settings
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsMap');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // music settings
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsMusic');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            this.core.music.setMusic(obj.name,((obj.loopStart===undefined)?0:obj.loopStart),((obj.loopEnd===undefined)?0:obj.loopEnd));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // skyboxes
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsSky');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            map.sky.on=true;
            map.sky.offset.setFromValues(obj.offset.x,obj.offset.y,obj.offset.z);
            map.sky.scale.setFromValues(obj.scale.x,obj.scale.y,obj.scale.z);
            map.sky.rotate.setFromValues(obj.rotate.x,obj.rotate.y,obj.rotate.z);
            map.sky.color.setFromValues(obj.color.r,obj.color.g,obj.color.b);
            map.sky.bitmap=mesh.bitmap;
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // backgrounds
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsBackground');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            map.background.on=true;
            map.background.shift=obj.shift;
            map.background.bitmap=mesh.bitmap;
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // lights
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsLight');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            map.lightList.add(new LightClass(mesh.center,new ColorClass(obj.color.r,obj.color.g,obj.color.b),obj.intensity,((obj.exponent===undefined)?0.0:obj.exponent),((obj.ambient===undefined)?false:obj.ambient)));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // movements
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsMove');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            rotateOffset=new PointClass(0,0,0);
            if (obj.rotateOffset!==undefined) rotateOffset.setFromValues(obj.rotateOffset.x,obj.rotateOffset.y,obj.rotateOffset.z);

            mesh.movement=new MeshMovementClass(this.core,mesh,rotateOffset);

            for (n=0;n!==obj.moves.length;n++) {
                moveDef=obj.moves[n];

                movePoint=new PointClass(0,0,0);
                if (moveDef.move!==undefined) movePoint.setFromValues(moveDef.move.x,moveDef.move.y,moveDef.move.z);

                moveRotate=new PointClass(0,0,0);
                if (moveDef.rotate!==undefined) moveRotate.setFromValues(moveDef.rotate.x,moveDef.rotate.y,moveDef.rotate.z);

                mesh.movement.addMove(new MeshMoveClass(moveDef.tick,movePoint,moveRotate,mesh.movement.lookupPauseType(moveDef.pauseType),((moveDef.pauseData===undefined)?null:moveDef.pauseData),((moveDef.sound===undefined)?null:moveDef.sound),((moveDef.trigger===undefined)?null:moveDef.trigger)));
            }
            
            return(this.MESH_INFORMATIONAL_KEEP);
        }
        
            // cubes
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsCube');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);

            map.cubeList.add(new MapCubeClass(obj.name,((obj.actions===undefined)?null:obj.actions),mesh.xBound,mesh.yBound,mesh.zBound,((obj.data===undefined)?null:obj.data)));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // liquids
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsLiquid');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);

            map.liquidList.add(new MapLiquidClass(this.core,mesh.bitmap,obj.waveSize,obj.wavePeriod,obj.waveHeight,((obj.waveUVStamp===undefined)?[0,0]:obj.waveUVStamp),((obj.uvShift===undefined)?new PointClass(0,0,0):new PointClass(obj.uvShift[0],obj.uvShift[1],0)),((obj.gravityFactor===undefined)?0.1:obj.gravityFactor),((obj.tint===undefined)?new ColorClass(1,1,1):new ColorClass(obj.tint[0],obj.tint[1],obj.tint[2])),((obj.soundIn===undefined)?null:obj.soundIn),((obj.soundOut===undefined)?null:obj.soundOut),mesh.xBound,mesh.yBound,mesh.zBound));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // effects
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsEffect');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            if (obj.effect===undefined) {
                console.log('Bad effect JSON for mesh: '+meshNode.name);
                return(this.MESH_INFORMATIONAL_ERROR);
            }
            
            map.effectList.add(new EffectClass(this.core,null,obj.effect,mesh.center,((obj.data===undefined)?null:obj.data),true,true));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // entities
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsEntity');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);
            
            if (obj.entity===undefined) {
                console.log('Bad entity JSON for mesh: '+meshNode.name);
                return(this.MESH_INFORMATIONAL_ERROR);
            }
            
            pos=new PointClass(mesh.center.x,mesh.yBound.min,mesh.center.z);
            ang=this.getRotationForMeshNodeParent(meshIdx);
            if (map.entityList.addFromMap(obj.entity,meshNode.name,pos,ang,((obj.data===undefined)?null:obj.data),((obj.show===undefined)?true:obj.show))===null) return(this.MESH_INFORMATIONAL_ERROR);
            return(this.MESH_INFORMATIONAL_REMOVE);
        }
        
            // kart starts
            
        value=this.getCustomProperty(materialNode,meshNode,'wsjsKartStart');
        if (value!==null) {
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(this.MESH_INFORMATIONAL_ERROR);

            map.kartStartPositions.push(new PointClass(mesh.center.x,mesh.yBound.min,mesh.center.z));
            return(this.MESH_INFORMATIONAL_REMOVE);
        }

        return(this.MESH_INFORMATIONAL_KEEP);
    }
    
        //
        // decode meshes
        //
        
    decodeMesh(map,meshList,skeleton)
    {
        let n,k,t,meshesNode,meshNode,primitiveNode;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let jointArray,weightArray,fakeArrayLen,noSkinAttachedNodeIdx,skinIdx;
        let nIdx;
        let mesh,materialNode,bitmap,curBitmapName,informResult;
        let v=new PointClass(0,0,0);
        let normal=new PointClass(0,0,0);
        let tangent=new PointClass(0,0,0);
        let cumulativeNodeMatrix;
        let meshes=[];
        
            // run through the meshes
            
        meshesNode=this.jsonData.meshes;
        
        for (n=0;n!==meshesNode.length;n++) {
            meshNode=meshesNode[n];
            
                // always store a matrix for each mesh
                // from the nodes, this is mostly used by
                // maps to precalculate the vertexes as there
                // is no rigging so they need to be moved
                // into their real coordinates
                
            cumulativeNodeMatrix=this.getCumulativeNodeMatrixForMesh(n);
            
                // run through the primitives
                // we need to knock out anything that's
                // not a triangle stream
                
            for (k=0;k!==meshNode.primitives.length;k++) {
                primitiveNode=meshNode.primitives[k];
                
                    // is it a triangle stream?  Some exporters
                    // seem to leave this off, so I assume the default
                    // is triangle stream
                    
                if (primitiveNode.mode!==undefined) {
                    if (primitiveNode.mode!==4) continue;
                }
                
                    // create or get bitmap
                    
                bitmap=this.findMaterialForMesh(meshNode,primitiveNode);
                if (bitmap===null) return(false);
                
                    // get all the arrays
                  
                indexArray=this.decodeBuffer(primitiveNode.indices,1);
                vertexArray=this.decodeBuffer(primitiveNode.attributes.POSITION,3);
                normalArray=this.decodeBuffer(primitiveNode.attributes.NORMAL,3);
                
                tangentArray=null;  // tangents aren't always there, we recreate them if missing
                if (primitiveNode.attributes.TANGENT!==undefined) tangentArray=this.decodeBuffer(primitiveNode.attributes.TANGENT,3);
                
                    // get the UV, sometimes solid colors have
                    // no UV so just make a 0 uv array
                    
                if (primitiveNode.attributes.TEXCOORD_0!==undefined) {
                    uvArray=this.decodeBuffer(primitiveNode.attributes.TEXCOORD_0,2);
                }
                else {
                    fakeArrayLen=Math.trunc(vertexArray.length/3)*2;
                    uvArray=new Float32Array(fakeArrayLen);
                }
                
                    // if we don't have a skeleton (loading a map) then
                    // don't get any joints.  If we have a skeleton, but no
                    // joints, then it's something attached directly to
                    // a node (no skinning) otherwise it's a regular skinned mesh
                    
                    // we also find which skin this is attached to
                    
                jointArray=null;
                weightArray=null;
                skinIdx=-1;
                noSkinAttachedNodeIdx=-1;
                
                if (skeleton!==null) {
                    
                    if (primitiveNode.attributes.JOINTS_0===undefined) {
                        noSkinAttachedNodeIdx=this.findNodeIndexInDataForMeshIndex(n);
                        if (noSkinAttachedNodeIdx===-1) noSkinAttachedNodeIdx=0;        // if no attachment, then just use root node
                        
                        fakeArrayLen=Math.trunc(vertexArray.length/3)*4;    // some drivers can get goofy if you don't bind something
                        jointArray=new Float32Array(fakeArrayLen);
                        weightArray=new Float32Array(fakeArrayLen);        
                    }
                    else {
                        jointArray=this.decodeBuffer(primitiveNode.attributes.JOINTS_0,4);
                        weightArray=this.decodeBuffer(primitiveNode.attributes.WEIGHTS_0,4);
                        
                        skinIdx=this.findSkinIndexInDataForMeshIndex(n);
                        if (skinIdx===-1) skinIdx=0;                        // if no attachment, then it defaults to first skin
                    }
                }
                
                    // maps don't have skeletons so we need to add up
                    // the cumulative matrixes since to animation
                
                if (skeleton===null) {    
                    for (t=0;t<vertexArray.length;t+=3) {
                        v.setFromValues(vertexArray[t],vertexArray[t+1],vertexArray[t+2]);
                        v.matrixMultiply(cumulativeNodeMatrix);

                        vertexArray[t]=v.x;
                        vertexArray[t+1]=v.y;
                        vertexArray[t+2]=v.z;

                        normal.setFromValues(normalArray[t],normalArray[t+1],normalArray[t+2]);
                        normal.matrixMultiplyIgnoreTransform(cumulativeNodeMatrix);        // will get normalized below

                        normalArray[t]=normal.x;
                        normalArray[t+1]=normal.y;
                        normalArray[t+2]=normal.z;
                    }
                }
                
                    // normalize any normals

                for (t=0;t<vertexArray.length;t+=3) {
                    normal.setFromValues(normalArray[t],normalArray[t+1],normalArray[t+2]);
                    normal.normalize();
                    normalArray[t]=normal.x;
                    normalArray[t+1]=normal.y;
                    normalArray[t+2]=normal.z;
                }
                
                    // recreate or normalize the tangents
                    
                if (tangentArray===null) {
                    tangentArray=this.buildTangents(vertexArray,uvArray,indexArray);
                }
                else {
                    nIdx=0;
                    
                    for (t=0;t<vertexArray.length;t+=3) {
                        tangent.setFromValues(tangentArray[nIdx],tangentArray[nIdx+1],tangentArray[nIdx+2]);
                        tangent.normalize();
                        tangentArray[nIdx++]=tangent.x;
                        tangentArray[nIdx++]=tangent.y;
                        tangentArray[nIdx++]=tangent.z;
                    }
                }
                
                    // any texture transforms
                    
                if (bitmap.scale!==null) {
                    for (t=0;t<uvArray.length;t+=2) {
                        uvArray[t]=uvArray[t]*bitmap.scale[0];
                        uvArray[t+1]=uvArray[t+1]*bitmap.scale[1];
                    }
                }
                
                    // finally make the mesh
                    // all the array types should be their proper
                    // type at this point (like Float32Array, etc)
                    
                mesh=new MeshClass(this.core,meshNode.name,bitmap,noSkinAttachedNodeIdx,skinIdx,vertexArray,normalArray,tangentArray,uvArray,jointArray,weightArray,indexArray);
                
                    // maps don't have rigging, so we need to
                    // fix the import scale here
                    
                if (map!==null) mesh.scale(this.mapImportScale);
                    
                    // handle any custom properties and
                    // informational meshes
                    
                materialNode=this.jsonData.materials[primitiveNode.material];
                if (this.getCustomProperty(materialNode,meshNode,'wsjsNoCollision')!==null) mesh.noCollisions=true;
                if (this.getCustomProperty(materialNode,meshNode,'wsjsSimpleCollision')!==null) mesh.simpleCollisions=true;
                
                if (map!==null) {
                    informResult=this.decodeMapMeshInformational(map,materialNode,meshNode,mesh,n);
                    if (informResult===this.MESH_INFORMATIONAL_ERROR) return(false);
                    if (informResult===this.MESH_INFORMATIONAL_REMOVE) continue;
                }
                
                    // finally add it to model
                    
                meshes.push(mesh);
            }
        }

            // and sort meshes by bitmaps into mesh list
            
        for (n=0;n!==meshes.length;n++) {
            if (meshes[n]===null) continue;
            
            curBitmapName=meshes[n].bitmap.name;
            
            for (k=n;k<meshes.length;k++) {
                if (meshes[k]===null) continue;
                
                if (meshes[k].bitmap.name===curBitmapName) {
                    meshList.add(meshes[k]);
                    meshes[k]=null;
                }
            }
        }
        
        return(true);
    }
    
        //
        // decode map informational
        // this is a special mesh in the map that we use to store
        // some game specific information
        //
        
    decodeMapInformational(map)
    {
        let n,meshNode,meshesNode;
        let value,obj;

        meshesNode=this.jsonData.meshes;
        
        for (n=0;n!==meshesNode.length;n++) {
            meshNode=meshesNode[n];
            
            value=this.getCustomProperty(null,meshNode,'wsjsMap');
            if (value===null) continue;
            
                // decode it
                
            obj=this.decideMapMeshInformationalParseJSON(meshNode,value);
            if (obj===null) return(false);
            
            if ((obj.scale===undefined) || (obj.bumpHeight===undefined) || (obj.gravity===undefined)) {
                console.log('Map glTF wsjsMap mesh JSON requires scale, bumpHeight, and gravity');
                return(false);
            }
            
            this.mapImportScale=obj.scale;
            
            map.bumpHeight=obj.bumpHeight;
            map.viewSetup=obj.view;
            map.gravityMinValue=obj.gravity.min;
            map.gravityMaxValue=obj.gravity.max;
            map.gravityAcceleration=obj.gravity.acceleration;

            if (obj.maxFloorCeilingDetectionFactor!==undefined) {
                map.meshList.maxFloorCeilingDetectionFactor=1.0-obj.maxFloorCeilingDetectionFactor;     // 0 = walls facing straight up only, to 1 which is pretty much anything
            }

            if (obj.lightMin!==undefined) map.lightList.lightMin.setFromValues(obj.lightMin.r,obj.lightMin.g,obj.lightMin.b);
            if (obj.lightMax!==undefined) map.lightList.lightMax.setFromValues(obj.lightMax.r,obj.lightMax.g,obj.lightMax.b);
            
            return(true);
        }
        
        console.log('Map glTF is missing a wsjsMap mesh with map information');
        
        return(false);
    }
    
        //
        // decode animations
        //
        
    decodeAnimations(skeleton)
    {
        let n,k,t,isVec4;
        let animations,channels,animateNode,channelNode,samplerNode;
        let animation,channel,pose;
        let timeArray,vectorArray,vIdx;
        
            // decode the animations
        
        animations=this.jsonData.animations;
        if (animations===undefined) return(true);
        
        for (n=0;n!==animations.length;n++) {
            animateNode=animations[n];
            
                // new animation
                
            animation=new ModelAnimationClass(animateNode.name);
            skeleton.animations.push(animation);
            
                // channels
                
            channels=animateNode.channels;
            
            for (k=0;k!==channels.length;k++) {
                channelNode=channels[k];
                
                    // currently only handling translation, rotation,
                    // and scale
                    
                if ((channelNode.target.path!=='translation') && (channelNode.target.path!=='rotation') && (channelNode.target.path!=='scale')) continue;
                    
                channel=new ModelAnimationChannelClass(channelNode.target.node,channelNode.target.path);
                
                    // read in the samplier
                    
                samplerNode=animateNode.samplers[channelNode.sampler];
                    
                isVec4=(channel.trsType===channel.TRS_TYPE_ROTATION);
                timeArray=this.decodeBuffer(samplerNode.input,1);
                vectorArray=this.decodeBuffer(samplerNode.output,(isVec4?4:3));
                
                for (t=0;t!==timeArray.length;t++) {
                    if (isVec4) {
                        vIdx=t*4;
                        pose=new ModelAnimationChannelPoseClass(Math.trunc(timeArray[t]*1000),vectorArray.slice(vIdx,(vIdx+4)));
                    }
                    else {
                        vIdx=t*3;
                        pose=new ModelAnimationChannelPoseClass(Math.trunc(timeArray[t]*1000),vectorArray.slice(vIdx,(vIdx+3)));
                    }
                    channel.poses.push(pose);
                }
                
                    // add to animation
                    
                animation.channels.push(channel);
            }
            
                // finally calculate length of animation
                
            animation.calcAnimationLength();
        }
        
        return(true);
    }
    
        //
        // main importer
        //
        
    async import(map,meshList,skeleton)
    {
        this.jsonData=null;
        this.binData=null;
        
            // load the gltf
            
        await this.loadGLTFJson()
            .then
                (
                    value=>{
                        this.jsonData=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );

        if (this.jsonData===null) return(false);
        
            // load the bin
            
        await this.loadGLTFBin()
            .then
                (
                    value=>{
                        this.binData=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );

        if (this.binData===null) return(false);
        
            // process the file
            
        if (skeleton!==null) {
            if (!this.decodeSkeleton(skeleton)) return(false);
        }
        
        if (map!==null) {
            if (!this.decodeMapInformational(map)) return(false);
        }
        
        if (!this.decodeMesh(map,meshList,skeleton)) return(false);
        
        if (skeleton!==null) {
            if (!this.decodeAnimations(skeleton)) return(false);
        }
        
        return(true);
    }
}
