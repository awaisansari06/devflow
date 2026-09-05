/**
 * Visual Editor Patcher
 *
 * Converts visual edits (CSS property changes, text changes, className changes)
 * into source-code patches that can be applied to the stored fragment files.
 */

export interface VisualPatch {
    filePath: string;
    oldContent: string;
    newContent: string;
}

export interface StyleEdit {
    type: "style";
    /** CSS property in camelCase, e.g. "backgroundColor" */
    property: string;
    /** New CSS value, e.g. "rgb(59, 130, 246)" */
    value: string;
    /** Original className string from the element */
    originalClassName: string;
}

export interface TextEdit {
    type: "text";
    oldText: string;
    newText: string;
}

export interface ClassNameEdit {
    type: "className";
    oldClassName: string;
    newClassName: string;
}

export type VisualEdit = StyleEdit | TextEdit | ClassNameEdit;

/**
 * Map of CSS property names (camelCase) to their Tailwind prefix.
 */
const CSS_TO_TAILWIND_PREFIX: Record<string, string> = {
    color: "text",
    backgroundColor: "bg",
    fontSize: "text",
    fontWeight: "font",
    padding: "p",
    paddingTop: "pt",
    paddingBottom: "pb",
    paddingLeft: "pl",
    paddingRight: "pr",
    margin: "m",
    marginTop: "mt",
    marginBottom: "mb",
    marginLeft: "ml",
    marginRight: "mr",
    borderRadius: "rounded",
    borderColor: "border",
    opacity: "opacity",
};

/**
 * Convert a hex color to the closest Tailwind color class.
 * Falls back to arbitrary value syntax: `bg-[#ff0000]`
 */
export function hexToTailwindClass(prefix: string, hex: string): string {
    // Use Tailwind arbitrary value syntax for exact colors
    return `${prefix}-[${hex}]`;
}

/**
 * Convert an RGB string like "rgb(59, 130, 246)" to hex "#3b82f6"
 */
export function rgbToHex(rgb: string): string {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb; // Already hex or invalid
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
}

/**
 * Strip existing Tailwind classes with a given prefix from a className string.
 * e.g. stripTailwindPrefix("text-red-500 font-bold p-4", "text") => "font-bold p-4"
 */
export function stripTailwindPrefix(className: string, prefix: string): string {
    const classes = className.split(/\s+/).filter(Boolean);
    const filtered = classes.filter((cls) => {
        // Match prefix- followed by anything, including multi-segment names and arbitrary values
        const regex = new RegExp(`^${prefix}-(\\[[^\\]]+\\]|[a-zA-Z0-9/._-]+)$`);
        return !regex.test(cls);
    });
    return filtered.join(" ");
}

/**
 * Apply a single style edit to a className string.
 * Returns the modified className.
 */
export function applyStyleToClassName(
    className: string,
    property: string,
    value: string
): string {
    const prefix = CSS_TO_TAILWIND_PREFIX[property];
    if (!prefix) return className; // Unsupported property

    // For color properties, convert to Tailwind arbitrary value
    if (["color", "backgroundColor", "borderColor"].includes(property)) {
        const hex = rgbToHex(value);
        const newClass = hexToTailwindClass(prefix, hex);
        const stripped = stripTailwindPrefix(className, prefix);
        return `${stripped} ${newClass}`.trim();
    }

    // For opacity
    if (property === "opacity") {
        const pct = Math.round(parseFloat(value) * 100);
        const stripped = stripTailwindPrefix(className, prefix);
        return `${stripped} opacity-${pct}`.trim();
    }

    // For other properties, use arbitrary value
    const stripped = stripTailwindPrefix(className, prefix);
    return `${stripped} ${prefix}-[${value}]`.trim();
}

/**
 * Given the files record, find which file contains the target className string,
 * and generate patches.
 */
export function generatePatches(
    files: Record<string, string>,
    edits: VisualEdit[]
): VisualPatch[] {
    const patches: VisualPatch[] = [];

    // Prioritize component/page files where JSX is likely located
    const fileEntries = Object.entries(files).sort(([pathA], [pathB]) => {
        const isCompA = pathA.includes("page.") || pathA.includes("components/");
        const isCompB = pathB.includes("page.") || pathB.includes("components/");
        if (isCompA && !isCompB) return -1;
        if (!isCompA && isCompB) return 1;
        return 0;
    });

    for (const edit of edits) {
        if (edit.type === "text") {
            const trimmedOld = edit.oldText.trim();
            if (!trimmedOld) continue;

            let matched = false;

            // 1. Direct or trimmed match
            for (const [filePath, content] of fileEntries) {
                if (content.includes(edit.oldText)) {
                    patches.push({
                        filePath,
                        oldContent: edit.oldText,
                        newContent: edit.newText,
                    });
                    matched = true;
                    break;
                } else if (content.includes(trimmedOld)) {
                    patches.push({
                        filePath,
                        oldContent: trimmedOld,
                        newContent: edit.newText.trim(),
                    });
                    matched = true;
                    break;
                }
            }

            // 2. HTML entity variations (e.g. &apos;, &#39;, &amp;)
            if (!matched) {
                const entityVariations = [
                    trimmedOld.replace(/'/g, "&apos;"),
                    trimmedOld.replace(/'/g, "&#39;"),
                    trimmedOld.replace(/&/g, "&amp;"),
                    trimmedOld.replace(/"/g, "&quot;"),
                ];
                for (const variant of entityVariations) {
                    if (variant === trimmedOld) continue;
                    for (const [filePath, content] of fileEntries) {
                        if (content.includes(variant)) {
                            patches.push({
                                filePath,
                                oldContent: variant,
                                newContent: edit.newText.trim(),
                            });
                            matched = true;
                            break;
                        }
                    }
                    if (matched) break;
                }
            }

            // 3. Whitespace & newline tolerant matching for multiline JSX
            if (!matched) {
                const escaped = trimmedOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const flexibleRegex = new RegExp(escaped.replace(/\s+/g, "\\s+"));
                for (const [filePath, content] of fileEntries) {
                    const match = content.match(flexibleRegex);
                    if (match && match[0]) {
                        patches.push({
                            filePath,
                            oldContent: match[0],
                            newContent: edit.newText.trim(),
                        });
                        matched = true;
                        break;
                    }
                }
            }
        } else if (edit.type === "className") {
            const trimmedOldClass = edit.oldClassName.trim();
            if (!trimmedOldClass) continue;

            for (const [filePath, content] of fileEntries) {
                if (content.includes(edit.oldClassName)) {
                    patches.push({
                        filePath,
                        oldContent: edit.oldClassName,
                        newContent: edit.newClassName,
                    });
                    break;
                }
            }
        } else if (edit.type === "style") {
            const trimmedOriginal = edit.originalClassName.trim();
            if (!trimmedOriginal) continue;

            const newClassName = applyStyleToClassName(
                edit.originalClassName,
                edit.property,
                edit.value
            );

            if (newClassName !== edit.originalClassName) {
                let matched = false;
                for (const [filePath, content] of fileEntries) {
                    if (content.includes(edit.originalClassName)) {
                        patches.push({
                            filePath,
                            oldContent: edit.originalClassName,
                            newContent: newClassName,
                        });
                        matched = true;
                        break;
                    }
                }

                // If exact class string wasn't found, try matching normalized class tokens inside className="..."
                if (!matched) {
                    for (const [filePath, content] of fileEntries) {
                        const classAttrRegex = /className=["']([^"']+)["']/g;
                        let match: RegExpExecArray | null;
                        while ((match = classAttrRegex.exec(content)) !== null) {
                            const foundClass = match[1];
                            // Check if foundClass has high overlap with original classes
                            const originalTokens = new Set(trimmedOriginal.split(/\s+/));
                            const foundTokens = foundClass.split(/\s+/);
                            const intersection = foundTokens.filter((t) => originalTokens.has(t));
                            if (intersection.length >= Math.min(originalTokens.size, 2)) {
                                const patchedFound = applyStyleToClassName(
                                    foundClass,
                                    edit.property,
                                    edit.value
                                );
                                patches.push({
                                    filePath,
                                    oldContent: foundClass,
                                    newContent: patchedFound,
                                });
                                matched = true;
                                break;
                            }
                        }
                        if (matched) break;
                    }
                }
            }
        }
    }

    return patches;
}

/**
 * Apply patches to the files record, returning a new files object.
 */
export function applyPatches(
    files: Record<string, string>,
    patches: VisualPatch[]
): Record<string, string> {
    const result = { ...files };

    for (const patch of patches) {
        if (result[patch.filePath]) {
            result[patch.filePath] = result[patch.filePath].replace(
                patch.oldContent,
                patch.newContent
            );
        }
    }

    return result;
}
