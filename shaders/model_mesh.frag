#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp sampler2D normalTex;
uniform lowp sampler2D metallicRoughnessTex;
uniform lowp sampler2D emissiveTex;
uniform lowp sampler2D maskTex;

uniform mediump vec3 emissiveFactor;

uniform lowp vec3 lightMin,lightMax;

struct lightType {
    highp vec4 positionIntensity;
    mediump vec4 colorExponent;
};

uniform lightType lights[24];

in highp vec3 eyeVector,eyePosition;
in highp vec2 fragUV;
in mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

out lowp vec4 outputPixel;

void main(void)
{
    lowp float att;
    highp float intensity,dist;
    highp vec3 lightVector,lightVertexVector;

        // the texture fragment

    lowp vec4 tex=texture(baseTex,fragUV);

        // the bump map

    highp vec3 bumpLightVertexVector;
    lowp vec3 bumpMap=normalize((texture(normalTex,fragUV.xy).rgb*2.0)-1.0);
    lowp float bump=0.0;

        // the metallic-roughness map

    lowp vec3 metallicRoughnessMap=texture(metallicRoughnessTex,fragUV).rgb;
    lowp vec3 metallicHalfVector;
    lowp float metallic;

        // lights

    lowp vec3 lightCol=vec3(0,0,0);

    for (int n=0;n!=24;n++) {

            // if intensity = 0.0, then light is off

        intensity=lights[n].positionIntensity.w;
        if (intensity==0.0) continue;

            // get vector for light

        lightVector=lights[n].positionIntensity.xyz-eyePosition;

        dist=length(lightVector);
        if (dist<intensity) {

                // the lighting attenuation

            att=1.0-(dist/intensity);
            att+=pow(att,lights[n].colorExponent.w);
            lightCol+=(lights[n].colorExponent.rgb*att);

                // per-light bump calc (in tangent space)

            lightVertexVector.x=dot(lightVector,tangentSpaceTangent);
            lightVertexVector.y=dot(lightVector,tangentSpaceBinormal);
            lightVertexVector.z=dot(lightVector,tangentSpaceNormal);

            bumpLightVertexVector=normalize(lightVertexVector);
            bump+=(dot(bumpLightVertexVector,bumpMap)*att);

                // per-light metallic

            metallicHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
            metallic+=((metallicRoughnessMap.b*pow(max(dot(bumpMap,metallicHalfVector),0.0),5.0))*att);
        }
    }

        // calculate the final lighting

    lightCol=clamp((lightCol*bump),lightMin,lightMax);

        // finally create the pixel

    outputPixel.rgb=((tex.rgb*lightCol)+(min(metallic,1.0)*lightCol))+(texture(emissiveTex,fragUV.xy).rgb*emissiveFactor);
    outputPixel.a=1.0;

        // any masking pixel discards
        // have to do this at very end because some drivers
        // get weird about this (or so I've read)

    if (texture(maskTex,fragUV).a==0.0) discard;
}

