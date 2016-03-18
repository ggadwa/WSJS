uniform lowp sampler2D baseTex;
uniform lowp vec4 colorAlpha;

varying highp vec2 fragUV;

void main(void)
{
    lowp float r=texture2D(baseTex,fragUV).r;   // red component is used as a mask
    if (r!=1.0) discard;

    gl_FragColor=colorAlpha;
}

