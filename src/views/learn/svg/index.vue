<template>
  <div ref="drawingArea" class="drawing-area" @click="handleClick">
    <svg id="svg-container" width="500" height="500">
      <line
        v-for="(lin, l) in lineList"
        :key="l"
        :x1="lin.x"
        :y1="lin.y"
        :x2="lin.x1"
        :y2="lin.y1"
        stroke="black"
        stroke-width="2"
      >
        <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="5s" repeatCount="indefinite" />
      </line>
    </svg>
    <!--    <svg width="400" height="300">-->
    <!--      <defs>-->
    <!--        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">-->
    <!--          <stop offset="0%" stop-color="#4CAF50" />-->
    <!--          <stop offset="100%" stop-color="#2196F3" />-->
    <!--        </linearGradient>-->
    <!--      </defs>-->

    <!--      <polyline points="50,250 100,100 150,200 200,150 250,250 300,50 350,200"-->
    <!--                fill="none"-->
    <!--                stroke="url(#gradient)"-->
    <!--                stroke-width="3"-->
    <!--                stroke-linecap="round"-->
    <!--                stroke-linejoin="round"-->
    <!--                stroke-dasharray="5,5" />-->

    <!--      <text x="50" y="275" font-size="14">Sales Data</text>-->
    <!--    </svg>-->

    <!--    <svg width="500" height="300">-->
    <!--      &lt;!&ndash; 二次贝塞尔曲线 &ndash;&gt;-->
    <!--      <path d="M 100 200 Q 200 50 400 200"-->
    <!--            fill="none"-->
    <!--            stroke="blue"-->
    <!--            stroke-width="2" />-->

    <!--      &lt;!&ndash; 三次贝塞尔曲线 &ndash;&gt;-->
    <!--      <path d="M 100 100 C 150 25 350 175 400 100"-->
    <!--            fill="none"-->
    <!--            stroke="red"-->
    <!--            stroke-width="2" />-->
    <!--    </svg>-->
  </div>
  <button @click="save" style="position: absolute; left: 0; top: 20px">保存</button>

  <!--  <svg width="500" height="300">-->
  <!--    <polyline id="line"-->
  <!--              points="50,250 100,100 150,200 200,150 250,250 300,50 350,200 400,100 450,250"-->
  <!--              fill="none"-->
  <!--              stroke-width="4"-->
  <!--              stroke-linecap="round"-->
  <!--              stroke-linejoin="round" />-->

  <!--    <defs>-->
  <!--      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">-->
  <!--        <stop offset="0%" stop-color="#4CAF50" />-->
  <!--        <stop offset="50%" stop-color="#2196F3" />-->
  <!--        <stop offset="100%" stop-color="#4CAF50" />-->
  <!--      </linearGradient>-->
  <!--    </defs>-->

  <!--    <polyline id="line"-->
  <!--              points="50,250 100,100 150,200 200,150 250,250 300,50 350,200 400,100 450,250"-->
  <!--              fill="none"-->
  <!--              stroke="url(#gradient)"-->
  <!--              stroke-width="4"-->
  <!--              stroke-linecap="round"-->
  <!--              stroke-linejoin="round" />-->

  <!--    <defs>-->
  <!--      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">-->
  <!--        <stop offset="0%" stop-color="#4CAF50" />-->
  <!--        <stop offset="50%" stop-color="#2196F3" />-->
  <!--        <stop offset="100%" stop-color="#4CAF50" />-->
  <!--        <animateTransform-->
  <!--            attributeName="gradientTransform"-->
  <!--            type="translate"-->
  <!--            from="-100%,0"-->
  <!--            to="100%,0"-->
  <!--            dur="5s"-->
  <!--            repeatCount="indefinite" />-->
  <!--      </linearGradient>-->
  <!--    </defs>-->

  <!--    <polyline id="line"-->
  <!--              points="50,250 100,100 150,200 200,150 250,250 300,50 350,200 400,100 450,250"-->
  <!--              fill="none"-->
  <!--              stroke="url(#gradient)"-->
  <!--              stroke-width="4"-->
  <!--              stroke-linecap="round"-->
  <!--              stroke-linejoin="round" />-->
  <!--  </svg>-->

  <!--  <svg width="500" height="300">-->
  <!--    <defs>-->
  <!--      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">-->
  <!--        <stop offset="0%" stop-color="#4CAF50" />-->
  <!--        <stop offset="50%" stop-color="#2196F3" />-->
  <!--        <stop offset="100%" stop-color="#4CAF50" />-->
  <!--      </linearGradient>-->
  <!--    </defs>-->

  <!--    <polyline id="line"-->
  <!--              points="50,250 100,100 150,200 200,150 250,250 300,50 350,200 400,100 450,250"-->
  <!--              fill="none"-->
  <!--              stroke="url(#gradient)"-->
  <!--              stroke-width="4"-->
  <!--              stroke-linecap="round"-->
  <!--              stroke-linejoin="round">-->
  <!--      <animate attributeName="stroke-dasharray"-->
  <!--               from="0,1000"-->
  <!--               to="1000,0"-->
  <!--               dur="5s"-->
  <!--               repeatCount="indefinite" />-->
  <!--    </polyline>-->
  <!--  </svg>-->

  <svg width="800" height="800">
    <rect width="200" height="200" fill="#000" stroke="#7FFF00" stroke-width="2" fill-opacity="0.5"></rect>

    <br />
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <path id="path1" d="M75,20 a1,1 0 0,0 100,0" />
    </defs>
    <text x="10" y="100" style="fill: red">
      <textPath xlink:href="#path1">I love SVG I love SVG</textPath>
    </text>
  </svg>

  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10">
      <animate attributeName="rx" values="0;5;0" dur="10s" repeatCount="indefinite" />
    </rect>
  </svg>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from "vue";

  const drawingArea = ref<HTMLElement | null>(null);
  // const startPos = ref({ x: 0, y: 0 });
  // const endPos = ref({ x: 0, y: 0 });
  const showLine = ref(false);

  const lineArr = ref<any[]>([]);

  const lineList = computed(() => {
    const result = [] as any;
    const temp = JSON.parse(JSON.stringify(lineArr.value));
    if (!(temp.length && temp.length % 2 == 0)) {
      temp.pop();
    }

    if (temp.length) {
      for (let i = 0; i < temp.length; i += 2) {
        result.push({ x: temp[i].x, y: temp[i].y, x1: temp[i + 1].x, y1: temp[i + 1].y });
      }
    }

    return result;
  });
  const handleClick = (event: MouseEvent) => {
    const position = {
      x: event.clientX - drawingArea.value!.offsetLeft,
      y: event.clientY - drawingArea.value!.offsetTop,
    };
    if (!showLine.value) {
      lineArr.value.push(position);
    } else {
      lineArr.value.push(position);
    }
    showLine.value = !showLine.value;
    console.log(lineArr, "lineArr");
  };

  nextTick(() => {
    sessionStorage.getItem("lineArr") && (lineArr.value = JSON.parse(sessionStorage.getItem("lineArr") as string));
  });
  const save = () => {
    console.log("进入了");
    sessionStorage.setItem("lineArr", JSON.stringify(lineArr.value));
  };
</script>

<style scoped>
  .drawing-area {
    width: 500px;
    height: 500px;
    border: 1px solid #ccc;
  }
</style>
