#version 300 es

uniform lowp sampler2D baseTex;

uniform lowp vec3 lightMin,lightMax;

struct lightType {
    highp vec4 positionIntensity;
    mediump vec4 colorExponent;
};

uniform lightType lights[32];

in highp vec3 eyePosition;
in highp vec2 fragUV;

out lowp vec4 outputPixel;

void main(void)
{
    lowp float att;
    highp float intensity,dist;

        // the liquid texture

    lowp vec4 tex=texture(baseTex,fragUV);

        // lights

    lowp vec3 lightCol=vec3(0,0,0);

    for (int n=0;n!=32;n++) {

            // if intensity = 0.0, then light is off

        intensity=lights[n].positionIntensity.w;
        if (intensity==0.0) continue;

            // get vector for light

        dist=length(lights[n].positionIntensity.xyz-eyePosition);
        if (dist<intensity) {

                // the lighting attenuation

            att=1.0-(dist/intensity);
            att+=pow(att,lights[n].colorExponent.w);
            lightCol+=(lights[n].colorExponent.rgb*att);
        }
    }

        // calculate the final lighting

    lightCol=clamp(lightCol,lightMin,lightMax);

        // and the final pixel

    outputPixel.rgb=tex.rgb*lightCol;
    outputPixel.a=tex.a;
}

