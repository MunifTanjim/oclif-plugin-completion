export function template(
  literals: TemplateStringsArray,
  ...keys: Array<number | string>
) {
  return (
    values: Array<number | string> | { [key: string]: number | string }
  ): string => {
    const dict: Record<string, number | string> = Array.isArray(values)
      ? values.reduce((dict: Record<string, number | string>, value, index) => {
          dict[index] = value
          return dict
        }, {})
      : values

    const parts = keys.reduce<string[]>((parts, key, index) => {
      const value = `${dict[key]}`
      parts.push(literals[index], value)
      return parts
    }, [])

    parts.push(literals[literals.length - 1])

    return parts.join('')
  }
}

export const getFirstLine = (string = ''): string => {
  return string.split('\n')[0]
}
