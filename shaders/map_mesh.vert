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

uniform lightType light_0;
uniform lightType light_1;
uniform lightType light_2;
uniform lightType light_3;
uniform lightType light_4;
uniform lightType light_5;

varying highp vec3 eyeVector;
varying highp vec4 fragUV;

varying highp vec3 lightVector_0;
varying highp vec3 lightVector_1;
varying highp vec3 lightVector_2;
varying highp vec3 lightVector_3;
varying highp vec3 lightVector_4;
varying highp vec3 lightVector_5;

varying highp vec3 lightVertexVector_0;
varying highp vec3 lightVertexVector_1;
varying highp vec3 lightVertexVector_2;
varying highp vec3 lightVertexVector_3;
varying highp vec3 lightVertexVector_4;
varying highp vec3 lightVertexVector_5;

void main(void)
{
    highp vec3 lvct;

    gl_Position=perspectiveMatrix*modelMatrix*vec4(vertexPosition,1.0);

        // get the tangent space

    highp vec3 vtx=vec3(modelMatrix*vec4(vertexPosition,1.0));

    mediump vec3 tangentSpaceTangent=normalize(normalMatrix*vertexTangent);
    mediump vec3 tangentSpaceBinormal=normalize(normalMatrix*cross(vertexNormal,vertexTangent));
    mediump vec3 tangentSpaceNormal=normalize(normalMatrix*vertexNormal);

        // translate the eye vector

    eyeVector.x=dot(-vtx,tangentSpaceTangent);
    eyeVector.y=dot(-vtx,tangentSpaceBinormal);
    eyeVector.z=dot(-vtx,tangentSpaceNormal);

        // translate the light 0 vector

    lightVector_0=light_0.positionIntensity.xyz-vtx;
    lightVertexVector_0.x=dot(lightVector_0,tangentSpaceTangent);
    lightVertexVector_0.y=dot(lightVector_0,tangentSpaceBinormal);
    lightVertexVector_0.z=dot(lightVector_0,tangentSpaceNormal);

        // translate the light 1 vector

    lightVector_1=light_1.positionIntensity.xyz-vtx;
    lightVertexVector_1.x=dot(lightVector_1,tangentSpaceTangent);
    lightVertexVector_1.y=dot(lightVector_1,tangentSpaceBinormal);
    lightVertexVector_1.z=dot(lightVector_1,tangentSpaceNormal);

        // translate the light 2 vector

    lightVector_2=light_2.positionIntensity.xyz-vtx;
    lightVertexVector_2.x=dot(lightVector_2,tangentSpaceTangent);
    lightVertexVector_2.y=dot(lightVector_2,tangentSpaceBinormal);
    lightVertexVector_2.z=dot(lightVector_2,tangentSpaceNormal);

        // translate the light 3 vector

    lightVector_3=light_3.positionIntensity.xyz-vtx;
    lightVertexVector_3.x=dot(lightVector_3,tangentSpaceTangent);
    lightVertexVector_3.y=dot(lightVector_3,tangentSpaceBinormal);
    lightVertexVector_3.z=dot(lightVector_3,tangentSpaceNormal);

        // translate the light 4 vector

    lightVector_4=light_4.positionIntensity.xyz-vtx;
    lightVertexVector_4.x=dot(lightVector_4,tangentSpaceTangent);
    lightVertexVector_4.y=dot(lightVector_4,tangentSpaceBinormal);
    lightVertexVector_4.z=dot(lightVector_4,tangentSpaceNormal);

        // translate the light 5 vector

    lightVector_5=light_5.positionIntensity.xyz-vtx;
    lightVertexVector_5.x=dot(lightVector_5,tangentSpaceTangent);
    lightVertexVector_5.y=dot(lightVector_5,tangentSpaceBinormal);
    lightVertexVector_5.z=dot(lightVector_5,tangentSpaceNormal);

        // the varying uv

    fragUV=vertexAndLightmapUV;
}

