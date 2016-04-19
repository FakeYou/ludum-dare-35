import Airplane from './Airplane';
import World from './World';

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

export default class Application {

	constructor(container) {
		this.container = container;

		this.camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 5000);
		this.camera.position.set(100, 100, -12);

		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});

		this.renderer.setSize(WIDTH, HEIGHT);
		this.container.appendChild(this.renderer.domElement);

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.stats = new Stats();

		this.scene = new THREE.Scene();
		this.keyboard = new THREE.KeyboardState();

		this.score = 0;
		this.scoreElement = document.getElementById('score');

		window.addEventListener('resize', this.onResize.bind(this));
		document.body.appendChild(this.stats.dom);

		this.preload();
	}

	preload() {
		this.create();
	}

	create() {
		// this.scene.add(new THREE.AxisHelper(10));

		var light = new THREE.AmbientLight(0xffffff);
		this.scene.add(light);

		this.airplane = new Airplane(this);
		this.scene.add(this.airplane.mesh);

		this.world = new World(this);
		this.scene.add(this.world.mesh);

		this.startTime = Date.now();
		this.lastTime = Date.now();
		this.update();
	}

	update() {
		this.stats.begin();

		let time = Date.now() - this.startTime;
		let delta = Date.now() - this.lastTime;
		this.lastTime = Date.now();

		this.airplane.update(time, delta);
		this.world.update(time, delta);

		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.update.bind(this));

		this.scoreElement.innerText = 'score ' + Math.round(this.score);

		this.stats.end();
	}

	onResize(e) {
		WIDTH = window.innerWidth
		HEIGHT = window.innerHeight

		this.renderer.setSize(WIDTH, HEIGHT)
		this.camera.aspect = WIDTH / HEIGHT
		this.camera.updateProjectionMatrix()
	}

}
