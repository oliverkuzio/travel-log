export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  // Route middleware runs before the layout has loaded the session on a fresh page load.
  if (!authStore.user) {
    await authStore.init();
  }

  if (!authStore.isAdmin) {
    return navigateTo("/dashboard");
  }
});
