import { describe, it, expect } from "vitest";
import { convertFilesToTreeItems } from "../utils";

describe("convertFilesToTreeItems", () => {
    it("returns an empty array when files is empty", () => {
        expect(convertFilesToTreeItems({})).toEqual([]);
    });

    it("converts flat files correctly", () => {
        const files = {
            "README.md": "# Readme",
            "package.json": "{}",
        };
        const result = convertFilesToTreeItems(files);
        expect(result).toEqual(["README.md", "package.json"]);
    });

    it("converts nested directory structures correctly", () => {
        const files = {
            "src/components/Button.tsx": "export const Button = () => null;",
            "src/index.ts": "export * from './components/Button';",
            "package.json": "{}",
        };
        const result = convertFilesToTreeItems(files);
        expect(result).toContain("package.json");
        // Nested array has folder name as first element
        const srcFolder = result.find((item) => Array.isArray(item) && item[0] === "src");
        expect(srcFolder).toBeDefined();
    });
});
