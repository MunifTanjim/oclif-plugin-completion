import { flags } from '@oclif/command'
import { CompletionBase } from '../../../base'
import { generateCompletionAliasScriptForBash } from '../../../utils/bash'
import { generateCompletionAliasScriptForFish } from '../../../utils/fish'

export default class CompletionGenerateAlias extends CompletionBase {
  static description = [
    `Generates completion script for alias`,
    ``,
    `This needs the completion script for the main command to be present.`,
    ``,
    `Check the "completion:generate" command.`,
  ].join('\n')

  static args = [
    {
      name: 'ALIAS',
      required: true,
      description: 'name of the alias',
    },
  ]

  static flags = {
    ...CompletionBase.flags,
    shell: flags.string({
      ...CompletionBase.flags.shell,
      options: CompletionBase.flags.shell.options?.filter(
        (shell) => shell !== 'zsh'
      ),
      required: true,
    }),
  }

  async run() {
    const { args, flags } = this.parse(CompletionGenerateAlias)
    const shell = flags.shell

    const { bin } = this.config
    const alias = args.ALIAS

    if (bin === alias) {
      return this.error(`ALIAS can not be ${bin}`, { exit: 1 })
    }

    let scriptContent = ''

    if (shell === 'bash') {
      scriptContent = generateCompletionAliasScriptForBash({ bin, alias })
    }

    if (shell === 'fish') {
      scriptContent = generateCompletionAliasScriptForFish({ bin, alias })
    }

    if (shell === 'zsh') {
      this.error(`not needed for ${shell}`, { exit: 1 })
    }

    this.log(scriptContent)
  }
}
