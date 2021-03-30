import { CompletionBase } from '../../base'
import { getInstructionsForBash } from '../../utils/bash'
import { getInstructionsForFish } from '../../utils/fish'
import { getInstructionsForZsh } from '../../utils/zsh'

export default class Completion extends CompletionBase {
  static description = [
    `Generate shell completion script`,
    ``,
    `Run this command to see instructions for your shell.`,
  ].join('\n')

  static args = []

  static flags = {
    ...CompletionBase.flags,
  }

  static examples = ['$ <%= config.bin %> completion --shell zsh']

  async run() {
    const { flags } = this.parse(Completion)
    const shell = flags.shell

    const aliases = this.aliases
    const { bin } = this.config

    let instructions: string[] = []

    if (shell === 'bash') {
      instructions = getInstructionsForBash({ bin, shell, aliases })
    }

    if (shell === 'fish') {
      instructions = getInstructionsForFish({ bin, shell, aliases })
    }

    if (shell === 'zsh') {
      instructions = getInstructionsForZsh({ bin, shell })
    }

    this.log(instructions.join('\n'))
  }
}
