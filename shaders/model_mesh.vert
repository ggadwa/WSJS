#version 300 es

in highp vec3 vertexPosition;
in highp vec3 vertexNormal;
in highp vec3 vertexTangent;
in highp vec2 vertexUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;
uniform highp mat4 modelMatrix;
uniform highp mat3 normalMatrix;

out highp vec3 mapPosition,eyeVector,eyePosition;
out highp vec2 fragUV;
out mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*modelMatrix*vec4(vertexPosition,1.0);

    mapPosition=vertexPosition;
    eyePosition=vec3(viewMatrix*vec4(vertexPosition,1.0));

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

