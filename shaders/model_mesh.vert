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
uniform highp mat3 normalMatrix;

uniform lowp int hasSkin;
uniform highp mat4 jointMatrix[128];

out highp vec3 eyeVector,eyePosition;
out highp vec2 fragUV;
out mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
        // calculate the possible animation
        // and vertex position

    highp vec4 pos;

    if (hasSkin!=0) {
        mat4 skinMatrix=(vertexWeight.x*jointMatrix[int(vertexJoint.x)])+(vertexWeight.y*jointMatrix[int(vertexJoint.y)])+(vertexWeight.z*jointMatrix[int(vertexJoint.z)])+(vertexWeight.w*jointMatrix[int(vertexJoint.w)]);
        pos=viewMatrix*modelMatrix*skinMatrix*vec4(vertexPosition,1.0);
    }
    else {
        pos=viewMatrix*modelMatrix*vec4(vertexPosition,1.0);
    }

    gl_Position=perspectiveMatrix*pos;
    eyePosition=vec3(pos);

        // get the tangent space
        // need to rotate the normals with the model matrix
        // this gets passed to the fragment so we can calculate lights

    highp mat3 rotNormalMatrix=mat3(modelMatrix)*normalMatrix;
    tangentSpaceTangent=normalize(rotNormalMatrix*vertexTangent);
    tangentSpaceBinormal=normalize(rotNormalMatrix*cross(vertexNormal,vertexTangent));
    tangentSpaceNormal=normalize(rotNormalMatrix*vertexNormal);

        // translate the eye vector

    eyeVector.x=dot(-eyePosition,tangentSpaceTangent);
    eyeVector.y=dot(-eyePosition,tangentSpaceBinormal);
    eyeVector.z=dot(-eyePosition,tangentSpaceNormal);

        // the varying uv

    fragUV=vertexUV;
}

