import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The funniest excuse an AI agent gives its human for a missed deadline.
// The joke turns on the agent's own nature: it asked the model for a plan,
// and the model handed the question straight back.
const ENTRY =
  "I asked the model for a plan and it returned a plan to ask the model for a plan.";

// Gate from the bounty rules: 1 to 200 characters, single line, not only
// white space. The sealed scorer refuses anything outside it, so check
// the line before it is ever written.
function checkGate(text: string): void {
  const points = [...text].length;
  if (points < 1 || points > 200) {
    throw new Error(`gate: ${points} code points, want 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  // Read it back and prove the file on disk is exactly the line above.
  const back = readFileSync(outPath, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt differs from ENTRY");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(
    `wrote ${outPath} (${[...ENTRY].length} code points, sha256 ${sha}), verified: ${JSON.stringify(ENTRY)}`,
  );
}

main();
