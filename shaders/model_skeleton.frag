#version 300 es

uniform lowp vec3 color;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel.rgb=color;
    outputPixel.a=1.0;
}

