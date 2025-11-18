import { formatEther } from 'viem'
import { cn } from '@/lib/utils'

interface StatRowProps {
  label: string
  ethAmount: bigint
  usdAmount: number
  isPositive?: boolean
}

export function StatRow({ label, ethAmount, usdAmount, isPositive = false }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-5 px-5 hover:bg-muted/20 transition-colors">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-col items-end gap-0.5">
        <span className={cn(
          "text-base font-semibold tabular-nums tracking-tight",
          isPositive ? "text-green-500" : "text-foreground"
        )}>
          {isPositive ? '+' : ''}{parseFloat(formatEther(ethAmount)).toFixed(4)} ETH
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
