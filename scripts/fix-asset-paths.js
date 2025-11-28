const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = process.cwd();
const scanDir = path.join(repoRoot, "src");
const exts = [".vue", ".js", ".ts", ".jsx", ".tsx", ".html"];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results = results.concat(walk(p));
    } else {
      if (exts.includes(path.extname(entry.name))) results.push(p);
    }
  }
  return results;
}

function caseInsensitiveFind(targetPath) {
  // try to find file by walking directory and matching case-insensitively
  if (!fs.existsSync(path.dirname(targetPath))) return null;
  const dirFiles = fs.readdirSync(path.dirname(targetPath));
  const base = path.basename(targetPath).toLowerCase();
  for (const f of dirFiles) {
    if (f.toLowerCase() === base) return path.join(path.dirname(targetPath), f);
  }
  return null;
}

const files = walk(scanDir);
const assetRegex =
  /(["'`])(?:@\/assets|src\/assets)\/([\w\-\/\.@ ]+?\.(?:png|jpg|jpeg|svg|webp|gif))(\1)/gi;
let totalChanges = 0;
const changes = [];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;
  let newContent = content.replace(assetRegex, (m, quote, relPath) => {
    const prefix = m.startsWith(quote + "@/assets") ? "@/assets" : "src/assets";
    const originalRef = `${prefix}/${relPath}`;
    // compute disk path
    const diskPath = path.join(repoRoot, "src", relPath);
    if (fs.existsSync(diskPath)) {
      // file exists as referenced (assuming prefix replacement handled)
      return `${quote}${originalRef}${quote}`;
    }
    // try with src/assets prefix if original used @/
    const altDiskPath = path.join(repoRoot, originalRef.replace(/^@\//, ""));
    if (fs.existsSync(altDiskPath)) {
      return `${quote}${originalRef}${quote}`; // it exists
    }
    // try case-insensitive find in same directory
    const expectedDisk = altDiskPath; // path under src
    const found = caseInsensitiveFind(expectedDisk);
    if (found) {
      // compute path relative to src
      const relToSrc = path
        .relative(path.join(repoRoot, "src"), found)
        .split(path.sep)
        .join("/");
      const replacement =
        (m.includes("@/assets") ? "@/assets/" : "src/assets/") + relToSrc;
      modified = true;
      totalChanges++;
      changes.push({ file, original: originalRef, fixed: replacement });
      return `${quote}${replacement}${quote}`;
    }
    // not found; leave as is
    return m;
  });

  if (modified) {
    fs.writeFileSync(file, newContent, "utf8");
  }
}

if (changes.length > 0) {
  console.log("Changes to apply:");
  changes.forEach((c) => console.log(`${c.file}: ${c.original} => ${c.fixed}`));
  try {
    execSync("git add -A", { stdio: "inherit" });
    execSync(
      'git commit -m "fix: normalize asset path casing to match static files"',
      { stdio: "inherit" }
    );
    execSync("git push origin main", { stdio: "inherit" });
    console.log("Committed and pushed changes.");
  } catch (e) {
    console.error("Failed to commit/push automatically:", e.message);
  }
} else {
  console.log("No mismatched asset references found.");
}

console.log("Total corrections:", totalChanges);
