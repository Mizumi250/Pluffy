// ============================================================
// PLUFF UNREAL TRANSFORMS v1.0
//
// The Unreal scene DSL uses the same axes as the Unity scene DSL so scenes read
// the same way in both engines:
//
//   position / scale / axis vectors:  [x, y, z]
//     x = right, y = UP, z = forward, units = meters
//
// Unreal itself is Z-up, centimeters:  X = forward, Y = right, Z = up.
// The mapping  (x, y, z) -> (X = z, Y = x, Z = y)  is an even permutation of the
// axes (determinant +1), so it keeps handedness and rotations map by simply
// relabeling the quaternion's axes the same way.
//
// rotation: [x, y, z] Euler degrees, composed in Unity's order (Z, then X, then
// Y). The generator converts it to a quaternion here, in JavaScript, so the C++
// runtime only reads finished numbers.
// ============================================================

export const CM_PER_METER = 100

// -0 and float noise out of the generated JSON
export function clean(number, digits = 6) {
  const factor = 10 ** digits
  return Math.round(number * factor) / factor || 0
}

export function toUnrealPosition([x, y, z]) {
  return [clean(z * CM_PER_METER), clean(x * CM_PER_METER), clean(y * CM_PER_METER)]
}

export function toUnrealAxis([x, y, z]) {
  return [clean(z), clean(x), clean(y)]
}

export function toUnrealScale([x, y, z]) {
  return [clean(z), clean(x), clean(y)]
}

export function quaternionFromAxisAngle([ax, ay, az], radians) {
  const half = radians / 2
  const sine = Math.sin(half)
  return [ax * sine, ay * sine, az * sine, Math.cos(half)]
}

// Hamilton product a * b: b is applied first, then a (same as Unity and Unreal).
export function multiplyQuaternions(a, b) {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}

// Unity Euler order: roll (z) first, then pitch (x), then yaw (y).
export function eulerToQuaternion([xDegrees, yDegrees, zDegrees]) {
  const radians = degrees => (degrees * Math.PI) / 180
  const qx = quaternionFromAxisAngle([1, 0, 0], radians(xDegrees))
  const qy = quaternionFromAxisAngle([0, 1, 0], radians(yDegrees))
  const qz = quaternionFromAxisAngle([0, 0, 1], radians(zDegrees))
  return multiplyQuaternions(qy, multiplyQuaternions(qx, qz))
}

// Relabel (x, y, z, w) from DSL axes to Unreal axes.
export function toUnrealQuaternion([x, y, z, w]) {
  return [clean(z), clean(x), clean(y), clean(w)]
}

export function rotationToUnrealQuaternion(eulerDegrees) {
  return toUnrealQuaternion(eulerToQuaternion(eulerDegrees))
}

// q * v * q^-1 for a unit quaternion. Used by the tests to prove the mapping.
export function rotateVector([qx, qy, qz, qw], [vx, vy, vz]) {
  const tx = 2 * (qy * vz - qz * vy)
  const ty = 2 * (qz * vx - qx * vz)
  const tz = 2 * (qx * vy - qy * vx)
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx),
  ]
}
