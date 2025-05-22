<script lang="ts" setup>
</script>

<template>
  <div class="navbar bg-base-200 base-content">
    <div class="navbar-start">
      <NuxtLink to="/" class="btn btn-ghost text-xl base-content">
        <span class="font-semibold">Travel Log</span>
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <AppThemeToggle />
      <AuthButton />
    </div>
  </div>
</template>
