import { Vector2 } from 'three';
export const CRTShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new Vector2() },
        warp: { value: 0.75 },
        scan: { value: 0.75 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float warp;
    uniform float scan;
    varying vec2 vUv;

    void main() {
      // Convert UV to screen coordinates
      vec2 fragCoord = vUv * resolution;
      vec2 uv = vUv;
      
      // squared distance from center
      vec2 dc = abs(0.5-uv);
      dc *= dc;
      
      // warp the fragment coordinates
      uv.x -= 0.5; 
      uv.x *= 1.0+(dc.y*(0.5*warp)); 
      uv.x += 0.5;
      uv.y -= 0.5; 
      uv.y *= 1.0+(dc.x*(0.5*warp)); 
      uv.y += 0.5;

      if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        // determine if we are drawing in a scanline
        float apply = abs(sin(fragCoord.y)*0.5*scan);
        // sample the texture
        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = vec4(mix(texel.rgb, vec3(0.0), apply), 1.0);
      }
    }
  `
};
