import darkStyle from "~/public/styles/dark.json";
import lightStyle from "~/public/styles/light.json";

const STYLES: Record<string, typeof darkStyle | typeof lightStyle> = {
  dark: darkStyle,
  light: lightStyle,
};

const PLACEHOLDER = "get_your_own_OpIi9ZULNHzrESv6T2vL";

export default defineEventHandler((event) => {
  const theme = getRouterParam(event, "theme") ?? "light";
  const style = STYLES[theme] ?? STYLES.light;

  const { env } = event.context.cloudflare;
  const key = env.MAPTILER_API_KEY;

  const styleWithKey = JSON.parse(
    JSON.stringify(style).replaceAll(PLACEHOLDER, key),
  );

  setHeader(event, "Cache-Control", "public, max-age=3600");
  return styleWithKey;
});
