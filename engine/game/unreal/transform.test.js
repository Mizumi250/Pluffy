import assert from 'node:assert/strict'
import test from 'node:test'
import {
  eulerToQuaternion,
  multiplyQuaternions,
  quaternionFromAxisAngle,
  rotateVector,
  rotationToUnrealQuaternion,
  toUnrealAxis,
  toUnrealPosition,
  toUnrealQuaternion,
  toUnrealScale,
} from './transform.js'

// Generated numbers are rounded to 6 decimals, so comparisons that go through the
// converter use 1e-5; pure math uses 1e-9.
const near = (actual, expected, label, tolerance = 1e-9) => {
  assert.equal(actual.length, expected.length, label)
  actual.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < tolerance, `${label}: ${actual} vs ${expected}`))
}
// DSL axes (x right, y up, z forward) -> Unreal axes (X forward, Y right, Z up)
const toUnrealVector = ([x, y, z]) => [z, x, y]

test('positions are meters in DSL axes and become centimeters in Unreal axes', () => {
  assert.deepEqual(toUnrealPosition([2, 1, 1]), [100, 200, 100])
  assert.deepEqual(toUnrealPosition([0, -0.5, 0]), [0, 0, -50])
  assert.deepEqual(toUnrealPosition([1, 2, 3]), [300, 100, 200])
  assert.deepEqual(toUnrealScale([20, 1, 20]), [20, 20, 1])
  assert.deepEqual(toUnrealAxis([0, 1, 0]), [0, 0, 1])
})

test('there is no negative zero in converted output', () => {
  for (const value of [...toUnrealPosition([0, 0, -0]), ...toUnrealQuaternion([-0, 0, -0, 1])]) {
    assert.equal(Object.is(value, -0), false)
  }
})

test('euler rotation follows the DSL convention: yaw turns right, pitch looks down', () => {
  near(rotateVector(eulerToQuaternion([0, 90, 0]), [0, 0, 1]), [1, 0, 0], 'yaw 90: forward -> right')
  near(rotateVector(eulerToQuaternion([90, 0, 0]), [0, 0, 1]), [0, -1, 0], 'pitch 90: forward -> down')
  near(rotateVector(eulerToQuaternion([0, 0, 0]), [0.3, 0.4, 0.5]), [0.3, 0.4, 0.5], 'identity')
})

test('euler order is roll, then pitch, then yaw', () => {
  const rolledFirst = multiplyQuaternions(
    quaternionFromAxisAngle([0, 1, 0], Math.PI / 2),
    multiplyQuaternions(quaternionFromAxisAngle([1, 0, 0], Math.PI / 2), quaternionFromAxisAngle([0, 0, 1], Math.PI / 2)),
  )
  near(eulerToQuaternion([90, 90, 90]), rolledFirst, 'ZXY composition')
})

test('rotating in DSL space then converting equals converting then rotating in Unreal space', () => {
  const samples = [[45, -30, 0], [10, 20, 30], [-60, 135, 15], [0, 0, 90], [90, 0, 0]]
  const vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.3, -0.7, 0.2]]
  for (const euler of samples) {
    const dsl = eulerToQuaternion(euler)
    const unreal = toUnrealQuaternion(dsl)
    for (const vector of vectors) {
      near(toUnrealVector(rotateVector(dsl, vector)), rotateVector(unreal, toUnrealVector(vector)), `euler ${euler} vector ${vector}`, 1e-5)
    }
  }
})

test('converted quaternions stay unit length', () => {
  const [x, y, z, w] = rotationToUnrealQuaternion([45, -30, 12])
  assert.ok(Math.abs(Math.hypot(x, y, z, w) - 1) < 1e-5)
})

test('a downward light stays downward after conversion (forward is +X in Unreal)', () => {
  const q = rotationToUnrealQuaternion([90, 0, 0])
  near(rotateVector(q, [1, 0, 0]), [0, 0, -1], 'unreal forward -> down', 1e-5)
})
