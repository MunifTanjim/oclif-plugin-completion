import { CompletionBase } from '../../base'
import { getInstructionsForBash } from '../../utils/bash'
import { getInstructionsForFish } from '../../utils/fish'
import { getInstructionsForZsh } from '../../utils/zsh'

export default class Completion extends CompletionBase {
  static description = 'Add shell completion'

  static args = []

  static flags = {
    ...CompletionBase.flags,
  }

  static examples = ['$ <%= config.bin %> completion --shell zsh']

  async run() {
    const { flags } = this.parse(Completion)
    const { bin } = this.config
    const shell = flags.shell

    let instructions: string[] = []

    if (shell === 'bash') {
      instructions = getInstructionsForBash({ bin, shell })
    }

    if (shell === 'fish') {
      instructions = getInstructionsForFish({ bin, shell })
    }

    if (shell === 'zsh') {
      instructions = getInstructionsForZsh({ bin, shell })
    }

    this.log(instructions.join('\n'))
  }
}
