#version 300 es

uniform lowp sampler2D baseTex;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel=texture(baseTex,fragUV);;
}

