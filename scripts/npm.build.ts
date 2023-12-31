import { build, emptyDir } from "$dnt";

await emptyDir("./build");

await build({
  entryPoints: ["./cli.ts"],
  outDir: "./build",
  shims: {
    deno: true,
  },
  package: {
    name: "@fathym/create-deno-fresh-project",
    version: Deno.args[0],
    description: "ES6 based module project.",
    license: "MIT",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "build/LICENSE");
    Deno.copyFileSync("README.md", "build/README.md");
  },
});
