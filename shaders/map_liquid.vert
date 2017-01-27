#version 300 es

in highp vec3 vertexPosition;
in highp vec2 vertexUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 modelMatrix;

out highp vec2 fragUV;

void main(void)
{
    gl_Position=perspectiveMatrix*modelMatrix*vec4(vertexPosition,1.0);
    fragUV=vertexUV;
}

