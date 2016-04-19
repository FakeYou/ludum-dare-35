import FastSimplexNoise  from 'fast-simplex-noise';
import Trees from './Trees';

export default class World {
	constructor(app) {
		this.app = app;

		this.boundaries = [-10000, 500, 1500, 2500, 3000000];
		this.gradient = 300;

		this.colors = [
			[
				new THREE.Color(0xe25b82),
				new THREE.Color(0xf7d63a),
				new THREE.Color(0xf99e26),
				new THREE.Color(0x49c6d1),
				new THREE.Color(0xF8D5C1)
			],
			[
				new THREE.Color(0xe25b82),
				new THREE.Color(0xf7d63a),
				new THREE.Color(0xf99e26),
				new THREE.Color(0x49c6d1),
				new THREE.Color(0xF8D5C1)
			],
			[
				new THREE.Color(0xED3D7F),
				new THREE.Color(0x502E55),
				new THREE.Color(0xF3618D),
				new THREE.Color(0x8C94A0),
				new THREE.Color(0xFFFEFC)
			],
			[
				new THREE.Color(0xFEA657),
				new THREE.Color(0x6E1E52),
				new THREE.Color(0xE64F5C),
				new THREE.Color(0x520D1E),
				new THREE.Color(0x99C2AD)
			],
			[
				new THREE.Color(0xff0000),
				new THREE.Color(0x00ff00),
				new THREE.Color(0x0000ff),
				new THREE.Color(0x000000),
				new THREE.Color(0x000000),
			],
		]

		this.planes = [
			// { geometry: new THREE.PlaneGeometry(120, 120, 24, 24), position: new THREE.Vector3(0, 300, 0)},
			{ geometry: new THREE.PlaneGeometry(700, 600, 70, 60), position: new THREE.Vector3(0, 0, 0)},

			// { geometry: new THREE.PlaneGeometry(128, 128, 12, 12), position: new THREE.Vector3(-128, 352, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 12, 12), position: new THREE.Vector3(128, 352, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 12, 12), position: new THREE.Vector3(-128, 224, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 24, 24), position: new THREE.Vector3(0, 224, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 12, 12), position: new THREE.Vector3(128, 224, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 10, 10), position: new THREE.Vector3(-128, 98, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 10, 10), position: new THREE.Vector3(0, 98, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 10, 10), position: new THREE.Vector3(128, 98, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 8, 8), position: new THREE.Vector3(-128, -30, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 8, 8), position: new THREE.Vector3(0, -30, 0)},
			// { geometry: new THREE.PlaneGeometry(128, 128, 8, 8), position: new THREE.Vector3(128, -30, 0)},
		];


		this.material = new THREE.ShaderMaterial({
			wireframe: false,
			uniforms: {
				time: { type: 'f', value: 1.0 },
				resolution: { type: 'v2', value: new THREE.Vector2() },
				airplane: { type: 'v3', value: new THREE.Vector3() },
				coords: { type: 'v3', value: new THREE.Vector3() },
				diff: { type: 'v3', value: new THREE.Vector3() },
				distance: { type: 'f', value: 0.0 },
				maxHeight: { type: 'f', value: 42.0 },
				minHeight: { type: 'f', value: -42.0 },
				far: { type: 'f', value: 600.0 },
				near: { type: 'f', value: 0.1 },
				color1: { type: 'c', value: new THREE.Color(1, 0.5, 0.5) },
				color2: { type: 'c', value: new THREE.Color() },
				color3: { type: 'c', value: new THREE.Color() },
				color4: { type: 'c', value: new THREE.Color() },
				color5: { type: 'c', value: new THREE.Color() }
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		});

		this.mesh = new THREE.Mesh(new THREE.Geometry(), this.material);
		this.mesh.rotation.x -= Math.PI / 2;

		for(let i = 0; i < this.planes.length; i++) {
			let plane = this.planes[i];
			let matrix = new THREE.Matrix4().setPosition(plane.position);

			this.mesh.geometry.merge(plane.geometry, matrix);
		}

		this.simplex = new FastSimplexNoise({
			frequency: 0.01,
			max: 255,
			min: 0,
			octaves: 8
		});

		this.delta = 0;

		this.trees = new Trees(app, 40, 40, 10);
		this.forest = new THREE.Group();
		this.forest.add(this.trees.mesh);
		this.app.scene.add(this.forest);

		this.diff = new THREE.Vector3();
		this.travel = -500;
	}

	update(time, delta) {
		let i, j;

		this.travel = this.mesh.position.z - this.app.airplane.mesh.position.z - 290;

		if(this.travel < -50) {
			this.diff = new THREE.Vector3(this.app.airplane.mesh.position.x, -this.mesh.position.z, 0);

			this.mesh.position.setX(this.app.airplane.mesh.position.x);
			this.mesh.position.setZ(this.app.airplane.mesh.position.z + 290);

			this.forest.position.x = this.mesh.position.x;
			this.forest.position.y = this.mesh.position.z - 20;

			this.travel = 0;
		}

		let coords = this.mesh.position.clone();
		coords.y -= this.diff.x;

		this.material.uniforms.time.value = time;
		this.material.uniforms.distance.value = this.travel;
		this.material.uniforms.diff.value = this.diff;
		this.material.uniforms.coords.value = coords;

		let colors = [];
		// if(Math.random() < 0.02) {
		// 	console.log(this.mesh.position.z);
		// }

		let pos = this.app.airplane.mesh.position.z + 100;
		for(let i = 0; i < this.boundaries.length; i++) {
			if(pos + this.gradient / 2 > this.boundaries[i] && pos - this.gradient / 2 < this.boundaries[i]) {
				let percentage = Math.min(1, Math.max(0, (pos - this.boundaries[i] + this.gradient/2)/this.gradient));

				colors[0] = this.mixColor(this.colors[i][0], this.colors[i - 1][0], percentage);
				colors[1] = this.mixColor(this.colors[i][1], this.colors[i - 1][1], percentage);
				colors[2] = this.mixColor(this.colors[i][2], this.colors[i - 1][2], percentage);
				colors[3] = this.mixColor(this.colors[i][3], this.colors[i - 1][3], percentage);
				colors[4] = this.mixColor(this.colors[i][4], this.colors[i - 1][4], percentage);

			}
			else if(pos > this.boundaries[i]) {
				colors[0] = this.colors[i][0];
				colors[1] = this.colors[i][1];
				colors[2] = this.colors[i][2];
				colors[3] = this.colors[i][3];
				colors[4] = this.colors[i][4];
			}
		}

		this.material.uniforms.color1.value = colors[0];
		this.material.uniforms.color2.value = colors[1];
		this.material.uniforms.color3.value = colors[2];
		this.material.uniforms.color4.value = colors[3];
		this.material.uniforms.color5.value = colors[4];
		this.app.renderer.setClearColor(colors[4]);

		this.material.uniforms.airplane.value = new THREE.Vector3(
			this.app.airplane.mesh.position.x - this.mesh.position.x,
			this.app.airplane.mesh.position.y - this.mesh.position.y - 30,
			this.app.airplane.mesh.position.z - this.mesh.position.z
		);

		if(!this.app.airplane.alive) {
			this.material.uniforms.airplane.value = new THREE.Vector3(-1000, -1000, -1000);
		}

		this.delta = this.app.airplane.mesh.position.z / 1000;
		this.delta = time / 8000;

		for(i = 0; i < this.mesh.geometry.vertices.length; i++) {
			let vert = this.mesh.geometry.vertices[i].clone();
			vert.add(this.diff);

			this.mesh.geometry.vertices[i].setZ(this.calcHeight(Math.floor(vert.x), Math.floor(vert.y)));
		}

		this.mesh.geometry.verticesNeedUpdate = true;
		this.mesh.geometry.normalsNeedUpdate = true;
		this.mesh.geometry.computeVertexNormals();
	}

	calcHeight(x, y) {
		let z = 0;

		let stages = [0, 0, 0, 0, 0, 0, 0];
		let percentages = [0, 0, 0, 0, 0, 0];

		stages[0] += this.simplex.raw3D(y / 64, x / 100, this.delta) * 6;

		stages[1] += this.simplex.raw3D(y / 100, x / 60, this.delta) * 6;
		stages[1] += this.simplex.raw3D(y / 160, x / 160, this.delta) * 12;

		stages[2] += this.simplex.raw3D(x/80, y/80, this.delta) * 10;
		stages[2] += this.simplex.raw3D(x/160, y/320, this.delta) * 30;

		stages[3] += this.simplex.raw3D(x/100, y/80, this.delta) * 10;
		stages[3] += this.simplex.raw3D(x/160, y/240, this.delta) * 40;

		for(let i = 0; i < this.boundaries.length; i++) {
			if(-y + this.gradient / 2 > this.boundaries[i] && -y - this.gradient / 2 < this.boundaries[i]) {
				let percentage = Math.min(1, Math.max(0, (-y - this.boundaries[i] + this.gradient/2)/this.gradient));
				z = stages[i] * percentage + stages[i + 1] * (1 - percentage);
			}
			else if(-y > this.boundaries[i]) {
				z = stages[i];
			}

		}

		return z;
	}

	mixColor(color1, color2, weight) {
		let p = weight === undefined ? 0.5 : weight;

		let w = 2 * p - 1;
		let a = 0;

		let w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		let w2 = 1 - w1;

		return new THREE.Color(
			w1 * color1.r + w2 * color2.r,
			w1 * color1.g + w2 * color2.g,
			w1 * color1.b + w2 * color2.b
		);
	}
}