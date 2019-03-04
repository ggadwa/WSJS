import ImportBaseClass from '../import/import_base.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import ColorClass from '../utility/color.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import MeshClass from '../mesh/mesh.js';
import ModelNodeClass from '../model/model_node.js';
import ModelJointClass from '../model/model_joint.js';
import ModelAnimationClass from '../model/model_animation.js';
import ModelAnimationChannelClass from '../model/model_animation_channel.js';
import ModelAnimationChannelPoseClass from '../model/model_animation_channel_pose.js';
import ModelSkeletonClass from '../model/model_skeleton.js';

export default class ImportGLTFClass extends ImportBaseClass
{
    constructor(view,importSettings)
    {
        super(view,importSettings);
        
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
        let url='./data/models/'+this.importSettings.name+'/scene.gltf';
        
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
        let url='./data/models/'+this.importSettings.name+'/scene.bin';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.arrayBuffer());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
    async loadGLTF()
    {
        this.jsonData=null;
        this.binData=null;
        
        await Promise.all([this.loadGLTFJson(),this.loadGLTFBin()])
            .then
                (
                    (values)=>{
                        this.jsonData=values[0];
                        this.binData=values[1];
                    },
                    (value)=>{
                        console.log(value);
                    }
                );

        return(this.jsonData!==null);
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
            
            case this.view.gl.FLOAT:
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
            
            case this.view.gl.UNSIGNED_INT:
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
            
            case this.view.gl.INT:
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
            
            case this.view.gl.UNSIGNED_SHORT:
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
                
            case this.view.gl.UNSIGNED_SHORT:
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
        let uv0=new Point2DClass(0,0,0);
        let uv1=new Point2DClass(0,0,0);
        let uv2=new Point2DClass(0,0,0);
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
        rotation=new QuaternionClass();
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
        rotation=new QuaternionClass();
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
        let n,nodes,skin,joints;
        let mat,inverseBindMatrixFloatArray;
        
            // if there's no skin, then no rigging
        
        if (this.jsonData.skins===undefined) return(true);
        
            // we have to load every node
            // because even though they aren't part of
            // the skeleton they have important TRS data
         
        nodes=this.jsonData.nodes;
        
        for (n=0;n!==nodes.length;n++) {
            skeleton.nodes.push(this.decodeNode(n));
        }
        
            // assuming a single skin, we
            // get the joint indexes for this skeleton
            // because of shader limits, we need to 
            // error out if too many joints
        
        skin=this.jsonData.skins[0];
        joints=skin.joints;
        
        if (joints.length>ModelSkeletonClass.MAX_SKELETON_JOINT) {
            console.log('too many joints in skeleton ('+joints.length+' out of '+SkeletonClass.MAX_SKELETON_JOINT+' in model '+this.importSettings.name);
            return(false);
        }
        
        inverseBindMatrixFloatArray=this.decodeBuffer(skin.inverseBindMatrices,16);
        
        for (n=0;n!==joints.length;n++) {
            mat=new Matrix4Class();
            mat.fromArrayOffset(inverseBindMatrixFloatArray,(n*16));
            skeleton.joints.push(new ModelJointClass(joints[n],mat));
        }
        
            // now find the parents
            
        for (n=0;n!==skeleton.nodes.length;n++) {
            skeleton.nodes[n].parentNodeIdx=this.findNodeIndexInSkeletonChildIndexes(skeleton,n);
        }
        
            // find the root node by taking the first joint
            // node and finding it's ultimate parent
            
        skeleton.rootNodeIdx=skeleton.joints[0].nodeIdx;
        
        while (true) {
            if (skeleton.nodes[skeleton.rootNodeIdx].parentNodeIdx===-1) break;
            skeleton.rootNodeIdx=skeleton.nodes[skeleton.rootNodeIdx].parentNodeIdx;
        }
            
        return(true);
    }
    
        //
        // decode materials
        //
    
    findMaterialForMesh(meshNode,primitiveNode)
    {
        let diffuseTexture,diffuseFactor,baseColorFactor,glossTexture,specularFactorProp,glossFactor;
        let colorURL=null;
        let normalURL=null;
        let specularURL=null;
        let specularFactor=null;
        let prefixURL='models/'+this.importSettings.name+'/';
        let materialNode=this.jsonData.materials[primitiveNode.material];
        
            // first find any normal texture
            
        if ((materialNode.normalTexture!==undefined) && (!this.importSettings.getMaterialDirectlyFromName)) {
            normalURL=prefixURL+this.jsonData.images[materialNode.normalTexture.index].uri;
        }
        
            // default specular
            
        specularFactor=new ColorClass(1.0,1.0,1.0);
        
            // special override for fbx->gltf conversions
            // that have wacky textures
            
        if (this.importSettings.getMaterialDirectlyFromName) {
            colorURL=prefixURL+'textures/'+materialNode.name+'_color.png';
            normalURL=prefixURL+'textures/'+materialNode.name+'_normals.png';
            specularURL=prefixURL+'textures/'+materialNode.name+'_specular.png';
            specularFactor=new ColorClass(5.0,5.0,5.0);
        }
        
            // now any color texture
            // check specularGlossiness first
        
        if (colorURL===null) {
            if (materialNode.extensions!==undefined) {
                if (materialNode.extensions.KHR_materials_pbrSpecularGlossiness!==undefined) {

                        // find the glossy base color

                    diffuseTexture=materialNode.extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture;
                    if (diffuseTexture!==undefined) {
                        colorURL=prefixURL+this.jsonData.images[diffuseTexture.index].uri;
                    }
                    else {
                        diffuseFactor=materialNode.extensions.KHR_materials_pbrSpecularGlossiness.diffuseFactor;
                        if (diffuseFactor!==undefined) {
                            glossFactor=(materialNode.extensions.KHR_materials_pbrSpecularGlossiness.glossinessFactor*2.0);     // this is relatively random and really here to deal with missing textures
                            return(this.view.bitmapList.addSolidColor((prefixURL+materialNode.name),(diffuseFactor[0]+glossFactor),(diffuseFactor[1]+glossFactor),(diffuseFactor[2]+glossFactor)));
                        }
                    }

                        // get the specular

                    glossTexture=materialNode.extensions.KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture;
                    if (glossTexture!==undefined) {
                        specularURL=prefixURL+this.jsonData.images[glossTexture.index].uri;

                        specularFactorProp=materialNode.extensions.KHR_materials_pbrSpecularGlossiness.specularFactor;
                        if (specularFactorProp!==undefined) specularFactor=new ColorClass(specularFactorProp[0],specularFactorProp[1],specularFactorProp[2]);
                    }
                }
            }
        }
        
            // check metallicRoughness next
            
        if (colorURL===null) {
            
                // check for base color
                
            if (materialNode.pbrMetallicRoughness!==undefined) {
                if (materialNode.pbrMetallicRoughness.baseColorTexture!==undefined) {
                    colorURL=prefixURL+this.jsonData.images[materialNode.pbrMetallicRoughness.baseColorTexture.index].uri;
                }
                
                    // else check for solid color
                    
                else {
                    baseColorFactor=materialNode.pbrMetallicRoughness.baseColorFactor;
                    if (baseColorFactor!==undefined) {
                        return(this.view.bitmapList.addSolidColor((prefixURL+materialNode.name),baseColorFactor[0],baseColorFactor[1],baseColorFactor[2]));
                    }
                }
            }
        }
        
            // no color texture is an error

        if (colorURL===null) {
            console.log('Could not find texture for mesh '+meshNode.name+' in '+this.importSettings.name);
            return(null);
        }
        
            // add the texture and return the bitmap

        return(this.view.bitmapList.add(colorURL,normalURL,specularURL,specularFactor,null));
    }
    
        //
        // decode meshes
        //
        
    decodeMesh(meshList,skeleton)
    {
        let n,k,t,meshesNode,meshNode,primitiveNode;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let jointArray,weightArray;
        let nIdx,tIdx;
        let mesh,bitmap,curBitmapName;
        let normal=new PointClass(0,0,0);
        let tangent=new PointClass(0,0,0);
        let cumulativeNodeMatrix;
        let meshes=[];
        
            // if there's no skin, then ignore any rigging
            
        if (this.jsonData.skins===undefined) skeleton=null;
        
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
                // triangle stream
                
            for (k=0;k!==meshNode.primitives.length;k++) {
                primitiveNode=meshNode.primitives[k];
                if (primitiveNode.mode!==4) continue;       // not a triangle stream
                
                    // get all the arrays
                  
                indexArray=this.decodeBuffer(primitiveNode.indices,1);
                vertexArray=this.decodeBuffer(primitiveNode.attributes.POSITION,3);
                normalArray=this.decodeBuffer(primitiveNode.attributes.NORMAL,3);
                
                tangentArray=null;  // tangents aren't always there, we recreate them if missing
                if (primitiveNode.attributes.TANGENT!==undefined) tangentArray=this.decodeBuffer(primitiveNode.attributes.TANGENT,3);
                
                                    // solid colors usually don't have UVs but we treat everything as a texture so we create a 0,0 list
                if (primitiveNode.attributes.TEXCOORD_0!==undefined) {
                    uvArray=this.decodeBuffer(primitiveNode.attributes.TEXCOORD_0,2);
                }
                else {
                    uvArray=new Float32Array(Math.trunc(vertexArray.length/3)*2);
                }
                
                if (skeleton!==null) {
                    jointArray=this.decodeBuffer(primitiveNode.attributes.JOINTS_0,4);
                    weightArray=this.decodeBuffer(primitiveNode.attributes.WEIGHTS_0,4);
                }
                else {
                    jointArray=null;
                    weightArray=null;
                }
                
                    // normalize any normals or tangents

                nIdx=0;
                tIdx=0;
                
                for (t=0;t<vertexArray.length;t+=3) {
                    normal.setFromValues(normalArray[nIdx],normalArray[nIdx+1],normalArray[nIdx+2]);
                    normal.normalize();
                    normalArray[nIdx++]=normal.x;
                    normalArray[nIdx++]=normal.y;
                    normalArray[nIdx++]=normal.z;
                    
                    if (tangentArray!==null) {
                        tangent.setFromValues(tangentArray[nIdx],tangentArray[nIdx+1],tangentArray[nIdx+2]);
                        tangent.normalize();
                        tangentArray[nIdx++]=tangent.x;
                        tangentArray[nIdx++]=tangent.y;
                        tangentArray[nIdx++]=tangent.z;
                    }
                }
                
                    // do we need to recreate tangents?
                    
                if (tangentArray===null) tangentArray=this.buildTangents(vertexArray,uvArray,indexArray);
                
                    // create bitmap
                    
                bitmap=this.findMaterialForMesh(meshNode,primitiveNode);
                if (bitmap===null) return(false);
                
                    // finally make the mesh
                    // all the array types should be their proper
                    // type at this point (like Float32Array, etc)
                    
                mesh=new MeshClass(this.view,meshNode.name,bitmap,cumulativeNodeMatrix,vertexArray,normalArray,tangentArray,uvArray,jointArray,weightArray,indexArray);
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
        // decode animations
        //
        
    decodeAnimations(skeleton)
    {
        let n,k,t,isVec4;
        let animations,channels,animateNode,channelNode,samplerNode;
        let animation,channel,pose;
        let timeArray,vectorArray,vIdx;
        
            // if no skin, then no animation
            
        if (this.jsonData.skins===undefined) return(true);    
            
            // decode the animations
        
        animations=this.jsonData.animations;
        if (animations===undefined) return;
        
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
                    
                channel=null;
                
                switch (channelNode.target.path) {
                    case 'translation':
                        channel=new ModelAnimationChannelClass(channelNode.target.node,ModelAnimationChannelClass.TRS_TYPE_TRANSLATION);
                        break;
                    case 'rotation':
                        channel=new ModelAnimationChannelClass(channelNode.target.node,ModelAnimationChannelClass.TRS_TYPE_ROTATION);
                        break;
                    case 'rotation':
                        channel=new ModelAnimationChannelClass(channelNode.target.node,ModelAnimationChannelClass.TRS_TYPE_SCALE);
                        break;
                }
                
                if (channel===null) continue;
                
                    // read in the samplier
                    
                samplerNode=animateNode.samplers[channelNode.sampler];
                    
                isVec4=(channel.trsType===ModelAnimationChannelClass.TRS_TYPE_ROTATION);
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
        
    async import(meshList,skeleton)
    {
        let success;
        
            // load the files
            
        success=true;
        
        await this.loadGLTF()
            .then
                (
                    value=>{
                        success=value;
                    },
                )
                
        if (!success) return;
        
            // process the file
            
        if (skeleton!==null) {
            if (!this.decodeSkeleton(skeleton)) return(false);
        }
        
        if (!this.decodeMesh(meshList,skeleton)) return(false);
        
        if (skeleton!==null) {
            if (!this.decodeAnimations(skeleton)) return(false);
        }
        
        return(true);
    }
}
