import { createPublicClient, http, formatEther, type Address } from 'viem'
import { base } from 'viem/chains'

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export interface TransactionStats {
  totalGasFees: bigint
  totalNftPurchases: bigint
  totalNftSales: bigint
  gasFeeUsd: number
  nftPurchaseUsd: number
  nftSaleUsd: number
}

// Fetch historical ETH price at a specific timestamp
async function getEthPriceAtTime(timestamp: number): Promise<number> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${new Date(timestamp * 1000).toLocaleDateString('en-GB')}`
    )
    const data = await response.json()
    return data.market_data?.current_price?.usd || 0
  } catch (error) {
    console.error('[v0] Error fetching historical ETH price:', error)
    return 0
  }
}

// Fetch current ETH price
async function getCurrentEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    const data = await response.json()
    return data.ethereum?.usd || 0
  } catch (error) {
    console.error('[v0] Error fetching current ETH price:', error)
    return 0
  }
}

// Calculate transaction statistics for a wallet address
export async function calculateTransactionStats(
  address: Address,
  useCurrentPrice: boolean = false
): Promise<TransactionStats> {
  try {
    // Fetch transaction history from Base network
    // Note: In production, you would use a proper indexer like Alchemy or Etherscan API
    const blockNumber = await publicClient.getBlockNumber()
    
    let totalGasFees = BigInt(0)
    let totalNftPurchases = BigInt(0)
    let totalNftSales = BigInt(0)
    
    let gasFeeUsd = 0
    let nftPurchaseUsd = 0
    let nftSaleUsd = 0

    // For demo purposes, we'll use mock data
    // In production, you would fetch actual transaction history
    const mockGasFees = BigInt('1000000000000000') // 0.001 ETH
    const mockNftPurchases = BigInt('50000000000000000') // 0.05 ETH
    const mockNftSales = BigInt('100000000000000000') // 0.1 ETH

    totalGasFees = mockGasFees
    totalNftPurchases = mockNftPurchases
    totalNftSales = mockNftSales

    // Calculate USD values
    const ethPrice = useCurrentPrice 
      ? await getCurrentEthPrice()
      : await getEthPriceAtTime(Math.floor(Date.now() / 1000))

    gasFeeUsd = parseFloat(formatEther(totalGasFees)) * ethPrice
    nftPurchaseUsd = parseFloat(formatEther(totalNftPurchases)) * ethPrice
    nftSaleUsd = parseFloat(formatEther(totalNftSales)) * ethPrice

    return {
      totalGasFees,
      totalNftPurchases,
      totalNftSales,
      gasFeeUsd,
      nftPurchaseUsd,
      nftSaleUsd,
    }
  } catch (error) {
    console.error('[v0] Error calculating transaction stats:', error)
    return {
      totalGasFees: BigInt(0),
      totalNftPurchases: BigInt(0),
      totalNftSales: BigInt(0),
      gasFeeUsd: 0,
      nftPurchaseUsd: 0,
      nftSaleUsd: 0,
    }
  }
}
