import ImportBaseClass from '../import/import_base.js';
import FBXNodeClass from '../import/fbx_node.js';
import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';
import MeshVertexClass from '../mesh/mesh_vertex.js';
import MeshVertexBoneConnectClass from '../mesh/mesh_vertex_bone_connect.js';
import MeshClass from '../mesh/mesh.js';
import ModelBoneClass from '../model/model_bone.js';

export default class ImportFbxClass extends ImportBaseClass
{
    constructor(view,importSettings)
    {
        super(view,importSettings);
        
        this.data=null;
        this.lines=null;
        
        this.READ_NODE_LIST=[
                                'Objects','Model','Geometry',
                                'Vertices','PolygonVertexIndex',
                                'LayerElementUV','UV','UVIndex','LayerElementNormal','Normals','NormalsIndex',
                                'MappingInformationType','ReferenceInformationType',
                                'Properties70','P',
                                'Deformer','Indexes','Weights',
                                'Connections','C'
                            ];        

        this.meshes=[];
    }
    
        //
        // async FBX loader
        //
        
    async loadFBX()
    {
        let resp;
        let url='./data/fbx/'+this.importSettings.name+'.fbx';
        
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
        // node utilities
        //
        
    findNodeByName(startNode,name)
    {
        let node;
        
        for (node of startNode.children) {
            if (node.name===name) return(node);
        }
        
        return(null);
    }
    
    trimNodeNameToNullCharacter(name)
    {
        let idx=name.indexOf(String.fromCharCode(0));
        if (idx!==-1) name=name.substring(0,idx);
        
        return(name);
    }
    
    findNodeByFirstPropertyString(searchNode,name)
    {
        let node;
        
        for (node of searchNode.children) {
            if (node.properties.length!==0) {
                if (node.properties[0]===name) return(node);
            }
        }
        
        return(null);
    }
    
        //
        // rotations and Y zeroing
        //
        
    rotate(vertexList,skeleton)
    {
        let n,v,nVertex;
        let centerPnt=new PointClass(0,0,0);
        let rotAng=this.importSettings.rotate;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=vertexList.length;
        if (nVertex<=1) return;
       
            // find the center

        centerPnt.setFromPoint(vertexList[0].position);
            
        for (n=1;n!==nVertex;n++) {
            centerPnt.addPoint(vertexList[n].position);
        }
        
        centerPnt.x=Math.trunc(centerPnt.x/nVertex);
        centerPnt.y=Math.trunc(centerPnt.y/nVertex);
        centerPnt.z=Math.trunc(centerPnt.z/nVertex);
        
            // now rotate vertexes
            
        for (n=0;n!==nVertex;n++) {
            v=vertexList[n];
            v.position.rotateAroundPoint(centerPnt,rotAng);
            v.normal.rotate(rotAng);
        }
        
            // and any bones
            
        for (n=0;n!==skeleton.bones.length;n++) {
            skeleton.bones[n].vectorFromParent.rotate(rotAng);        // these are vectors, just need to rotate
        }
    }
    
    zeroTop(vertexList)
    {
        let n,nVertex,by;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=vertexList.length;
        if (nVertex<=1) return;
       
            // find bottom Y
            
        by=0;
            
        for (n=0;n!==nVertex;n++) {
            if (vertexList[n].position.y<by) by=vertexList[n].position.y;
        }
        
        by=Math.trunc(Math.abs(by));
        
            // floor vertexes and bones
            
        for (n=0;n!==nVertex;n++) {
            vertexList[n].position.y+=by;
        }
    }
    
    zeroBottom(vertexList)
    {
        let n,nVertex,by;
        
            // can't do anything if only one
            // or no vertexes
            
        nVertex=vertexList.length;
        if (nVertex<=1) return;
       
            // find bottom Y
            
        by=0;
            
        for (n=0;n!==nVertex;n++) {
            if (vertexList[n].position.y>by) by=vertexList[n].position.y;
        }
        
            // floor it
            
        for (n=0;n!==nVertex;n++) {
            vertexList[n].position.y-=by;
        }
    }
    
    buildVertexListTangents(vertexList,indexes)
    {
        let n,nTrig,trigIdx;
        let v0,v1,v2;
        let u10,u20,v10,v20;

            // generate tangents by the trigs
            // sometimes we will end up overwriting
            // but it depends on the mesh to have
            // constant shared vertices against
            // triangle tangents

            // note this recreates a bit of what
            // goes on to create the normal, because
            // we need that first to make the UVs

        let p10=new PointClass(0.0,0.0,0.0);
        let p20=new PointClass(0.0,0.0,0.0);
        let vLeft=new PointClass(0.0,0.0,0.0);
        let vRight=new PointClass(0.0,0.0,0.0);
        let vNum=new PointClass(0.0,0.0,0.0);
        let denom;
        let tangent=new PointClass(0.0,0.0,0.0);

        nTrig=Math.trunc(indexes.length/3);

        for (n=0;n!==nTrig;n++) {

                // get the vertex indexes and
                // the vertexes for the trig

            trigIdx=n*3;

            v0=vertexList[indexes[trigIdx]];
            v1=vertexList[indexes[trigIdx+1]];
            v2=vertexList[indexes[trigIdx+2]];

                // create vectors

            p10.setFromSubPoint(v1.position,v0.position);
            p20.setFromSubPoint(v2.position,v0.position);

                // get the UV scalars (u1-u0), (u2-u0), (v1-v0), (v2-v0)

            u10=v1.uv.x-v0.uv.x;        // x component
            u20=v2.uv.x-v0.uv.x;
            v10=v1.uv.y-v0.uv.y;        // y component
            v20=v2.uv.y-v0.uv.y;

                // calculate the tangent
                // (v20xp10)-(v10xp20) / (u10*v20)-(v10*u20)

            vLeft.setFromScale(p10,v20);
            vRight.setFromScale(p20,v10);
            vNum.setFromSubPoint(vLeft,vRight);

            denom=(u10*v20)-(v10*u20);
            if (denom!==0.0) denom=1.0/denom;
            tangent.setFromScale(vNum,denom);
            tangent.normalize();

                // and set the mesh normal
                // to all vertexes in this trig

            v0.tangent.setFromPoint(tangent);
            v1.tangent.setFromPoint(tangent);
            v2.tangent.setFromPoint(tangent);
        }
    }
    
        //
        // decode geometry nodes
        //
        
    decodeGeometry(rootNode,skeleton)
    {
        let n,k,v,npt,name,bitmap;
        let idx,x,y,z,bone;
        let objectsNode,geoNode;
        let trigIndexes,polygonIndexNode,polygonIndexes,indexes;
        let verticesNode,refTypeNode;
        let uvLayerNode,uvNode,uvIndexNode,uvIndexes;
        let normalLayerNode,normalsNode,normalsIndexNode,normalsIndexes;
        let startTrigIdx,startVertexIdx;
        let vertexList,vertexArray,uvArray,normalsArray;
        let vertexConnectionList;
                
            // find the objects>geometry node
            
        objectsNode=this.findNodeByName(rootNode,'Objects');
        if (objectsNode===null) {
            console.log('No objects node in FBX file '+this.importSettings.name);
            return(null);
        }
        
        geoNode=this.findNodeByName(objectsNode,'Geometry');
        if (geoNode===null) {
            console.log('No geometry node in FBX file '+this.importSettings.name);
            return(null);
        }
        
            // find the name
            // (has a null separator in it, then [SOH]Model)
        
        name=this.trimNodeNameToNullCharacter(geoNode.properties[1]);
            
            // get the indexes
            
        polygonIndexNode=this.findNodeByName(geoNode,'PolygonVertexIndex');
        if (polygonIndexNode===null) {
            console.log('No polygon indexes found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        polygonIndexes=polygonIndexNode.properties[0];
        
            // get the vertexes
            
        verticesNode=this.findNodeByName(geoNode,'Vertices');
        if (verticesNode===null) {
            console.log('No vertices found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        vertexArray=verticesNode.properties[0];
        
            // load the UVs
            // we are assuming ByPolygonVertex mapping
            
        uvLayerNode=this.findNodeByName(geoNode,'LayerElementUV');
        if (uvLayerNode===null) {
            console.log('No UV Layer found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        uvIndexes=null;
        
        refTypeNode=this.findNodeByName(uvLayerNode,'ReferenceInformationType');
        if (refTypeNode.properties[0]!=='Direct') {
            uvIndexNode=this.findNodeByName(uvLayerNode,'UVIndex');
            uvIndexes=uvIndexNode.properties[0];
        }
        
        uvNode=this.findNodeByName(uvLayerNode,'UV');
        uvArray=uvNode.properties[0];
        
            // load the normals
            // we are assuming ByPolygonVertex mapping
            
        normalLayerNode=this.findNodeByName(geoNode,'LayerElementNormal');
        if (normalLayerNode===null) {
            console.log('No Normals Layer found in FBX model: '+this.importSettings.name);
            return(null);
        }
        
        normalsIndexes=null;
        
        refTypeNode=this.findNodeByName(normalLayerNode,'ReferenceInformationType');
        if (refTypeNode.properties[0]!=='Direct') {
            normalsIndexNode=this.findNodeByName(normalLayerNode,'UVIndex');
            normalsIndexes=normalsIndexNode.properties[0];
        }
        
        normalsNode=this.findNodeByName(normalLayerNode,'Normals');
        normalsArray=normalsNode.properties[0];
        
            // since we have to flatten the vertex list
            // (normals and uvs can be different) we figure
            // out all the bone connections first
            
        vertexConnectionList=new Array(vertexArray.length);
        
        for (n=0;n!==vertexArray.length;n++) {
            vertexConnectionList[n]=new Array();
        }
                
        for (n=0;n!==skeleton.bones.length;n++) {
            bone=skeleton.bones[n];
            if (bone.fbxImportIndexes===null) continue;

            for (k=0;k!==bone.fbxImportIndexes.length;k++) {
                vertexConnectionList[bone.fbxImportIndexes[k]].push(new MeshVertexBoneConnectClass(n,bone.fbxImportWeights[k]));
            }
        }
        
            // run through the indexes and build
            // a vertex for each one, this is necessary so
            // we preserve good normals
            
        indexes=[];
        vertexList=[];
        
        startTrigIdx=0;
        trigIndexes=[];
        
        for (n=0;n!=polygonIndexes.length;n++) {
            
                // a negative number indicates the end of a polygon

            idx=polygonIndexes[n];
            if (idx>=0) {
                trigIndexes.push(idx);
                continue;
            }

            trigIndexes.push((-idx)-1);     // was XOR, need to make positive and -1
            
                // build the vertexes
            
            npt=trigIndexes.length;
            
            startVertexIdx=vertexList.length;
            
            for (k=0;k!=npt;k++) {
                
                    // the position
                    
                idx=trigIndexes[k]*3;
                x=vertexArray[idx]*this.importSettings.scale;
                y=vertexArray[idx+1]*this.importSettings.scale;
                z=vertexArray[idx+2]*this.importSettings.scale;
            
                v=new MeshVertexClass();
                v.position.setFromValues(x,y,z);
                vertexList.push(v);
                
                    // the uv
                    
                if (uvIndexes===null) {
                    idx=(startTrigIdx+k)*2;
                }
                else {
                    idx=uvIndexes[startTrigIdx+k]*2;
                }
            
                x=uvArray[idx]*this.importSettings.uScale;
                y=uvArray[idx+1]*this.importSettings.vScale;
                v.uv.setFromValues(x,y);
                
                    // the normal
                    
                if (normalsIndexes===null) {
                    idx=(startTrigIdx+k)*3;
                }
                else {
                    idx=normalsIndexes[startTrigIdx+k]*3;
                }
                
                x=normalsArray[idx];
                y=normalsArray[idx+1];
                z=normalsArray[idx+2];
                    
                v.normal.setFromValues(x,y,z);
                v.normal.normalize();
                
                    // and any bone attachments
                    
                v.boneConnects=vertexConnectionList[trigIndexes[k]];
            }
                
                // now build the indexes
                
            for (k=0;k<(npt-2);k++) {
                indexes.push(startVertexIdx);
                indexes.push(startVertexIdx+(k+1));
                indexes.push(startVertexIdx+(k+2));
            }
            
                // move on to next polygon
                
            startTrigIdx=n+1;
            trigIndexes=[];
        }
        
        indexes=new Uint32Array(indexes);           // force to typed array

            // any user rotations
            
        this.rotate(vertexList,skeleton);
        
            // maps should have zero top (for convience)
            // models should have zero bottom so they
            // draw at the bottom of the xyz position
            // but it's not required
            
        switch (this.importSettings.yZero) {
            case this.importSettings.Y_ZERO_TOP:
                this.zeroTop(vertexList);
                break;
            case this.importSettings.Y_ZERO_BOTTOM:
                this.zeroBottom(vertexList);
                break;
        }

            // recreate the tangents
            
        this.buildVertexListTangents(vertexList,indexes);
                
            // decode successful
        
        this.view.bitmapList.add(this.importSettings.name,false);    
        bitmap=this.view.bitmapList.get(this.importSettings.name);
        if (bitmap===undefined) {
            console.log('missing material: '+this.importSettings.name);
            return(null);
        }

        return(new MeshClass(this.view,name,bitmap,vertexList,indexes,0));
    }
    
        //
        // decode bones and animations
        //
        
    decodeBones(rootNode,skeleton)
    {
        let n,k,t,x,y,z,uid,parentUID,name;
        let objectsNode,property70Node,connectionsNode,propNode;
        let indexesNode,weightsNode,node,bone;
        
             // find the objects and connections node
        
        objectsNode=this.findNodeByName(rootNode,'Objects');
        if (objectsNode===null) {
            console.log('No objects node in FBX file '+this.importSettings.name);
            return(false);
        }
            
        connectionsNode=this.findNodeByName(rootNode,'Connections');
        if (connectionsNode===null) {
            console.log('No connections node in FBX file '+this.importSettings.name);
            return(false);
        }
        
            // get all the models for bones
            
        for (n=0;n!==objectsNode.children.length;n++) {
            node=objectsNode.children[n];
            if (node.name!=='Model') continue;
            if (node.properties[2]!=='LimbNode') continue;
            
                // get uid and name
             
            uid=node.properties[0];
            name=this.trimNodeNameToNullCharacter(node.properties[1]);
            
                // find local transform
                
            property70Node=this.findNodeByName(node,'Properties70');
            propNode=this.findNodeByFirstPropertyString(property70Node,'Lcl Translation');
            
            x=propNode.properties[4]*this.importSettings.scale;
            y=propNode.properties[5]*this.importSettings.scale;
            z=propNode.properties[6]*this.importSettings.scale;
            
                // create bone
                
            bone=new ModelBoneClass(name,new PointClass(x,y,z));
            bone.fbxImportUID=uid;
            
            skeleton.bones.push(bone);
        }
        
        for (n=0;n!==skeleton.bones.length;n++) {
            bone=skeleton.bones[n];
            
            for (k=0;k!==connectionsNode.children.length;k++) {
                node=connectionsNode.children[k];
                if (node.properties[1]===bone.fbxImportUID) {
                    
                    parentUID=node.properties[2];
                    for (t=0;t!==skeleton.bones.length;t++) {
                        if (skeleton.bones[t].fbxImportUID===parentUID) {
                            bone.parentBoneIdx=t;
                        }
                    }
                }
            }
        } 
        
            // get all the deformers
            // we store these and use them later add
            // to the vertexes

        for (n=0;n!==objectsNode.children.length;n++) {
            node=objectsNode.children[n];
            if (node.name!=='Deformer') continue;
            
                // find bone for deformer

            name=this.trimNodeNameToNullCharacter(node.properties[1]);
            if (name.startsWith("Cluster ")) name=name.substring(8);
            
            bone=skeleton.findBone(name);
            if (bone===null) continue;
            
                // get the indexes and weights
                
            indexesNode=this.findNodeByName(node,'Indexes');
            weightsNode=this.findNodeByName(node,'Weights');
            
            if ((indexesNode!==null) && (weightsNode!==null)) {
                bone.fbxImportIndexes=indexesNode.properties[0];
                bone.fbxImportWeights=weightsNode.properties[0];
            }
        }
        
        return(true);
    }
    
    decodeAnimations(rootNode)
    {
        /*
        let n;
        let takesNode,node;
        
            // takes aren't required
            
        takesNode=this.findNodeByName(rootNode,'Takes');
        if (takesNode===null) return(null);
        
            // get all the takes
            
        for (n=0;n!==takesNode.children.length;n++) {
            node=takesNode.children[n];
            
            if (node.name==='Take') console.log('Take='+node.properties[0]);
        }
        */
        
    }
    
        //
        // compressed data utility
        //
        
    extractZipData(compressedBytes)
    {
        let bytes;
        let pako=window.pako;
        
        try {
            bytes=pako.inflate(compressedBytes);
            return(new DataView(bytes.buffer));
        }
        catch(err)
        {
            console.log('Error in compressed FBX data: '+err);
        }
        
        return(null);
    }
    
        //
        // decode binary tree nodes
        //
        
    decodeProperty(data,view,textDecoder,byteOffset,node)
    {
        let propType;
        let arrayLen,arrayEncode,arrayCompressLen,len;
        let n,array,arrayView;
        let str,idx;
        
        propType=String.fromCharCode(view.getUint8(byteOffset)).charAt(0);
        
            // get the item
            
        switch (propType) {
            
                // regular types
                
            case 'Y':
                node.addProperty(view.getInt16((byteOffset+1),true));
                return(2+1);
            case 'C':
                node.addProperty(view.getUint8((byteOffset+1))!==0);
                return(1+1);
            case 'I':
                node.addProperty(view.getInt32((byteOffset+1),true));
                return(4+1);
            case 'F':
                node.addProperty(view.getFloat32((byteOffset+1),true));
                return(4+1);
            case 'D':
                node.addProperty(view.getFloat64((byteOffset+1),true));
                return(8+1);
            case 'L':
                node.addProperty(view.getInt32((byteOffset+1),true)+((2**32)*view.getInt32((byteOffset+5),true)));
                return(8+1);
                
                // arrays
                
            case 'f':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, aren't used in decoding
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
                
            case 'd':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                
                if (arrayEncode===0) {
                    arrayView=new DataView(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                else {
                    arrayView=this.extractZipData(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                if (arrayView==null) return(-1);
                
                array=new Float64Array(arrayLen); 
                for (n=0;n!==arrayLen;n++) {
                    array[n]=arrayView.getFloat64((n*8),true);
                }
                
                node.addProperty(array);
                
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
                
            case 'l':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, arent't used in decoding
                return((arrayEncode===0)?((arrayLen*8)+13):(arrayCompressLen+13));
                
            case 'i':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                
                if (arrayEncode===0) {
                    arrayView=new DataView(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                else {
                    arrayView=this.extractZipData(data.slice((byteOffset+13),((byteOffset+13)+arrayCompressLen)));
                }
                if (arrayView==null) return(-1);
                
                array=new Int32Array(arrayLen);
                for (n=0;n!==arrayLen;n++) {
                    array[n]=arrayView.getInt32((n*4),true);
                }
                
                node.addProperty(array);
                
                return((arrayEncode===0)?((arrayLen*4)+13):(arrayCompressLen+13));
                
            case 'b':
                arrayLen=view.getUint32((byteOffset+1),true);
                arrayEncode=view.getUint32((byteOffset+5),true);
                arrayCompressLen=view.getUint32((byteOffset+9),true);
                // ignore these, aren't used in decoding
                return((arrayEncode===0)?(arrayLen+13):(arrayCompressLen+13));
                
                // others
                
            case 'S':
                len=view.getUint32((byteOffset+1),true);
                str=textDecoder.decode(new Uint8Array(data.slice((byteOffset+5),((byteOffset+5)+len))));
                idx=str.indexOf(0);
                if (idx!==-1) str=str.substring(0,idx);     // strings can be null terminated
                node.addProperty(str);
                return(len+5);
                
            case 'R':
                len=view.getUint32((byteOffset+1),true);
                // ignore these, aren't used in decoding
                return(len+5);
        }

        console.log('Unknown property type in FBX: '+propType);
        return(-1);
    }
        
    decodeBinaryTree(data,view,textDecoder,is64bit,byteOffset,parentNode)
    {
        let n,ok;
        let nodeHeaderLen,propAdd;
        let nextNodeOffset,propertyOffset,propertyCount,propertyListSize,nameLen;
        let node,name;
        
        while (true) {
            
                // get node information

            if (!is64bit) {
                nextNodeOffset=view.getUint32(byteOffset,true);
                propertyCount=view.getUint32((byteOffset+4),true);
                propertyListSize=view.getUint32((byteOffset+8),true);
                nameLen=view.getUint8(byteOffset+12);
                nodeHeaderLen=13;
            }
            else {
                nextNodeOffset=view.getUint32(byteOffset,true)+(view.getUint32((byteOffset+4),true)*(2**32));
                propertyCount=view.getUint32((byteOffset+8),true)+(view.getUint32((byteOffset+12),true)*(2**32));
                propertyListSize=view.getUint32((byteOffset+16),true)+(view.getUint32((byteOffset+20),true)*(2**32));
                nameLen=view.getUint8(byteOffset+24);
                nodeHeaderLen=25;
                
            }
            
                // at the blank end node?
                
            if (nextNodeOffset===0) break;

                // get the name
                
            byteOffset+=nodeHeaderLen;
            name=textDecoder.decode(new Uint8Array(data.slice(byteOffset,(byteOffset+nameLen))));
            byteOffset+=nameLen;
            
                // we are only looking for specific nodes,
                // so knock out things we don't care about

            ok=false;
            
            for (n=0;n!==this.READ_NODE_LIST.length;n++) {
                if (name===this.READ_NODE_LIST[n]) {
                    ok=true;
                }
            }
                
            if (!ok) {
                byteOffset=nextNodeOffset;
                continue;
            }

                // create the node
            
            node=parentNode.addChild(name);
            
                // read the properties
            
            propertyOffset=byteOffset;
            
            for (n=0;n!==propertyCount;n++) {
                propAdd=this.decodeProperty(data,view,textDecoder,propertyOffset,node);
                if (propAdd===-1) return(false);
                
                propertyOffset+=propAdd;
            }
            
            byteOffset+=propertyListSize;
            
                // check for nested nodes
                // there is always a null node at the end so ignore that
            
            if (byteOffset<nextNodeOffset) {
                this.decodeBinaryTree(data,view,textDecoder,is64bit,byteOffset,node);
            }
            
                // move on to next child
                
            byteOffset=nextNodeOffset;
        }

        return(true);
    }
    
        //
        // main importer
        //
        
    async import(meshList,skeleton)
    {
        let rootNode;
        let name,version,is64bit,view,textDecoder;
        let mesh;
        let data=null;
        
            // load the file
            
        await this.loadFBX()
            .then
                (
                        // resolved
                
                    value=>{
                        data=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
        
            // convert to a tree
            
        view=new DataView(data);
        textDecoder=new TextDecoder('utf-8');
        
            // make sure it's a proper file
            
        name=textDecoder.decode(new Uint8Array(data.slice(0,18)));
        if (name!=='Kaydara FBX Binary') {
            console.log('Not a proper binary FBX file: '+this.importSettings.name);
            return(false);
        }
        
            // get the version
        
        version=view.getUint32(23,true);
        if (version<7400) {
            console.log('FBX binary needs to be at least version 7.4: '+this.importSettings.name);
            return(false);
        }
        
        is64bit=version>=7500;
        
            // decode the tree
            // start at byte 27 to skip headers
        
        rootNode=new FBXNodeClass(null);
        if (!this.decodeBinaryTree(data,view,textDecoder,is64bit,27,rootNode)) return(false);
        
        //this.debugNodePrintOut(rootNode,0);
        
            // get the bones ahead of time so
            // we can attach when building the
            // vertexes
            
        if (skeleton!==null) { 
            if (!this.decodeBones(rootNode,skeleton)) return(false);
            skeleton.precalcAnimationValues();
            skeleton.buildNeutralPose();
        }
        
            // decode the mesh
            // for now, seems there's only one mesh in FBX
            
        mesh=this.decodeGeometry(rootNode,skeleton);
        if (mesh===null) return(false);
        
        if (skeleton!==null) mesh.precalcAnimationValues(skeleton);
        
        meshList.add(mesh);
        
        return(true);
    }

    debugNodePrintOut(node,spaceCount)
    {
        let n,k;
        let str,prop;

        for (n=0;n!=node.children.length;n++) {
            str='';
            for (k=0;k!==spaceCount;k++) { str+='.'; }
            
            str+=node.children[n].name;

            if (node.children[n].properties.length!==0) {
                str+=' [';

                for (k=0;k!==node.children[n].properties.length;k++) {
                    if (k!==0) str+=',';
                    
                    prop=node.children[n].properties[k];
                    
                    switch (typeof(prop)) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                            str+=node.children[n].properties[k];
                            break;
                        default:
                            if (prop instanceof Float64Array) {
                                str+='Float64Array->'+prop.length;
                                break;
                            }
                            if (prop instanceof Int32Array) {
                                str+='Int32Array->'+prop.length;
                                break;
                            }
                            str+='?';
                            break;
                    }
                }
                
                str+=']';
            }
            
            console.log(str);
            
            this.debugNodePrintOut(node.children[n],(spaceCount+1));
        }
    }
}
