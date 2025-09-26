<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Minimal critical reset */
html, body, #__nuxt { height: 100%; }
body { margin: 0; }
* { box-sizing: border-box; }
</style>
