import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";

import { USER_CACHES } from "~/lib/pwa-caches";

const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          input: false,
        },
      },
    }),
  ],
});

export const useAuthStore = defineStore("useAuthStore", () => {
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(null);

  async function init() {
    // better-auth requests a relative URL on the server but an absolute one in the browser, so
    // useFetch's generated keys differ and hydration would start without the server's session.
    // A fixed key reuses it, so the client renders the same (e.g. admin-only) items as the server.
    const data = await authClient.useSession(((url: string, options: object) =>
      useFetch(url, { ...options, key: "auth-session" })) as typeof useFetch);
    session.value = data;
  }

  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);
  const isAdmin = computed(() => user.value?.role === "admin");

  async function signIn() {
    const { csrf } = useCsrf();
    const headers = new Headers();
    headers.append("csrf-token", csrf);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      fetchOptions: {
        headers,
      },
    });
  }

  async function signOut() {
    const { csrf } = useCsrf();
    const headers = new Headers();
    headers.append("csrf-token", csrf);
    await authClient.signOut({
      fetchOptions: {
        headers,
      },
    });
    // Saved pages, data and photos are private, so don't leave them behind for the next person.
    if ("caches" in window) {
      await Promise.all(USER_CACHES.map(name => caches.delete(name)));
    }
    navigateTo("/");
  }

  return {
    init,
    isAdmin,
    loading,
    signIn,
    signOut,
    user,
  };
});
