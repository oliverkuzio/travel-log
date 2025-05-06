<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

async function signIn() {
  await authClient.signIn.social({
    provider: "github",
  });
}
</script>

<template>
  <button class="btn btn-accent" @click="signIn">
    Sign in with GitHub
    <Icon name="tabler:brand-github" />
  </button>
</template>
