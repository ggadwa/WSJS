#version 300 es

in highp vec3 vertexPosition;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*vec4(vertexPosition,1.0);
}

