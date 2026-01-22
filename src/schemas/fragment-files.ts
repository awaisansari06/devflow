import { z } from "zod";

export const fragmentFilesSchema = z.record(z.string(), z.string());

export type FragmentFiles = z.infer<typeof fragmentFilesSchema>;
