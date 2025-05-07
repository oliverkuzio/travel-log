<script setup lang="ts">
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink to="/" class="btn btn-ghost text-xltext-primary-content">
        <span class="font-bold">Travel Log</span>
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <AppThemeToggle />
      <AuthButton />
    </div>
  </div>
</template>
