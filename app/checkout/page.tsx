"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Truck, MapPin, Check } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/toaster"

interface CheckoutData {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
  sameAsBilling: boolean
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  specialInstructions: string
}

const steps = [
  { id: 1, name: "Information", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Review", icon: Check },
]

export default function CheckoutPage() {
  const { items, getCartSummary, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState<CheckoutData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    sameAsBilling: true,
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    specialInstructions: "",
  })

  const [errors, setErrors] = useState<Partial<CheckoutData>>({})

  const { subtotal, shipping, tax, total } = getCartSummary()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some items to your cart before checking out.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const updateFormData = (field: keyof CheckoutData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CheckoutData> = {}

    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.phone) newErrors.phone = "Phone is required"
      if (!formData.address) newErrors.address = "Address is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.state) newErrors.state = "State is required"
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required"
    }

    if (step === 2) {
      if (formData.paymentMethod === "card") {
        if (!formData.cardNumber) newErrors.cardNumber = "Card number is required"
        if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required"
        if (!formData.cvv) newErrors.cvv = "CVV is required"
        if (!formData.cardName) newErrors.cardName = "Cardholder name is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      toast({
        title: "Step completed",
        description: `Proceeding to ${steps[currentStep]?.name || "next step"}`,
      })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Order placed successfully!",
        description: "Redirecting to confirmation page...",
      })

      // Clear cart and redirect to success page
      clearCart()
      setTimeout(() => {
        router.push("/checkout/success")
      }, 1000)
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please check your payment information and try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground scale-110"
                      : "border-muted-foreground text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium transition-colors ${
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 && "Shipping Information"}
                    {currentStep === 2 && "Payment Method"}
                    {currentStep === 3 && "Review Order"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            className={errors.phone ? "border-destructive" : ""}
                          />
                          {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            className={errors.firstName ? "border-destructive" : ""}
                          />
                          {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            className={errors.lastName ? "border-destructive" : ""}
                          />
                          {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          className={errors.address ? "border-destructive" : ""}
                        />
                        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => updateFormData("city", e.target.value)}
                            className={errors.city ? "border-destructive" : ""}
                          />
                          {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => updateFormData("state", e.target.value)}
                            className={errors.state ? "border-destructive" : ""}
                          />
                          {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => updateFormData("zipCode", e.target.value)}
                            className={errors.zipCode ? "border-destructive" : ""}
                          />
                          {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                        <Textarea
                          id="specialInstructions"
                          placeholder="Any special delivery instructions..."
                          value={formData.specialInstructions}
                          onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) => updateFormData("paymentMethod", value)}
                      >
                        <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex-1">
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-2" />
                              Credit/Debit Card
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.paymentMethod === "card" && (
                        <div className="space-y-4 p-4 border border-border rounded-lg">
                          <div>
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input
                              id="cardName"
                              value={formData.cardName}
                              onChange={(e) => updateFormData("cardName", e.target.value)}
                              className={errors.cardName ? "border-destructive" : ""}
                            />
                            {errors.cardName && <p className="text-sm text-destructive mt-1">{errors.cardName}</p>}
                          </div>

                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={(e) => updateFormData("cardNumber", e.target.value)}
                              className={errors.cardNumber ? "border-destructive" : ""}
                            />
                            {errors.cardNumber && <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={(e) => updateFormData("expiryDate", e.target.value)}
                                className={errors.expiryDate ? "border-destructive" : ""}
                              />
                              {errors.expiryDate && (
                                <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => updateFormData("cvv", e.target.value)}
                                className={errors.cvv ? "border-destructive" : ""}
                              />
                              {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Information</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p>{formData.address}</p>
                          <p>
                            {formData.city}, {formData.state} {formData.zipCode}
                          </p>
                          <p>{formData.phone}</p>
                          <p>{formData.email}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Credit/Debit Card ending in {formData.cardNumber.slice(-4)}</p>
                        </div>
                      </div>

                      {formData.specialInstructions && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-2">Special Instructions</h3>
                            <p className="text-sm text-muted-foreground">{formData.specialInstructions}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="hover:bg-primary/10 bg-transparent"
                    >
                      Back
                    </Button>
                    {currentStep < 3 ? (
                      <Button onClick={handleNext} className="hover:bg-primary/90">
                        Continue
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isProcessing} className="hover:bg-primary/90">
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
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
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
