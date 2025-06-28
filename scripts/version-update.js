import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { execSync } from "child_process";

// Get the package.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// Parse current version
const versionParts = packageJson.version.split(".").map(Number);
let [major, minor, patch = 0] = versionParts;

// Get the git diff to check for changes
const gitDiff = execSync("git diff --name-only HEAD HEAD~1").toString();
const hasChanges = gitDiff.trim().length > 0;

if (hasChanges) {
  // For development builds, increment the patch version
  patch += 1;

  // For commits to main/master, increment minor version
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();
  if (["main", "master"].includes(currentBranch)) {
    minor += 1;
    patch = 0; // Reset patch when minor is incremented
  }

  // Update the version
  const newVersion = `${major}.${minor}.${patch}`;
  packageJson.version = newVersion;

  // Write the updated package.json
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

  // Update the VERSION file
  writeFileSync(join(__dirname, "../public/VERSION"), newVersion);

  // Stage the version changes
  execSync("git add package.json public/VERSION");

  console.log(`Updated version to ${newVersion}`);
}
