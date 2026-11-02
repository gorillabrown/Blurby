import { describe, expect, it } from "vitest";

// CPU-7 fixes the normalized input contract; A1 remains red until A2 adds the module.
const modulePath = "../../scripts/narrate-rebuild/lib/cpuprofile.mjs";

const d2Configs = {
  "schemaVersion": "narrate.cpu-profile.configs.v1",
  "rates": [1, 2],
  "types": ["play", "resume", "click", "speed"],
  "configurations": [
    {
      "id": "t4-1",
      "threads": 4,
      "runtimeThreads": 4,
      "d6class": "mainstream",
      "medianAppCpuPct": 52,
      "counting": [
        [20, 20, 20, 20],
        [20, 20, 20, 20]
      ],
      "worstMs": [
        [1800, 1800, 1800, 1800],
        [1800, 1800, 1800, 1800]
      ]
    },
    {
      "id": "t3",
      "threads": 3,
      "runtimeThreads": 3,
      "d6class": "mainstream",
      "medianAppCpuPct": 40,
      "counting": [
        [20, 20, 20, 20],
        [20, 20, 20, 20]
      ],
      "worstMs": [
        [1950, 1950, 1950, 1950],
        [1950, 1950, 1950, 1950]
      ]
    },
    {
      "id": "t2",
      "threads": 2,
      "runtimeThreads": 2,
      "d6class": "mainstream",
      "medianAppCpuPct": 30,
      "counting": [
        [20, 20, 20, 20],
        [20, 20, 20, 20]
      ],
      "worstMs": [
        [2600, 2600, 2600, 2600],
        [2600, 2600, 2600, 2600]
      ]
    },
    {
      "id": "t1",
      "threads": 1,
      "runtimeThreads": 1,
      "d6class": "mainstream",
      "medianAppCpuPct": 18,
      "counting": [
        [20, 20, 20, 20],
        [20, 20, 20, 20]
      ],
      "worstMs": [
        [3400, 3400, 3400, 3400],
        [3400, 3400, 3400, 3400]
      ]
    },
    {
      "id": "t4-2",
      "threads": 4,
      "runtimeThreads": 4,
      "d6class": "mainstream",
      "medianAppCpuPct": 54,
      "counting": [
        [20, 20, 20, 20],
        [20, 20, 20, 20]
      ],
      "worstMs": [
        [1900, 1900, 1900, 1900],
        [1900, 1900, 1900, 1900]
      ]
    }
  ]
};

describe("narrate CPU profile", () => {
  it("(d1) breaks down one completed request", async () => {
    const modulePromise = import(modulePath);
    await expect(modulePromise).resolves.toBeDefined();
    const { requestBreakdown } = await modulePromise;
    const events = [
      {
        "kind": "narrate-request",
        "t": 1000,
        "cause": "click"
      },
      {
        "kind": "narrate-schedule",
        "t": 6000,
        "requestedT": 1000,
        "genMs": 600,
        "chunkStart": 100,
        "chunkEnd": 106,
        "busyAtAssign": {
          "pool": 1
        },
        "hops": {
          "stages": {
            "queued": 5000,
            "posted": 5040,
            "received": 5700
          }
        }
      },
      {
        "kind": "narrate-first-voiced",
        "t": 6001,
        "requestT": 1000,
        "cause": "click"
      }
    ];

    expect(requestBreakdown(events)).toEqual({
      cause: "click",
      waitMs: 40,
      genMs: 600,
      words: 6,
      genMsPerWord: 100,
      otherBusy: true,
    });
  });

  it("(d2) adapts to three threads when admissible with a CPU gain", async () => {
    const modulePromise = import(modulePath);
    await expect(modulePromise).resolves.toBeDefined();
    const { profileDecision } = await modulePromise;

    expect(profileDecision(structuredClone(d2Configs))).toEqual({
      verdict: "adapt",
      threads: 3,
    });
  });

  it("(d3) keeps four threads when the CPU gain is insufficient", async () => {
    const modulePromise = import(modulePath);
    await expect(modulePromise).resolves.toBeDefined();
    const { profileDecision } = await modulePromise;
    const configs = structuredClone(d2Configs);
    configs.configurations[1].medianAppCpuPct = 46;

    expect(profileDecision(configs)).toEqual({ verdict: "keep", threads: 4 });
  });

  it("(d4) reports noisy for a baseline cell spread above 500 ms", async () => {
    const modulePromise = import(modulePath);
    await expect(modulePromise).resolves.toBeDefined();
    const { profileDecision } = await modulePromise;
    const configs = structuredClone(d2Configs);
    configs.configurations[4].worstMs[1][2] = 2400;

    expect(profileDecision(configs)).toEqual({ verdict: "noisy" });
  });
});
