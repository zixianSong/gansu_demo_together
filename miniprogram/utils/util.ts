export const formatPrice = (price: number): string => `¥${price}`

export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 300
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
