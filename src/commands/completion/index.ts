import { CompletionBase } from '../../base'

export default class Completion extends CompletionBase {
  static description = 'completion plugin'

  static args = []

  static flags = {
    ...CompletionBase.flags,
  }

  static examples = ['$ <%= config.bin %> completion --shell zsh']

  async run() {
    const { flags } = this.parse(Completion)
    const shell = flags.shell

    this.log(
      [
        `Run the following command to generate completion script for ${shell} shell:`,
        `$ ${this.config.bin} completion:generate --shell=${shell}`,
      ].join('\n')
    )
  }
}
