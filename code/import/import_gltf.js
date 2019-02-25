import ImportBaseClass from '../import/import_base.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import ColorClass from '../utility/color.js';
import QuaternionClass from '../utility/quaternion.js';
import Matrix4Class from '../utility/matrix4.js';
import MeshClass from '../mesh/mesh.js';
import ModelBoneClass from '../model/model_bone.js';

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
        // flooring
        //
    
    floorY(meshes,skeleton)
    {
        let n,k,mesh,fy;
        
        fy=meshes[0].vertexArray[1];        // first Y on first mesh
        
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            for (k=0;k<mesh.vertexArray.length;k+=3) {
                if (mesh.vertexArray[k+1]<fy) fy=mesh.vertexArray[k+1];
            }
        }
        
            // floor vertexes
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            for (k=0;k<mesh.vertexArray.length;k+=3) {
                mesh.vertexArray[k+1]-=fy;
            }
        }
        
            // and floor the root bone
            
        if (skeleton.rootBoneIdx!==-1) {
            skeleton.bones[skeleton.rootBoneIdx].translation.y-=fy;
        }
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
        
        let tangentArray=[];

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

            tangentArray.push(tangent.x,tangent.y,tangent.z);
            tangentArray.push(tangent.x,tangent.y,tangent.z);
            tangentArray.push(tangent.x,tangent.y,tangent.z);
        }
        
        return(tangentArray);
    }
    
        //
        // decode bones
        //
    
    decodeBoneRecurse(skeleton,parentBoneIdx,nodeIdx)
    {
        let n,node,bone,boneIdx;
        let translationProp,rotationProp,scaleProp;
        let mat,translation,rotation,scale;
        
        node=this.jsonData.nodes[nodeIdx];
        
            // find this bones TRS
            
        translation=new PointClass(0,0,0);
        rotation=new QuaternionClass();
        scale=new PointClass(1,1,1);
        
            // check for matrixes first
            
        if (node.matrix!==undefined) {
            mat=new Matrix4Class();
            mat.fromArray(node.matrix);

                // decompose to TRS

            translation.setFromValues((mat.data[12]*this.importSettings.scale),(mat.data[13]*this.importSettings.scale),(mat.data[14]*this.importSettings.scale));
            rotation.fromMatrix(mat);
            scale.scaleFromMatrix(mat);
        }
        
            // else get TRS
            
        else {
            translationProp=node.translation;
            if (translationProp!==undefined) translation.setFromValues((translationProp[0]*this.importSettings.scale),(translationProp[1]*this.importSettings.scale),(translationProp[2]*this.importSettings.scale));
            
            rotationProp=node.rotation;
            if (rotationProp!==undefined) rotation.setFromValues(rotationProp[0],rotationProp[1],rotationProp[2],rotationProp[3]);
            
            scaleProp=node.scale;
            if (scaleProp!==undefined) scale.setFromValues(scaleProp[0],scaleProp[1],scaleProp[2]);
        }
        
            // setup the bone and parent
        
        bone=new ModelBoneClass(node.name,parentBoneIdx,translation,rotation,scale);
        
        boneIdx=skeleton.bones.length;
        skeleton.bones.push(bone);
        
            // run through all the children
            
        if (node.children===undefined) return(boneIdx);
        
        for (n=0;n!==node.children.length;n++) {
            bone.childBoneIdxs.push(this.decodeBoneRecurse(skeleton,boneIdx,node.children[n]));
        }
        
        return(boneIdx);
    }
    
    decodeBonesFindParentNodeForChildIndex(nodeIdx)
    {
        let n,k,node;
        
        for (n=0;n!==this.jsonData.nodes.length;n++) {
            if (n===nodeIdx) continue;
            
            node=this.jsonData.nodes[n];
            if (node.children===undefined) continue;
            
            for (k=0;k!==node.children.length;k++) {
                if (node.children[k]===nodeIdx) return(n);
            }
        }
        
        return(-1);
    }
    
    decodeBones(skeleton)
    {
        let n,nodeIdx,parentNodeIdx;
        
            // build the bone tree
            // for now we assume a single skin
            // and we find the root of the first
            // joint in that skin, the skeleton
            // index is unreliable and might go away
            
        nodeIdx=this.jsonData.skins[0].joints[0];
        
        while (true) {
            parentNodeIdx=this.decodeBonesFindParentNodeForChildIndex(nodeIdx);
            if (parentNodeIdx===-1) break;
            
            nodeIdx=parentNodeIdx;
        }

            // now bring in the rest of the skeleton
        
        skeleton.rootBoneIdx=this.decodeBoneRecurse(skeleton,-1,nodeIdx);
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
            
        if (materialNode.normalTexture!==undefined) {
            normalURL=prefixURL+this.jsonData.images[materialNode.normalTexture.index].uri;
        }
        
            // default specular
            
        specularFactor=new ColorClass(1.0,1.0,1.0);
        
            // now any color texture
            // check specularGlossiness first
        
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
        let n,k,t,meshesNode,meshNode,primitiveNode,skip;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let jointArray,weightArray;
        let vIdx,nIdx,tIdx;
        let mesh,bitmap,curBitmapName;
        let normal=new PointClass(0,0,0);
        let tangent=new PointClass(0,0,0);
        let meshes=[];
        
            // run through the meshes
            
        meshesNode=this.jsonData.meshes;
        
        for (n=0;n!==meshesNode.length;n++) {
            meshNode=meshesNode[n];
            
                // we can skip meshes that the user doesn't
                // want because sometimes meshs can have planes
                // and stuff
            
            skip=false;
            
            for (k=0;k!==this.importSettings.skipMeshes.length;k++) {
                if (meshNode.name===this.importSettings.skipMeshes[k]) {
                    skip=true;
                    break;
                }
            }
            
            if (skip) continue;
            
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
                
                    // scale the vertexes and normalize
                    // any normals or tangents
                    
                vIdx=0;
                nIdx=0;
                tIdx=0;
                
                for (t=0;t<vertexArray.length;t+=3) {
                    vertexArray[vIdx++]*=this.importSettings.scale;
                    vertexArray[vIdx++]*=this.importSettings.scale;
                    vertexArray[vIdx++]*=this.importSettings.scale;
                    
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
                    
                if (tangentArray===null) this.buildTangents(vertexArray,uvArray,indexArray);
                
                    // create bitmap
                    
                bitmap=this.findMaterialForMesh(meshNode,primitiveNode);
                if (bitmap===null) return(false);
                
                    // finally make the mesh
                    // all the array types should be their proper
                    // type at this point (like Float32Array, etc)
                    
                mesh=new MeshClass(this.view,meshNode.name,bitmap,vertexArray,normalArray,tangentArray,uvArray,jointArray,weightArray,indexArray);
                meshes.push(mesh);
            }
        }

            // models should have zero bottom so they
            // draw at the bottom of the xyz position

        if (this.importSettings.floorY) this.floorY(meshes,skeleton);
        
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
            
        this.decodeBones(skeleton);
        if (!this.decodeMesh(meshList,skeleton)) return(false);
        
        return(true);
    }
}
