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
    const classes = className.split(/\s+/);
    const filtered = classes.filter((cls) => {
        // Match prefix- followed by anything, including arbitrary values
        const regex = new RegExp(`^${prefix}-(\\[.*\\]|[a-zA-Z0-9/.]+)$`);
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

    for (const edit of edits) {
        if (edit.type === "text") {
            // Find the file containing the old text and replace it
            for (const [filePath, content] of Object.entries(files)) {
                if (content.includes(edit.oldText)) {
                    patches.push({
                        filePath,
                        oldContent: edit.oldText,
                        newContent: edit.newText,
                    });
                    break; // Only patch first occurrence
                }
            }
        } else if (edit.type === "className") {
            for (const [filePath, content] of Object.entries(files)) {
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
            // For style edits, we modify the className
            const newClassName = applyStyleToClassName(
                edit.originalClassName,
                edit.property,
                edit.value
            );
            if (newClassName !== edit.originalClassName) {
                for (const [filePath, content] of Object.entries(files)) {
                    if (content.includes(edit.originalClassName)) {
                        patches.push({
                            filePath,
                            oldContent: edit.originalClassName,
                            newContent: newClassName,
                        });
                        break;
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
