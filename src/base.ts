import Command, { flags } from '@oclif/command'
import { basename } from 'path'

export abstract class CompletionBase extends Command {
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
}
