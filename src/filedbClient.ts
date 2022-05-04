import { FileDB } from "./deps/filedb.ts";

export const db = new FileDB({ rootDir: "./.data", isAutosave: true });
