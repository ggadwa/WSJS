#version 300 es

in highp vec3 vertexPosition;
in lowp vec4 vertexColor;

uniform highp mat4 orthoMatrix;

out lowp vec4 fragColor;

void main(void)
{
    gl_Position=orthoMatrix*vec4(vertexPosition,1.0);
    fragColor=vertexColor;
}

