import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { join } from "https://deno.land/std@0.195.0/path/mod.ts";

await new Command()
  .name("create-deno-module-project")
  .version("0.0.0")
  .description("Command line framework for Deno")
  .arguments("<name:string>")
  .option("-d, --directory <dir:string>", "Set the directory to run in.")
  .action(async (options, ...args) => {
    const [name] = args;

    let { directory } = options;

    if (!directory) {
      directory = Deno.execPath();
    }

    const freshInit = await new Deno.Command("deno", {
        args: ["run", "-A", "-r", "https://fresh.deno.dev"]
    });
    
    await freshInit.output();
    
    await Deno.mkdir(directory, { recursive: true });
    await Deno.mkdir(join(directory, ".vscode"), { recursive: true });
    await Deno.mkdir(join(directory, "scripts"), { recursive: true });
    await Deno.mkdir(join(directory, "src"), { recursive: true });
    await Deno.mkdir(join(directory, "tests"), { recursive: true });

    // await ensureDenoJson(directory);
  })
  .parse(Deno.args);

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);

    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}

// async function ensureDenoJson(directory: string): Promise<void> {
//   const filePath = join(directory, "./deno.json");

//   if (!(await exists(filePath))) {
//     await Deno.writeTextFileSync(
//       filePath,
//       JSON.stringify(defaultDenoJson(), null, 2),
//     );
//   }
// }

// function defaultDenoJson() {
//   return {
//     "tasks": {
//       "build": "deno task build:fmt && deno task build:lint && deno task test",
//       "build:fmt": "deno fmt",
//       "build:lint": "deno lint",
//       "deploy": "deno task build && ftm git",
//       "npm:build": "deno run -A scripts/npm.build.ts",
//       "npm:publish": "npm publish ./build --access public",
//       "test": "deno test -A ./tests/tests.ts --coverage=cov",
//     },
//     "imports": {
//       "$dnt": "https://deno.land/x/dnt/mod.ts",
//       "$std/": "https://deno.land/std@0.195.0/",
//     },
//     "compilerOptions": {
//       "jsx": "react-jsx",
//       "jsxImportSource": "preact",
//     },
//     "lock": false,
//     "fmt": {
//       "files": {
//         "include": [],
//         "exclude": [],
//       },
//       "options": {},
//     },
//     "lint": {
//       "files": {
//         "include": [],
//         "exclude": [],
//       },
//       "rules": {
//         "include": [],
//         "exclude": [],
//       },
//     },
//   };
// }
