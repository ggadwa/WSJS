attribute highp vec3 vertexPosition;
attribute highp vec2 vertexUV;

uniform highp mat4 orthoMatrix;

varying highp vec2 fragUV;

void main(void)
{
    gl_Position=orthoMatrix*vec4(vertexPosition,1.0);
    fragUV=vertexUV;
}

