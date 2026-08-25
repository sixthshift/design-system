import { watch } from "node:fs";
import { $ } from "bun";

const themeFiles = ["src/theme/theme.json", "src/theme/palette.json", "src/theme/typography.json"];

console.log("Watching theme files for changes...");

for (const file of themeFiles) {
  watch(file, async (event) => {
    if (event === "change") {
      console.log(`\n${file} changed, rebuilding theme...`);
      await $`bun run build:theme`;
      console.log("Done.\n");
    }
  });
}

// Keep the process running
await Bun.sleep(Number.MAX_SAFE_INTEGER);
