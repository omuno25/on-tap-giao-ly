import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

export function readContent(...pathSegments: string[]) {
  return readFileSync(
    path.join(process.cwd(), "content", ...pathSegments),
    "utf8",
  );
}

export const getRootPath = (...paths: string[]) =>
  path.join(process.cwd(), ...paths);
