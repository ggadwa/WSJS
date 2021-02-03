#version 300 es

in highp vec3 vertexPositionShadow;
in highp vec2 vertexUVShadow;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;

out highp vec2 shadowUV;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*vec4(vertexPositionShadow,1.0);

        // the varying uvs

    shadowUV=vertexUVShadow;
}

