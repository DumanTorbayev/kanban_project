import path from "node:path";

const quote = (file) => JSON.stringify(file);
const relativeTo = (cwd, files) =>
  files.map((file) => quote(path.relative(cwd, file))).join(" ");
const absoluteList = (files) => files.map(quote).join(" ");

export default {
  "apps/web/**/*.{ts,tsx,js,jsx,mjs,cjs}": (files) => [
    `pnpm --dir apps/web exec eslint --fix ${relativeTo("apps/web", files)}`,
    `pnpm exec prettier --write ${absoluteList(files)}`,
  ],
  "packages/ui/**/*.{ts,tsx,js,jsx,mjs,cjs}": (files) => [
    `pnpm --dir packages/ui exec eslint --fix ${relativeTo("packages/ui", files)}`,
    `pnpm exec prettier --write ${absoluteList(files)}`,
  ],
  "*.{js,mjs,cjs}": (files) =>
    `pnpm exec prettier --write ${absoluteList(files)}`,
  "packages/eslint-config/**/*.{js,mjs,cjs}": (files) =>
    `pnpm exec prettier --write ${absoluteList(files)}`,
  "**/*.{json,md,yml,yaml}": (files) =>
    `pnpm exec prettier --write ${absoluteList(files)}`,
  "**/*.css": (files) => [
    `pnpm exec stylelint --fix ${absoluteList(files)}`,
    `pnpm exec prettier --write ${absoluteList(files)}`,
  ],
};
