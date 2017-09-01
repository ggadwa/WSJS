#version 300 es

uniform lowp sampler2D baseTex;

uniform lowp float alpha;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    lowp vec4 tex=texture(baseTex,fragUV);

    outputPixel.rgb=tex.rgb;
    outputPixel.a=tex.a*alpha;
}

