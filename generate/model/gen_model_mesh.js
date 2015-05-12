"use strict";

//
// gen model mesh class
//

function GenModelMeshObject(model,bitmap,genRandom)
{
    this.model=model;
    this.genRandom=genRandom;

        //
        // build mesh around skeleton
        //

    this.build=function(view)
    {
        var n,k;
        var bones=this.model.skeleton.bones;
        
            // supergumba -- temporary, boxing bones for now
            
        var vertices=new Float32Array(bones.length*(18*6));     // plane is 6 points of 3 each (18) * # of sides (6)
        var uvs=new Float32Array(bones.length*(12*6));
        var indexes=new Uint16Array(bones.length*(6*6));

            // box all the bones
        
        var idx=0;
        var startVIdx=0;
        var uvIdx=0;
        var iIdx=0;
        var xBound,yBound,zBound;
        
        for (n=0;n!==bones.length;n++) {
            
            xBound=new wsBound((bones[n].position.x-100),(bones[n].position.x+100));
            yBound=new wsBound((bones[n].position.y-100),(bones[n].position.y+100));
            zBound=new wsBound((bones[n].position.z-100),(bones[n].position.z+100));
            
            startVIdx=Math.floor(idx/3);

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;

            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;    
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.min;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.min;
            vertices[idx++]=xBound.max;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;
            vertices[idx++]=xBound.min;
            vertices[idx++]=yBound.max;
            vertices[idx++]=zBound.max;

            for (k=0;k!==6;k++) {
                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=1.0;
                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=1.0;
                uvs[uvIdx++]=1.0;

                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=1.0;
                uvs[uvIdx++]=1.0;
                uvs[uvIdx++]=0.0;
                uvs[uvIdx++]=1.0;
            }  

            for (k=0;k!==36;k++) {
                indexes[iIdx++]=startVIdx+k;
            }
        }
    
        var meshUVTangents=new MeshUVTangentsObject();
        var normals=meshUVTangents.buildMeshNormals(vertices,indexes,false);
        var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);

            // add mesh to model
            
        this.model.mesh=new ModelMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,0);
        this.model.mesh.setupBuffers(view);
    };
    
}
