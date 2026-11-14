import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  DESKTOP,
  desktopCoordinates,
  monitorCoordinates,
  screenProjection,
  screenVisible,
} from '../../src/monitor/projection';

function fixture(width = 1440, height = 900) {
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.04, 50);
  camera.position.set(0.2, 0.1, 2);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 0.765),
    new THREE.MeshBasicMaterial(),
  );
  const scene = new THREE.Scene();
  scene.add(screen);
  scene.updateMatrixWorld(true);
  return { camera, screen, scene };
}

describe('physical monitor projection', () => {
  it.each([
    [1440, 900],
    [800, 600],
    [390, 844],
  ])(
    'maps DOM corners and raycast pointers in %i × %i CSS pixels',
    (width, height) => {
      const { camera, screen } = fixture(width, height);
      const matrix = screenProjection(screen, camera, width, height);
      expect(Math.abs(matrix.determinant())).toBeGreaterThan(0);
      for (const [u, v] of [
        [0.01, 0.01],
        [0.5, 0.5],
        [0.99, 0.99],
      ]) {
        const css = new THREE.Vector4(
          u! * DESKTOP.width,
          v! * DESKTOP.height,
          0,
          1,
        ).applyMatrix4(matrix);
        const x = css.x / css.w,
          y = css.y / css.w;
        const local = desktopCoordinates(x, y, width, height, camera, screen);
        expect(local?.x).toBeCloseTo(u! * DESKTOP.width, 4);
        expect(local?.y).toBeCloseTo(v! * DESKTOP.height, 4);
        const point = monitorCoordinates(
          x + 20,
          y + 30,
          { left: 20, top: 30, width, height },
          camera,
          screen,
        );
        expect(point?.x).toBeCloseTo(u! * DESKTOP.width, 4);
        expect(point?.y).toBeCloseTo(v! * DESKTOP.height, 4);
      }
      expect(
        monitorCoordinates(
          -10000,
          -10000,
          { left: 0, top: 0, width, height },
          camera,
          screen,
        ),
      ).toBeNull();
    },
  );

  it('hides DOM when blocked or viewed from behind', () => {
    const { scene, camera, screen } = fixture();
    expect(screenVisible(scene, camera, screen)).toBe(true);
    const blocker = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 0.1),
      new THREE.MeshBasicMaterial(),
    );
    blocker.position.z = 1;
    scene.add(blocker);
    scene.updateMatrixWorld(true);
    expect(screenVisible(scene, camera, screen)).toBe(false);
    scene.remove(blocker);
    camera.position.z = -2;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    expect(screenVisible(scene, camera, screen)).toBe(false);
  });
});
