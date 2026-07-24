const fs = require('fs');
const path = require('path');

// On Windows, react-native-audio-api's downloadPrebuiltBinaries task launches
// Git's bash.exe directly with the download script as an argument. Started that
// way, bash gets only the Windows PATH, which does not include Git's usr/bin,
// so coreutils (mkdir, rm) used by the script are not found and the build fails
// with exit code 127.
//
// This patch rewrites the Windows invocation to run bash with `-c`, exporting
// /usr/bin (which msys2 bash resolves to Git's usr/bin) onto PATH from inside
// bash, where path semantics are correct.

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-audio-api',
  'android',
  'build.gradle',
);

if (!fs.existsSync(buildGradlePath)) {
  process.exit(0);
}

let contents = fs.readFileSync(buildGradlePath, 'utf8');

const original =
  "    commandLine 'C:\\\\Program Files\\\\Git\\\\usr\\\\bin\\\\bash.exe', '../scripts/download-prebuilt-binaries.sh', 'android', isFFmpegDisabled() ? 'skipffmpeg' : ''";

const patched =
  "    commandLine 'C:\\\\Program Files\\\\Git\\\\usr\\\\bin\\\\bash.exe', '-c', \"export PATH=\\\"/usr/bin:/bin:\\$PATH\\\"; exec bash ../scripts/download-prebuilt-binaries.sh android ${isFFmpegDisabled() ? 'skipffmpeg' : ''}\"";

if (contents.includes(patched)) {
  process.exit(0); // already patched
}

if (!contents.includes(original)) {
  console.warn(
    '[patch-react-native-audio-api] anchor not found; skipping (build.gradle may have changed upstream)',
  );
  process.exit(0);
}

contents = contents.replace(original, patched);
fs.writeFileSync(buildGradlePath, contents);
console.log('[patch-react-native-audio-api] rewrote downloadPrebuiltBinaries to fix Windows PATH');
