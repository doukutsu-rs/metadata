`metadata.js` usage:
```
    node metadata.js OPTIONS FILE

    FILE:
        A metadata file.

    OPTIONS:
        --commit Optional. Hash of commit, that triggered a build.
        --os The target OS for which the application is built. Examples: windows, linux, android, horizon.
        --arch=["universal"] Optional. Target CPU architecture of the build.
            "universal" arch is used for packaged build, which contains prebuilts for multiple architectures.
            For example, Android package contains prebuilts for x86, x86_64, armv8 and armv7 architectures.
        --profile=["default"] Optional. A build profile. E.g. "static" for static-linked builds, "handhelt" for handhelt devices. The default profile is "default".
        --version Application version.
        --link Link to download build.
        --fileHash Hash of executable file.

        --minOsVersion Optional. Minimal supported OS version.
        --date=[current timestamp] Optional. Build unix timestamp.
```
