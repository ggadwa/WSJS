uniform lowp vec4 colorAlpha;

void main(void)
{
    gl_FragColor.rgb=colorAlpha.rgb;
    gl_FragColor.a=colorAlpha.a;
}

