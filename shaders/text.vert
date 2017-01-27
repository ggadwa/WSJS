#version 300 es

in highp vec3 vertexPosition;
in highp vec2 vertexUV;

uniform highp mat4 orthoMatrix;

out highp vec2 fragUV;

void main(void)
{
    gl_Position=orthoMatrix*vec4(vertexPosition,1.0);
    fragUV=vertexUV;
}

