uniform lowp vec3 color;

void main(void)
{
    gl_FragColor.rgb=color;
    gl_FragColor.a=1.0;
}

