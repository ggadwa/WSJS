#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp vec3 color;

in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    outputPixel.rgb=texture(baseTex,fragUV).rgb*color;
    outputPixel.a=1.0;
}

