import type { RouteRecordRaw } from "vue-router";
const fileRouter: RouteRecordRaw[] = [];
import _ from "lodash";
// 使用 import.meta.glob 动态导入 views 目录下的所有 Vue 组件文件
const viewFiles = import.meta.glob("../views/**/*.vue");
// 遍历导入的文件,生成路由配置
Object.keys(viewFiles).forEach((path: any) => {
  const routePath = _.dropRight(path.replace("../views", "").split("/")).join("/");
  const route = {
    path: `/${routePath}`,
    component: () => import(path),
  };
  fileRouter.push(route);
});

export default fileRouter;
