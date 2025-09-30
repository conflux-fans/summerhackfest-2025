import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// Test that the module structure is correct
describe("Module Structure", () => {
  it("should have correct package.json structure", () => {
    const packageJsonPath = path.join(__dirname, "../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    expect(packageJson.name).toBe("@chainbrawler/react");
    expect(packageJson.version).toBe("0.1.0");
    expect(packageJson.main).toBe("dist/index.js");
    expect(packageJson.types).toBe("dist/index.d.ts");
    expect(packageJson.dependencies).toHaveProperty("@chainbrawler/core");
    expect(packageJson.dependencies).toHaveProperty("react");
    expect(packageJson.dependencies).toHaveProperty("react-dom");
  });

  it("should have correct TypeScript configuration", () => {
    const tsconfigPath = path.join(__dirname, "../../tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

    expect(tsconfig.extends).toBe("../../tsconfig.base.json");
    expect(tsconfig.compilerOptions.outDir).toBe("./dist");
    expect(tsconfig.compilerOptions.module).toBe("ESNext");
    expect(tsconfig.compilerOptions.moduleResolution).toBe("bundler");
  });

  it("should have correct source file structure", () => {
    const srcDir = path.join(__dirname, "../");

    // Check that main directories exist
    expect(fs.existsSync(path.join(srcDir, "index.ts"))).toBe(true);
    expect(fs.existsSync(path.join(srcDir, "hooks"))).toBe(true);
    expect(fs.existsSync(path.join(srcDir, "components"))).toBe(true);
    expect(fs.existsSync(path.join(srcDir, "providers"))).toBe(true);
    expect(fs.existsSync(path.join(srcDir, "adapters"))).toBe(true);
    expect(fs.existsSync(path.join(srcDir, "examples"))).toBe(true);
  });

  it("should have all required hook files", () => {
    const hooksDir = path.join(__dirname, "../hooks");

    expect(fs.existsSync(path.join(hooksDir, "useChainBrawler.ts"))).toBe(true);
    expect(fs.existsSync(path.join(hooksDir, "useUXState.ts"))).toBe(true);
    expect(fs.existsSync(path.join(hooksDir, "usePools.ts"))).toBe(true);
    expect(fs.existsSync(path.join(hooksDir, "useLeaderboard.ts"))).toBe(true);
    expect(fs.existsSync(path.join(hooksDir, "useClaims.ts"))).toBe(true);
  });

  it("should have all required component files", () => {
    const componentsDir = path.join(__dirname, "../components");

    expect(fs.existsSync(path.join(componentsDir, "CharacterDisplay.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, "PoolsDisplay.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, "LeaderboardDisplay.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, "ClaimsDisplay.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, "ErrorDisplay.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, "StatusDisplay.tsx"))).toBe(true);
  });

  it("should have provider files", () => {
    const providersDir = path.join(__dirname, "../providers");

    expect(fs.existsSync(path.join(providersDir, "ChainBrawlerProvider.tsx"))).toBe(true);
  });

  it("should have adapter files", () => {
    const adaptersDir = path.join(__dirname, "../adapters");

    expect(fs.existsSync(path.join(adaptersDir, "ReactAdapter.ts"))).toBe(true);
  });

  it("should have example files", () => {
    const examplesDir = path.join(__dirname, "../examples");

    expect(fs.existsSync(path.join(examplesDir, "App.tsx"))).toBe(true);
  });

  it("should have test configuration", () => {
    expect(fs.existsSync(path.join(__dirname, "../../vitest.config.ts"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../../src/test/setup.ts"))).toBe(true);
  });
});
