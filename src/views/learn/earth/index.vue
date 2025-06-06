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
  const radius = 100; // 地球半径
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
      //   createStarField();
      createEarth();
      createAreaPoint();
      createLightCone();
      createFlyLine();
      // loadAndDrawGeoJSON(`https://geo.datav.aliyun.com/areas_v3/bound/${100000}_full.json`);
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

      //   stars.rotation.y += 0.0002;
      //   earthMesh.rotation.y += 0.002;
      //   lightsMesh.rotation.y += 0.002;

      //   // 更新卫星的位置，使其绕轨道旋转
      //   satelliteAngle += 0.01; // 控制旋转速度

      //   // 更新卫星1的位置
      //   const satellite1X = Math.cos(satelliteAngle) * satelliteOrbitRadius;
      //   const satellite1Y = 0; // 假设轨道在XY平面，Y为0，可以根据需要调整
      //   const satellite1Z = Math.sin(satelliteAngle) * satelliteOrbitRadius;
      //   if (satellite1) {
      //     satellite1.position.set(satellite1X, satellite1Y, satellite1Z);
      //     // 让卫星朝向轨道中心（地球）
      //     // satellite1.lookAt(earthMesh.position);
      //     // 或者，如果想让它沿着轨道切线方向，需要更复杂的计算或使用辅助对象
      //   }

      //   // 更新卫星2的位置，使其在轨道的另一侧
      //   const satellite2X = Math.cos(satelliteAngle + Math.PI) * satelliteOrbitRadius;
      //   const satellite2Y = 0; // 假设轨道在XY平面
      //   const satellite2Z = Math.sin(satelliteAngle + Math.PI) * satelliteOrbitRadius;
      //   if (satellite2) {
      //     satellite2.position.set(satellite2X, satellite2Y, satellite2Z);
      //   }

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
  var areas = [
    {
      name: "中国",
      position: [116.2, 39.55],
    },
    {
      name: "中非共和国",
      position: [18.35, 4.23],
    },
    {
      name: "智利",
      position: [-70.4, -33.24],
    },
    {
      name: "乍得",
      position: [14.59, 12.1],
    },
    {
      name: "赞比亚",
      position: [28.16, -15.28],
    },
    {
      name: "越南",
      position: [105.55, 21.05],
    },
    {
      name: "约旦",
      position: [35.52, 31.57],
    },
    {
      name: "英属维尔京群岛",
      position: [-64.37, 18.27],
    },
    {
      name: "英国",
      position: [-0.05, 51.36],
    },
  ];

  // 坐标转换，
  function createPosition(lnglat) {
    let spherical = new THREE.Spherical();
    spherical.radius = radius;
    const lng = lnglat[0];
    const lat = lnglat[1];
    const theta = (lng + 90) * (Math.PI / 180);
    const phi = (90 - lat) * (Math.PI / 180);
    spherical.phi = phi; // phi是方位面（水平面）内的角度，范围0~360度
    spherical.theta = theta; // theta是俯仰面（竖直面）内的角度，范围0~180度
    let position = new THREE.Vector3();
    position.setFromSpherical(spherical);
    return position;
  }

  function createAreaPoint() {
    // 球面
    let sphereGeom = new THREE.SphereGeometry(1, 20, 20),
      sphereMat = new THREE.MeshBasicMaterial({
        color: 0x03d98e,
        wireframe: true,
      });
    let sphere = new THREE.Mesh(sphereGeom, sphereMat);
    scene.add(sphere);
    // 地标及光锥
    for (let i = 0, length = areas.length; i < length; i++) {
      const position = createPosition(areas[i].position);
      createHexagon(position); // 地标
    }
  }

  // 创建地标标记
  function createHexagon(position) {
    var hexagon = new THREE.Object3D();
    let hexagonLine = new THREE.CircleGeometry(4, 6);
    let hexagonPlane = new THREE.CircleGeometry(3, 6);
    // let vertices = hexagonLine.vertices;
    // vertices.shift(); // 第一个节点是中心点
    let material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
      opacity: 0.5,
    });
    let circleLine = new THREE.LineLoop(hexagonLine, material);
    let circlePlane = new THREE.Mesh(hexagonPlane, material);
    circleLine.position.copy(position);
    circlePlane.position.copy(position);
    circlePlane.lookAt(new THREE.Vector3(0, 0, 0));
    circleLine.lookAt(new THREE.Vector3(0, 0, 0));

    hexagon.add(circleLine);
    hexagon.add(circlePlane);
    scene.add(hexagon);
  }

  /**
   * 地球
   **/
  function createEarth() {
    const geometry = new THREE.SphereGeometry(radius, 32, 32); // 半径为50，水平和垂直分段各32
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/src/assets/map/texture/00_earthmap1k.jpg"); // 确保路径正确，可以使用如NASA提供的地球纹理
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
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
            linewidth: 1,
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
                    EARTH_RADIUS + 0.002,
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
                EARTH_RADIUS + 0.002,
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

  // 创建光柱
  function createLightCone() {
    const beamMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vWorldPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vWorldPosition;
        void main() {
            float intensity = pow(0.7 - dot(normalize(vWorldPosition), vec3(0.0, 1.0, 0.0)), 12.0);
            gl_FragColor = vec4(color, intensity);
        }
    `,
      uniforms: { color: { value: new THREE.Color(0xff0000) } },
      side: THREE.BackSide, // 使光柱只在地球背面显示
    });

    const beamGeometry = new THREE.PlaneGeometry(10, 100); // 根据需要调整大小和长度
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.rotation.x = -Math.PI / 2; // 使光柱水平放置
    scene.add(beam);
  }

  // 创建飞线
  function createFlyLine() {
    const points = [];
    points.push(new THREE.Vector3(-5, 0, 0)); // 开始点，相对于地球中心的位置
    points.push(new THREE.Vector3(5, 0, 0)); // 结束点，相对于地球中心的位置
    const beamLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const beamLineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // 绿色激光线
    const beamLine = new THREE.Line(beamLineGeometry, beamLineMaterial);
    scene.add(beamLine);
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
