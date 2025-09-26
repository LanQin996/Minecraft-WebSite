<template>
  <div class="hero" :style="{ background: `linear-gradient(180deg, var(--hero-overlay-start) 0%, var(--hero-overlay-end) 100%), url('${hero.bg_url}')` }">
    <div class="hero-content">
      <h1 class="title">{{ hero.title }}</h1>
      <p class="subtitle">{{ hero.subtitle }}</p>
      <div class="cta">
        <a class="btn" href="#join">加入教程</a>
        <a class="btn ghost" href="#rules">服务器规则</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hero: { title: string; subtitle: string; bg_url: string } }>()
</script>

<style>
.hero .title {
  /* 移动端到桌面端自适应更大字号 */
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1.15;
  margin: 0 0 12px;
}

.hero .subtitle {
  font-size: clamp(14px, 2.2vw, 18px);
  line-height: 1.6;
  margin: 0 0 16px;
}
</style>


