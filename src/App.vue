<script setup lang="ts">
  import { NConfigProvider, darkTheme } from "naive-ui";
  import AppProvider from "./components/common/app-provider.vue";
  defineOptions({
    name: "App",
  });
</script>

<template>
  <NConfigProvider :theme="darkTheme" class="h-full w-full">
    <AppProvider>
      <RouterView class="bg-layout" />
    </AppProvider>
  </NConfigProvider>
</template>

<style scoped></style>
