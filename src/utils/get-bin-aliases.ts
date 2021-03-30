export function getBinAliases({
  bin,
  pjson,
}: {
  bin: string
  pjson: { bin?: { [name: string]: string } }
}): string[] {
  const aliases: string[] = []

  if (!pjson.bin) {
    return aliases
  }

  const binPath = pjson.bin[bin]

  for (const [name, path] of Object.entries(pjson.bin)) {
    if (name !== bin && path === binPath) {
      aliases.push(name)
    }
  }

  return aliases
}
