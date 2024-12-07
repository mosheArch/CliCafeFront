'use client'

import React, { useState, useEffect, useRef } from 'react'
import TerminalLine from './TerminalLine'

const MENU = [
  { id: 1, name: 'Custom Coffee', price: 40 },
  { id: 2, name: 'Espresso', price: 25 },
  { id: 3, name: 'Cappuccino', price: 35 },
  { id: 4, name: 'Latte', price: 30 },
  { id: 5, name: 'Americano', price: 28 },
]

const CUSTOMIZATION_OPTIONS = {
  base: ['espresso', 'americano', 'latte'],
  milk: ['regular', 'skim', 'almond', 'soy', 'coconut'],
  extras: ['extra shot', 'vanilla', 'caramel', 'cinnamon'],
  size: ['small', 'medium', 'large']
}

interface OrderTerminalProps {
  onBack: () => void
}

const OrderTerminal: React.FC<OrderTerminalProps> = ({ onBack }) => {
  const [lines, setLines] = useState<string[]>(['Welcome to XoloRealm Coffee Order System. Type "menu" to see the options.'])
  const [currentInput, setCurrentInput] = useState('')
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number; customization?: string }[]>([])
  const [customizationStep, setCustomizationStep] = useState<string | null>(null)
  const [currentCustomization, setCurrentCustomization] = useState<Record<string, string>>({})
  const [terminalColor, setTerminalColor] = useState('green')
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const processCommand = (input: string) => {
    const [command, ...args] = input.toLowerCase().split(' ')

    if (customizationStep) {
      return handleCustomization(input)
    }

    switch (command) {
      case 'menu':
        return ['Menu:', ...MENU.map(item => `${item.id}. ${item.name} - $${item.price}`)]
      case 'add':
        const itemId = parseInt(args[0])
        const quantity = parseInt(args[1]) || 1
        const item = MENU.find(i => i.id === itemId)
        if (item) {
          if (item.id === 1) {
            setCustomizationStep('base')
            return ['Let\'s customize your coffee. First, choose the base:', ...CUSTOMIZATION_OPTIONS.base]
          } else {
            const newItem = { ...item, quantity }
            setCart(prev => [...prev, newItem])
            return [`Added ${quantity} ${item.name} to the cart`]
          }
        }
        return ['Product not found']
      case 'cart':
        if (cart.length === 0) return ['The cart is empty']
        return [
          'Cart:',
          ...cart.map(item => `${item.name} x${item.quantity} - $${item.price * item.quantity}${item.customization ? ` (${item.customization})` : ''}`),
          `Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}`
        ]
      case 'order':
        if (cart.length === 0) return ['The cart is empty']
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        setCart([])
        return [
          'Order placed successfully',
          `Total: $${total}`,
          'Your coffee will arrive in approximately 30 minutes'
        ]
      case 'help':
        return [
          'Available commands:',
          'menu - Show the menu',
          'add <id> <quantity> - Add a product to the cart',
          'cart - Show the cart contents',
          'order - Place the order',
          'help - Show this list of commands',
          'exit - Return to the main menu',
          'color <color> - Change the terminal color',
          '',
          'To customize your coffee, use "add 1" and follow the instructions.'
        ]
      case 'exit':
        onBack()
        return []
      case 'color':
        const newColor = args[0]
        if (['green', 'blue', 'red', 'yellow', 'purple'].includes(newColor)) {
          setTerminalColor(newColor)
          return [`Terminal color changed to ${newColor}`]
        } else {
          return ['Invalid color. Options: green, blue, red, yellow, purple']
        }
      default:
        return ['Unrecognized command. Type "help" to see available commands.']
    }
  }

  const handleCustomization = (input: string) => {
    if (!customizationStep) return ['Error: No coffee is being customized']

    const option = input.toLowerCase()
    if (!CUSTOMIZATION_OPTIONS[customizationStep as keyof typeof CUSTOMIZATION_OPTIONS].includes(option)) {
      return [`Invalid option. Please choose one of the following:`, ...CUSTOMIZATION_OPTIONS[customizationStep as keyof typeof CUSTOMIZATION_OPTIONS]]
    }

    setCurrentCustomization(prev => ({ ...prev, [customizationStep]: option }))

    switch (customizationStep) {
      case 'base':
        setCustomizationStep('milk')
        return ['Excellent. Now, choose the type of milk:', ...CUSTOMIZATION_OPTIONS.milk]
      case 'milk':
        setCustomizationStep('extras')
        return ['Perfect. Do you want any extras? (you can choose multiple, separated by comma, or "none"):', ...CUSTOMIZATION_OPTIONS.extras]
      case 'extras':
        setCustomizationStep('size')
        return ['Almost done. Lastly, choose the size:', ...CUSTOMIZATION_OPTIONS.size]
      case 'size':
        const customization = Object.values(currentCustomization).join(', ')
        const price = calculateCustomPrice(currentCustomization)
        const newItem = { id: 1, name: 'Custom Coffee', price, quantity: 1, customization }
        setCart(prev => [...prev, newItem])
        setCustomizationStep(null)
        setCurrentCustomization({})
        return [`Custom coffee added to cart: ${customization} - $${price}`]
      default:
        return ['Error in customization']
    }
  }

  const calculateCustomPrice = (customization: Record<string, string>): number => {
    let price = 40 // Base price
    if (customization.milk && ['almond', 'soy', 'coconut'].includes(customization.milk)) price += 10
    if (customization.extras && customization.extras !== 'none') {
      const extras = customization.extras.split(',')
      price += extras.length * 5
    }
    if (customization.size === 'large') price += 10
    else if (customization.size === 'medium') price += 5
    return price
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const fullCommand = `xolorealmcoffee@order:~$ ${currentInput}`
      setLines(prev => [...prev, fullCommand])
      const output = processCommand(currentInput)
      setLines(prev => [...prev, ...output])
      setCurrentInput('')
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1))
    } else if (e.key.length === 1) {
      setCurrentInput(prev => prev + e.key)
    }
  }

  return (
    <div className={`terminal-window w-full max-w-4xl`} style={{
      '--matrix-green': `var(--terminal-${terminalColor})`,
      color: `var(--terminal-${terminalColor})`
    } as React.CSSProperties}>
      <div className="terminal-header">
        <div className="flex">
          <div className="terminal-button terminal-close" onClick={onBack}></div>
          <div className="terminal-button terminal-minimize"></div>
          <div className="terminal-button terminal-maximize"></div>
        </div>
        <div className="terminal-title">XoloRealm Coffee Order Terminal</div>
        <div className="w-[68px]"></div>
      </div>
      <div
        ref={terminalRef}
        className="terminal-body"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {lines.map((line, index) => (
          <TerminalLine
            key={index}
            content={line}
            isCommand={line.includes('xolorealmcoffee@order')}
          />
        ))}
        <div className="terminal-line">
          <span className="terminal-prompt">
            xolorealmcoffee@order:~$&nbsp;
          </span>
          <span>{currentInput}</span>
          <span className="terminal-cursor"></span>
        </div>
      </div>
    </div>
  )
}

export default OrderTerminal

