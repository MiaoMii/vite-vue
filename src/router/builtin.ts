import fileRouter from "./createRouterByFile";
export const ROOT_ROUTE: any = {
  name: "root",
  path: "/",
  redirect: "/learn/svg",
  meta: {
    title: "root",
    constant: true,
  },
};

export function createBuiltinVueRoutes() {
  console.log([ROOT_ROUTE, ...fileRouter]);
  return [ROOT_ROUTE, ...fileRouter];
}
