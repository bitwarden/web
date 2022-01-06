const child_process = require("child_process");
const path = require("path");

const [img] = process.argv.slice(2);

switch (img.split(".").pop()) {
  case "png":
    child_process.execSync(
      `npx @squoosh/cli --oxipng '{}' --output-dir "${path.dirname(img)}" "${img}"`
    );
    break;
}
