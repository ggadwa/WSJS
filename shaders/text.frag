uniform lowp sampler2D baseTex;
uniform lowp vec3 color;

varying highp vec2 fragUV;

void main(void)
{
    lowp vec4 tex=texture2D(baseTex,fragUV);

    gl_FragColor.rgb=color;       // treat as gray scale, use that for alpha, fill rest with color
    gl_FragColor.a=tex.r;
}

