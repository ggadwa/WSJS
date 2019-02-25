#version 300 es

in highp vec3 vertexPosition;
in highp vec3 vertexNormal;
in highp vec3 vertexTangent;
in highp vec2 vertexUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;
uniform highp mat3 normalMatrix;

out highp vec3 mapPosition,eyeVector,eyePosition;
out highp vec2 fragUV;
out mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*vec4(vertexPosition,1.0);

    mapPosition=vertexPosition;
    eyePosition=vec3(viewMatrix*vec4(vertexPosition,1.0));

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

