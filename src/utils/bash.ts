import type { Command } from '@oclif/command'
import { template } from './template'

const getBootstrap = (rootCommandName: string) => {
  const bootstrapTemplate = template`
__${'bin'}_debug()
{
  if [[ -n \${BASH_COMP_DEBUG_FILE} ]]; then
    echo "$*" >> "\${BASH_COMP_DEBUG_FILE}"
  fi
}

# Homebrew on Macs have version 1.3 of bash-completion which doesn't include
# _init_completion. This is a very minimal version of that function.
__${'bin'}_init_completion()
{
  COMPREPLY=()
  _get_comp_words_by_ref "$@" cur prev words cword
}

__${'bin'}_index_of_word()
{
  local w word=$1
  shift
  index=0
  for w in "$@"; do
    [[ $w = "$word" ]] && return
    index=$((index+1))
  done
  index=-1
}

__${'bin'}_contains_word()
{
  local w word=$1; shift
  for w in "$@"; do
      [[ $w = "$word" ]] && return
  done
  return 1
}

__${'bin'}_filter_flag()
{
  local flag

  for inserted_flag in "\${inserted_flags[@]}"; do
    for i in "\${!COMPREPLY[@]}"; do
      flag="\${COMPREPLY[i]%%=*}"
      if [[ $flag = $inserted_flag ]]; then
        if ! __${'bin'}_contains_word $flag "\${multi_flags[@]}"; then
          __${'bin'}_debug "\${FUNCNAME[0]}: \${COMPREPLY[i]}"
          unset 'COMPREPLY[i]'
        fi
      fi
    done
  done

  COMPREPLY=("\${COMPREPLY[@]}")
}

__${'bin'}_handle_reply()
{
  local comp

  __${'bin'}_debug "\${FUNCNAME[0]}: c is $c words[c] is \${words[c]} cur is $cur"

  case $cur in
    -*)
      if [[ $(type -t compopt) = "builtin" ]]; then
        compopt -o nospace
      fi

      local allflags=("\${flags[*]}")

      while IFS='' read -r comp; do
        COMPREPLY+=("$comp")
      done < <(compgen -W "\${allflags[*]}" -- "$cur")

      if [[ $(type -t compopt) = "builtin" ]]; then
        [[ "\${COMPREPLY[0]}" == *= ]] || compopt +o nospace
      fi

      __${'bin'}_filter_flag

      # complete after --flag=abc
      if [[ $cur == *=* ]]; then
        COMPREPLY=()

        if [[ $(type -t compopt) = "builtin" ]]; then
          compopt +o nospace
        fi

        local index flag
        flag="\${cur%%=*}"
        __${'bin'}_index_of_word "$flag" "\${option_flags[@]}"

        __${'bin'}_debug "\${FUNCNAME[0]}: flag is $flag index is $index"

        if [[ \${index} -ge 0 ]]; then
          cur="\${cur#*=}"

          local option_flag_handler="\${option_flag_handlers[\${index}]}"
          $option_flag_handler
        fi
      fi

      return
      ;;
  esac

  local index
  __${'bin'}_index_of_word "$prev" "\${option_flags[@]}"

  __${'bin'}_debug "\${FUNCNAME[0]}: flag is $flag index is $index"

  if [[ \${index} -ge 0 ]]; then
    local option_flag_handler="\${option_flag_handlers[\${index}]}"
    $option_flag_handler
    return
  fi

  local completions

  completions=("\${commands[@]}")

  while IFS='' read -r comp; do
    COMPREPLY+=("$comp")
  done < <(compgen -W "\${completions[*]}" -- "$cur")

  __${'bin'}_filter_flag

  # available in bash-completion >= 2, not always present on macOS
  if declare -F __ltrim_colon_completions >/dev/null; then
    __ltrim_colon_completions "$cur"
  fi

  # If there is only 1 completion and it is a flag with an = it will be completed
  # but we don't want a space after the =
  if [[ "\${#COMPREPLY[@]}" -eq "1" ]] && [[ $(type -t compopt) = "builtin" ]] && [[ "\${COMPREPLY[0]}" == --*= ]]; then
     compopt -o nospace
  fi
}

__${'bin'}_handle_flag()
{

  __${'bin'}_debug "\${FUNCNAME[0]}: c is $c words[c] is \${words[c]}"

  # skip the argument to option flag without =
  if [[ \${words[c]} != *"="* ]] && __${'bin'}_contains_word "\${words[c]}" "\${option_flags[@]}"; then
    __${'bin'}_debug "\${FUNCNAME[0]}: found a flag \${words[c]}, skip the next argument"

    c=$((c+1))

    # if we are looking for a flags value, don't show commands
    if [[ $c -eq $cword ]]; then
      commands=()
    fi
  fi

  c=$((c+1))
}

__${'bin'}_handle_command()
{
  __${'bin'}_debug "\${FUNCNAME[0]}: c is $c words[c] is \${words[c]}"

  local next_command
  if [[ -n \${last_command} ]]; then
    next_command="_\${last_command}_\${words[c]//:/__}"
  else
    if [[ $c -eq 0 ]]; then
      next_command="_${'bin'}"
    else
      next_command="_\${words[c]//:/__}"
    fi
  fi

  c=$((c+1))

  __${'bin'}_debug "\${FUNCNAME[0]}: looking for \${next_command}"

  declare -F "$next_command" >/dev/null && $next_command
}

__${'bin'}_handle_word()
{
  __${'bin'}_debug "\${FUNCNAME[0]}: c is $c words[c] is \${words[c]}"

  if [[ -z "\${BASH_VERSION}" || "\${BASH_VERSINFO[0]}" -gt 3 ]]; then
    if __${'bin'}_contains_word "\${words[c]}" "\${command_aliases[@]}"; then
      __${'bin'}_debug "\${FUNCNAME[0]}: words[c] is \${words[c]} -> \${command_by_alias[$\{words[c]}]}"

      words[c]=\${command_by_alias[$\{words[c]}]}
    fi
  fi

  if [[ $c -ge $cword ]]; then
    __${'bin'}_handle_reply

    __${'bin'}_debug "\${FUNCNAME[0]}: COMPREPLY is \${COMPREPLY[@]}"
    return
  fi

  if [[ "\${words[c]}" == -* ]]; then
    __${'bin'}_handle_flag
  elif __${'bin'}_contains_word "\${words[c]}" "\${commands[@]}"; then
    __${'bin'}_handle_command
  elif __${'bin'}_contains_word "\${words[c]}" "\${command_aliases[@]}"; then
    __${'bin'}_handle_command
  elif [[ $c -eq 0 ]]; then
    __${'bin'}_handle_command
  else
    c=$((c+1))
  fi

  __${'bin'}_handle_word
}
`

  return bootstrapTemplate({ bin: rootCommandName })
}

const getInit = (bin: string, aliases: string[]) => {
  const initFunctionTemplate = template`
__${'bin'}_init()
{
  __${'bin'}_debug ""

  local cur prev words cword

  if declare -F _init_completion >/dev/null 2>&1; then
    _init_completion -n ":" -n "=" || return
  else
    __${'bin'}_init_completion -n ":" -n "="  || return
  fi

  __${'bin'}_debug "\${FUNCNAME[0]}: words is \${words[@]}"

  local c=0
  local last_command

  local commands=("${'bin'}")
  local command_aliases=()
  declare -A command_by_alias 2>/dev/null || :

  local args=()

  local flags=()

  local multi_flags=()
  local option_flags=()
  local option_flag_handlers=()

  local inserted_flags=()

  __${'bin'}_handle_word
}
`

  const initTemplate = template`
if [[ $(type -t compopt) = "builtin" ]]; then
  ${'initForBuiltin'}
else
  ${'init'}
fi
`

  const commandNames = [bin, ...aliases]

  const parts = [
    initFunctionTemplate({ bin }).trim(),
    initTemplate({
      init: commandNames
        .map((name) => {
          return template`complete -o default -o nospace -F __${'bin'}_init ${'name'}`(
            { bin, name }
          )
        })
        .join('\n  '),
      initForBuiltin: commandNames
        .map((name) => {
          return template`complete -o default -F __${'bin'}_init ${'name'}`({
            bin,
            name,
          })
        })
        .join('\n  '),
    }).trim(),
  ]

  return parts.join('\n'.repeat(2))
}

export function generateCompletionScriptForBash({
  bin,
  aliases,
  commands,
}: Pick<Command['config'], 'bin' | 'commands'> & { aliases: string[] }) {
  const scriptParts = []

  scriptParts.push(getBootstrap(bin))

  commands.forEach((command) => {
    let commandName = [bin, command.id].join(' ')
    commandName = commandName?.replace(/ /g, '_')
    commandName = commandName?.replace(/:/g, '__')

    const parts: string[] = []

    for (const [name, flag] of Object.entries(command.flags)) {
      if (flag.type === 'option' && flag.options) {
        parts.push(`_${commandName}___flag_options--${name}()`)
        parts.push(`{`)
        parts.push(`  local options=()`)
        for (const option of flag.options) {
          parts.push(`  options+=("${option}")`)
        }
        parts.push(`  COMPREPLY=( $( compgen -W "\${options[*]}" -- "$cur" ) )`)
        parts.push(`}`)
      }
    }

    parts.push(`_${commandName}()`)
    parts.push(`{`)

    parts.push(`  last_command=${commandName}`)

    parts.push(`  commands=()`)
    parts.push(`  command_aliases=()`)

    parts.push(`  args=()`)

    parts.push(`  flags=()`)
    parts.push(`  flag_aliases=()`)

    parts.push(`  multi_flags=()`)
    parts.push(`  option_flags=()`)
    parts.push(`  option_flag_handlers=()`)
    parts.push(`  required_flags=()`)

    parts.push(`  inserted_flags=()`)

    for (const arg of command.args) {
      if (arg.hidden) {
        continue
      }
    }

    for (const [name, flag] of Object.entries(command.flags)) {
      if (flag.hidden) {
        continue
      }

      parts.push(`  flags+=("--${name}")`)

      if (flag.char) {
        parts.push(`  flags+=("-${flag.char}")`)
      }

      if (flag.type === 'option') {
        // TODO: need upstream fix. `flag.multiple` property does not exist
        // Upstream PR: https://github.com/oclif/config/pull/113
        // @ts-expect-error
        if (flag.multiple || !flag.multiple) {
          // Until the Upstream PR is merged, everything is multiple 🤷‍♂️
          parts.push(`  multi_flags+=("--${name}")`)

          if (flag.char) {
            parts.push(`  multi_flags+=("-${flag.char}")`)
          }
        }

        if (flag.options) {
          parts.push(`  option_flags+=("--${name}")`)
          parts.push(
            `  option_flag_handlers+=("_${commandName}___flag_options--${name}")`
          )

          if (flag.char) {
            parts.push(`  option_flags+=("-${flag.char}")`)
            parts.push(
              `  option_flag_handlers+=("_${commandName}___flag_options--${name}")`
            )
          }
        }
      }

      if (flag.required) {
        parts.push(`  required_flags+=("--${name}")`)

        if (flag.char) {
          parts.push(`  required_flags+=("-${flag.char}")`)
        }
      }
    }

    parts.push(`}`)

    scriptParts.push(parts.join(`\n`))
  })

  const rootCommandParts: string[] = []

  rootCommandParts.push(`_${bin}()`)
  rootCommandParts.push(`{`)

  rootCommandParts.push(`  commands=()`)

  for (const command of commands) {
    if (command.hidden) {
      continue
    }

    rootCommandParts.push(`  commands+=("${command.id}")`)

    if (command.aliases.length > 0) {
      for (const alias of command.aliases) {
        rootCommandParts.push(`  command_aliases+=("${alias}")`)
      }

      rootCommandParts.push(
        `  if [[ -z "\${BASH_VERSION}" || "\${BASH_VERSINFO[0]}" -gt 3 ]]; then`
      )

      for (const alias of command.aliases) {
        rootCommandParts.push(`    command_by_alias[${alias}]=${command.id}`)
      }

      rootCommandParts.push(`  else`)

      for (const alias of command.aliases) {
        rootCommandParts.push(`    command+=("${alias}")`)
      }

      rootCommandParts.push(`  fi`)
    }
  }

  rootCommandParts.push(`  last_command=${bin}`)
  rootCommandParts.push(`}`)

  scriptParts.push(rootCommandParts.join(`\n`))

  scriptParts.push(getInit(bin, aliases))

  return scriptParts.join('\n'.repeat(2))
}

export function generateCompletionAliasScriptForBash({
  bin,
}: {
  bin: string
  alias: string
}) {
  const scriptParts: string[] = []

  scriptParts.push(`_xfunc ${bin} __${bin}_init`)

  return scriptParts.join('\n'.repeat(2))
}

export function getInstructionsForBash({
  bin,
  shell,
  aliases,
}: {
  bin: string
  shell: string
  aliases: string[]
}): string[] {
  const scriptName = (name: string) => name

  const lines = [
    `Make sure you have the "bash-completion" package installed on your system.`,
    ``,
    `Running the following command will generate the completion script for ${shell} shell:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} > ${scriptName(bin)}`,
  ]

  lines.push(
    ``,
    `You need to put that "${scriptName(
      bin
    )}" file in one of the following directories (depending on your system):`,
    ``,
    `  - $XDG_DATA_HOME/bash-completion/completions`,
    `  - ~/.local/share/bash-completion/completions`,
    `  - /usr/local/share/bash-completion/completions`,
    `  - /usr/share/bash-completion/completions`,
    ``,
    `Usually this should work:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} | tee ~/.local/share/bash-completion/completions/${scriptName(
      bin
    )}`
  )

  if (aliases.length > 0) {
    const plural = aliases.length > 1
    lines.push(
      ``,
      `Also, '${bin}' provides ${plural ? 'these' : 'the'} ${
        plural ? 'aliases' : 'alias'
      }: '${aliases.join("', '")}'. You can generate completion ${
        plural ? 'scripts' : 'script'
      } for ${
        plural ? 'those' : 'that'
      } using the "completion:generate:alias" command. For example:`,
      ``,
      `  $ ${bin} completion:generate:alias --shell=${shell} ${
        aliases[0]
      } | tee ~/.local/share/bash-completion/completions/${scriptName(
        aliases[0]
      )}`
    )
  }

  lines.push(
    ``,
    `For more info, visit: https://www.npmjs.com/package/oclif-plugin-completion#${shell}`,
    ``,
    `Enjoy!`
  )

  return lines
}
