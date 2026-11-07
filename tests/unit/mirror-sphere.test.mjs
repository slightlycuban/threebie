import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMirrorSphere } from '../../src/mirror-sphere.mjs';

const RADIUS = 50;
const RES = 25;
const VERTICES_PER_ROW = RES + 1;

function sphere() {
  return createMirrorSphere(new THREE.Scene(), RADIUS, RES);
}

function vertexAt(x, y) {
  return y * VERTICES_PER_ROW + x;
}

function normalOf(s, i) {
  return new THREE.Vector3().fromBufferAttribute(s.mesh.geometry.attributes.normal, i);
}

function radialOf(s, i) {
  return new THREE.Vector3().fromBufferAttribute(s.mesh.geometry.attributes.position, i).normalize();
}

function bump(cx, cy, amount) {
  return (x, y) => (x === cx && y === cy ? amount : 0);
}

test('an undisturbed sphere keeps radial normals', () => {
  const s = sphere();
  s.displace(() => 0);
  for (let i = 0; i < VERTICES_PER_ROW * (RES + 1); i++) {
    const angle = normalOf(s, i).angleTo(radialOf(s, i));
    assert.ok(angle < 1e-6, `vertex ${i} normal is ${angle} rad off radial`);
  }
});

test('a bump tilts the normals around it', () => {
  const s = sphere();
  s.displace(bump(12, 12, 5));
  for (const [x, y] of [[11, 12], [13, 12], [12, 11], [12, 13]]) {
    const i = vertexAt(x, y);
    const angle = normalOf(s, i).angleTo(radialOf(s, i));
    assert.ok(angle > 0.05, `normal at (${x}, ${y}) is only ${angle} rad off radial`);
  }
});

// Each seam vertex has two copies, and each pole a whole row of them. A
// normal per copy would show as a line down the seam or a pinch at a pole.
test('both copies of a seam vertex share a normal', () => {
  const s = sphere();
  s.displace(bump(0, 12, 5));
  for (let y = 0; y <= RES; y++) {
    assert.deepEqual(normalOf(s, vertexAt(RES, y)), normalOf(s, vertexAt(0, y)), `row ${y}`);
  }
});

test('every copy of a pole vertex shares a normal', () => {
  const s = sphere();
  s.displace((x, y) => (x === 3 && (y === 1 || y === RES - 1) ? 5 : 0));
  for (const y of [0, RES]) {
    const first = normalOf(s, vertexAt(0, y));
    for (let x = 1; x <= RES; x++) {
      assert.deepEqual(normalOf(s, vertexAt(x, y)), first, `pole row ${y}, copy ${x}`);
    }
  }
});
