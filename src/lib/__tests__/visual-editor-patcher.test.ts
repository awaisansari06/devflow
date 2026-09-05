import { describe, it, expect } from "vitest";
import {
    rgbToHex,
    hexToTailwindClass,
    stripTailwindPrefix,
    applyStyleToClassName,
    generatePatches,
    applyPatches,
    type VisualEdit,
} from "../visual-editor-patcher";

describe("visual-editor-patcher", () => {
    describe("rgbToHex", () => {
        it("converts rgb strings to hex correctly", () => {
            expect(rgbToHex("rgb(59, 130, 246)")).toBe("#3b82f6");
            expect(rgbToHex("rgb(255, 255, 255)")).toBe("#ffffff");
            expect(rgbToHex("rgb(0, 0, 0)")).toBe("#000000");
        });

        it("leaves non-rgb strings as-is", () => {
            expect(rgbToHex("#3b82f6")).toBe("#3b82f6");
        });
    });

    describe("stripTailwindPrefix", () => {
        it("removes classes matching prefix", () => {
            const input = "p-4 text-red-500 font-bold text-lg";
            expect(stripTailwindPrefix(input, "text")).toBe("p-4 font-bold");
        });

        it("handles arbitrary values", () => {
            const input = "bg-[#ff0000] text-white p-2";
            expect(stripTailwindPrefix(input, "bg")).toBe("text-white p-2");
        });
    });

    describe("applyStyleToClassName", () => {
        it("replaces color property with Tailwind class", () => {
            const result = applyStyleToClassName("text-blue-500 font-bold", "color", "rgb(239, 68, 68)");
            expect(result).toContain("text-[#ef4444]");
            expect(result).not.toContain("text-blue-500");
        });

        it("applies opacity properly", () => {
            const result = applyStyleToClassName("opacity-100 font-bold", "opacity", "0.5");
            expect(result).toBe("font-bold opacity-50");
        });
    });

    describe("generatePatches & applyPatches", () => {
        it("generates and applies text replacement patches", () => {
            const files = {
                "app/page.tsx": "export default function Page() { return <h1>Welcome</h1>; }",
            };

            const edits: VisualEdit[] = [
                {
                    type: "text",
                    oldText: "Welcome",
                    newText: "Hello DevFlow",
                },
            ];

            const patches = generatePatches(files, edits);
            expect(patches).toHaveLength(1);
            expect(patches[0].filePath).toBe("app/page.tsx");

            const updated = applyPatches(files, patches);
            expect(updated["app/page.tsx"]).toContain("Hello DevFlow");
            expect(updated["app/page.tsx"]).not.toContain("Welcome");
        });

        it("handles multiline JSX text replacement", () => {
            const files = {
                "app/page.tsx": `
                    <h1>
                        The Lord of the Rings
                    </h1>
                `,
            };
            const edits: VisualEdit[] = [
                {
                    type: "text",
                    oldText: "The Lord of the Rings",
                    newText: "Aasiya Naaz Shaikh",
                },
            ];
            const patches = generatePatches(files, edits);
            expect(patches).toHaveLength(1);
            const updated = applyPatches(files, patches);
            expect(updated["app/page.tsx"]).toContain("Aasiya Naaz Shaikh");
            expect(updated["app/page.tsx"]).not.toContain("The Lord of the Rings");
        });

        it("handles HTML entity encoded text replacement", () => {
            const files = {
                "app/page.tsx": "<p>Tolkien&apos;s The Hobbit</p>",
            };
            const edits: VisualEdit[] = [
                {
                    type: "text",
                    oldText: "Tolkien's The Hobbit",
                    newText: "New Fantasy Story",
                },
            ];
            const patches = generatePatches(files, edits);
            expect(patches).toHaveLength(1);
            const updated = applyPatches(files, patches);
            expect(updated["app/page.tsx"]).toContain("New Fantasy Story");
        });

        it("ignores empty text edits", () => {
            const files = {
                "app/page.tsx": "<h1>Hello</h1>",
            };
            const edits: VisualEdit[] = [
                {
                    type: "text",
                    oldText: "   ",
                    newText: "Something",
                },
            ];
            const patches = generatePatches(files, edits);
            expect(patches).toHaveLength(0);
        });
    });
});
