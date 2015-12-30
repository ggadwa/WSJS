attribute highp vec3 vertexPosition;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 modelMatrix;

void main(void)
{
    gl_Position=perspectiveMatrix*modelMatrix*vec4(vertexPosition,1.0);
}

