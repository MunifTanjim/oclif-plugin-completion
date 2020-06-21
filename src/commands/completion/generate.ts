import { CompletionBase } from '../../base'
import { generateCompletionScriptForBash } from '../../utils/bash'
import { generateCompletionScriptForFish } from '../../utils/fish'
import { generateCompletionScriptForZsh } from '../../utils/zsh'

export default class CompletionGenerate extends CompletionBase {
  static description = 'generates completion script'

  static args = []

  static flags = {
    ...CompletionBase.flags,
  }

  static examples = ['$ <%= config.bin %> completion:generate --shell zsh']

  async run() {
    const { flags } = this.parse(CompletionGenerate)
    const shell = flags.shell

    let scriptContent = ''

    if (shell === 'bash') {
      scriptContent = generateCompletionScriptForBash(this.config)
    }

    if (shell === 'fish') {
      scriptContent = generateCompletionScriptForFish(this.config)
    }

    if (shell === 'zsh') {
      scriptContent = generateCompletionScriptForZsh(this.config)
    }

    this.log(scriptContent)
  }
}
