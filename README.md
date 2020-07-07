[![oclif Plugin](https://img.shields.io/badge/oclif-plugin-brightgreen?style=for-the-badge)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-plugin-completion?style=for-the-badge)](https://npmjs.org/package/oclif-plugin-completion)
[![License](https://img.shields.io/npm/l/oclif-plugin-completion?style=for-the-badge)](https://github.com/MunifTanjim/oclif-plugin-completion/blob/master/LICENSE)

# oclif Plugin: completion

oclif plugin for generating shell completions

<!-- toc -->

- [oclif Plugin: completion](#oclif-plugin-completion)
- [Completion Features](#completion-features)
- [Supported Shells](#supported-shells)
- [Commands](#commands)
<!-- tocstop -->

# Completion Features

Consider the following `dummy` CLI:

```sh
Usage: dummy <COMMAND> [OPTION...]

Commands:

  open   <ro|rw>      open a dummy (as read-only or read-write)
  save                save a dummy
  search              search a dummy

Options (open):

  -i, --id            dummy id
  -f, --file          path to dummy file
  -d, --dir           path to dummy directory (default: ./dummies)
  -v, --verbose       boolean flag

Options (save):

  -n, --name          dummy name
  -a, --age           dummy age
  -t, --tag           dummy tag, can be multiple (a/b/c/d)
  -f, --file          path to dummy file
  -d, --dir           path to dummy directory (default: ./dummies)
  -o, --overwrite     boolean flag
  -v, --verbose       boolean flag

Options (search):

  -n, --name          dummy name
  -a, --age           dummy age
  -t, --tag           dummy tag, can be multiple (a/b/c/d)
  -v, --verbose       boolean flag
```

Running on the current directory with tree:

```sh
|- dir-one/
|  |- 042.dummy-with-id-042.json
|- dir-two/
|- dummies/
|  |- 109.dummy-with-id-109.json
|  |- 110.dummy-with-id-110.json
|  |- 111.dummy-with-id-111.json
|- file-one.txt
|- file-two.txt
```

## Features Description

**File Path completion**:

Completion will suggest the files on disk matching glob pattern.

**Directory Path completion**:

Completion will suggest the directories on disk matching glob pattern.

**Dynamic Runtime completion**:

Completion will generate the suggestion based on state of runtime environment and/or configuration.

## Features Examples

| Feature                    | Input                                | Output                       |
| -------------------------- | ------------------------------------ | ---------------------------- |
| File Path completion       | `dummy open --file=./dir/one/<TAB>`  | `042.dummy-with-id-042.json` |
| Directory Path completion  | `dummy open --dir ./di<TAB>`         | `dir-one dir-two`            |
| Dynamic Runtime completion | `dummy open --id <TAB>`              | `109 110 111`                |
| Dynamic Runtime completion | `dummy open -d ./dir-one --id <TAB>` | `042`                        |

## Feature Support Matrix

| :+1:      | :-1:        | :grey_exclamation: | :bug: | :heavy_check_mark: | :heavy_minus_sign:    | :x:             |
| --------- | ----------- | ------------------ | ----- | ------------------ | --------------------- | --------------- |
| Supported | Unsupported | Unknown            | Bug   | Implemented        | Partially Implemented | Not Implemented |

| oclif      | Feature                      | Example                            | Bash                    | Zsh                     | Fish                    |
| ---------- | ---------------------------- | ---------------------------------- | ----------------------- | ----------------------- | ----------------------- |
| :+1:       | Positional argument          | `ro`                               | :grey_exclamation: :x:  | :+1: :heavy_check_mark: | :grey_exclamation: :x:  |
| :+1:       | Basic Long                   | `--name john --age 42 --overwrite` | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Alternate Long               | `--name=john --age=42`             | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Basic Short                  | `-n john -a 42 -o`                 | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Alternative Short            | `-njohn -a42`                      | :+1: :x:                | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Stacking Short               | `-ov`                              | :grey_exclamation: :x:  | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Stacking Short with argument | `-ova 42`                          | :grey_exclamation: :x:  | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1:       | Options / Enum               | `--tag a`                          | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: | :+1: :heavy_check_mark: |
| :+1: :bug: | Multiple                     | `-t c --tag d`                     | :+1: :heavy_minus_sign: | :+1: :heavy_minus_sign: | :+1: :heavy_minus_sign: |
| :-1:       | File Path completion         | `--file ...`                       | :+1: :heavy_minus_sign: | :+1: :x:                | :+1: :heavy_minus_sign: |
| :-1:       | Directory Path completion    | `--dir ...`                        | :+1: :heavy_minus_sign: | :+1: :x:                | :+1: :heavy_minus_sign: |
| :-1:       | Dynamic Runtime completion   | `--dir ./dummies --id 111`         | :+1: :x:                | :+1: :x:                | :+1: :x:                |

# Supported Shells

## Bash

Reference: [Bash Completion](https://github.com/scop/bash-completion)

You need to have `bash-completion` package installed on your system.

### Bash Usage

You can enable completion for Bash using various methods. A few of them are mentioned below:

**vanilla (.bashrc)**:

Add the following line in your `.bashrc` file:

```sh
eval "$(dummy completion:generate --shell bash);"
```

**vanilla (user directory)**:

Run the following command:

```sh
dummy completion:generate --shell bash | tee ~/.local/share/bash-completion/completions/dummy
```

## Zsh

Reference: [Zsh Completion System](http://zsh.sourceforge.net/Doc/Release/Completion-System.html)

### Zsh Usage

You can enable completion for Zsh using various methods. A few of them are mentioned below:

**vanilla (.zshrc)**:

Add the following line in your `.zshrc` file:

```sh
eval "$(dummy completion:generate --shell zsh); compdef _dummy dummy;"
```

**vanilla (vendor-completions)**:

Run the following command:

```sh
dummy completion:generate --shell zsh | sudo tee /usr/share/zsh/vendor-completions/_dummy
```

[**zinit**](https://github.com/zdharma/zinit):

Run the following commands:

```sh
dummy completion:generate --shell zsh > ~/.local/share/zsh/completions/_dummy
zinit creinstall ~/.local/share/zsh/completions
```

## Fish

Reference: [Fish Completion](https://fishshell.com/docs/current/cmds/complete.html)

### Fish Usage

Reference: [Where to put completions](https://fishshell.com/docs/current/index.html#where-to-put-completions)

You can enable completion for Fish using various methods. A few of them are mentioned below:

**vanilla (user directory)**:

Run the following command:

```sh
dummy completion:generate --shell fish | tee ~/.config/fish/completions/dummy.fish
```

# Commands

<!-- commands -->

- [`dummy completion`](#dummy-completion)
- [`dummy completion:generate`](#dummy-completiongenerate)

## `dummy completion`

completion plugin

```
USAGE
  $ dummy completion

OPTIONS
  -s, --shell=bash|fish|zsh  (required) Name of shell

EXAMPLE
  $ dummy completion --shell zsh
```

_See code: [src/commands/completion/index.ts](https://github.com/MunifTanjim/oclif-plugin-completion/blob/0.3.2/src/commands/completion/index.ts)_

## `dummy completion:generate`

generates completion script

```
USAGE
  $ dummy completion:generate

OPTIONS
  -s, --shell=bash|fish|zsh  (required) Name of shell

EXAMPLE
  $ dummy completion:generate --shell zsh
```

_See code: [src/commands/completion/generate.ts](https://github.com/MunifTanjim/oclif-plugin-completion/blob/0.3.2/src/commands/completion/generate.ts)_

<!-- commandsstop -->
