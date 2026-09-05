import { describe, it, expect } from "vitest";
import { isValidSandboxUrl } from "../route";

describe("visual-editor-proxy - isValidSandboxUrl", () => {
    it("should accept valid E2B .e2b.app URLs", () => {
        expect(isValidSandboxUrl("https://3000-iniby3xeeyne462kwcyi1.e2b.app")).toBe(true);
        expect(isValidSandboxUrl("https://3000-test-sandbox.e2b.app/dashboard")).toBe(true);
    });

    it("should accept valid E2B .e2b.dev URLs", () => {
        expect(isValidSandboxUrl("https://3000-iniby3xeeyne462kwcyi1.e2b.dev")).toBe(true);
        expect(isValidSandboxUrl("https://sub.e2b.dev")).toBe(true);
    });

    it("should accept localhost and 127.0.0.1 in non-production", () => {
        expect(isValidSandboxUrl("http://localhost:3000")).toBe(true);
        expect(isValidSandboxUrl("http://127.0.0.1:3000/preview")).toBe(true);
    });

    it("should reject unauthorized external domains", () => {
        expect(isValidSandboxUrl("https://evil.com")).toBe(false);
        expect(isValidSandboxUrl("https://e2b.app.evil.com")).toBe(false);
        expect(isValidSandboxUrl("https://google.com")).toBe(false);
        expect(isValidSandboxUrl("https://attacker-e2b.app.attacker.com")).toBe(false);
    });

    it("should reject non-http/https protocols", () => {
        expect(isValidSandboxUrl("javascript:alert(1)")).toBe(false);
        expect(isValidSandboxUrl("file:///etc/passwd")).toBe(false);
        expect(isValidSandboxUrl("ftp://3000-test.e2b.app")).toBe(false);
    });

    it("should reject malformed URLs", () => {
        expect(isValidSandboxUrl("not a url")).toBe(false);
        expect(isValidSandboxUrl("")).toBe(false);
    });
});
