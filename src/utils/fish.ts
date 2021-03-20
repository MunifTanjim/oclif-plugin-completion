import type { Command } from '@oclif/command'
import { getFirstLine } from './template'

export function generateCompletionScriptForFish({
  bin,
  commands,
}: Command['config']) {
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
      } -d '${getFirstLine(command.description)}'`
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
        flagPart += ` -d "${getFirstLine(flag.description)}"`
      }

      commandParts.push(flagPart)
    }

    scriptParts.push(commandParts.join('\n'))
  }

  return scriptParts.join('\n'.repeat(2))
}

export function getInstructionsForFish({
  bin,
  shell,
}: {
  bin: string
  shell: string
}): string[] {
  const scriptName = `${bin}.fish`

  const lines = [
    `Running the following command will generate the completion script for ${shell} shell:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} > ${scriptName}`,
    ``,
    `You need to put that "${scriptName}" file in one of the directories present in "$fish_complete_path" environment variable:`,
    ``,
    `  $ echo $fish_complete_path`,
    ``,
    `Usually this should work:`,
    ``,
    `  $ ${bin} completion:generate --shell=${shell} | tee ~/.config/fish/completions/${scriptName}`,
    ``,
    `For more info, visit: https://www.npmjs.com/package/oclif-plugin-completion#${shell}`,
    ``,
    `Enjoy!`,
  ]
  return lines
}
