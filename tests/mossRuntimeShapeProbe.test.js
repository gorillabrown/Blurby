import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const mossRuntimeShapeProbeUrl = new URL("../scripts/moss_runtime_shape_probe.mjs", import.meta.url);

async function importRuntimeShapeProbe() {
  const module = await import(`${mossRuntimeShapeProbeUrl.href}?case=${Date.now()}-${Math.random()}`);
  expect(module.runMossRuntimeShapeProbe).toEqual(expect.any(Function));
  expect(module.parseArgs).toEqual(expect.any(Function));
  return module;
}

async function makeTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-moss-runtime-shape-"));
}

function configPathFor(projectRoot) {
  return path.join(projectRoot, ".runtime", "moss", "config.json");
}

function wslProjectPath(projectRoot) {
  const normalized = path.resolve(projectRoot).replace(/\\/g, "/");
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (!driveMatch) return normalized;
  return path.posix.join("/mnt", driveMatch[1].toLowerCase(), driveMatch[2]);
}

function wslHost2BinaryPath(projectRoot) {
  return path.posix.join(wslProjectPath(projectRoot), ".runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts");
}

async function writeConfig(projectRoot, config) {
  const configPath = configPathFor(projectRoot);
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return configPath;
}

async function writeBinary(projectRoot) {
  const binaryPath = path.join(projectRoot, ".runtime", "moss", "llama.cpp", "build-vs-x64", "bin", "Release", "llama-moss-tts.exe");
  await fs.mkdir(path.dirname(binaryPath), { recursive: true });
  await fs.writeFile(binaryPath, "", "utf8");
  return binaryPath;
}

async function writeArm64LlvmPreset(projectRoot) {
  const presetPath = path.join(projectRoot, ".runtime", "moss", "llama.cpp", "CMakePresets.json");
  await fs.mkdir(path.dirname(presetPath), { recursive: true });
  await fs.writeFile(
    presetPath,
    JSON.stringify({
      version: 6,
      configurePresets: [
        {
          name: "arm64-windows-llvm-release",
          generator: "Ninja",
        },
      ],
    }, null, 2),
    "utf8",
  );
  return presetPath;
}

async function writeArm64LlvmBinary(projectRoot) {
  const binaryPath = path.join(projectRoot, ".runtime", "moss", "llama.cpp", "build-arm64-windows-llvm-release", "bin", "Release", "llama-moss-tts.exe");
  await fs.mkdir(path.dirname(binaryPath), { recursive: true });
  await fs.writeFile(binaryPath, "", "utf8");
  return binaryPath;
}

function execStub(handlers = {}) {
  return vi.fn(async (command, args) => {
    const key = [command, ...(args ?? [])].join(" ");
    for (const [pattern, result] of Object.entries(handlers)) {
      if (key.includes(pattern)) {
        if (result instanceof Error) throw result;
        if (typeof result === "function") return result(command, args);
        return result;
      }
    }
    const error = new Error(`Unexpected command: ${key}`);
    error.code = "ENOENT";
    throw error;
  });
}

describe("MOSS runtime shape probe", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it("parses --attempt-build", async () => {
    const { parseArgs } = await importRuntimeShapeProbe();

    expect(parseArgs(["--attempt-build", "--json"])).toMatchObject({
      attemptBuild: true,
      json: true,
    });
  });

  it("does not run cmake or ninja without --attempt-build", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const execFile = execStub({
      "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
      "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      "cmake --version": { stdout: "cmake version 3.29.0\n", stderr: "" },
      "ninja --version": { stdout: "1.12.0\n", stderr: "" },
    });

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-no-build-guard",
      execFile,
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(execFile).not.toHaveBeenCalledWith(
      "cmake",
      expect.arrayContaining(["--preset", "arm64-windows-llvm-release"]),
      expect.any(Object),
    );
    expect(execFile).not.toHaveBeenCalledWith(
      "cmake",
      expect.arrayContaining(["--build"]),
      expect.any(Object),
    );
    expect(execFile).not.toHaveBeenCalledWith("ninja", expect.any(Array), expect.any(Object));
    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "blocked",
      blocker: "binary-missing",
      wouldRun: true,
      buildCommand: {
        command: "cmake",
        args: ["--build", "--preset", "arm64-windows-llvm-release"],
      },
    });
  });

  it("classifies missing cmake as blocked when --attempt-build is set", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const missingCmake = new Error("spawn cmake ENOENT");
    missingCmake.code = "ENOENT";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-cmake-missing",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
        "cmake --version": missingCmake,
      }),
      hostArch: "arm64",
      attemptBuild: true,
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "blocked",
      blocker: "cmake-unavailable",
      wouldRun: true,
    });
    expect(result.status).not.toBe("failed");
  });

  it("classifies missing clang as blocked for the arm64 LLVM preset", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const missingClang = new Error("spawn clang ENOENT");
    missingClang.code = "ENOENT";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-arm64-llvm-clang-missing",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": missingClang,
      }),
      hostArch: "arm64",
      attemptBuild: true,
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "blocked",
      blocker: "clang-unavailable",
      wouldRun: true,
      buildCommand: {
        command: "cmake",
        args: ["--build", "--preset", "arm64-windows-llvm-release"],
      },
    });
    expect(result.status).not.toBe("failed");
  });

  it("classifies missing ninja as blocked when --attempt-build is set", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const missingNinja = new Error("spawn ninja ENOENT");
    missingNinja.code = "ENOENT";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-ninja-missing",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
        "cmake --version": { stdout: "cmake version 3.29.0\n", stderr: "" },
        "ninja --version": missingNinja,
      }),
      hostArch: "arm64",
      attemptBuild: true,
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "blocked",
      blocker: "ninja-unavailable",
      wouldRun: true,
    });
    expect(result.status).not.toBe("failed");
  });

  it("classifies failed guarded builds as build-failed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const buildFailure = new Error("cmake build failed");
    buildFailure.code = 1;
    buildFailure.stdout = "compiling\n";
    buildFailure.stderr = "link failed\n";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-build-failed",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
        "cmake --version": { stdout: "cmake version 3.29.0\n", stderr: "" },
        "ninja --version": { stdout: "1.12.0\n", stderr: "" },
        "cmake --preset arm64-windows-llvm-release": { stdout: "configured\n", stderr: "" },
        "cmake --build --preset arm64-windows-llvm-release": buildFailure,
      }),
      hostArch: "arm64",
      attemptBuild: true,
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "failed",
      blocker: "build-failed",
      buildCommand: {
        command: "cmake",
        args: ["--build", "--preset", "arm64-windows-llvm-release"],
      },
      stderrTail: "link failed\n",
    });
    expect(result.status).toBe("failed");
  });

  it("reports guarded arm64 LLVM builds as available when the binary appears", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    await writeArm64LlvmPreset(projectRoot);
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const execFile = execStub({
      "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
      "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      "cmake --version": { stdout: "cmake version 3.29.0\n", stderr: "" },
      "ninja --version": { stdout: "1.12.0\n", stderr: "" },
      "cmake --preset arm64-windows-llvm-release": { stdout: "configured\n", stderr: "" },
      "cmake --build --preset arm64-windows-llvm-release": async () => {
        await writeArm64LlvmBinary(projectRoot);
        return { stdout: "built\n", stderr: "" };
      },
    });

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-build-ok",
      execFile,
      hostArch: "arm64",
      attemptBuild: true,
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "available",
      binaryPath: path.join(projectRoot, ".runtime", "moss", "llama.cpp", "build-arm64-windows-llvm-release", "bin", "Release", "llama-moss-tts.exe"),
    });
    expect(execFile).toHaveBeenCalledWith(
      "cmake",
      ["--preset", "arm64-windows-llvm-release"],
      expect.any(Object),
    );
    expect(execFile).toHaveBeenCalledWith(
      "cmake",
      ["--build", "--preset", "arm64-windows-llvm-release"],
      expect.any(Object),
    );
  });

  it("records missing WSL2 as blocked, not failed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const missingWsl = new Error("spawn wsl.exe ENOENT");
    missingWsl.code = "ENOENT";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-wsl-missing",
      execFile: execStub({
        "wsl.exe --status": missingWsl,
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.wsl2Linux).toMatchObject({
      status: "blocked",
      blocker: "wsl2-unavailable",
    });
  });

  it("recognizes NUL-padded WSL2 status output as available", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-wsl-nul-padded",
      execFile: execStub({
        "wsl.exe --status": { stdout: "D\u0000e\u0000f\u0000a\u0000u\u0000l\u0000t\u0000 \u0000V\u0000e\u0000r\u0000s\u0000i\u0000o\u0000n\u0000:\u0000 \u00002\u0000\n", stderr: "" },
        "wsl.exe -d Ubuntu-24.04 -u root -- bash -lc": { stdout: "WSL_OK\naarch64\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.wsl2Linux).toMatchObject({
      status: "available",
    });
  });

  it("requires the Ubuntu distro shell gate before marking WSL2 Linux available", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const gateFailure = new Error("Ubuntu gate failed");
    gateFailure.code = 1;
    gateFailure.stdout = "WSL_OK\n";
    gateFailure.stderr = "missing host2 binary\n";
    const execFile = execStub({
      "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
      "wsl.exe -d Ubuntu-24.04 -u root -- bash -lc": gateFailure,
      "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
    });

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-wsl-gate-required",
      execFile,
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(execFile).toHaveBeenCalledWith(
      "wsl.exe",
      expect.arrayContaining(["-d", "Ubuntu-24.04", "-u", "root", "--", "bash", "-lc"]),
      expect.any(Object),
    );
    expect(result.shapes.wsl2Linux).toMatchObject({
      status: "blocked",
      blocker: "wsl2-linux-runtime-unavailable",
    });
  });

  it("classifies WSL2 Linux as available when Ubuntu gate finds the host2 aarch64 binary", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const execFile = execStub({
      "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
      "wsl.exe -d Ubuntu-24.04 -u root -- bash -lc": { stdout: "WSL_OK\naarch64\n", stderr: "" },
      "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
    });

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-wsl-gate-available",
      execFile,
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(execFile).toHaveBeenCalledWith(
      "wsl.exe",
      [
        "-d",
        "Ubuntu-24.04",
        "-u",
        "root",
        "--",
        "bash",
        "-lc",
        `echo WSL_OK && test -x ${wslHost2BinaryPath(projectRoot)} && uname -m`,
      ],
      expect.any(Object),
    );
    expect(result.shapes.wsl2Linux).toMatchObject({
      status: "available",
      binaryPath: wslHost2BinaryPath(projectRoot),
      machine: "aarch64",
    });
  });

  it("records missing native ARM64 clang as blocked, not failed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const missingClang = new Error("spawn clang ENOENT");
    missingClang.code = "ENOENT";

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-clang-missing",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": missingClang,
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.nativeArm64Clang).toMatchObject({
      status: "blocked",
      blocker: "clang-unavailable",
    });
  });

  it("reports the configured x64 Windows binary as available", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const binaryPath = await writeBinary(projectRoot);
    await writeConfig(projectRoot, { llamaCppBinary: binaryPath });
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-x64",
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.x64Windows).toMatchObject({
      status: "available",
      binaryPath,
    });
  });

  it("runs configured shape commands and marks passing commands as passed", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const binaryPath = await writeBinary(projectRoot);
    await writeConfig(projectRoot, {
      llamaCppBinary: binaryPath,
      runtimeShapeCommands: {
        x64Windows: { command: "moss-shape-smoke.cmd", args: ["--no-download"] },
      },
    });
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();
    const execFile = execStub({
      "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
      "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      "moss-shape-smoke.cmd --no-download": { stdout: "ok\n", stderr: "" },
    });

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-command",
      execFile,
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.shapes.x64Windows).toMatchObject({
      status: "passed",
      command: "moss-shape-smoke.cmd",
    });
  });

  it("does not leak Hugging Face tokens or secret values into artifacts", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    const binaryPath = await writeBinary(projectRoot);
    await writeConfig(projectRoot, {
      llamaCppBinary: binaryPath,
      hfToken: "hf_abcdefghijklmnopqrstuvwxyz123456",
      secretAccessKey: "super-secret-value",
      runtimeShapeCommands: {
        x64Windows: {
          command: "moss-shape-smoke.cmd",
          args: ["--token", "hf_abcdefghijklmnopqrstuvwxyz123456"],
        },
      },
    });
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-redaction",
      outputDir: path.join(projectRoot, "artifacts", "moss", "shape-redaction"),
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
        "moss-shape-smoke.cmd --token hf_abcdefghijklmnopqrstuvwxyz123456": {
          stdout: "token hf_abcdefghijklmnopqrstuvwxyz123456 was ignored\n",
          stderr: "secret super-secret-value\n",
        },
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    const summaryJson = await fs.readFile(result.summaryJsonPath, "utf8");
    const summaryText = await fs.readFile(result.summaryPath, "utf8");
    expect(summaryJson).not.toContain("hf_abcdefghijklmnopqrstuvwxyz123456");
    expect(summaryJson).not.toContain("super-secret-value");
    expect(summaryText).not.toContain("hf_abcdefghijklmnopqrstuvwxyz123456");
    expect(summaryText).not.toContain("super-secret-value");
    expect(summaryJson).toContain("[REDACTED]");
  });

  it("writes JSON and text summaries under --out", async () => {
    const projectRoot = await makeTempProject();
    tempDirs.push(projectRoot);
    await writeConfig(projectRoot, {});
    const outputDir = path.join(projectRoot, "artifacts", "moss", "shape-out");
    const { runMossRuntimeShapeProbe } = await importRuntimeShapeProbe();

    const result = await runMossRuntimeShapeProbe({
      projectRoot,
      runId: "shape-out",
      outputDir,
      execFile: execStub({
        "wsl.exe --status": { stdout: "Default Version: 2\n", stderr: "" },
        "clang --version": { stdout: "clang version 18.0.0\nTarget: aarch64-pc-windows-msvc\n", stderr: "" },
      }),
      hostArch: "arm64",
      now: () => new Date("2026-04-26T12:00:00.000Z"),
    });

    expect(result.summaryJsonPath).toBe(path.join(outputDir, "summary.json"));
    expect(result.summaryPath).toBe(path.join(outputDir, "summary.txt"));
    expect(JSON.parse(await fs.readFile(result.summaryJsonPath, "utf8"))).toMatchObject({
      runId: "shape-out",
      shapes: expect.any(Object),
    });
    expect(await fs.readFile(result.summaryPath, "utf8")).toContain("MOSS Runtime Shape Probe");
  });
});
