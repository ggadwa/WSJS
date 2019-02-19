import ImportBaseClass from '../import/import_base.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
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
        
    decodeBuffer(accessorIdx,vecSize)
    {
        let n,k,arrayIdx,byteIdx;
        let dataView,array,itemCount,componentType;
        let accessorNode,bufferViewNode;
        let byteOffset,byteLength,byteStride;
        
            // start at the accessor
            
        accessorNode=this.jsonData.accessors[accessorIdx];
        byteOffset=(accessorNode.byteOffset===undefined)?0:accessorNode.byteOffset;
        componentType=accessorNode.componentType;

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
                byteStride=(bufferViewNode.byteStride===undefined)?4:bufferViewNode.byteStride;
                itemCount=Math.trunc(byteLength/byteStride);
                
                array=new Float32Array(itemCount*vecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==itemCount;n++) {
                    for (k=0;k!==vecSize;k++) {
                        array[arrayIdx]=dataView.getFloat32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.view.gl.UNSIGNED_INT:
                byteStride=(bufferViewNode.byteStride===undefined)?4:bufferViewNode.byteStride;
                itemCount=Math.trunc(byteLength/byteStride);
                
                array=new Uint32Array(itemCount*vecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==itemCount;n++) {
                    for (k=0;k!==vecSize;k++) {
                        array[arrayIdx]=dataView.getUint32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.view.gl.INT:
                byteStride=(bufferViewNode.byteStride===undefined)?4:bufferViewNode.byteStride;
                itemCount=Math.trunc(byteLength/byteStride);
                
                array=new Int32Array(itemCount*vecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==itemCount;n++) {
                    for (k=0;k!==vecSize;k++) {
                        array[arrayIdx]=dataView.getInt32((byteIdx+(k*4)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
            
            case this.view.gl.UNSIGNED_SHORT:
                byteStride=(bufferViewNode.byteStride===undefined)?2:bufferViewNode.byteStride;
                itemCount=Math.trunc(byteLength/byteStride);
                
                array=new Uint16Array(itemCount*vecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==itemCount;n++) {
                    for (k=0;k!==vecSize;k++) {
                        array[arrayIdx]=dataView.getUint16((byteIdx+(k*2)),true);
                        arrayIdx++;
                    }
                    byteIdx+=byteStride;
                }
            
                return(array);
                
            case this.view.gl.UNSIGNED_SHORT:
                byteStride=(bufferViewNode.byteStride===undefined)?2:bufferViewNode.byteStride;
                itemCount=Math.trunc(byteLength/byteStride);
                
                array=new Int16Array(itemCount*vecSize);

                byteIdx=0;
                arrayIdx=0;

                for (n=0;n!==itemCount;n++) {
                    for (k=0;k!==vecSize;k++) {
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
        // rotations and Y zeroing
        //
        
    rotate(meshes,skeleton)
    {
        let n,k,v,mesh,pos,nVertex;
        let centerPnt;
        let minPnt=new PointClass(0,0,0);
        let maxPnt=new PointClass(0,0,0);
        let rotAng=this.importSettings.rotate;
        
            // run through all meshes
            // and get the center point
        
        minPnt.setFromPoint(meshes[0].vertexList[0].position);
        maxPnt.setFromPoint(meshes[0].vertexList[0].position);
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
            
            nVertex=mesh.vertexList.length;

            for (k=0;k!==nVertex;k++) {
                pos=mesh.vertexList[k].position;
                if (pos.x<minPnt.x) minPnt.x=pos.x;
                if (pos.y<minPnt.y) minPnt.y=pos.y;
                if (pos.z<minPnt.z) minPnt.z=pos.z;
                if (pos.x>maxPnt.x) maxPnt.x=pos.x;
                if (pos.y>maxPnt.y) maxPnt.y=pos.y;
                if (pos.z>maxPnt.z) maxPnt.z=pos.z;
            }
        }
        
        centerPnt=new PointClass(Math.trunc((minPnt.x+maxPnt.x)*0.5),Math.trunc((minPnt.y+maxPnt.y)*0.5),Math.trunc((minPnt.z+maxPnt.z)*0.5));
        
            // now rotate vertexes
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
            
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                v=mesh.vertexList[k];
                v.position.rotateAroundPoint(centerPnt,rotAng);
                v.normal.rotate(rotAng);
            }
        }
        
            // and any bones
            
        for (n=0;n!==skeleton.bones.length;n++) {
            skeleton.bones[n].vectorFromParent.rotate(rotAng);        // these are vectors, just need to rotate
        }
    }
    
    zeroTop(meshes)
    {
        let n,k,mesh,nVertex,by;
        
            // find bottom Y
            
        by=0;
        
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                if (mesh.vertexList[k].position.y<by) by=mesh.vertexList[k].position.y;
            }
        }
        
        by=Math.trunc(Math.abs(by));
        
            // floor vertexes
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                mesh.vertexList[k].position.y+=by;
            }
        }
    }
    
    zeroBottom(meshes)
    {
        let n,k,mesh,nVertex,by;
        
        by=0;
        
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                if (mesh.vertexList[k].position.y>by) by=mesh.vertexList[k].position.y;
            }
        }
        
            // floor vertexes
            
        for (n=0;n!==meshes.length;n++) {
            mesh=meshes[n];
        
            nVertex=mesh.vertexList.length;
            
            for (k=0;k!==nVertex;k++) {
                mesh.vertexList[k].position.y-=by;
            }
        }
    }
    
        //
        // decode bones
        //
    
    decodeBoneRecurse(skeleton,parentBoneIdx,nodeIdx)
    {
        let n,node,bone,boneIdx;
        let translation,vectorFromParent;
        
        node=this.jsonData.nodes[nodeIdx];
        
            // get the position
            
        translation=node.translation;
        
        if ((parentBoneIdx===-1) || (translation===undefined)) {
            vectorFromParent=new PointClass(0,0,0);
        }
        else {
            vectorFromParent=new PointClass((translation[0]*this.importSettings.scale),(translation[1]*this.importSettings.scale),(translation[2]*this.importSettings.scale));
        }
        
            // setup the bone and parent
        
        bone=new ModelBoneClass(node.name,parentBoneIdx,vectorFromParent);
        
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
        // decode meshes
        //
        
    decodeMesh(meshList,skeleton)
    {
        let n,k,t,meshesNode,meshNode,primitiveNode;
        let indices,vertices,normals,tangents,uvs,v,vertexList;
        let vIdx,nIdx,tIdx,uvIdx;
        let mesh,curBitmapName;
        let meshes=[];
        
            // run through the meshes
            
        meshesNode=this.jsonData.meshes;
        
        for (n=0;n!==meshesNode.length;n++) {
            meshNode=meshesNode[n];
            
                // run through the primitives
                // we need to knock out anything that's
                // not a uv mapped triangle stream
                
            for (k=0;k!==meshNode.primitives.length;k++) {
                primitiveNode=meshNode.primitives[k];
                if (primitiveNode.mode!==4) continue;       // not a triangle stream
                if (primitiveNode.attributes.TEXCOORD_0===undefined) continue;      // no uv mapping
                
                    // create the mesh
                  
                indices=this.decodeBuffer(primitiveNode.indices,1);
                vertices=this.decodeBuffer(primitiveNode.attributes.POSITION,3);
                normals=this.decodeBuffer(primitiveNode.attributes.NORMAL,3);
                tangents=this.decodeBuffer(primitiveNode.attributes.TANGENT,3);
                uvs=this.decodeBuffer(primitiveNode.attributes.TEXCOORD_0,2);
                
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
                
                    // finally make the mesh
                    
                mesh=new MeshClass(this.view,meshNode.name,this.view.bitmapList.get('roof_metal'),vertexList,indices,0);
                meshes.push(mesh);
            }
        }

            // any user rotations

        this.rotate(meshes,skeleton);

            // maps should have zero top (for convience)
            // models should have zero bottom so they
            // draw at the bottom of the xyz position
            // but it's not required

        switch (this.importSettings.yZero) {
            case this.importSettings.Y_ZERO_TOP:
                this.zeroTop(meshes);
                break;
            case this.importSettings.Y_ZERO_BOTTOM:
                this.zeroBottom(meshes);
                break;
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
