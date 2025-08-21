const Y = require('yjs');
const THREE = require('three');

function serializeNode(node) {
  const yNode = new Y.Map();
  yNode.set('id', node.uuid);
  yNode.set('type', node.type);

  const pos = new Y.Map();
  pos.set('x', node.position.x);
  pos.set('y', node.position.y);
  pos.set('z', node.position.z);
  yNode.set('position', pos);

  if (node.material && node.material.color) {
    yNode.set('material', node.material.color.getHex());
  }

  const children = new Y.Array();
  for (const child of node.children) {
    children.push([serializeNode(child)]);
  }
  yNode.set('children', children);
  return yNode;
}

function sceneToDoc(scene) {
  const doc = new Y.Doc();
  const root = serializeNode(scene);
  doc.getMap('scene').set('root', root);
  return doc;
}

function deserializeNode(yNode) {
  const type = yNode.get('type');
  let obj;
  if (type === 'Scene') {
    obj = new THREE.Scene();
  } else if (type === 'Mesh') {
    const color = yNode.get('material') || 0xffffff;
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color });
    obj = new THREE.Mesh(geometry, material);
  } else {
    obj = new THREE.Object3D();
  }

  const pos = yNode.get('position');
  if (pos) {
    obj.position.set(pos.get('x') || 0, pos.get('y') || 0, pos.get('z') || 0);
  }

  const children = yNode.get('children');
  if (children) {
    children.forEach(yChild => {
      const childObj = deserializeNode(yChild);
      obj.add(childObj);
    });
  }

  return obj;
}

function docToScene(doc) {
  const root = doc.getMap('scene').get('root');
  if (!root) {
    return new THREE.Scene();
  }
  return deserializeNode(root);
}

module.exports = { sceneToDoc, docToScene };
