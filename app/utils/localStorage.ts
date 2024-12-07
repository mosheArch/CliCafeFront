export function saveCart(cart: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
}

export function loadCart(): any {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  }
  return []
}

