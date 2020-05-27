type Command = import('@oclif/command').Command

const escapeString = (string: string, chars: string) => {
  const pattern = new RegExp(`([${chars}])`, 'g')
  return string.replace(pattern, '\\$1')
}

const getFirstLine = (string: string = ''): string => {
  return string.split('\n')[0]
}

const getArgs = (command: Command['config']['commands'][number]): string[] => {
  const args: string[] = []

  command.args.forEach((arg, index) => {
    let MESSAGE = ` `
    let ACTION = ``

    if (arg.options && arg.options.length > 0) {
      ACTION = `(${arg.options.join(' ')})`
    } else if (arg.required) {
      ACTION = `( )`
    }

    args.push(`"${index + 1}:${MESSAGE}:${ACTION}"`)
  })

  Object.entries(command.flags).forEach(([name, flag]) => {
    let OPTNAME: {
      long: string
      neg?: string
      short?: string
    } = {
      long: `--${name}`,
    }

    if (flag.type === 'boolean' && flag.allowNo) {
      OPTNAME.neg = `--no-${name}`
    }

    if (flag.char) {
      OPTNAME.short = `-${flag.char}`
    }

    let GROUP: string | null = null

    if (OPTNAME.neg || OPTNAME.short) {
      GROUP = `(${Object.values(OPTNAME).filter(Boolean).join(' ')})`
    }

    // TODO: need upstream fix. `flag.multiple` property does not exist
    // @ts-ignore
    if (flag.type === 'option' && flag.multiple) {
      OPTNAME.long = `*${OPTNAME.long}`

      if (OPTNAME.short) {
        OPTNAME.short = `*${OPTNAME.short}`
      }
    }

    if (flag.type !== 'boolean') {
      OPTNAME.long = `${OPTNAME.long}=`

      if (OPTNAME.short) {
        OPTNAME.short = `${OPTNAME.short}+`
      }
    }

    let OPTSPEC = ``

    if (GROUP) {
      OPTSPEC = `{${Object.values(OPTNAME).filter(Boolean).join(',')}}`
    } else {
      OPTSPEC = `${OPTNAME.long}`
    }

    let EXPLANATION = `[${escapeString(getFirstLine(flag.description), ':')}]`

    let MESSAGE = `${name}`
    let ACTION = ``
    if (flag.type === 'option' && flag.options && flag.options.length > 0) {
      ACTION = `(${flag.options.join(' ')})`
    } else if (flag.required) {
      ACTION = `( )`
    }

    let OPTARG = ``

    if (flag.type !== 'boolean') {
      OPTARG = `:${MESSAGE}:${ACTION}`
    }

    if (GROUP) {
      args.push(`"${GROUP}"${OPTSPEC}"${EXPLANATION}${OPTARG}"`)
    } else {
      args.push(`"${OPTSPEC}${EXPLANATION}${OPTARG}"`)
    }
  })

  return args
}

export function generateCompletionScriptForZsh({
  bin,
  commands,
}: Command['config']) {
  const scriptParts = [`#compdef _${bin} ${bin}`]

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

    if (args.length) {
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