import { createFileRoute, Link } from '@tanstack/react-router'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/offline')({
  component: OfflinePage,
})

function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">You're currently offline</h1>
      <p className="mb-8 max-w-xs text-muted-foreground">
        EggRateToday requires an internet connection for live data. 
        Previously available information may be shown where safe.
      </p>
      
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button 
          onClick={() => window.location.reload()}
          className="w-full gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link to="/">
          <Button variant="outline" className="w-full">
            Go to Home
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs text-muted-foreground italic">
        * Never display old data as today's live rate.
      </div>
    </div>
  )
}
