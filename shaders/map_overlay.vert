attribute highp vec3 vertexPosition;

uniform highp mat4 orthoMatrix;

void main(void)
{
    gl_Position=orthoMatrix*vec4(vertexPosition,1.0);
}
