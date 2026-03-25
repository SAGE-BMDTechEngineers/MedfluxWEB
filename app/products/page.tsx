"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Menu, Filter, SortAsc } from "lucide-react"
import { CartProvider, useCart } from "@/contexts/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { ProductCard } from "@/components/product-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Toaster } from "@/components/toaster"

// Mock medication data
const medications = [
  {
    id: 1,
    name: "Aspirin 325mg",
    category: "Pain Relief",
    price: 12.99,
    image: "/aspirin-medication-bottle.png",
    description: "Fast-acting pain relief tablets",
    inStock: true,
  },
  {
    id: 2,
    name: "Ibuprofen 200mg",
    category: "Pain Relief",
    price: 15.49,
    image: "/ibuprofen-medication-bottle.png",
    description: "Anti-inflammatory pain reliever",
    inStock: true,
  },
  {
    id: 3,
    name: "Vitamin D3 1000IU",
    category: "Vitamins",
    price: 18.99,
    image: "/multivitamin-supplement-bottle.png",
    description: "Essential vitamin supplement",
    inStock: true,
  },
  {
    id: 4,
    name: "Multivitamin Complex",
    category: "Vitamins",
    price: 24.99,
    image: "/multivitamin-supplement-bottle.png",
    description: "Complete daily vitamin formula",
    inStock: true,
  },
  {
    id: 5,
    name: "Cough Syrup",
    category: "Cold & Flu",
    price: 9.99,
    image: "/cough-syrup-medicine-bottle.png",
    description: "Soothing cough relief syrup",
    inStock: false,
  },
  {
    id: 6,
    name: "Allergy Relief 24hr",
    category: "Allergy",
    price: 21.99,
    image: "/cough-syrup-medicine-bottle.png",
    description: "24-hour allergy protection",
    inStock: true,
  },
]

const categories = ["All", "Pain Relief", "Vitamins", "Cold & Flu", "Allergy", "Prescription"]

function MedicationWebsiteContent() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "price" | "category">("name")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getTotalItems, setIsOpen } = useCart()

  const filteredAndSortedMedications = useMemo(() => {
    const filtered = medications.filter((med) => {
      const matchesCategory = selectedCategory === "All" || med.category === selectedCategory
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    // Sort medications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "category":
          return a.category.localeCompare(b.category)
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [selectedCategory, searchTerm, sortBy])

  const handleSearch = (value: string) => {
    setIsLoading(true)
    setSearchTerm(value)
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <div className="min-h-screen bg-background mb-36  mt-28 md:mt-44">
      {/* Header */}
      <header className="">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
             
            </div>

            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative hover:bg-primary/10 transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2  -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <aside className={`lg:w-64 ${isMobileMenuOpen ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start transition-all hover:translate-x-1"
                    onClick={() => {
                      setSelectedCategory(category)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    {category}
                    {category !== "All" && (
                      <Badge variant="secondary" className="ml-auto">
                        {medications.filter((med) => med.category === category).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedCategory === "All" ? "All Medications" : selectedCategory}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredAndSortedMedications.length} products found
                    {searchTerm && ` for "${searchTerm}"`}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <SortAsc className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "price" | "category")}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="category">Sort by Category</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-muted-foreground">Searching medications...</span>
              </div>
            ) : filteredAndSortedMedications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No medications found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `No results for "${searchTerm}". Try adjusting your search.`
                    : "No medications available in this category."}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => handleSearch("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedMedications.map((medication, index) => (
                  <div
                    key={medication.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard medication={medication} />
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Cart Sidebar */}
          <CartSidebar />
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default function MedicationWebsite() {
  return (
    <CartProvider>
      <MedicationWebsiteContent />
    </CartProvider>
  )
}
