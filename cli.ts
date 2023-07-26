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

    if (directory) {
        await Deno.mkdir(directory!, { recursive: true });
    }

    if (!directory) {
      directory = Deno.execPath();
    } else if (directory.startsWith(".")) {
        directory = await Deno.realPath(directory);
    }

    console.log(directory);

    const freshInit = await new Deno.Command("deno", {
        args: ["run", "-A", "-r", "https://fresh.deno.dev", ".", "--twind", "--vscode"],
        cwd: directory,
    });
    
    const output = await freshInit.output();

    console.log(output);
    console.log(new TextDecoder().decode(output.stdout));
    console.log(new TextDecoder().decode(output.stderr));
    
    await Deno.mkdir(join(directory, "scripts"), { recursive: true });
    await Deno.mkdir(join(directory, "tests"), { recursive: true });

    await ensureDockerfile(directory, name);
    
    await ensureNPMBuild(directory, name);
    
    await ensureVSCodeLaunch(directory);
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

async function ensureDockerfile(directory: string, name: string): Promise<void> {
    const filePath = join(directory, "./Dockerfile");

    if (!(await exists(filePath))) {
        await Deno.writeTextFileSync(
            filePath,
            defaultDockerfile(name),
        );
    }
}

function defaultDockerfile(name: string) {
return `FROM denoland/deno:1.33.2

ARG VERSION
ENV DENO_DEPLOYMENT_ID=${"${VERSION}"}

WORKDIR /app

COPY . .
RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "-A", "main.ts"]`;
}
  
async function ensureNPMBuild(directory: string, name: string): Promise<void> {
    const filePath = join(directory, "./scripts/npm.build.ts");

    if (!(await exists(filePath))) {
        await Deno.writeTextFileSync(
            filePath,
            defaultNPMBuild(name),
        );
    }
}

function defaultNPMBuild(name: string) {
return `import { build, emptyDir } from "$dnt";

await emptyDir("./build");

await build({
entryPoints: ["mod.ts"],
outDir: "./build",
shims: {
    deno: true,
},
package: {
    name: "${name}",
    version: Deno.args[0],
    description: "ES6 based module project.",
    license: "MIT"
},
postBuild() {
    Deno.copyFileSync("LICENSE", "build/LICENSE");
    Deno.copyFileSync("README.md", "build/README.md");
},
});
`;
}
  
async function ensureVSCodeLaunch(directory: string): Promise<void> {
    const filePath = join(directory, "./.vscode/launch.json");

    if (!(await exists(filePath))) {
        await Deno.writeTextFileSync(
            filePath,
            JSON.stringify(defaultVSCodeLaunch(), null, 2),
        );
    }
}

function defaultVSCodeLaunch() {
    return {
        "version": "0.2.0",
        "configurations": [
            {
                "request": "launch",
                "name": "Launch Program",
                "type": "node",
                "program": "${workspaceFolder}/tests/tests.ts",
                "cwd": "${workspaceFolder}",
                "runtimeExecutable": "C:\\ProgramData\\chocolatey\\lib\\deno\\deno.EXE",
                "runtimeArgs": [
                    "test",
                    "--config",
                    "./deno.json",
                    "--inspect-wait",
                    "--allow-all",
                ],
                "attachSimplePort": 9229,
            },
        ],
    };
}
  