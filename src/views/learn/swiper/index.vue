<template>
  <div class="swiper-wrapper">
    <swiper
      class="mySwiper"
      :loop="true"
      :modules="modules"
      :centeredSlides="true"
      :direction="'vertical'"
      :slidesPerView="3"
      :spaceBetween="10"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false,
      }"
    >
      <swiper-slide>Slide 1</swiper-slide>
      <swiper-slide>Slide 2</swiper-slide>
      <swiper-slide>Slide 3</swiper-slide>
      <swiper-slide>Slide 4</swiper-slide>
      <swiper-slide>Slide 5</swiper-slide>
      <swiper-slide>Slide 6</swiper-slide>
      <swiper-slide>Slide 7</swiper-slide>
      <swiper-slide>Slide 8</swiper-slide>
      <swiper-slide>Slide 9</swiper-slide>
    </swiper>
  </div>
</template>
<script lang="ts" setup>
  import { Swiper, SwiperSlide } from "swiper/vue";
  import { Navigation, Autoplay } from "swiper/modules";
  const modules = [Navigation, Autoplay];
</script>
<style scoped>
  .swiper-wrapper {
    height: 600px;
  }
  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #fff;

    /* Center slide text vertically */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
