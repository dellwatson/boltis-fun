const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

// Get the package.json file
const packageJsonPath = path.join(__dirname, "../package.json");
const versionFilePath = path.join(__dirname, "../public/VERSION");

// Function to update the version
function updateVersion() {
  try {
    const packageJson = require(packageJsonPath);
    const versionParts = packageJson.version.split(".").map(Number);

    // For dev, we'll use a timestamp as the patch version
    const timestamp = Math.floor(Date.now() / 1000);
    const newVersion = `0.0.${timestamp}`;

    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n",
    );

    // Update VERSION file
    fs.writeFileSync(versionFilePath, newVersion);

    console.log(`🔄 Updated version to ${newVersion} (development)`);
  } catch (error) {
    console.error("Error updating version:", error);
  }
}

// Watch for changes in src directory
console.log("👀 Watching for file changes in src directory...");
console.log("   (Development version updates enabled)");

// Initial version update
updateVersion();

// Watch for changes and update version
chokidar
  .watch("src", { ignored: /(^|[\/\\])\../, ignoreInitial: true })
  .on("all", (event, path) => {
    if (event === "change") {
      updateVersion();
    }
  });
