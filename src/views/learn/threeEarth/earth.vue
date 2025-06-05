<template>
  <div ref="container" class="earth-container"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from "vue";
  import * as THREE from "three";
  // import * as d3 from "d3";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  //   import { getCurrentInstance } from "vue";
  //   const { proxy } = getCurrentInstance() as any;
  // const projection = d3.geoMercator().center([104.779307, 29.33924]).translate([0, 0]);
  const container = ref<HTMLDivElement | null>(null);
  const renderer = ref<THREE.WebGLRenderer>();
  //   const scene = ref<THREE.Scene>();
  const camera = ref<THREE.PerspectiveCamera>();
  const controls = ref<OrbitControls>();
  let earthMesh: THREE.Mesh;
  let earthGroup: THREE.Group;
  let lightsMesh: THREE.Mesh;
  //   const animationFrameId = ref(0);
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);
  let scene: THREE.Scene;
  let stars: THREE.Points;

  /**
   * 地球
   **/

  onMounted(() => {
    nextTick(() => {
      initRenderer();
      initCamera();
      initScene();
      initLight();
      initControls();
      createStarField();
      createEarth();
      loadAndDrawGeoJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${100000}_full.json`);
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
    camera.value = new THREE.PerspectiveCamera(45, width.value / height.value, 0.1, 1000);
    camera.value.position.set(5, -20, 200);
    camera.value.lookAt(0, 3, 0);
  }

  /**
   * @description 初始化场景
   */
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020924);
    scene.fog = new THREE.Fog(0x020924, 200, 1000);
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
    if (!scene) return;
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(1, 0.1, 0).normalize();
    var directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
    directionalLight2.position.set(1, 0.1, 0.1).normalize();
    scene.add(directionalLight);
    scene.add(directionalLight2);
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
    hemiLight.position.set(0, 1, 0);
    scene.add(hemiLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 500, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 18;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -52;
    directionalLight.shadow.camera.right = 12;
    scene.add(directionalLight);
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
      renderer.value.clear();
      renderer.value.render(scene!, camera.value!);
    }
  }

  // 设置卫星的旋转动画
  let satelliteAngle = 0;
  const satelliteOrbitRadius = 1.5; // 调整轨道半径，使其在地球模型外部
  let satellite1: THREE.Mesh;
  let satellite2: THREE.Mesh;

  /**
   * 更新
   **/
  function animate() {
    window.requestAnimationFrame(() => {
      if (controls.value) controls.value.update();

      stars.rotation.y += 0.0002;
      earthMesh.rotation.y += 0.002;
      lightsMesh.rotation.y += 0.002;

      // 更新卫星的位置，使其绕轨道旋转
      satelliteAngle += 0.01; // 控制旋转速度

      // 更新卫星1的位置
      const satellite1X = Math.cos(satelliteAngle) * satelliteOrbitRadius;
      const satellite1Y = 0; // 假设轨道在XY平面，Y为0，可以根据需要调整
      const satellite1Z = Math.sin(satelliteAngle) * satelliteOrbitRadius;
      if (satellite1) {
        satellite1.position.set(satellite1X, satellite1Y, satellite1Z);
        // 让卫星朝向轨道中心（地球）
        // satellite1.lookAt(earthMesh.position);
        // 或者，如果想让它沿着轨道切线方向，需要更复杂的计算或使用辅助对象
      }

      // 更新卫星2的位置，使其在轨道的另一侧
      const satellite2X = Math.cos(satelliteAngle + Math.PI) * satelliteOrbitRadius;
      const satellite2Y = 0; // 假设轨道在XY平面
      const satellite2Z = Math.sin(satelliteAngle + Math.PI) * satelliteOrbitRadius;
      if (satellite2) {
        satellite2.position.set(satellite2X, satellite2Y, satellite2Z);
      }

      renders();
      animate();
    });
  }

  /**
   * 星空背景
   **/
  function createStarField() {
    const positions = [];
    const colors = [];

    const geometry = new THREE.BufferGeometry();
    for (var i = 0; i < 10000; i++) {
      //   const theta = Math.acos(2 * Math.random() - 1); // 纬度角（-π/2 到 π/2）
      //   const phi = Math.random() * 2 * Math.PI; // 经度角（0 到 2π）
      //   // 使用球坐标系转换为笛卡尔坐标
      //   const x = radius * Math.sin(theta) * Math.cos(phi);
      //   const y = radius * Math.sin(theta) * Math.sin(phi);
      //   const z = radius * Math.cos(theta);
      //   // 创建一个 Vector3 对象并添加到点数组中
      //   positions.push(new THREE.Vector3(x, y, z));
      // 创建一个 BufferGeometry 对象
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      positions.push(vertex.x, vertex.y, vertex.z);
      var color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
      colors.push(color.r, color.g, color.b);
    }
    // geometry.setFromPoints(points);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    //     const vertexShader = `
    //   varying vec2 vUv;
    //   void main() {
    //     vUv = uv;
    //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //   }
    // `;

    //     const fragmentShader = `
    //   uniform sampler2D texture;
    //   varying vec2 vUv;
    //   void main() {
    //     vec4 color = texture2D(texture, vUv);
    //     // 修改颜色，例如乘以一个颜色值
    //     color *= vec4(1.0, 0.5, 0.5, 1.0); // 红色调减弱，绿色和蓝色增强
    //     gl_FragColor = color;
    //   }
    // `;

    // 创建一个纹理
    const texture = new THREE.TextureLoader().load("/src/assets/map/texture/circle.png");

    // const starsMaterial = new THREE.ShaderMaterial({
    //   uniforms: {
    //     texture: { value: texture },
    //   },
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader,
    // });

    var starsMaterial = new THREE.PointsMaterial({
      map: texture,
      size: 1,
      transparent: true,
      opacity: 1,
      vertexColors: true, //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    stars = new THREE.Points(geometry, starsMaterial);
    stars.scale.set(300, 300, 300);

    // // 创建一个点材质
    // const material = new THREE.PointsMaterial({
    //   color: 0x00ff00, // 点的颜色
    //   size: 0.1, // 点的大小
    // });

    // // 创建一个 BufferGeometry 对象
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // // 创建一个 Points 对象
    // const pointCloud = new THREE.Points(geometry, material);

    scene.add(stars);
  }

  /**
   * 地球
   **/
  function createEarth() {
    earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    const detail = 12;
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    const material = new THREE.MeshPhongMaterial({
      map: loader.load("/src/assets/map/texture/00_earthmap1k.jpg"),
      specularMap: loader.load("/src/assets/map/texture/02_earthspec1k.jpg"),
      bumpMap: loader.load("/src/assets/map/texture/01_earthbump1k.jpg"),
      bumpScale: 0.04,
    });
    // material.map.colorSpace = THREE.SRGBColorSpace;
    earthMesh = new THREE.Mesh(geometry, material);
    earthGroup.add(earthMesh);

    const lightsMat = new THREE.MeshBasicMaterial({
      map: loader.load("/src/assets/map/texture/03_earthlights1k.jpg"),
      blending: THREE.AdditiveBlending,
    });
    lightsMesh = new THREE.Mesh(geometry, lightsMat);
    earthGroup.add(lightsMesh);

    // 假设你已经加载了模型并知道模型的大小
    const boundingBox = new THREE.Box3().setFromObject(earthGroup); // 获取模型的包围盒

    const center = new THREE.Vector3();
    boundingBox.getCenter(center); // 获取模型的中心点
    const size = boundingBox.getSize(new THREE.Vector3()); // 获取模型的大小

    // 根据模型的大小设置相机的位置
    const distance = size.length() * 1.5; // 使用模型大小的1.5倍作为距离
    camera.value!.position.set(center.x, center.y, center.z + distance); // 相机位置放置在模型前方
    camera.value!.lookAt(center); // 让相机注视模型的中心

    // 加载地球的大气层
    const radius = 1; // 地球的半径
    // 加载大气层
    const atmosphereTexture = new THREE.TextureLoader().load("/src/assets/map/texture/atmosphere.png");
    const spriteMaterial = new THREE.SpriteMaterial({
      map: atmosphereTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(radius * 3, radius * 3, 1);
    earthGroup.add(sprite);

    // 加载卫星轨道
    const trackGroup = new THREE.Group();
    const trackTexture = new THREE.TextureLoader().load("/src/assets/map/texture/track.png");
    const trackGeometry = new THREE.PlaneGeometry(satelliteOrbitRadius * 2.1, satelliteOrbitRadius * 2.1); // 让轨道比卫星轨道稍大
    const trackMaterial = new THREE.MeshLambertMaterial({
      map: trackTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    // 调整轨道平面的朝向，使其与卫星的运动平面一致
    // 如果卫星在XY平面绕Z轴旋转，轨道可以保持默认或者旋转至XY平面
    trackMesh.rotation.x = Math.PI / 2; // 例如，如果轨道在XZ平面，卫星绕Y轴转
    trackGroup.add(trackMesh);

    // 两颗卫星 - 改为 Mesh 对象
    const satelliteTexture = new THREE.TextureLoader().load("/src/assets/map/texture/salPointer.png");
    // 如果 salPointer.png 是一个点状纹理，用于Sprite可能更合适，或者用简单的几何体
    const satelliteGeometry = new THREE.SphereGeometry(0.05, 8, 8); // 使用小球体代表卫星
    const satelliteMaterial = new THREE.MeshBasicMaterial({ map: satelliteTexture });

    satellite1 = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    satellite2 = new THREE.Mesh(satelliteGeometry, satelliteMaterial);

    trackGroup.add(satellite1);
    trackGroup.add(satellite2);

    // earthPoints 不再需要，因为我们用单独的 satellite1 和 satellite2 Mesh
    // earthPoints = new THREE.Points(satelliteGeometry, satelliteMaterial);
    // earthPoints.rotation.set(1.9, 0.5, 1);
    // trackGroup.add(earthPoints);

    trackGroup.rotation.set(1.9, 0.5, 1); // 轨道的旋转，根据需要调整
    scene.add(trackGroup);
  }

  /**
   * 初始化地图
   */
  //   function initMap() {
  //     fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${100000}_full.json`)
  //       .then((response) => response.json())
  //       .then((data) => {
  //         const map = new THREE.Group();
  //         // 遍历省份构建模型
  //         data.features.forEach((elem: any) => {
  //           // 新建一个省份容器：用来存放省份对应的模型和轮廓线
  //           const province = new THREE.Object3D();
  //           const coordinates = elem.geometry.coordinates;
  //           coordinates.forEach((multiPolygon: any) => {
  //             multiPolygon.forEach((polygon: any) => {
  //               const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf19553 }); //0x3BFA9E
  //               const positions = [];
  //               const linGeometry = new THREE.BufferGeometry();
  //               for (let i = 0; i < polygon.length; i++) {
  //                 var pos = projection(polygon[i]) as any;
  //                 positions.push(pos.x, pos.y, 0);
  //               }
  //               linGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  //               const line = new THREE.Line(linGeometry, lineMaterial);
  //               province.add(line);
  //             });
  //           });
  //           map.add(province);
  //         });
  //         scene.add(map);
  //       })
  //       .catch((error) => console.error("Error fetching JSON:", error));
  //   }
  const EARTH_RADIUS = 1; // 与您的地球模型半径一致

  // 函数：将经纬度转换为球体上的3D坐标
  function lonLatToVector3(lon: number, lat: number, radius: number = EARTH_RADIUS) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  async function loadAndDrawGeoJSON(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const geoJsonData = await response.json();

      const geoJsonGroup = new THREE.Group();

      // 遍历 GeoJSON 特征
      geoJsonData.features.forEach((feature: any) => {
        if (feature.geometry) {
          const type = feature.geometry.type;
          const coordinates = feature.geometry.coordinates;

          // 为每个省份创建线条材质
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff, // 青色线条
            transparent: true,
            opacity: 0.8,
            linewidth: 1
          });

          if (type === "Polygon") {
            coordinates.forEach((polygonCoords: any[]) => {
              const points3D: THREE.Vector3[] = [];
              polygonCoords.forEach((coord: number[]) => {
                points3D.push(lonLatToVector3(coord[0], coord[1], EARTH_RADIUS + 0.001)); // 略微抬高以避免z-fighting
              });

              if (points3D.length > 2) {
                // 创建线条
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points3D);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                geoJsonGroup.add(line);

                // 如果需要，添加省份标记点
                if (feature.properties && feature.properties.cp) {
                  const centroid3D = lonLatToVector3(
                    feature.properties.cp[0],
                    feature.properties.cp[1],
                    EARTH_RADIUS + 0.002
                  );
                  const markerGeo = new THREE.SphereGeometry(0.005, 8, 8);
                  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                  const marker = new THREE.Mesh(markerGeo, markerMaterial);
                  marker.position.copy(centroid3D);
                  geoJsonGroup.add(marker);
                }
              }
            });
          } else if (type === "MultiPolygon") {
            coordinates.forEach((multiPolygonCoords: any[][]) => {
              multiPolygonCoords.forEach((polygonCoords: any[]) => {
                const points3D: THREE.Vector3[] = [];
                polygonCoords.forEach((coord: number[]) => {
                  points3D.push(lonLatToVector3(coord[0], coord[1], EARTH_RADIUS + 0.001));
                });

                if (points3D.length > 2) {
                  // 创建线条
                  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points3D);
                  const line = new THREE.Line(lineGeometry, lineMaterial);
                  geoJsonGroup.add(line);
                }
              });
            });

            // 为 MultiPolygon 添加一个中心标记
            if (feature.properties && feature.properties.cp) {
              const centroid3D = lonLatToVector3(
                feature.properties.cp[0],
                feature.properties.cp[1],
                EARTH_RADIUS + 0.002
              );
              const markerGeo = new THREE.SphereGeometry(0.005, 8, 8);
              const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
              const marker = new THREE.Mesh(markerGeo, markerMaterial);
              marker.position.copy(centroid3D);
              geoJsonGroup.add(marker);
            }
          }
        }
      });

      // 将地图添加到地球组，这样就会跟随地球旋转
      earthGroup.add(geoJsonGroup);

    } catch (error) {
      console.error("Error loading or drawing GeoJSON:", error);
    }
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
