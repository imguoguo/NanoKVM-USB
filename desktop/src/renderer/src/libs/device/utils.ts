export function setBit(number: number, bitPosition: number, value: boolean): number {
  if (value) {
    return number | (1 << bitPosition)
  } else {
    return number & ~(1 << bitPosition)
  }
}

export function intToByte(value: number): number {
  if (value < -128 || value > 127) {
    throw new Error('value must be in range -128 to 127 for a signed byte')
  }
  return (value + 256) % 256
}
