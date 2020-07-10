#version 300 es

in highp vec3 vertexPosition;
in highp vec2 vertexUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;

uniform highp vec3 cameraPosition;
uniform highp float globeSize;

out highp vec2 fragUV;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*vec4(((vertexPosition*globeSize)+cameraPosition),1.0);
    fragUV=vertexUV;
}

