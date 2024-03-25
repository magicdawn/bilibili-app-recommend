export function minmax(value: number, min: number, max: number) {
  if (value < min) {
    return min
  } else if (value > max) {
    return max
  } else {
    return value
  }
}
