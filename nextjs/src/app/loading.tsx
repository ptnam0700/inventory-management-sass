import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}