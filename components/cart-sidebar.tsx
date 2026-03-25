"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, Trash2, X, Heart, Clock, MessageSquare } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"

export function CartSidebar() {
  const {
    items,
    savedItems,
    recentlyViewed,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    getCartSummary,
    isOpen,
    setIsOpen,
  } = useCart()

  const router = useRouter()
  const [activeTab, setActiveTab] = useState("cart")
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null)

  if (!isOpen) return null

  const { subtotal, shipping, tax, total } = getCartSummary()

  const handleCheckout = () => {
    setIsOpen(false)
    router.push("/checkout")
  }

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Overlay for mobile */}
      <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />

      {/* Cart sidebar */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border lg:relative lg:w-80 lg:max-w-none">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>Shopping Cart</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-4">
                <TabsTrigger value="cart" className="text-xs">
                  Cart ({items.length})
                </TabsTrigger>
                <TabsTrigger value="saved" className="text-xs">
                  Saved ({savedItems.length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">
                  Recent
                </TabsTrigger>
              </TabsList>

              {/* Cart Tab */}
              <TabsContent value="cart" className="flex-1 flex flex-col mt-0">
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
                  {items.length > 0 && (
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCart}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  )}

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground mt-1">Add some medications to get started</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="border border-border rounded-lg p-3 space-y-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-muted-foreground text-xs">{item.category}</p>
                            <p className="text-primary font-medium text-sm">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => saveForLater(item.id)} className="text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedNotes(expandedNotes === item.id ? null : item.id)}
                              className="text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Notes
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>

                        {expandedNotes === item.id && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add special instructions or notes..."
                              value={item.notes || ""}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>

                {items.length > 0 && (
                  <CardFooter className="flex-shrink-0 flex-col space-y-4 border-t border-border">
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span className={shipping === 0 ? "text-indigo-600" : ""}>
                          {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                        <span>Total:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                      {shipping > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add ${(50 - subtotal).toFixed(2)} more for free shipping
                        </p>
                      )}
                    </div>
                    <Button className="w-full" size="lg" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                      Continue Shopping
                    </Button>
                  </CardFooter>
                )}
              </TabsContent>

              <TabsContent value="saved" className="flex-1 flex flex-col mt-0">
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
                  {savedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No saved items</p>
                      <p className="text-sm text-muted-foreground mt-1">Save items for later from your cart</p>
                    </div>
                  ) : (
                    savedItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">{item.category}</p>
                          <p className="text-primary font-medium text-sm">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button size="sm" onClick={() => moveToCart(item.id)} className="text-xs">
                            Add to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSavedItem(item.id)}
                            className="text-destructive hover:text-destructive text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </TabsContent>

              <TabsContent value="recent" className="flex-1 flex flex-col mt-0">
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
                  {recentlyViewed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No recent items</p>
                      <p className="text-sm text-muted-foreground mt-1">Items you view will appear here</p>
                    </div>
                  ) : (
                    recentlyViewed.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">{item.category}</p>
                          <p className="text-primary font-medium text-sm">${item.price.toFixed(2)}</p>
                        </div>
                        <Button size="sm" onClick={() => moveToCart(item.id)} className="text-xs">
                          Add to Cart
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </aside>
    </div>
  )
}
