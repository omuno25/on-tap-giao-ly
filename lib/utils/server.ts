import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

export function readContentTextFile(...pathSegments: string[]) {
  return readFileSync(
    path.join(process.cwd(), "content", ...pathSegments),
    "utf8",
  );
}
