<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';

	let spin = 0;

	SC.onFrame(() => {
		spin += 0.01;
	});
</script>

<SC.Canvas
	antialias
	background={new THREE.Color('papayawhip')}
	shadows
	fog={new THREE.FogExp2('papayawhip', 0.1)}
	powerPreference={'default'}
>
	<SC.Mesh
		geometry={new THREE.BoxGeometry()}
		material={new THREE.MeshStandardMaterial({ color: 0xff3e00, emissive: 'white' })}
		rotation={[spin, -spin, -spin]}
		position={[0, 1, 0]}
		castShadow
	/>
	<SC.Primitive
		object={new THREE.GridHelper(50, 50, 0x444444, 0x555555)}
		position={[0, 0.001, 0]}
	/>
	<SC.Mesh
		geometry={new THREE.PlaneGeometry(50, 50)}
		material={new THREE.MeshStandardMaterial({ color: 'burlywood' })}
		rotation={[-Math.PI / 2, 0, 0]}
		receiveShadow
	/>
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} shadow={{ mapSize: [2024, 2024] }} />
	<SC.AmbientLight intensity={0.6} />
	<SC.PerspectiveCamera position={[2, 1, 1]} />
	<SC.OrbitControls enableZoom={true} />
</SC.Canvas>
