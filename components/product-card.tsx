"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface Medication {
  id: number
  name: string
  category: string
  price: number
  image: string
  description: string
  inStock: boolean
}

interface ProductCardProps {
  medication: Medication
}

export function ProductCard({ medication }: ProductCardProps) {
  const { items, addItem, updateQuantity, addToRecentlyViewed } = useCart()

  const cartItem = items.find((item) => item.id === medication.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addItem({
      id: medication.id,
      name: medication.name,
      price: medication.price,
      image: medication.image,
      category: medication.category,
    })
  }

  const handleIncrement = () => {
    updateQuantity(medication.id, quantity + 1)
  }

  const handleDecrement = () => {
    updateQuantity(medication.id, quantity - 1)
  }

  const handleViewProduct = () => {
    addToRecentlyViewed({
      id: medication.id,
      name: medication.name,
      price: medication.price,
      image: medication.image,
      category: medication.category,
    })
  }

  return (
    <Card
      className="group relative overflow-hidden bg-white border-gray-200 hover:border-indigo-600/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleViewProduct}
    >
      {/* Image Header */}
      <CardHeader className="p-0 relative h-56 overflow-hidden bg-gray-50">
        <img
          src={medication.image || "/placeholder.svg"}
          alt={medication.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Category Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className="bg-indigo-600 text-white border-0 shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {medication.category}
          </Badge>
        </div>

        {/* Stock Status Overlay */}
        {!medication.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="bg-red-200 text-white text-base px-4 py-2 shadow-lg">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Stock Indicator - Top Left */}
        <div className="absolute top-3 left-3">
          <div className={`w-3 h-3 rounded-full ${medication.inStock ? 'bg-green-400 animate-pulse' : 'bg-red-400'} shadow-lg`}></div>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-6 space-y-4">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between">
          <CardTitle className="text-md font-bold text-black group-hover:text-indigo-600 transition-colors duration-200 leading-tight">
            {medication.name}
          </CardTitle>
          <div className="text-right">
            <div className="text-xl font-black text-indigo-600">${medication.price.toFixed(2)}</div>
            <Badge 
              variant={medication.inStock ? "default" : "destructive"} 
              className={`text-xs ${medication.inStock ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} mt-1`}
            >
              {medication.inStock ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {medication.description}
        </p>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="p-6 pt-0 bg-gray-50/50">
        {quantity > 0 ? (
          <div className="flex items-center justify-between w-full gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDecrement()
                }}
                className="h-10 w-10 text-black hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-l-lg"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 font-bold text-black bg-gray-50 min-w-[3rem] text-center">
                {quantity}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleIncrement()
                }}
                disabled={!medication.inStock}
                className="h-10 w-10 text-black hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-r-lg disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Buy Now Button */}
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Buy Now
            </Button>
          </div>
        ) : (
          <Button
  className="
    w-full 
    bg-indigo-600 hover:bg-indigo-700 
    disabled:bg-gray-400 disabled:cursor-not-allowed
    text-white font-semibold 
    py-3 px-4
    rounded-lg 
    transition-all duration-200 
    shadow-md hover:shadow-lg
    flex items-center justify-center
    min-h-[48px]
    text-sm sm:text-base
    group/button
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
  "
  onClick={(e) => {
    e.stopPropagation()
    handleAddToCart()
  }}
  disabled={!medication.inStock}
>
  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover/button:animate-bounce flex-shrink-0" />
  <span className="truncate">
    {medication.inStock ? 'Add to Cart' : 'Out of Stock'}
  </span>
</Button>
        )}
      </CardFooter>
    </Card>
  )
}