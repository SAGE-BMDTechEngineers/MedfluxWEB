"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [orderNumber] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase())

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-indigo-600">Order Confirmed!</CardTitle>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-xl font-bold text-primary">#{orderNumber}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm">Confirmation Email</h3>
                  <p className="text-xs text-muted-foreground">Sent to your email</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm">Processing</h3>
                  <p className="text-xs text-muted-foreground">1-2 business days</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm">Delivery</h3>
                  <p className="text-xs text-muted-foreground">3-5 business days</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  We will send you tracking information once your order ships.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
                    Continue Shopping
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Track Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
