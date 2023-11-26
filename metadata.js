const fs = require('fs');

const args = {
  file: undefined,
  os: undefined,
  arch: {
    required: false,
    value: undefined
  },
  version: undefined,
  link: undefined,
  minOsVersion: {
    required: false,
    value: undefined
  }
};
process.argv = process.argv.slice(2);

let argName;
process.argv.forEach((arg) => {
  if (arg.startsWith('--')) {
    argName = arg.slice(2);
  } else if (argName !== undefined) {
    if (typeof args[argName] == 'object' && args[argName]) {
      args[argName].value = arg;
    } else {
      args[argName] = arg;
    }

    argName = undefined;
  } else {
    args.file = arg;
  }
})

Object.keys(args).forEach((arg) => {
  if (args[arg] === undefined) {
    console.error(`Required argument '${arg}' is missing`);
    process.exit(1);
  }
})

let data = {};
try {
  const exists = fs.existsSync(args.file);
  if (exists) {
    const isDir = fs.statSync(args.file).isDirectory();
    if (!isDir) {
      const content = fs.readFileSync(args.file);
      data = JSON.parse(content);
    } else {
      throw new Error('Provided file is a dir');
    }
  }
} catch (e) {
  console.error(`Failed to read metadata from the file. ${e.message}`);
  process.exit(2);
}

if (data[args.os] === undefined) {
  data[args.os] = {};
}

const date = Math.floor(Date.now() / 1000);
const info = {
  version: args.version,
  link: args.link,
  date
};
if (args.arch.value !== undefined) {
  data[args.os][args.arch.value] = info;
} else {
  data[args.os] = info;
}

if (args.minOsVersion.value !== undefined) {
  data[args.os][args.arch].minOsVersion = args.minOsVersion.value;
}

try {
  const content = JSON.stringify(data);
  fs.writeFileSync(args.file, content, {
    flush: true
  });
} catch (e) {
  console.error(`Failed to write data into the file. ${e.message}`);
  process.exitCode = 3;
}
