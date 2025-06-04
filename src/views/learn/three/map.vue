<script setup lang="ts">
  import { nextTick } from "vue";
  import * as THREE from "three";
  import * as d3 from "d3";
  import gsap from "gsap";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
  nextTick(() => {
    // 容器
    const container = document.querySelector(".container") as unknown as HTMLDivElement;
    // 场景
    const scene = new THREE.Scene();
    // 相机 fov 视野角度 aspect纵横比 near近裁剪面 far远裁剪面  PerspectiveCamera（透视相机）
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    // 渲染器
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setClearColor(0x000000, 1); // 黑色背景
    // 2d渲染器
    const css2Renderer = new CSS2DRenderer();
    css2Renderer.setSize(window.innerWidth, window.innerHeight);
    css2Renderer.domElement.style.position = "absolute";
    css2Renderer.domElement.style.top = "0px";
    css2Renderer.domElement.style.left = "0px";
    css2Renderer.domElement.style.pointerEvents = "none";

    container!.appendChild(css2Renderer.domElement);
    container!.appendChild(renderer.domElement);

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 80;
    controls.minDistance = 20;
    controls.target.set(0, 0, 5);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(80);

    // 渲染
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      css2Renderer.render(scene, camera);
      flowMaterial.uniforms.time.value += 0.03;

      controls.update();
    };
    // animate();

    // 高度
    const MAP_DEPTH = 10;
    // 转换坐标函数
    const projection = d3.geoMercator().center([104.779307, 29.33924]).translate([0, 0]);
    // 光线投射
    const raycaster = new THREE.Raycaster();
    // 材质加载器
    const textureLoader = new THREE.TextureLoader();
    // 区域网格列表
    const provinceMeshList = [] as any;
    // 标签列表
    const labelList = [];
    // map Group容器，能统一规划区域
    let map = null as unknown as any;
    // 顶部材质
    let topFaceMaterial = null as unknown as any;
    // 侧面材质
    let sideMaterial = null as unknown as any;
    // 鼠标事件
    let mouseEvent = null as unknown as any;

    getMapData(100000);

    // 请求JSON数据
    function getMapData(adcode: number) {
      fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
        .then((response) => response.json())
        .then((data) => {
          setTexture();
          setSunLight();
          operationData(data);
        })
        .catch((error) => console.error("Error fetching JSON:", error));
    }

    // 设置灯光
    function setSunLight() {
      //   平行光1
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
      directionalLight1.position.set(0, 57, 33);
      //   平行光2
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight2.position.set(-95, 28, -33);
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

      scene.add(directionalLight1);
      scene.add(directionalLight2);
      scene.add(ambientLight);
    }

    //设置材质
    function setTexture() {
      const scale = 0.2;
      const textureMap = textureLoader.load("/src/assets/map/texture/gz-map.jpg");
      const textureMapFx = textureLoader.load("/src/assets/map/texture/gz-map-fx.jpg");
      textureMap.wrapS = textureMapFx.wrapS = THREE.RepeatWrapping;
      textureMap.wrapT = textureMapFx.wrapT = THREE.RepeatWrapping;
      textureMap.flipY = textureMapFx.flipY = false;
      textureMap.rotation = textureMapFx.rotation = THREE.MathUtils.degToRad(45);
      textureMap.repeat.set(scale, scale);
      textureMapFx.repeat.set(scale, scale);
      topFaceMaterial = new THREE.MeshPhongMaterial({
        map: textureMap,
        color: 0xb3fffa,
        combine: THREE.MultiplyOperation,
        transparent: true,
        opacity: 0.8,
      });
      sideMaterial = new THREE.MeshLambertMaterial({
        color: 0x123024,
        transparent: true,
        opacity: 0.9,
      });
    }

    /**
     * 解析json数据，并绘制地图多边形
     * @param {*} jsondata 地图数据
     */
    function operationData(jsondata: any) {
      map = new THREE.Group();

      // geo信息
      const features = jsondata.features;
      features.forEach((feature: any) => {
        // 单个省份 对象
        const province = new THREE.Object3D() as any;
        // 地址
        province.properties = feature.properties.name;
        province.isHover = false;
        // 多个情况
        if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach((coordinate: any) => {
            coordinate.forEach((rows: any) => {
              const line = drawBoundary(rows);
              const mesh = drawExtrudeMesh(rows);
              province.add(line);
              province.add(mesh);
              provinceMeshList.push(mesh);
            });
          });
        }

        // 单个情况
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates.forEach((coordinate: any) => {
            const line = drawBoundary(coordinate);
            const mesh = drawExtrudeMesh(coordinate);
            province.add(line);
            province.add(mesh);
            provinceMeshList.push(mesh);
          });
        }
        const label = drawLabelText(feature);
        labelList.push({ name: feature.properties.name, label });
        label && province.add(label);
        map.add(province);
      });
      // map.position.set(0, 0, 0);
      map.scale.set(0.1, 0.1, 0.1);
      // map.rotation.set(THREE.MathUtils.degToRad(-90), 0, THREE.MathUtils.degToRad(20));
      scene.add(map);
      setMouseEvent();
    }

    /**
     * 画区域分界线
     * @param {*} polygon 区域坐标点数组
     * @returns 区域分界线
     */
    function drawBoundary(polygon: any) {
      const points = [];
      for (let i = 0; i < polygon.length; i++) {
        const [x, y] = projection(polygon[i]);
        points.push(new THREE.Vector3(x, -y, 0));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2,
        transparent: true,
        depthTest: false,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.translateZ(MAP_DEPTH + 0.001);
      return line;
    }

    /*
     * 边缘流光
     * */
    const flowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      float flow = fract(vUv.y + time); // 沿Y轴流动
      float alpha = smoothstep(0.4, 0.6, flow); // 控制流光带宽度
      gl_FragColor = vec4(color, alpha);
    }
  `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    /**
     * 绘制区域多边形
     * @param {*} polygon 区域坐标点数组
     * @returns 区域多边形
     */
    function drawExtrudeMesh(polygon: any) {
      const shape = new THREE.Shape();
      for (let i = 0; i < polygon.length; i++) {
        const [x, y] = projection(polygon[i]);
        if (i === 0) {
          shape.moveTo(x, -y);
        }
        shape.lineTo(x, -y);
      }
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: MAP_DEPTH,
        bevelEnabled: false,
        bevelSegments: 1,
        bevelThickness: 0.1,
      });
      return new THREE.Mesh(geometry, [topFaceMaterial, sideMaterial, flowMaterial]);
    }

    /**
     * 绘制2d省份标签
     * @param {*} province 省份
     * @returns 省份标签
     */
    function drawLabelText(province: any) {
      if (!province.properties.center) return;
      const [x, y] = projection(province.properties.center);
      const div = document.createElement("div");
      div.innerHTML = province.properties.name;
      div.style.padding = "4px 10px";
      div.style.color = "#fff";
      div.style.fontSize = "16px";
      div.style.position = "absolute";
      div.style.backgroundColor = "rgba(25,25,25,0.5)";
      div.style.borderRadius = "5px";
      const label = new CSS2DObject(div);
      div.style.pointerEvents = "none";
      label.position.set(x, y, MAP_DEPTH + 0.05);
      return label;
    }

    function setMouseEvent() {
      mouseEvent = handleEvent.bind(this);
      container.addEventListener("mousemove", mouseEvent);
    }

    // function removeMouseEvent() {
    //   container.removeEventListener("mousemove", mouseEvent);
    // }

    function handleEvent(e: MouseEvent) {
      if (map) {
        let mouse = new THREE.Vector2();
        let getBoundingClientRect = container.getBoundingClientRect();
        let x = ((e.clientX - getBoundingClientRect.left) / getBoundingClientRect.width) * 2 - 1;
        let y = -((e.clientY - getBoundingClientRect.top) / getBoundingClientRect.height) * 2 + 1;
        mouse.x = x;
        mouse.y = y;

        raycaster.setFromCamera(mouse, camera);

        let intersects = raycaster.intersectObjects(provinceMeshList, false);
        if (intersects.length) {
          let temp = intersects[0].object;
          animation(temp.parent);
        } else {
          animation();
        }
      }
    }

    function animation(province?: any) {
      if (province) {
        if (!province.isHover) {
          province.isHover = true;
          map.children.forEach((item: any) => {
            if (item.properties === province.properties) {
              gsap.to(province.position, {
                z: 2,
                duration: 0.6,
              });
            } else {
              resetAnimation(item);
            }
          });
        }
      } else {
        resetAllAnimation();
      }
    }

    function resetAnimation(province: any) {
      gsap.to(province.position, {
        z: 0,
        duration: 0.6,
        onComplete: () => {
          province.isHover = false;
        },
      });
    }

    function resetAllAnimation() {
      map.children.forEach((item: any) => {
        resetAnimation(item);
      });
    }

    // 设置地板
    const initFloor = () => {
      // 地板材质
      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        css2Renderer.setSize(window.innerWidth, window.innerHeight);
      });

      const floorGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

      const texture = new THREE.TextureLoader().load("/src/assets/images/pageBg1.jpg");
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);

      const floorMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      scene.add(floor);
    };
    initFloor();

    animate();

    // 初始化 Raycaster 和鼠标向量
    // const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null as unknown as any;

    // 监听点击事件
    window.addEventListener("click", (event) => {
      // 将鼠标坐标归一化到 -1 ~ +1
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 发射射线
      raycaster.setFromCamera(mouse, camera);

      // 检查交叉对象（你可以指定目标组）
      let intersects = raycaster.intersectObjects(provinceMeshList, false);
      if (intersects.length > 0) {
        const firstHit = intersects[0].object as any;

        // 查找顶级 Object3D
        const targetRoot = firstHit.parent; // 或使用递归向上找特定组

        // 取消前一个高亮
        if (selectedObject) {
          unhighlightObject3D(selectedObject);
        }

        // 应用高亮（例如用 emissive 增亮）
        highlightObject3D(targetRoot);

        selectedObject = targetRoot;
      }
    });
  });

  function findOutlineFromObject3D(object3D: any) {
    const outlines = [] as any;
    object3D.traverse((child: any) => {
      if (child.type === "Line" || child.type === "LineSegments") {
        outlines.push(child);
      }
    });
    return outlines;
  }

  const highlightObject3D = (obj3D: any, color = 0xffff00) => {
    const outlines = findOutlineFromObject3D(obj3D);
    outlines.forEach((line: any) => {
      line.material.color.set(color); // 修改描边颜色为红色
    });
  };

  function unhighlightObject3D(obj3D: any) {
    const outlines = findOutlineFromObject3D(obj3D);
    outlines.forEach((line: any) => {
      line.material.color.set(0xffffff); // 修改描边颜色为红色
    });
  }
</script>

<template>
  <div class="container"></div>
</template>

<style scoped></style>
