import type { Command } from '@oclif/command'
import { escapeString, getFirstLine } from './template'

export function generateCompletionScriptForFish({
  bin,
  aliases,
  commands,
}: Pick<Command['config'], 'bin' | 'commands'> & { aliases: string[] }) {
  const scriptParts: string[] = []

  scriptParts.push(`set -l seen __fish_seen_subcommand_from`)

  scriptParts.push(
    `set -l commands ${commands.map((command) => command.id).join(' ')}`
  )

  for (const command of commands) {
    if (command.hidden) {
      continue
    }

    const commandParts: string[] = []

    commandParts.push(
      `complete -c ${bin} -n "not $seen $commands" -f -a ${
        command.id
      } -d '${escapeString(getFirstLine(command.description), "'")}'`
    )

    for (const [name, flag] of Object.entries(command.flags)) {
      if (flag.hidden) {
        continue
      }

      let flagPart = `complete -c ${bin} -n "$seen ${command.id}" -l ${name}`

      if (flag.char) {
        flagPart += ` -s ${flag.char}`
      }

      if (flag.type === 'option') {
        if (flag.options) {
          flagPart += ` -x -a "${flag.options.join(' ')}"`
        } else {
          flagPart += ` -r`
        }
      }

      if (flag.description) {
        flagPart += ` -d '${escapeString(getFirstLine(flag.description), "'")}'`
      }

      commandParts.push(flagPart)
    }

    scriptParts.push(commandParts.join('\n'))
  }

  scriptParts.push(
    aliases.map((alias) => `complete -c ${alias} -w ${bin}`).join('\n')
  )

  return scriptParts.join('\n'.repeat(2))
}

export function generateCompletionAliasScriptForFish({
  bin,
  alias,
}: {
  bin: string
  alias: string
}) {
  const scriptParts: string[] = []

  scriptParts.push(`complete -c ${alias} -w ${bin}`)

  return scriptParts.join('\n'.repeat(2))
}

export function getInstructionsForFish({
  bin,
  shell,
  aliases,
}: {
  bin: string
  shell: string
  aliases: string[]
}): string[] {
  const scriptName = (name: string) => `${name}.fish`

  const lines = [
    `Running the following command will generate the completion script for ${shell} shell:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} > ${scriptName(bin)}`,
  ]

  lines.push(
    ``,
    `You need to put that "${scriptName(
      bin
    )}" file in one of the directories present in "$fish_complete_path" environment variable:`,
    ``,
    `  $ echo $fish_complete_path`,
    ``,
    `Usually this should work:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} | tee ~/.config/fish/completions/${scriptName(
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
      } | tee ~/.config/fish/completions/${scriptName(aliases[0])}`
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
