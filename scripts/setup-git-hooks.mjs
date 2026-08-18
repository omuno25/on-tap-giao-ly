import simpleGitHooks from "simple-git-hooks";

const isDeployment =
  process.env.NODE_ENV === "production" ||
  process.env.CI === "true" ||
  process.env.VERCEL === "1";

if (isDeployment) {
  console.log("[git-hooks] Bỏ qua cài đặt hook trong CI/production.");
} else {
  await simpleGitHooks.setHooksFromConfig(process.cwd(), process.argv);
}
