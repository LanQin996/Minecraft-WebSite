<template>
  <div>
    <section id="join" class="section">
      <h2>如何加入</h2>
      <ol>
        <li>在客户端添加服务器地址：play.example.com</li>
        <li>选择版本 1.20.x 并进入服务器</li>
        <li>阅读规则后开始你的旅程</li>
      </ol>
    </section>
    <section id="rules" class="section">
      <h2>服务器规则</h2>
      <ul>
        <li>禁止作弊与破坏他人物品</li>
        <li>友善交流，文明用语</li>
        <li>尊重他人创作与领地</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
.hero {
  min-height: 100svh; /* 全屏高度，支持移动端地址栏动态 */
  background: linear-gradient(180deg, var(--hero-overlay-start) 0%, var(--hero-overlay-end) 100%), url('/minecraft-hero.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 桌面端轻微视差 */
  background-blend-mode: multiply;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg);
}
.hero::after { /* 叠加一层顶部到下方的柔和渐变，提升可读性 */
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.00) 30%, rgba(0,0,0,0.25) 100%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; text-align: center; max-width: 920px; padding: 72px 24px 48px; }
.title { font-size: clamp(32px, 6vw, 64px); letter-spacing: 0.2px; margin: 0 0 10px; }
.subtitle { font-size: clamp(14px, 2.2vw, 20px); opacity: 0.92; margin: 0 0 24px; line-height: 1.6; }
.cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn { padding: 12px 16px; border-radius: 8px; background: linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb); color: #0b1219; font-weight: 700; text-decoration: none; }
.btn.ghost { background: transparent; color: var(--fg); border: 1px solid color-mix(in oklab, var(--fg) 35%, transparent); }
.section { max-width: 960px; margin: 40px auto; padding: 0 16px; color: var(--fg); }
.section h2 { margin: 0 0 12px; }
.section ol, .section ul { margin: 0; padding-left: 18px; }

/* 移动端优化：关闭 fixed 附着，避免抖动；增加顶部内边距避免与 56px 顶栏重叠感 */
@media (max-width: 1024px) {
  .hero { background-attachment: scroll; }
  .hero-content { padding-top: 88px; padding-bottom: 32px; }
}
</style>

