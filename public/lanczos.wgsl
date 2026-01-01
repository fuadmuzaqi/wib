@group(0) @binding(0) var src : texture_2d<f32>;
@group(0) @binding(1) var dst : texture_storage_2d<rgba8unorm, write>;

fn sinc(x: f32) -> f32 {
  if (x == 0.0) { return 1.0; }
  let px = 3.1415926 * x;
  return sin(px) / px;
}

fn lanczos(x: f32) -> f32 {
  if (abs(x) < 3.0) {
    return sinc(x) * sinc(x / 3.0);
  }
  return 0.0;
}

@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let size = textureDimensions(dst);
  if (id.x >= size.x || id.y >= size.y) { return; }

  let uv = vec2<f32>(id.xy) / vec2<f32>(size);
  let srcSize = textureDimensions(src);
  let pos = uv * vec2<f32>(srcSize);

  var color = vec4<f32>(0.0);
  var total = 0.0;

  for (var i = -3; i <= 3; i++) {
    for (var j = -3; j <= 3; j++) {
      let p = vec2<i32>(pos) + vec2<i32>(i, j);
      let w = lanczos(f32(i)) * lanczos(f32(j));
      color += textureLoad(src, p, 0) * w;
      total += w;
    }
  }

  textureStore(dst, vec2<i32>(id.xy), color / total);
}
