---
tags:
  - rust
  - programing
  - dotnet
title: Learning Rust as a .NET Developer
description: I know .NET but want to learn Rust. These are notes mapping Rust concepts back to the familiar .NET.
draft: true
---

> I'm still writing this as I explore deeper into Rust. So likely a lot of errors...

## Quick Introduction

I wanted to learn Rust for a small project. I could use .NET, and it would likely be done in a few hours, but this felt like a good time to check out Rust again. I'm happy I did, the tooling has improved dramatically since I last looked at Rust.

So here are my notes, mapping familiar .NET concepts to the world of Rust.

## Setup

Installing Rust has gotten a lot more straight forward, I favor [WinGet](https://github.com/microsoft/winget-cli) as it's installed by default on modern Windows.

```powershell
winget install --id Rustlang.Rustup
```

A quick sanity check is also a good idea:

```powershell
rustup check
```

```ouptut
stable-x86_64-pc-windows-msvc - Up to date : 1.80.0 (051478957 2024-07-21)
rustup - Up to date : 1.27.1
```

For my IDE, I selected [VSCode](https://github.com/microsoft/vscode), mostly because that's what I use for everything not C#.

```powershell
# Of course, install VSCode
winget install --id Microsoft.VisualStudioCode

# And install the Rust extension, which uses the Rust language server.
code --install-extension rust-lang.rust-analyzer

# And for debugging.
code --install-extension ms-vscode.cpptools

# And since Rust likes TOML.
code --install-extension tamasfe.even-better-toml
```

## CLI

The CLI is similar to .NET, where the CLI `dotnet` is basically `cargo`.

Scaffolding a new project can be done with `cargo new`:

```powershell
cargo new <name>
# Or for the current directory.
cargo init
```

Building, running, and testing are also obvious as their `dotnet` counterparts:

```powershell
cargo build
cargo run
cargo test
```

## Project Structure

TODO

- Packages vs projects.
- Solutions?
- Multi-projects?
- Build isolation?

I am curious how building ultimately works. .NET has historically kept separate cache directories for each project to improve building concurrency. Rust doesn't appear to do this.

### Git Ignore

With .NET projects, you typically want to ignore `obj` and `bin`, as these contain either cache or compile code. Rust makes this easier, only `/target` needs to be ignore (which resides in the root of the repository).

## Building

Similar to .NET, Rust maintains a build cache. While .NET stores these in the `obj` directory by default, Rust stores these caches in `target`. Both use a profile system for different kinds of builds e.g. `Release` and `Debug` (where the case only matters sometimes...). Rust calls these default profiles `release` and `debug`. Custom profiles can be defined, just like in .NET. Different target platform are defined by "tuples" (close to monikers in .NET), to support cross-compiling for another platform (although, this is much more important for Rust as most .NET builds are portable by default).

What's also interesting, Rust's cache is

While not officially supported by Rust, Mozilla has created the ability to share cache between projects, called [`sccache`](https://github.com/mozilla/sccache). This is kind of nice coming from .NET - which shares (and refcopies if possible) NuGet  assemblies between projects, anything compiled is completely isolated.

## Package Management

TODO

- Versioning
- Restoring
- Lock file.
- Registries.

Similar to .NET's `dotnet`, `cargo` is a unified interface to both building and package management. I think this is a good thing, looking from the sidelines at the Go package manager fragmentation over the years. A lot of Rust seems to do this, pushing developers along the well trodden path - again, similar to how .NET has formed over the years (which I've seen complaints for from Java developers, although, at least .NET doesn't have the Maven Central problem😝).

## Testing

TODO

## Profiling

TODO

## Debugging

When I first tried to learn Rust, years ago, debugging was very hit or miss. At least compared to my experiences in .NET (which might be unfair to Rust...). These days, debugging is much better.

On Windows, you can use the official [C++ debugger](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) provided by Microsoft. To my understanding, this uses the same debugger that Visual Studio uses (read, very good). Similar to the .NET debugger (as the OSS MonoSharp debugger is basically deprecated last I checked), it's considered intellectual property by Microsoft (meaning they have a dev team building it, but also means, not OSS).

## Governance

The governance of Rust is interesting, especially with context of the slow moving C++ ecosystem. I only recently looked into it, as Rust was respectively mentioned as a good template for good governance during the recent Nix governance controversies.

TODO

- Who owns what?
- Licensing.
- Compare the "pods".

## Tips

### Cargo Manifest Intellisense/Validation

If you have [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml) installed, you can use the published Cargo JSON schema to validate the `Cargo.toml`, just add the schema directive:

```toml
#:schema https://json.schemastore.org/cargo.json

[package]
# ...
```

I had to look at the extension code to figure this one out - I don't think it's well known.

## Troubleshooting

### Dependencies

On Windows, it's not obvious how the rust toolchain detects the MSVC linker. Through sus'ing, it appears Rust attempts to first detect the linker from the standard VC++ directories, if installed (hopefully discovery is via the registry).

If not found, Rust falls back to any `link.exe` in path, which could be wrong (e.g. if you have GNU tooling in path). This can produce a very weird error message:

```output
error: linking with `link.exe` failed: exit code: 1
note: link.exe: extra operand `F:\\Development\\github.com\\silvenga\\fwd-sync\\target\\debug\\deps\\fwd_sync.0ju5gv4udmcgrhiu8jkmtynl7.rcgu.o'
          Try `link.exe --help' for more information.
note: `link.exe` returned an unexpected error
note: in the Visual Studio installer, ensure the "C++ build tools" workload is selected
```

It's also not well documented what dependencies are needed, where many say just to install all C++ workloads in Visual Studio (including Microsoft...), I don't consider that an actual solution (Rust doesn't need things like the CLR C++ libraries).

Ultimately, you just need one of each:

- MSVC Build Tools for your platform, e.g. `MSVC v143 - VS 2022 C++ x64/x86 build tools (Latest)`
- A Windows SDK for your platform e.g. Windows 11 SDK (10.26100.0).

> I suppose you might want different versions/architectures based on the platforms you want to target.

If you want to just import a `.vsconfig`, the following works:

```json
{
  "version": "1.0",
  "components": [
    "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "Microsoft.VisualStudio.Component.Windows11SDK.26100"
  ],
  "extensions": []
}
```
