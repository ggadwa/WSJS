uniform lowp sampler2D baseTex;

varying highp vec2 fragUV;

void main(void)
{
    gl_FragColor.rgb=texture2D(baseTex,fragUV).rgb;
    gl_FragColor.a=0.7;
}

