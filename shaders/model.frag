uniform lowp sampler2D baseTex;
uniform lowp sampler2D normalTex;
uniform lowp sampler2D specularTex;

uniform lowp vec3 ambient;
uniform mediump float shineFactor;

struct lightType {
    highp vec4 position;
    lowp vec4 color;
    mediump float intensity;
    mediump float invertIntensity;
    mediump float exponent;
};

uniform lightType light_0;
uniform lightType light_1;
uniform lightType light_2;
uniform lightType light_3;

varying highp vec3 eyeVector;
varying highp vec2 fragUV;

varying highp vec3 lightVector_0;
varying highp vec3 lightVector_1;
varying highp vec3 lightVector_2;
varying highp vec3 lightVector_3;

varying highp vec3 lightVertexVector_0;
varying highp vec3 lightVertexVector_1;
varying highp vec3 lightVertexVector_2;
varying highp vec3 lightVertexVector_3;

void main(void)
{
    lowp float att;
    highp float dist;

        // the default light color is the ambient

    lowp vec3 lightCol=ambient;

        // the texture fragment

    lowp vec4 tex=texture2D(baseTex,fragUV);

        // the starting bump map
        // since it will be created by going through the
        // lights, we need a default value

    highp vec3 bumpLightVertexVector;
    lowp vec3 bumpMap=normalize((texture2D(normalTex,fragUV.xy).rgb*2.0)-1.0);
    lowp float bump=dot(vec3(0.33,0.33,0.33),bumpMap);

        // the starting spec map

    lowp vec3 spec=vec3(0.0,0.0,0.0),specHalfVector;
    lowp vec3 specMap=texture2D(specularTex,fragUV.xy).rgb;
    lowp float specFactor;

        // light 0

    dist=length(lightVector_0);
    if (dist<light_0.intensity) {

            // the lighting attenuation

        att=1.0-(dist*light_0.invertIntensity);
        att+=pow(att,light_0.exponent);
        lightCol+=(light_0.color.rgb*att);

            // per-light bump calc

        bumpLightVertexVector=normalize(lightVertexVector_0);
        bump+=(dot(bumpLightVertexVector,bumpMap)*att);

            // per-light spec count

        specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
        specFactor=max(dot(bumpMap,specHalfVector),0.0);
        spec+=((specMap*pow(specFactor,shineFactor))*att);
    }

        // light 1

    dist=length(lightVector_1);
    if (dist<light_1.intensity) {

            // the lighting attenuation

        att=1.0-(dist*light_1.invertIntensity);
        att+=pow(att,light_1.exponent);
        lightCol+=(light_1.color.rgb*att);

            // per-light bump calc

        bumpLightVertexVector=normalize(lightVertexVector_1);
        bump+=(dot(bumpLightVertexVector,bumpMap)*att);

            // per-light spec count

        specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
        specFactor=max(dot(bumpMap,specHalfVector),0.0);
        spec+=((specMap*pow(specFactor,shineFactor))*att);
    }

        // light 2

    dist=length(lightVector_2);
    if (dist<light_2.intensity) {

            // the lighting attenuation

        att=1.0-(dist*light_2.invertIntensity);
        att+=pow(att,light_2.exponent);
        lightCol+=(light_2.color.rgb*att);

            // per-light bump calc

        bumpLightVertexVector=normalize(lightVertexVector_2);
        bump+=(dot(bumpLightVertexVector,bumpMap)*att);

            // per-light spec count

        specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
        specFactor=max(dot(bumpMap,specHalfVector),0.0);
        spec+=((specMap*pow(specFactor,shineFactor))*att);
    }

        // light 3

    dist=length(lightVector_3);
    if (dist<light_3.intensity) {

            // the lighting attenuation

        att=1.0-(dist*light_3.invertIntensity);
        att+=pow(att,light_3.exponent);
        lightCol+=(light_3.color.rgb*att);

            // per-light bump calc

        bumpLightVertexVector=normalize(lightVertexVector_3);
        bump+=(dot(bumpLightVertexVector,bumpMap)*att);

            // per-light spec count

        specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
        specFactor=max(dot(bumpMap,specHalfVector),0.0);
        spec+=((specMap*pow(specFactor,shineFactor))*att);
    }

        // finish the spec by making sure
        // it's dimmed in dark areas

    spec=min(spec,1.0)*((lightCol.r+lightCol.g+lightCol.b)*0.33);

        // add bump into the ambient and make
        // sure it's never less than 10% of the
        // ambient

    lowp vec3 pixelAmbient=max((lightCol*bump),(ambient*0.9));

        // finally create the pixel

    gl_FragColor.rgb=(tex.rgb*pixelAmbient)+spec;
    gl_FragColor.a=tex.a;
}

