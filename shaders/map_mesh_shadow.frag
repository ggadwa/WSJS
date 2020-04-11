#version 300 es

uniform lowp sampler2D shadowTex;

in highp vec2 shadowUV;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel.rgb=texture(shadowTex,shadowUV).rgb;
    outputPixel.a=1.0;
}

