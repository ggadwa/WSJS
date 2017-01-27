#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp vec4 colorAlpha;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    lowp float r=texture(baseTex,fragUV).r;   // red component is used as a mask
    if (r!=1.0) discard;

    outputPixel=colorAlpha;
}

