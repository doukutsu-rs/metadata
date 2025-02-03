const fs = require("fs");

const DEFAULT_VERSION = 2;

const args = {
  file: undefined,

  // Build profile, e.g. "static" for static-linked builds.
  profile: "default",
  os: undefined,

  // If a platform have no prebuilts for a specific
  // architectures(e.g. Android package, which contains prebuilts for all archs),
  // it should be 'universal'.
  arch: undefined,
  version: undefined,
  commit: {
    required: false,
    value: undefined,
  },
  link: undefined,

  // Build date
  date: {
    type: "int",
    required: false,
    value: Math.floor(Date.now() / 1000),
  },
  minOsVersion: {
    required: false,
    value: undefined,
  },

  // Hash of executable file. Introduced as a way for the updater to verify
  // executable file integrity.
  fileHash: null,
};

// Skip `node metadata.js`
process.argv = process.argv.slice(2);

// Parse cli args
let argName;
process.argv.forEach((arg) => {
  if (arg.startsWith("--")) {
    argName = arg.slice(2);
  } else if (argName !== undefined) {
    if (typeof args[argName] == "object" && args[argName]) {
      args[argName].value = arg;

      switch (args[argName]["type"]) {
        case "int":
          args[argName].value = parseInt(args[argName].value);
          break;

        default:
          break;
      }
    } else {
      args[argName] = arg;
    }

    argName = undefined;
  } else {
    args.file = arg;
  }
});

// Check are required arguments set
Object.keys(args).forEach((argName) => {
  const arg = args[argName];
  if (arg === undefined || (arg.required && arg.value === undefined)) {
    console.error(`Required argument '${argName}' is missing`);
    process.exit(1);
  }
});

// Read current data from file
let data = {};
try {
  const exists = fs.existsSync(args.file);
  if (exists) {
    const isDir = fs.statSync(args.file).isDirectory();
    if (!isDir) {
      const content = fs.readFileSync(args.file);
      data = JSON.parse(content);
    } else {
      throw new Error("Provided file is a dir");
    }
  }
} catch (e) {
  console.error(`Failed to read metadata from the file. ${e.message}`);
  process.exit(2);
}

if (data.version === undefined) {
  data.version = DEFAULT_VERSION;
}

// Create a field for a provided platform, if it doesn't exist yet
if (data[args.os] === undefined) {
  data[args.os] = {};
}

let info = {
  version: args.version,
  link: args.link,
  date: args.date.value,
  fileHash: args.fileHash
};

if (args.minOsVersion.value !== undefined) {
  info.minOsVersion = args.minOsVersion.value;
}

if (args.commit.value !== undefined) {
  info.commit = args.commit.value;
}

switch (data.version) {
  // Version 1 doesn't support profiles, and builds with a ‘universal’ architecture are stored in the root of the ‘platform’ key instead of in a separate ‘{arch}’ key
  case 1:
    if (args.arch == "universal") {
      args.arch = undefined;
    }

    if (args.arch === undefined) {
      data[args.os] = info;
    } else {
      data[args.os][args.arch] = info;
    }
    break;

  case 2:
    if (data[args.os][args.arch] === undefined) {
      data[args.os][args.arch] = {};
    }

    data[args.os][args.arch][args.profile] = info;
    break;

  default:
    console.error("Unsupported metadata version");
    break;
}

try {
  const content = JSON.stringify(data);
  fs.writeFileSync(args.file, content, {
    flush: true,
  });
} catch (e) {
  console.error(`Failed to write data into the file. ${e.message}`);
  process.exitCode = 3;
}
