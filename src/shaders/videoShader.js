export const VideoShader = {
  uniforms: {
    tDiffuse: { value: null },
    uGridSize: { value: 10 },
    uDotSize: { value: 0.9 },
    uContrast: { value: 1.35 },
    uBrightness: { value: 0.04 },
    uEffectStrength: { value: 1 },
    uColor: { value: null },
    uEdgeHeight: { value: 0.1 },
    uEdgeWave: { value: 0.06 },
    uEdgeSoftness: { value: 0.12 },
    uScrollProgress: { value: 0 },
    uTime: { value: 0 },
    uResolution: { value: null },
    uVideoResolution: { value: null },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uGridSize;
    uniform float uDotSize;
    uniform float uContrast;
    uniform float uBrightness;
    uniform float uEffectStrength;
    uniform vec3 uColor;
    uniform float uEdgeHeight;
    uniform float uEdgeWave;
    uniform float uEdgeSoftness;
    uniform float uScrollProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uVideoResolution;

    varying vec2 vUv;

    vec2 coverUv(vec2 uv) {
      float canvasAspect = uResolution.x / uResolution.y;
      float videoAspect = uVideoResolution.x / uVideoResolution.y;
      vec2 scale = vec2(1.0);

      if (canvasAspect > videoAspect) {
        scale.y = videoAspect / canvasAspect;
      } else {
        scale.x = canvasAspect / videoAspect;
      }

      return (uv - 0.5) * scale + 0.5;
    }

    float bayer4(vec2 position) {
      vec2 cell = mod(floor(position), 4.0);

      if (cell.y < 1.0) {
        if (cell.x < 1.0) return 0.0 / 16.0;
        if (cell.x < 2.0) return 8.0 / 16.0;
        if (cell.x < 3.0) return 2.0 / 16.0;
        return 10.0 / 16.0;
      }

      if (cell.y < 2.0) {
        if (cell.x < 1.0) return 12.0 / 16.0;
        if (cell.x < 2.0) return 4.0 / 16.0;
        if (cell.x < 3.0) return 14.0 / 16.0;
        return 6.0 / 16.0;
      }

      if (cell.y < 3.0) {
        if (cell.x < 1.0) return 3.0 / 16.0;
        if (cell.x < 2.0) return 11.0 / 16.0;
        if (cell.x < 3.0) return 1.0 / 16.0;
        return 9.0 / 16.0;
      }

      if (cell.x < 1.0) return 15.0 / 16.0;
      if (cell.x < 2.0) return 7.0 / 16.0;
      if (cell.x < 3.0) return 13.0 / 16.0;
      return 5.0 / 16.0;
    }

    float random(vec2 position) {
      return fract(sin(dot(position, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float gridSize = max(uGridSize, 1.0);
      vec2 cellCount = max(uResolution / gridSize, vec2(1.0));
      vec2 pixelUv = (floor(vUv * cellCount) + 0.5) / cellCount;

      vec3 original = texture2D(tDiffuse, coverUv(vUv)).rgb;
      vec3 pixelColor = texture2D(tDiffuse, coverUv(pixelUv)).rgb;

      vec3 adjusted = (pixelColor - 0.5) * uContrast + 0.5;
      adjusted += uBrightness;
      adjusted = clamp(adjusted, 0.0, 1.0);

      float luminance = dot(adjusted, vec3(0.299, 0.587, 0.114));
      vec2 dotPosition = fract(gl_FragCoord.xy / gridSize) - 0.5;
      float dotRadius = mix(0.08, 0.48, luminance) * uDotSize;
      float dotPattern = 1.0 - smoothstep(
        dotRadius,
        dotRadius + 0.055,
        length(dotPosition)
      );

      float ditherPattern = step(bayer4(gl_FragCoord.xy), luminance);
      float pattern = mix(dotPattern, ditherPattern, 0.28);

      vec3 tintedColor = mix(adjusted, adjusted * uColor * 1.55, 0.7);
      vec3 processed = tintedColor * pattern;

      float grain = random(gl_FragCoord.xy + floor(uTime * 12.0)) - 0.5;
      float scanLine = sin(gl_FragCoord.y * 0.7 + uTime * 4.0);
      processed += grain * 0.05 + scanLine * 0.018;
      processed = clamp(processed, 0.0, 1.0);

      vec3 finalColor = mix(
        original,
        processed,
        clamp(uEffectStrength, 0.0, 1.0)
      );

      float veil = mix(0.84, 0.46, smoothstep(0.0, 0.48, vUv.x));
      veil = mix(veil, 0.04, smoothstep(0.48, 0.78, vUv.x));
      finalColor = mix(finalColor, vec3(0.91, 0.969, 0.969), veil);

      vec2 screenUv = gl_FragCoord.xy / uResolution;
      float scrollPhase = uScrollProgress * 4.0;
      float wave = sin(screenUv.x * 7.854 + 0.6 + scrollPhase) * 0.6;
      wave += sin(screenUv.x * 18.85 + 2.1 - scrollPhase * 1.4) * 0.28;
      wave += sin(screenUv.x * 35.81 + 1.4 + scrollPhase * 0.6) * 0.12;

      float edge = uEdgeHeight + wave * uEdgeWave;
      edge += sin(scrollPhase * 0.65) * 0.018;
      float softAlpha = smoothstep(edge, edge + uEdgeSoftness, screenUv.y);
      float ditherAlpha = step(bayer4(gl_FragCoord.xy) + 0.001, softAlpha);
      float edgeAlpha = mix(softAlpha, ditherAlpha, 0.62);
      vec3 pageColor = vec3(0.002125, 0.013702, 0.023153);

      gl_FragColor = vec4(mix(pageColor, finalColor, edgeAlpha), 1.0);
      #include <colorspace_fragment>
    }
  `,
}
