uniform lowp sampler2D baseTex;

varying highp vec2 fragUV;

void main(void)
{
    gl_FragColor=texture2D(baseTex,fragUV);;
}

