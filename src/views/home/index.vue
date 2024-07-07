<script setup lang="ts"></script>

<template>
  <NSpace vertical :size="16">
    <NGrid :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14">
        <NCard :bordered="false" class="card-wrapper"> </NCard>
      </NGi>
      <NGi span="24 s:24 m:10">
        <NCard :bordered="false" class="card-wrapper"> </NCard>
      </NGi>
    </NGrid>
    <NGrid :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14"> </NGi>
      <NGi span="24 s:24 m:10"> </NGi>
    </NGrid>
  </NSpace>
</template>

<style scoped></style>
