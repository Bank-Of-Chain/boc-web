/**
 *
 * @param {*} string
 * @param {*} leftEnd
 * @param {*} rightStart
 * @returns
 */
export const short = (string, leftEnd = 6, rightStart = 4) => {
  let displayAddress = string.substr(0, leftEnd)
  return (displayAddress += '...' + string.substr(-1 * rightStart))
}
