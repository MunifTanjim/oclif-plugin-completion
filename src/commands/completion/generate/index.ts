import { CompletionBase } from '../../../base'
import { generateCompletionScriptForBash } from '../../../utils/bash'
import { generateCompletionScriptForFish } from '../../../utils/fish'
import { generateCompletionScriptForZsh } from '../../../utils/zsh'

export default class CompletionGenerate extends CompletionBase {
  static description = [
    `Generates completion script`,
    ``,
    `Run the "completion" command to see instructions about how to use the script generated by this command.`,
  ].join('\n')

  static args = []

  static flags = {
    ...CompletionBase.flags,
  }

  static examples = ['$ <%= config.bin %> completion:generate --shell zsh']

  async run() {
    const { flags } = this.parse(CompletionGenerate)
    const shell = flags.shell

    const aliases = this.aliases
    const { bin, commands } = this.config

    let scriptContent = ''

    if (shell === 'bash') {
      scriptContent = generateCompletionScriptForBash({
        bin,
        aliases,
        commands,
      })
    }

    if (shell === 'fish') {
      scriptContent = generateCompletionScriptForFish({
        bin,
        aliases,
        commands,
      })
    }

    if (shell === 'zsh') {
      scriptContent = generateCompletionScriptForZsh({
        bin,
        aliases,
        commands,
      })
    }

    this.log(scriptContent)
  }
}