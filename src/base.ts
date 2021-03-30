import Command, { flags } from '@oclif/command'
import { basename } from 'path'
import { getBinAliases } from './utils/get-bin-aliases'

export abstract class CompletionBase extends Command {
  aliases: string[] = []

  static flags = {
    shell: flags.string({
      description: 'Name of shell',
      char: 's',
      env: 'SHELL',
      parse: (shell) => basename(shell),
      options: ['bash', 'fish', 'zsh'],
      required: true,
    }),
  }

  async init() {
    this.aliases.push(
      ...getBinAliases({
        bin: this.config.bin,
        // this is okay, `@oclif/config` package's `PJSON.CLI` type is too restrictive
        // @ts-expect-error
        pjson: this.config.pjson,
      })
    )
  }
}
