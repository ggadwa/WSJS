attribute highp vec3 vertexPosition;
attribute highp vec3 vertexNormal;
attribute highp vec3 vertexTangent;
attribute highp vec4 vertexAndLightmapUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 modelMatrix;
uniform highp mat3 normalMatrix;

struct lightType {
    highp vec4 positionIntensity;
    mediump vec4 colorExponent;
};

uniform lightType lights[24];

varying highp vec3 eyeVector,eyePosition;
varying highp vec4 fragUV;
varying mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
    gl_Position=perspectiveMatrix*modelMatrix*vec4(vertexPosition,1.0);

    eyePosition=vec3(modelMatrix*vec4(vertexPosition,1.0));

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

    fragUV=vertexAndLightmapUV;
}

