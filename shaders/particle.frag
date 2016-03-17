uniform lowp sampler2D baseTex;
uniform lowp vec4 colorAlpha;

varying highp vec2 fragUV;

void main(void)
{
    gl_FragColor.rgb=texture2D(baseTex,fragUV).rgb*colorAlpha.rgb;
    gl_FragColor.a=colorAlpha.a;
}

