"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  quantity: number
  notes?: string
  addedAt: Date
}

export interface SavedItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  savedAt: Date
}

interface CartContextType {
  items: CartItem[]
  savedItems: SavedItem[]
  recentlyViewed: SavedItem[]
  addItem: (item: Omit<CartItem, "quantity" | "addedAt">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  updateNotes: (id: number, notes: string) => void
  clearCart: () => void
  saveForLater: (id: number) => void
  moveToCart: (id: number) => void
  removeSavedItem: (id: number) => void
  addToRecentlyViewed: (item: Omit<SavedItem, "savedAt">) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getCartSummary: () => { subtotal: number; shipping: number; tax: number; total: number }
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<SavedItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("medication-cart")
    const savedForLater = localStorage.getItem("medication-saved")
    const recentItems = localStorage.getItem("medication-recent")

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Convert addedAt strings back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }))
        setItems(cartWithDates)
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error)
      }
    }

    if (savedForLater) {
      try {
        const parsedSaved = JSON.parse(savedForLater)
        const savedWithDates = parsedSaved.map((item: any) => ({
          ...item,
          savedAt: new Date(item.savedAt),
        }))
        setSavedItems(savedWithDates)
      } catch (error) {
        console.error("Failed to load saved items from localStorage:", error)
      }
    }

    if (recentItems) {
      try {
        const parsedRecent = JSON.parse(recentItems)
        const recentWithDates = parsedRecent.map((item: any) => ({
          ...item,
          savedAt: new Date(item.savedAt),
        }))
        setRecentlyViewed(recentWithDates)
      } catch (error) {
        console.error("Failed to load recent items from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("medication-cart", JSON.stringify(items))
  }, [items])

  // Save savedItems to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medication-saved", JSON.stringify(savedItems))
  }, [savedItems])

  // Save recentlyViewed to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medication-recent", JSON.stringify(recentlyViewed))
  }, [recentlyViewed])

  const addItem = (newItem: Omit<CartItem, "quantity" | "addedAt">) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id)
      if (existingItem) {
        toast({
          title: "Item updated",
          description: `${newItem.name} quantity increased to ${existingItem.quantity + 1}`,
        })
        return prev.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      toast({
        title: "Added to cart",
        description: `${newItem.name} has been added to your cart`,
      })
      return [...prev, { ...newItem, quantity: 1, addedAt: new Date() }]
    })
  }

  const removeItem = (id: number) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      toast({
        title: "Item removed",
        description: `${item.name} has been removed from your cart`,
      })
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const updateNotes = (id: number, notes: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const clearCart = () => {
    if (items.length > 0) {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })
    }
    setItems([])
  }

  const saveForLater = (id: number) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      const savedItem: SavedItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        savedAt: new Date(),
      }
      setSavedItems((prev) => {
        const exists = prev.find((saved) => saved.id === id)
        if (exists) return prev
        return [...prev, savedItem]
      })
      removeItem(id)
      toast({
        title: "Saved for later",
        description: `${item.name} has been saved for later`,
      })
    }
  }

  const moveToCart = (id: number) => {
    const savedItem = savedItems.find((item) => item.id === id)
    if (savedItem) {
      addItem(savedItem)
      removeSavedItem(id)
    }
  }

  const removeSavedItem = (id: number) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addToRecentlyViewed = (item: Omit<SavedItem, "savedAt">) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((recent) => recent.id !== item.id)
      const newItem = { ...item, savedAt: new Date() }
      return [newItem, ...filtered].slice(0, 10) // Keep only last 10 items
    })
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartSummary = () => {
    const subtotal = getTotalPrice()
    const shipping = subtotal > 50 ? 0 : 5.99 // Free shipping over $50
    const tax = subtotal * 0.08 // 8% tax rate
    const total = subtotal + shipping + tax

    return { subtotal, shipping, tax, total }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        recentlyViewed,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        addToRecentlyViewed,
        getTotalPrice,
        getTotalItems,
        getCartSummary,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
