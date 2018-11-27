#version 300 es

uniform lowp sampler2D baseTex;
uniform lowp sampler2D normalTex;
uniform lowp sampler2D specularTex;
uniform lowp sampler2D glowTex;

uniform lowp vec3 ambient;
uniform lowp float alpha;
uniform mediump float shineFactor;
uniform mediump float glowFactor;

struct lightType {
    highp vec4 positionIntensity;
    mediump vec4 colorExponent;
    highp vec2 boxXBound,boxZBound;
};

uniform lightType lights[24];

in highp vec3 mapPosition,eyeVector,eyePosition;
in highp vec2 fragUV;
in mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

out lowp vec4 outputPixel;

void main(void)
{
    lowp float att;
    highp float intensity,dist;
    highp vec3 lightVector,lightVertexVector;

        // the default light color is the ambient

    lowp vec3 lightCol=ambient;

        // the texture fragment

    lowp vec4 tex=texture(baseTex,fragUV);

        // the starting bump map
        // since it will be created by going through the
        // lights, we need a default value

    highp vec3 bumpLightVertexVector;
    lowp vec3 bumpMap=normalize((texture(normalTex,fragUV).rgb*2.0)-1.0);
    lowp float bump=dot(vec3(0.33,0.33,0.33),bumpMap);

        // the starting spec map

    lowp vec3 spec=vec3(0.0,0.0,0.0),specHalfVector;
    lowp vec3 specMap=texture(specularTex,fragUV).rgb;
    lowp float specFactor;

        // lights

    for (int n=0;n!=24;n++) {

            // if intensity = 0.0, then light is off

        intensity=lights[n].positionIntensity.w;
        if (intensity==0.0) continue;

            // get vector for light

        lightVector=lights[n].positionIntensity.xyz-eyePosition;

            // if intensity = -1.0, then light is a boundary box light

        if (intensity==-1.0) {

                // for now, only check x/z as outdoor lights are ambients
                // x = min, y = max

            if ((mapPosition.x<lights[n].boxXBound.x) || (mapPosition.x>lights[n].boxXBound.y)) continue;
            if ((mapPosition.z<lights[n].boxZBound.x) || (mapPosition.z>lights[n].boxZBound.y)) continue;

                // add in the light (no attenuation)

            lightCol+=lights[n].colorExponent.rgb;

                // per-light bump calc (in tangent space)

            lightVertexVector.x=dot(lightVector,tangentSpaceTangent);
            lightVertexVector.y=dot(lightVector,tangentSpaceBinormal);
            lightVertexVector.z=dot(lightVector,tangentSpaceNormal);

            bumpLightVertexVector=normalize(lightVertexVector);
            bump+=dot(bumpLightVertexVector,bumpMap);

                // per-light spec count

            specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
            specFactor=max(dot(bumpMap,specHalfVector),0.0);
            spec+=(specMap*pow(specFactor,shineFactor));

            continue;
        }

            // otherwise it's a normal radial light

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

                // per-light spec count

            specHalfVector=normalize(normalize(eyeVector)+bumpLightVertexVector);
            specFactor=max(dot(bumpMap,specHalfVector),0.0);
            spec+=((specMap*pow(specFactor,shineFactor))*att);
        }
    }

        // finish the spec by making sure
        // it's dimmed in dark areas

    spec=min(spec,1.0)*((lightCol.r+lightCol.g+lightCol.b)*0.33);

        // add bump into the ambient and make
        // sure it's never less than 10% of the
        // ambient

    lowp vec3 pixelAmbient=max((lightCol*bump),(ambient*0.9));

        // finally create the pixel

    outputPixel.rgb=((tex.rgb*pixelAmbient)+spec)+(texture(glowTex,fragUV).rgb*glowFactor);
    outputPixel.a=tex.a*alpha;
}

