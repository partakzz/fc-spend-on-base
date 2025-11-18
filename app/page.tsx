'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatRow } from '@/components/stat-row'
import { calculateTransactionStats, type TransactionStats } from '@/lib/transaction-utils'
import { Spinner } from '@/components/ui/spinner'
import { Wallet } from 'lucide-react'

declare global {
  interface Window {
    frame?: {
      sdk: {
        actions: {
          ready: (opts?: { disableSplash?: boolean }) => void
        }
      }
    }
  }
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [useCurrentPrice, setUseCurrentPrice] = useState(false)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize Farcaster Frame SDK and handle splash screen
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 20
    
    const initFrame = () => {
      attempts++
      
      if (window.frame?.sdk) {
        // Frame SDK is ready
        console.log('[v0] Farcaster Frame SDK initialized')
        window.frame.sdk.actions.ready()
        // Give a brief moment for any initial rendering, then remove splash
        setTimeout(() => {
          setIsInitializing(false)
        }, 300)
      } else if (attempts < maxAttempts) {
        // Keep checking for the SDK
        setTimeout(initFrame, 100)
      } else {
        // Not in a frame or SDK not available, proceed anyway
        console.log('[v0] Not running in Farcaster frame or SDK not available')
        setIsInitializing(false)
      }
    }

    initFrame()
  }, [])

  // Fetch transaction stats when wallet is connected or mode changes
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true)
      calculateTransactionStats(address, useCurrentPrice)
        .then(setStats)
        .finally(() => setIsLoading(false))
    }
  }, [isConnected, address, useCurrentPrice])

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected') || connectors[0]
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  const togglePriceMode = () => {
    setUseCurrentPrice(!useCurrentPrice)
  }

  // Show minimal splash screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-20 h-20 rounded-full bg-primary/30" />
            </div>
            <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">You Spend</h1>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-6 pt-12 max-w-md mx-auto w-full">
      {/* Top Center Title */}
      <h1 className="text-2xl font-bold mb-8 tracking-tight">You Spend</h1>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-6 rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Connect your wallet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              See your spending history on Base Network
            </p>
          </div>
          <Button 
            onClick={handleConnect}
            size="lg"
            className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={togglePriceMode}
              variant="secondary"
              className="min-w-[160px] font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {useCurrentPrice ? 'In USD now' : 'In USD at time'}
            </Button>
          </div>

          {/* Main Block */}
          <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm shadow-xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Calculating stats...</p>
              </div>
            ) : stats ? (
              <div className="divide-y divide-border">
                <StatRow
                  label="Gas Fees Spent"
                  ethAmount={stats.totalGasFees}
                  usdAmount={stats.gasFeeUsd}
                />
                <StatRow
                  label="NFT Purchases"
                  ethAmount={stats.totalNftPurchases}
                  usdAmount={stats.nftPurchaseUsd}
                />
                <StatRow
                  label="NFT Sales Earnings"
                  ethAmount={stats.totalNftSales}
                  usdAmount={stats.nftSaleUsd}
                  isPositive={true}
                />
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                Unable to load data
              </div>
            )}
          </Card>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={() => disconnect()}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
