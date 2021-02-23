#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp vec4 colorAlpha;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    lowp vec4 tex=texture(baseTex,fragUV);

    outputPixel.rgb=colorAlpha.rgb*tex.rgb;
    outputPixel.a=tex.a*colorAlpha.a;
}

