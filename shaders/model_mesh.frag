uniform lowp sampler2D baseTex;
uniform lowp sampler2D normalTex;
uniform lowp sampler2D specularTex;

uniform lowp vec3 ambient;
uniform mediump float shineFactor;

struct lightType {
    highp vec4 positionIntensity;
    mediump vec4 colorExponent;
};

uniform lightType lights[24];

varying highp vec3 eyeVector,eyePosition;
varying highp vec2 fragUV;
varying mediump vec3 tangentSpaceTangent,tangentSpaceBinormal,tangentSpaceNormal;

void main(void)
{
    lowp float att;
    highp float dist;
    highp vec3 lightVector,lightVertexVector;

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

        // lights

    for (int n=0;n!=24;n++) {

            // get vector for light

        lightVector=lights[n].positionIntensity.xyz-eyePosition;

        dist=length(lightVector);
        if (dist<lights[n].positionIntensity.w) {

                // the lighting attenuation

            att=1.0-(dist/lights[n].positionIntensity.w);
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

    gl_FragColor.rgb=(tex.rgb*pixelAmbient)+spec;
    gl_FragColor.a=tex.a;
}

