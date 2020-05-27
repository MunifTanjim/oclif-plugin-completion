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

  open                open a dummy
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

| oclif | Feature                      | Example                            | Zsh                     |
| ----- | ---------------------------- | ---------------------------------- | ----------------------- |
| :+1:  | Basic Long                   | `--name john --age 42 --overwrite` | :+1: :heavy_check_mark: |
| :+1:  | Alternate Long               | `--name=john --age=42`             | :+1: :heavy_check_mark: |
| :+1:  | Basic Short                  | `-n john -a 42 -o`                 | :+1: :heavy_check_mark: |
| :+1:  | Alternative Short            | `-njohn -a42`                      | :+1: :heavy_check_mark: |
| :+1:  | Stacking Short               | `-ov`                              | :+1: :heavy_check_mark: |
| :+1:  | Stacking Short with argument | `-ova 42`                          | :+1: :heavy_check_mark: |
| :+1:  | Options / Enum               | `--tag a`                          | :+1: :heavy_check_mark: |
| :+1:  | Multiple                     | `-t c --tag d`                     | :+1: :heavy_check_mark: |
| :x:   | File Path completion         | `--file ...`                       | :+1: :grey_exclamation: |
| :x:   | Directory Path completion    | `--dir ...`                        | :+1: :grey_exclamation: |
| :x:   | Dynamic Runtime completion   | `--dir ./dummies --id 111`         | :+1: :grey_exclamation: |

# Supported Shells

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
  -s, --shell=zsh  (required) Name of shell

EXAMPLE
  $ dummy completion --shell zsh
```

_See code: [src/commands/completion/index.ts](https://github.com/MunifTanjim/oclif-plugin-completion/blob/0.1.0/src/commands/completion/index.ts)_

## `dummy completion:generate`

generates completion script

```
USAGE
  $ dummy completion:generate

OPTIONS
  -s, --shell=zsh  (required) Name of shell

EXAMPLE
  $ dummy completion:generate --shell zsh
```

_See code: [src/commands/completion/generate.ts](https://github.com/MunifTanjim/oclif-plugin-completion/blob/0.1.0/src/commands/completion/generate.ts)_

<!-- commandsstop -->
