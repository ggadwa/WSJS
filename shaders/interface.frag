#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp vec4 color;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel=texture(baseTex,fragUV)*color;
}
