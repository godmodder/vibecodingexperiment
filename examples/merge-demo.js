const Y = require('yjs');
const THREE = require('three');
const path = require('path');
const { sceneToDoc, docToScene } = require('../src/sceneGraph');
const { persistUpdates, loadUpdates, replayUpdates } = require('../src/versioning');

// Create initial scene with one cube
const scene = new THREE.Scene();
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(cube);

// Build initial Yjs document
const doc1 = sceneToDoc(scene);
const updateInit = Y.encodeStateAsUpdate(doc1);

// Clone document for second editor
const doc2 = new Y.Doc();
Y.applyUpdate(doc2, updateInit);

// Local change on doc1: move cube on X axis
const sv1 = Y.encodeStateVector(doc1);
const cube1 = doc1.getMap('scene').get('root').get('children').get(0);
cube1.get('position').set('x', 1);
const update1 = Y.encodeStateAsUpdate(doc1, sv1);

// Local change on doc2: move cube on Y axis
const sv2 = Y.encodeStateVector(doc2);
const cube2 = doc2.getMap('scene').get('root').get('children').get(0);
cube2.get('position').set('y', 2);
const update2 = Y.encodeStateAsUpdate(doc2, sv2);

// Exchange updates (merging)
Y.applyUpdate(doc1, update2);
Y.applyUpdate(doc2, update1);

// Convert merged doc back to three.js scene
const mergedScene = docToScene(doc1);
const mergedPos = mergedScene.children[0].position;
console.log('Merged position:', mergedPos.x, mergedPos.y, mergedPos.z);

// Persist updates
const updatesDir = path.join(__dirname, 'updates');
persistUpdates([updateInit, update1, update2], updatesDir);

// Replay updates into a new document
const loaded = loadUpdates(updatesDir);
const docReplayed = new Y.Doc();
replayUpdates(loaded, docReplayed);
const sceneReplayed = docToScene(docReplayed);
const posReplay = sceneReplayed.children[0].position;
console.log('Replayed position:', posReplay.x, posReplay.y, posReplay.z);
