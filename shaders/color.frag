#version 300 es

in lowp vec4 fragColor;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel=fragColor;
}
