import FastSimplexNoise  from 'fast-simplex-noise';

export default class Trees {

	constructor(app, width, height, density) {
		this.app = app;

		this.material = new THREE.MeshNormalMaterial({ wireframe: true });
		
		this.mesh = new THREE.Mesh(new THREE.Geometry(), this.material);

		this.simplex = new FastSimplexNoise({
			frequency: 0.1,
			max: 255,
			min: 0,
			octaves: 8
		});

		for(let i = 0; i < density; i++) {
			let x = Math.random() * width - width / 2;
			let y = Math.random() * height - height / 2;

			let tree = new THREE.CylinderGeometry(0, 1, 8, 4);
			let matrix = new THREE.Matrix4();
			matrix.makeRotationX(Math.PI / 2);
			matrix.setPosition(new THREE.Vector3(x, y, 0));

			this.mesh.geometry.merge(tree, matrix);
		}
	}

	update(time, delta) {
		for(let i = 0; i < this.mesh.geometry.vertices.length; i++) {
			let vert = this.mesh.geometry.vertices[i];

			if(i % 7 === 0) {
				vert.z = this.app.world.calcHeight(vert.x, vert.y - this.mesh.position.y);
			}
		}

		this.mesh.geometry.verticesNeedUpdate = true;
		this.mesh.geometry.normalsNeedUpdate = true;
		this.mesh.geometry.computeVertexNormals();
	}
}