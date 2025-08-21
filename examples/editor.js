const Y = require('yjs');
const THREE = require('three');
const { sceneToDoc, docToScene } = require('../src/sceneGraph');

// Build initial scene with one cube
const baseScene = new THREE.Scene();
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
baseScene.add(cube);

// Represent scene in a Yjs document
const doc = sceneToDoc(baseScene);

// Rehydrate into a scene used for rendering
const threeScene = docToScene(doc);
const cubeMesh = threeScene.children[0];

// Three.js renderer and camera setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(threeScene, camera);
}
animate();

function updateCubeFromDoc() {
  const yCube = doc.getMap('scene').get('root').get('children').get(0);
  const pos = yCube.get('position');
  cubeMesh.position.set(pos.get('x'), pos.get('y'), pos.get('z'));
}

// Move cube with arrow keys, updating the Yjs doc
window.addEventListener('keydown', e => {
  const yCube = doc.getMap('scene').get('root').get('children').get(0);
  const pos = yCube.get('position');
  switch (e.key) {
    case 'ArrowUp':
      pos.set('y', pos.get('y') + 0.1);
      break;
    case 'ArrowDown':
      pos.set('y', pos.get('y') - 0.1);
      break;
    case 'ArrowLeft':
      pos.set('x', pos.get('x') - 0.1);
      break;
    case 'ArrowRight':
      pos.set('x', pos.get('x') + 0.1);
      break;
    default:
      return;
  }
  updateCubeFromDoc();
});
