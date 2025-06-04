<script setup lang="ts">
  import { Graph } from "@antv/x6";
  import { nextTick } from "vue";

  nextTick(() => {
    // 初始化图
    const graph = new Graph({
      container: document.getElementById("container"),
      grid: true,
    });

    // 创建两个节点
    const source = graph.addNode({
      x: 100,
      y: 40,
      width: 80,
      height: 40,
      attrs: {
        body: {
          fill: "#f5f5f5",
          stroke: "#333",
        },
      },
    });

    const target = graph.addNode({
      x: 300,
      y: 200,
      width: 80,
      height: 40,
      attrs: {
        body: {
          fill: "#f5f5f5",
          stroke: "#333",
        },
      },
    });

    // 创建连接两个节点的边，并添加浮窗和按钮
    graph.addEdge({
      source,
      target,
      attrs: {
        line: {
          stroke: "#31d0c6",
          strokeWidth: 2,
        },
      },
      router: {
        name: "manhattan",
      },
      zIndex: 1,
      addon: [
        {
          type: "floating-node",
          position: 0.5,
          attrs: {
            body: {
              fill: "#fff",
              stroke: "#31d0c6",
            },
            label: {
              text: "浮窗内容",
              fill: "#333",
            },
          },
          markup: [
            {
              tagName: "rect",
              selector: "body",
            },
            {
              tagName: "text",
              selector: "label",
            },
            {
              tagName: "button",
              selector: "button",
              attrs: {
                fill: "white",
                stroke: "none",
              },
              text: "按钮",
              event: "click", // 绑定点击事件
            },
          ],
        },
      ],
    });

    // 按钮点击事件处理
    graph.on("node:click", (args) => {
      const cell = args.cell;
      if (cell instanceof Edge) {
        const button = cell.findOne("button", (ele) => ele.getParent() === cell);
        if (button) {
          // 在这里编写按钮点击后的逻辑
          console.log("Button clicked!");
        }
      }
    });
  });
</script>

<template>
  <div id="container" style="width: 600px; height: 400px"></div>
</template>

<style scoped></style>
