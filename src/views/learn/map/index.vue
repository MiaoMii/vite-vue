<template>
  <div id="c2d" class="c2d" style="width: 2000px; height: 1000px"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from "vue";
  import * as THREE from "three";
  import * as d3 from "d3";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
  const container = ref<HTMLDivElement | null>(null);
  // 以北京为中心 修改坐标
  const projection = d3.geoMercator().center([116.412318, 39.909843]).translate([0, 0]);
  nextTick(() => {
    const canvas = document.querySelector("#c2d");
    // 渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(2000, 1000);

    renderer.setClearColor(0x000000, 1); // 黑色背景

    let lineStreamerMaterial: any;

    // 高度
    const MAP_DEPTH = 2;
    // 标签列表
    const labelList = [];
    // 2d渲染器
    const css2Renderer = new CSS2DRenderer();
    css2Renderer.setSize(2000, 1000);
    css2Renderer.domElement.style.position = "absolute";
    css2Renderer.domElement.style.top = "0px";
    css2Renderer.domElement.style.left = "0px";
    css2Renderer.domElement.style.pointerEvents = "none";
    canvas!.appendChild(renderer.domElement);
    canvas!.appendChild(css2Renderer.domElement);

    const fov = 40; // 视野范围
    const aspect = 2; // 相机默认值 画布的宽高比
    const near = 0.1; // 近平面
    const far = 10000; // 远平面
    // 透视投影相机
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 300);
    camera.lookAt(0, 0, 0);
    // 控制相机
    const controls = new OrbitControls(camera, canvas);
    controls.update();

    // 场景
    const scene = new THREE.Scene();
    // 坐标轴 辅助
    // var axes = new THREE.AxesHelper(700);
    // scene.add(axes);

    {
      const color = 0xffffff;
      const intensity = 1;
      // 环境光
      const light = new THREE.AmbientLight(color, intensity);
      // 加入场景
      scene.add(light);
    }

    const loader = new THREE.FileLoader();
    loader.load("/src/assets/map/zhongguo.json", (data) => {
      const jsondata = JSON.parse(data);
      operationData(jsondata);
    });

    /**
     * 立体几何图形
     * @param polygon 多边形 点数组
     * @param color 材质颜色
     * */
    function drawExtrudeMesh(polygon, color) {
      const shape = new THREE.Shape();
      polygon.forEach((row, i) => {
        if (!row) return;
        const [x, y] = projection(row);
        if (i === 0) {
          shape.moveTo(x, -y);
        }
        shape.lineTo(x, -y);
      });

      // 拉伸
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 10,
        bevelEnabled: false,
      });
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
      });
      return new THREE.Mesh(geometry, material);
    }

    /**
     * 边框 图形绘制
     * @param polygon 多边形 点数组
     * @param color 材质颜色
     * */
    function lineDraw(polygon, color) {
      const lineGeometry = new THREE.BufferGeometry();
      const pointsArray = new Array();
      polygon.forEach((row) => {
        const [x, y] = projection(row);
        // 创建三维点
        pointsArray.push(new THREE.Vector3(x, -y, 9));
      });
      // 放入多个点
      lineGeometry.setFromPoints(pointsArray);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
      });
      return new THREE.Line(lineGeometry, lineMaterial);
    }

    const map = new THREE.Object3D();
    // 解析数据
    function operationData(jsondata) {
      // 全国信息
      const features = jsondata.features;

      features.forEach((feature) => {
        // 单个省份 对象
        const province = new THREE.Object3D();
        // 地址
        province.properties = feature.properties.name;
        const coordinates = feature.geometry.coordinates;
        const color = "yellow";
        // const color = ['重庆市', '上海市'].includes(feature.properties.name) ? 'blue' : 'yellow'

        if (feature.geometry.type === "MultiPolygon") {
          // 多个，多边形
          coordinates.forEach((coordinate) => {
            // coordinate 多边形数据
            coordinate.forEach((rows) => {
              const mesh = drawExtrudeMesh(rows, color);
              const line = lineDraw(rows, color);
              province.add(line);
              province.add(mesh);
            });
          });
        }

        if (feature.geometry.type === "Polygon") {
          // 多边形
          coordinates.forEach((coordinate) => {
            const mesh = drawExtrudeMesh(coordinate, color);
            const line = lineDraw(coordinate, color);
            province.add(line);
            province.add(mesh);
          });
        }

        const label = drawLabelText(feature);
        labelList.push({ name: feature.properties.name, label });
        label && province.add(label);
        map.add(province);
      });
      scene.add(map);

      mapEdge(jsondata);
    }

    // 地图边缘流光
    function mapEdge(jsondata) {
      // 创建 GeoJSON 边界
      const coordinates = jsondata.features[0].geometry.coordinates[0];
      const points = coordinates.map((coord) => new THREE.Vector3(coord[0], coord[1], 0));

      // 创建 LineGeometry
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // 创建 ShaderMaterial 实现流光效果
      const vertexShader = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

      const fragmentShader = `
  varying vec3 vPosition;
  uniform float time;
  void main() {
    float intensity = abs(sin(vPosition.x + vPosition.y + time * 5.0));
    gl_FragColor = vec4(intensity, intensity, 1.0, 1.0);
  }
`;

      lineStreamerMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0.0 },
        },
        side: THREE.DoubleSide,
        transparent: true,
      });

      // 创建线条
      const line = new THREE.Line(geometry, lineStreamerMaterial);
      scene.add(line);
    }

    /**
     * 两点链接飞线
     * */
    function lineConnect(posStart, posEnd) {
      // 根据目标坐标设置3D坐标  z轴位置在地图表面
      const [x0, y0, z0] = [...posStart, 10.01];
      const [x1, y1, z1] = [...posEnd, 10.01];

      // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x0, -y0, z0),
        new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
        new THREE.Vector3(x1, -y1, z1),
      );

      // 绘制 目标位置
      spotCircle([x0, y0, z0]);
      spotCircle([x1, y1, z1]);
      moveSpot(curve);

      const lineGeometry = new THREE.BufferGeometry();
      // 获取曲线 上的50个点
      var points = curve.getPoints(50);
      var positions = [];
      var colors = [];
      var color = new THREE.Color();

      // 给每个顶点设置演示 实现渐变
      for (var j = 0; j < points.length; j++) {
        color.setHSL(0.81666 + j, 0.88, 0.715 + j * 0.0025); // 粉色
        colors.push(color.r, color.g, color.b);
        positions.push(points[j].x, points[j].y, points[j].z);
      }
      // 放入顶点 和 设置顶点颜色
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3, true));
      lineGeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3, true));

      const material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
      const line = new THREE.Line(lineGeometry, material);

      return line;
    }

    // 圆环网格对象组
    const circleYs = [];
    /**
     * 目标位置
     * */
    function spotCircle(spot) {
      // 圆
      const geometry1 = new THREE.CircleGeometry(0.5, 200);
      const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(geometry1, material1);
      // 绘制地图时 y轴取反 这里同步
      circle.position.set(spot[0], -spot[1], spot[2] + 0.1);
      scene.add(circle);

      // 圆环
      const geometry2 = new THREE.RingGeometry(0.5, 0.7, 50);
      // transparent 设置 true 开启透明
      const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true });
      const circleY = new THREE.Mesh(geometry2, material2);
      // 绘制地图时 y轴取反 这里同步
      circleY.position.set(spot[0], -spot[1], spot[2] + 0.1);
      scene.add(circleY);

      circleYs.push(circleY);
    }

    // 移动物体网格对象组
    const moveSpots = [];
    /**
     * 线上移动物体
     * */
    function moveSpot(curve) {
      // 线上的移动物体
      const aGeo = new THREE.SphereGeometry(0.4, 0.4, 0.4);
      const aMater = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
      const aMesh = new THREE.Mesh(aGeo, aMater);
      // 保存曲线实例
      aMesh.curve = curve;
      aMesh._s = 0;

      moveSpots.push(aMesh);

      scene.add(aMesh);
    }

    const line = lineConnect(projection([106.557691, 29.559296]), projection([121.495721, 31.236797]));
    scene.add(line);
    const line2 = lineConnect(projection([106.557691, 29.559296]), projection([104.006215, 30.650055]));
    scene.add(line2);
    const line3 = lineConnect(projection([106.557691, 29.559296]), projection([116.396795, 39.93242]));
    scene.add(line3);
    const line4 = lineConnect(projection([106.557691, 29.559296]), projection([87.617099, 43.863737]));
    scene.add(line4);

    /**
     * 绘制2d省份标签
     * @param {*} province 省份
     * @returns 省份标签
     */
    function drawLabelText(province: any) {
      if (!province.properties.center) return;
      const { name, centroid, center } = province.properties;
      const [x, y] = projection(center);
      console.log(x, y, "x, yx, yx, y");

      const div = document.createElement("div");
      div.innerHTML = name;
      div.style.padding = "4px 10px";
      div.style.color = "#fff";
      div.style.fontSize = "16px";
      div.style.position = "absolute"; // Keep this for CSS2DRenderer to manage
      div.style.backgroundColor = "rgba(25,25,25,0.5)";
      div.style.borderRadius = "5px";
      // Add transform to center the div
      div.style.transform = "translate(-50%, -50%)";
      const label = new CSS2DObject(div);
      div.style.pointerEvents = "none";
      // Use -y for the y-coordinate to match geometry
      label.position.set(x, -y, 10.01);

      return label;
    }

    // 渲染
    function render() {
      circleYs.forEach(function (mesh) {
        //  目标 圆环放大 并 透明
        mesh._s += 0.01;
        mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s);
        if (mesh._s <= 2) {
          mesh.material.opacity = 2 - mesh._s;
        } else {
          mesh._s = 1;
        }
      });

      moveSpots.forEach(function (mesh) {
        mesh._s += 0.006;
        let tankPosition = new THREE.Vector3();
        tankPosition = mesh.curve.getPointAt(mesh._s % 1);
        mesh.position.set(tankPosition.x, tankPosition.y, tankPosition.z);
      });

      // 更新时间
      if (lineStreamerMaterial) {
        lineStreamerMaterial.uniforms.time.value += 0.05;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  });
</script>

<style scoped>
  .earth-container {
    width: 100%;
    height: 100vh;
    /* 使容器占满整个视口高度 */
    overflow: hidden;
  }
</style>
