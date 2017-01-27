#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp vec3 color;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    lowp vec4 tex=texture(baseTex,fragUV);

    outputPixel.rgb=color;       // treat as gray scale, use that for alpha, fill rest with color
    outputPixel.a=tex.r;
}

