import ImportBaseClass from '../import/import_base.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import QuaternionClass from '../utility/quaternion.js';
import MatrixClass from '../utility/matrix.js';
import MeshVertexClass from '../mesh/mesh_vertex.js';
import MeshVertexBoneConnectClass from '../mesh/mesh_vertex_bone_connect.js';
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
        let n,k,mesh,nVertex,fy;
        
        fy=meshes[0].vertexList[0].position.y;
        
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                if (mesh.vertexList[k].position.y<fy) fy=mesh.vertexList[k].position.y;
            }
        }
        
            // floor vertexes
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                mesh.vertexList[k].position.y-=fy;
            }
        }
        
            // and floor the root bone
            
        if (skeleton.rootBoneIdx!==-1) {
            skeleton.bones[skeleton.rootBoneIdx].translation.y-=fy;
        }
    }
    
        //
        // decode bones
        //
    
    decodeBoneRecurse(skeleton,parentBoneIdx,nodeIdx)
    {
        let n,node,bone,boneIdx;
        let translationProp,rotationProp,scaleProp;
        let translation,rotation,scale;
        
        node=this.jsonData.nodes[nodeIdx];
        
            // get the position
            
        translation=new PointClass(0,0,0);
        rotation=new QuaternionClass();
        scale=new PointClass(1,1,1);
            
        if (parentBoneIdx!==-1) {
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
    
    decodeBones(skeleton)
    {
        let nodeIdx;
        
            // build the bone tree
            // for now we are assuming single skin
            // at this point for use skin 0 to get
            // root bone
            
        nodeIdx=this.jsonData.skins[0].skeleton;
        skeleton.rootBoneIdx=this.decodeBoneRecurse(skeleton,-1,nodeIdx);
    }
    
        //
        // decode materials
        //
    
    findMaterialForMesh(meshNode,primitiveNode)
    {
        let materialNode=this.jsonData.materials[primitiveNode.material];
        
        if (materialNode.extensions.KHR_materials_pbrSpecularGlossiness!==undefined) {
            if (materialNode.extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture) {
                console.log(meshNode.name+' has diffuse texture');
            }
            else {
                console.log(meshNode.name+' has diffuse color='+materialNode.extensions.KHR_materials_pbrSpecularGlossiness.diffuseFactor);
            }
        }
        else {
            if (materialNode.pbrMetallicRoughness!==undefined) {
                console.log(meshNode.name+' has metallic='+materialNode.pbrMetallicRoughness.baseColorTexture);
            }
        }
        
        console.log(materialNode.normalTexture);
        return(null);
        
            // could not find any texture
            
        console.log('Could not find texture for mesh '+meshNode.name+' in '+this.importSettings.name);
        return(null);
    }
    
        //
        // decode meshes
        //
        
    decodeMesh(meshList,skeleton)
    {
        let n,k,t,meshesNode,meshNode,primitiveNode;
        let indices,vertices,normals,tangents,uvs,v,vertexList,needColorTexture;
        let vIdx,nIdx,tIdx,uvIdx;
        let mesh,curBitmapName;
        let meshes=[];
        
            // run through the meshes
            
        meshesNode=this.jsonData.meshes;
        
        for (n=0;n!==meshesNode.length;n++) {
            meshNode=meshesNode[n];
            
                // run through the primitives
                // we need to knock out anything that's
                // triangle stream
                
            for (k=0;k!==meshNode.primitives.length;k++) {
                primitiveNode=meshNode.primitives[k];
                if (primitiveNode.mode!==4) continue;       // not a triangle stream
                needColorTexture=(primitiveNode.attributes.TEXCOORD_0===undefined);      // no uv mapping
                
                    // create the mesh
                  
                indices=this.decodeBuffer(primitiveNode.indices,1);
                vertices=this.decodeBuffer(primitiveNode.attributes.POSITION,3);
                normals=this.decodeBuffer(primitiveNode.attributes.NORMAL,3);
                tangents=this.decodeBuffer(primitiveNode.attributes.TANGENT,3);
                
                if (!needColorTexture) {
                    uvs=this.decodeBuffer(primitiveNode.attributes.TEXCOORD_0,2);
                }
                else {
                    uvs=new Float32Array(Math.trunc(vertices.length/3)*2);
                }
                
                vIdx=0;
                nIdx=0;
                tIdx=0;
                uvIdx=0;
                vertexList=[];
                
                for (t=0;t!=indices.length;t++) {
                    v=new MeshVertexClass();
                    v.position.setFromValues((vertices[vIdx++]*this.importSettings.scale),(vertices[vIdx++]*this.importSettings.scale),(vertices[vIdx++]*this.importSettings.scale));
                    v.normal.setFromValues(normals[nIdx++],normals[nIdx++],normals[nIdx++]);
                    v.normal.normalize();
                    v.tangent.setFromValues(tangents[tIdx++],tangents[tIdx++],tangents[tIdx++]);
                    v.tangent.normalize();
                    v.uv.setFromValues((uvs[uvIdx++]*this.importSettings.uScale),(uvs[uvIdx++]*this.importSettings.vScale));
                    vertexList.push(v);
                }
                
                    // create bitmap
                    
                this.findMaterialForMesh(meshNode,primitiveNode);
                
                    // finally make the mesh
                    
                mesh=new MeshClass(this.view,meshNode.name,this.view.bitmapList.get('roof_metal'),vertexList,indices,0);
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
        this.decodeMesh(meshList,skeleton);
        
        return(true);
    }
}
