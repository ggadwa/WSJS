#version 300 es

in highp vec3 vertexPosition;
in highp vec3 vertexNormal;
in highp vec3 vertexTangent;
in highp vec2 vertexUV;
in highp vec4 vertexJoint;
in highp vec4 vertexWeight;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;
uniform highp mat4 modelMatrix;

uniform bool noSkin;
uniform highp mat4 noSkinAttachedNodeMatrix;
uniform highp mat4 jointMatrix[64];

out highp vec3 eyeVector,eyePosition;
out highp vec2 fragUV;
out mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
        // calculate the skin animation
        // and vertex position, if skinning, calc
        // the skin matrix otherwise just attach to node
        // by its matrix

        // note we build the normalMatrix here,
        // this is costly but has to be done because of the
        // skin matrix

    highp vec4 pos;
    highp mat3 normalMatrix;

    if (!noSkin) {
        highp mat4 skinMatrix=(vertexWeight.x*jointMatrix[int(vertexJoint.x)])+(vertexWeight.y*jointMatrix[int(vertexJoint.y)])+(vertexWeight.z*jointMatrix[int(vertexJoint.z)])+(vertexWeight.w*jointMatrix[int(vertexJoint.w)]);
        pos=viewMatrix*modelMatrix*skinMatrix*vec4(vertexPosition,1.0);
        normalMatrix=transpose(inverse(mat3(viewMatrix)*mat3(modelMatrix)*mat3(skinMatrix)));
    }
    else {
        pos=viewMatrix*modelMatrix*noSkinAttachedNodeMatrix*vec4(vertexPosition,1.0);
        normalMatrix=transpose(inverse(mat3(viewMatrix)*mat3(modelMatrix)*mat3(noSkinAttachedNodeMatrix)));
    }

    gl_Position=perspectiveMatrix*pos;
    eyePosition=vec3(pos);

        // get the tangent space
        // this gets passed to the fragment so we can calculate lights

    tangentSpaceTangent=normalize(normalMatrix*vertexTangent);
    tangentSpaceBinormal=normalize(normalMatrix*cross(vertexNormal,vertexTangent));
    tangentSpaceNormal=normalize(normalMatrix*vertexNormal);

        // translate the eye vector

    eyeVector.x=dot(-eyePosition,tangentSpaceTangent);
    eyeVector.y=dot(-eyePosition,tangentSpaceBinormal);
    eyeVector.z=dot(-eyePosition,tangentSpaceNormal);

        // the varying uv

    fragUV=vertexUV;
}

