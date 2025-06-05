<template>
  <div ref="container" class="earth-container"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from "vue";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { getCurrentInstance } from "vue";
  const { proxy } = getCurrentInstance() as any;

  const container = ref<HTMLDivElement | null>(null);
  const renderer = ref<THREE.WebGLRenderer>();
  //   const scene = ref<THREE.Scene>();
  const camera = ref<THREE.PerspectiveCamera>();
  const controls = ref<OrbitControls>();
  //   const earth = ref<THREE.Mesh>();
  //   const animationFrameId = ref(0);
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  onMounted(() => {
    nextTick(() => {
      initRenderer();
      initCamera();
      initScene();
      initLight();
      initControls();
      createStarField();
      animate();
      window.addEventListener("resize", onWindowResize, false);
    });
  });

  onUnmounted(() => {
    // if (animationFrameId) {
    //   cancelAnimationFrame(animationFrameId);
    // }
    // window.removeEventListener("resize", onWindowResize);
    // if (renderer) {
    //   renderer.dispose();
    // }
    // if (container.value && renderer.domElement) {
    //   container.value.removeChild(renderer.domElement);
    // }
  });

  /**
   * @description 初始化渲染场景
   */
  function initRenderer() {
    renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.value.setPixelRatio(window.devicePixelRatio);
    renderer.value.setSize(width.value, height.value);
    if (container.value) {
      container.value.appendChild(renderer.value.domElement);
    } else {
      console.warn("容器元素不存在");
    }
  }

  /**
   * @description 初始化相机
   */
  function initCamera() {
    camera.value = new THREE.PerspectiveCamera(45, width.value / height.value, 1, 10000);
    camera.value.position.set(5, -20, 200);
    camera.value.lookAt(0, 3, 0);
  }

  /**
   * @description 初始化场景
   */
  function initScene() {
    proxy.$scene = new THREE.Scene();
    proxy.$scene.background = new THREE.Color(0x020924);
    proxy.$scene.fog = new THREE.Fog(0x020924, 200, 1000);
  }

  /**
   * 初始化用户交互
   **/
  function initControls() {
    controls.value = new OrbitControls(camera.value!, renderer.value!.domElement);
    controls.value.enableDamping = true;
    controls.value.enableZoom = true;
    controls.value.autoRotate = false;
    controls.value.autoRotateSpeed = 2;
    controls.value.enablePan = true;
  }

  /**
   * @description 初始化光
   */
  function initLight() {
    if (!proxy.$scene) return;
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
    proxy.$scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(1, 0.1, 0).normalize();
    var directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
    directionalLight2.position.set(1, 0.1, 0.1).normalize();
    proxy.$scene.add(directionalLight);
    proxy.$scene.add(directionalLight2);
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
    hemiLight.position.set(0, 1, 0);
    proxy.$scene.add(hemiLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 500, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 18;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -52;
    directionalLight.shadow.camera.right = 12;
    proxy.$scene.add(directionalLight);
  }

  /**
   * 窗口变动
   **/
  function onWindowResize() {
    if (camera.value && renderer.value) {
      camera.value.aspect = window.innerWidth / window.innerHeight;
      camera.value.updateProjectionMatrix();
      renderer.value.setSize(window.innerWidth, window.innerHeight);
      //   renders();
    }
  }

  /**
   * @description 渲染
   */
  function renders() {
    if (renderer.value) {
      console.log(renderer.value);
      renderer.value.clear();
      renderer.value.render(proxy.$scene!, camera.value!);
    }
  }

  /**
   * 更新
   **/
  function animate() {
    window.requestAnimationFrame(() => {
      if (controls.value) controls.value.update();
      renders();
      animate();
    });
  }

  /**
   * 星空背景
   **/
  function createStarField() {
    // 创建球体几何体，设置较大的半径
    const radius = 100;
    const widthSegments = 64;
    const heightSegments = 32;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    // 加载星空纹理
    const textureLoader = new THREE.TextureLoader();
    const starryTexture = textureLoader.load("path/to/your/starry_sky_texture.jpg"); // 替换为星空纹理的路径

    // 创建材质并应用星空纹理
    const material = new THREE.MeshBasicMaterial({
      map: starryTexture,
      side: THREE.BackSide, // 让纹理显示在球体内表面
      transparent: true, // 使材质透明，以增强效果
      opacity: 1, // 调整透明度（如果需要）
    });

    // 创建一个网格对象
    const sphere = new THREE.Mesh(geometry, material);
    proxy.$scene!.add(sphere);
  }
</script>

<style scoped>
  .earth-container {
    width: 100%;
    height: 100vh;
    /* 使容器占满整个视口高度 */
    overflow: hidden;
  }
</style>
