import type { Command } from '@oclif/command'
import { escapeString, getFirstLine } from './template'

const getArgs = (command: Command['config']['commands'][number]): string[] => {
  const args: string[] = []

  command.args.forEach((arg, index) => {
    const MESSAGE = ` `
    let ACTION = ``

    if (arg.options && arg.options.length > 0) {
      ACTION = `(${arg.options.join(' ')})`
    } else if (arg.required) {
      ACTION = `( )`
    }

    args.push(`"${index + 1}:${MESSAGE}:${ACTION}"`)
  })

  Object.entries(command.flags).forEach(([name, flag]) => {
    let GROUP: string | null = null

    const OPTNAME: {
      long: string
      neg?: string
      short?: string
    } = {
      long: `--${name}`,
    }

    if (flag.char) {
      OPTNAME.short = `-${flag.char}`
    }

    if (flag.type === 'boolean') {
      if (flag.allowNo) {
        OPTNAME.neg = `--no-${name}`
      }

      if (OPTNAME.neg || OPTNAME.short) {
        GROUP = `(${Object.values(OPTNAME).filter(Boolean).join(' ')})`
      }
    }

    if (flag.type === 'option') {
      OPTNAME.long = `${OPTNAME.long}=`

      if (OPTNAME.short) {
        OPTNAME.short = `${OPTNAME.short}+`
      }

      // TODO: need upstream fix. `flag.multiple` property does not exist
      // Upstream PR: https://github.com/oclif/config/pull/113
      // @ts-expect-error
      if (flag.multiple || !flag.multiple) {
        // Until the Upstream PR is merged, everything is multiple 🤷‍♂️
        OPTNAME.long = `*${OPTNAME.long}`

        if (OPTNAME.short) {
          OPTNAME.short = `*${OPTNAME.short}`
        }
      } else if (OPTNAME.short) {
        GROUP = `(${Object.values(OPTNAME).filter(Boolean).join(' ')})`
      }
    }

    const OPTSPEC: string[] = []

    if (GROUP) {
      OPTSPEC.push(`{${Object.values(OPTNAME).filter(Boolean).join(',')}}`)
    } else {
      OPTSPEC.push(`${OPTNAME.long}`)

      if (OPTNAME.short) {
        OPTSPEC.push(`${OPTNAME.short}`)
      }
    }

    const EXPLANATION = `[${escapeString(
      getFirstLine(flag.description),
      ':"'
    )}]`

    const MESSAGE = `${name}`

    let ACTION = ``
    if (flag.type === 'option' && flag.options && flag.options.length > 0) {
      ACTION = `(${flag.options.join(' ')})`
    } else if (flag.required) {
      ACTION = `( )`
    }

    let OPTARG = ``

    if (flag.type === 'option') {
      OPTARG = `:${MESSAGE}:${ACTION}`
    }

    if (GROUP) {
      args.push(`"${GROUP}"${OPTSPEC}"${EXPLANATION}${OPTARG}"`)
    } else {
      args.push(
        ...OPTSPEC.map((optspec) => `"${optspec}${EXPLANATION}${OPTARG}"`)
      )
    }
  })

  return args
}

export function generateCompletionScriptForZsh({
  bin,
  aliases,
  commands,
}: Pick<Command['config'], 'bin' | 'commands'> & { aliases: string[] }) {
  const scriptParts = [`#compdef ${[bin, ...aliases].join(' ')}`]

  const rootCommandPart = `
function _${bin} {
  local state
  local -a commands

  _arguments -s -w -S -C \\
    "1: :->command" \\
    "*::arg:->args"

  case $state in
    command)
      commands=(
        ${commands
          .map((command) => {
            const NAME = escapeString(command.id, ':')
            const DESCRIPTION = escapeString(
              getFirstLine(command.description),
              ':'
            )

            return `"${NAME}:${DESCRIPTION}"`
          })
          .join(`\n${' '.repeat(8)}`)}
      )
      _describe "command" commands
      ;;
  esac

  case "$words[1]" in
    ${commands
      .map((command) => {
        return `${command.id})\n${' '.repeat(6)}_${bin}_${
          command.id
        }\n${' '.repeat(6)};;`
      })
      .join(`\n${' '.repeat(4)}`)}
  esac
}
`.trim()

  scriptParts.push(rootCommandPart)

  commands.forEach((command) => {
    const functionParts: string[] = []

    const args = getArgs(command)

    if (args.length > 0) {
      functionParts.push(
        `_arguments -s -w -S -C ${args.join(` \\\n${' '.repeat(4)}`)}`
      )
    }

    const commandPart = `
function _${bin}_${command.id} {
  ${functionParts.join(`\n${' '.repeat(2)}`)}
}
`.trim()

    scriptParts.push(commandPart)
  })

  return scriptParts.join('\n'.repeat(2))
}

export function getInstructionsForZsh({
  bin,
  shell,
}: {
  bin: string
  shell: string
}): string[] {
  const scriptName = `_${bin}`

  const lines = [
    `Running the following command will generate the completion script for ${shell} shell:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} > ${scriptName}`,
    ``,
    `You need to put that "${scriptName}" file in one of the directories present in "$FPATH" variable:`,
    ``,
    `  $ echo $FPATH`,
    ``,
    `Usually this should work by automatically find an appropriate directory for you:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} | tee "$(echo \${FPATH} | tr ':' '\\n' | grep site-functions | head -n1)/${scriptName}"`,
    ``,
    `For more info, visit: https://www.npmjs.com/package/oclif-plugin-completion#${shell}`,
    ``,
    `Enjoy!`,
  ]

  return lines
}
