<script lang="ts" setup>
const { mainItems, isActive } = useNavItems();
</script>

<template>
  <!-- Phones only; larger screens use AppSidebar. -->
  <div class="dock bg-base-300 z-30 md:hidden">
    <NuxtLink
      v-for="item in mainItems"
      :key="item.id"
      :to="item.href"
      :class="{ 'dock-active': isActive(item) }"
    >
      <Icon
        :name="item.icon"
        size="24"
        :class="item.iconColor"
      />
      <span class="dock-label truncate max-w-full">{{ item.label }}</span>
    </NuxtLink>
  </div>
</template>
