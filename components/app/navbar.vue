<script lang="ts" setup>
const { $pwa } = useNuxtApp();
const route = useRoute();
// The homepage shows the map behind the navbar.
const overMap = computed(() => route.path === "/");
</script>

<template>
  <div
    class="navbar base-content relative z-10"
    :class="overMap ? 'bg-base-100/90' : 'bg-base-300'"
  >
    <div class="navbar-start">
      <NuxtLink to="/" class="btn btn-ghost text-xl base-content">
        <img
          src="/logo-sm.png"
          alt=""
          class="size-8"
        >
        <span class="font-semibold">Travel Log</span>
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <ClientOnly>
        <AppSyncStatus />
        <button
          v-if="$pwa?.showInstallPrompt"
          class="btn btn-ghost btn-sm"
          @click="$pwa.install()"
        >
          <Icon name="tabler:download" size="20" />
          Install
        </button>
      </ClientOnly>
      <AppThemeToggle />
      <AuthButton />
    </div>
  </div>
</template>
