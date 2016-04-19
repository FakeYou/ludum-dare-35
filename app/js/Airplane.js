export default class Airplane {
	constructor(app) {
		this.app = app;

		this.geometry = new THREE.CylinderGeometry(0, 0.7, 2, 4);
		this.material = new THREE.MeshNormalMaterial({wireframe:false});

		this.material = new THREE.ShaderMaterial({
			wireframe: false,
			uniforms: {
				time: { type: 'f', value: 1.0 },
				distance: { type: 'f', value: 0.0 },
				far: { type: 'f', value: 5.0 },
				near: { type: 'f', value: 2.0 },
				mainColor: { type: 'c', value: new THREE.Color(0xF0F5D0) },
				secColor: { type: 'c', value: new THREE.Color(0xE7763F) },
				darkColor: { type: 'c', value: new THREE.Color(0x9B947F) }
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader_airplane' ).textContent
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.y = 20;
		this.mesh.rotation.x += Math.PI / 2;
		this.mesh.scale.z = 0.3;

		this.mesh.translateY(20);

		this.roll = 0;
		this.pitch = 0;
		this.speed = 1.4;

		this.cameraPosition = new THREE.Vector3(0, 1, -4);

		this.caster = new THREE.Raycaster();
		this.alive = true;

		this.rays = [
			[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), 0.3],
			[new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), 0.2],
			[new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0), 0.2],
			[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), 0.2],

			[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), 0.5],
			[new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1, 0, 0), 0.5],
			[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), 0.5*0.3],

			[new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0), 0.8],
			[new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, 0, 0), 0.8],
			[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), 0.8*0.3],
		];
	}

	update() {
		let distance = this.mesh.position.y - this.app.world.calcHeight(this.mesh.position.x, -this.mesh.position.z + 45);
		this.mesh.material.wireframe = false;

		for(let i = 0; i < this.rays.length; i++) {
			let ray = this.rays[i];
			this.caster.set(this.mesh.position.clone().add(ray[0]), ray[1]);
			let hits = this.caster.intersectObject(this.app.world.mesh);

			if(hits.length > 0 && hits[0].distance < ray[2]) {
				this.alive = false;
				this.mesh.visible = false;
			}
		}

		if(distance < 0) {
			this.alive = false;
			this.mesh.visible = false;
		}

		if(this.alive) {
			this.app.score += Math.max(0, 10 - Math.min(30, distance)/3)/10;

			if(this.app.keyboard.pressed('d') || this.app.keyboard.pressed('right')) {
				this.roll += 0.025;
				this.roll *= 0.96;
			}
			else if(this.app.keyboard.pressed('a') || this.app.keyboard.pressed('left')) {
				this.roll -= 0.025;
				this.roll *= 0.96;
			}
			else {
				this.roll *= 0.91;
			}

			if(this.app.keyboard.pressed('w') || this.app.keyboard.pressed('up')) {
				this.pitch += 0.03;
				this.pitch *= 0.97;
			}
			else if(this.app.keyboard.pressed('s') || this.app.keyboard.pressed('down')) {
				this.pitch -= 0.025;
				this.pitch *= 0.96;
			}
			else {
				this.pitch *= 0.97;
			}

			this.speed += this.pitch / 20;

			this.drag = Math.max(0, (1.4 - this.speed)) / 10;
			this.pitch += this.drag;

			this.roll = Math.min(1.2, Math.max(-1.2, this.roll));
			this.pitch = Math.min(0.5, Math.max(-0.8, this.pitch));

			this.mesh.rotation.set(Math.PI / 2, 0, 0);
			this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.roll);
			this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.pitch);

			this.mesh.translateY(this.speed);

			this.mesh.rotateOnAxis(new THREE.Vector3(0, 0.5, 0), this.roll);
		}
		else {
			this.mesh.position.y = this.app.world.calcHeight(this.mesh.position.x, -this.mesh.position.z + 45);
			this.cameraPosition.y += (10 - this.cameraPosition.y) / 200;
			this.cameraPosition.z += (-20 - this.cameraPosition.z) / 200;
		}

		this.app.camera.position.copy(this.mesh.position);
		this.app.camera.position.add(this.cameraPosition);
		this.app.camera.lookAt(this.mesh.position);
		this.app.camera.rotation.z -= this.roll/2;
		this.app.camera.rotation.x += this.pitch/6;
	}
}