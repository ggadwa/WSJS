#version 300 es

uniform lowp vec4 color;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel=color;
}

