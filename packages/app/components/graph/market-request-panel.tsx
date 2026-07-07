"use client"

import { type FormEvent, useMemo, useState } from "react"
import { AlertCircle, DownloadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface MarketGraphLoadRequest {
  protocol: string
  chainId: string
  marketId: string
  llm: string
}

interface MarketRequestPanelProps {
  loading: boolean
  error: string | null
  onLoad: (request: MarketGraphLoadRequest) => void
}

const PROTOCOLS = [
  {
    id: "spark",
    label: "SparkLend",
    chains: [{ id: "1", label: "Ethereum" }],
    defaultMarketId: "USDC",
  },
  {
    id: "aave-v3",
    label: "Aave V3",
    chains: [
      { id: "1", label: "Ethereum" },
      { id: "10", label: "OP Mainnet" },
      { id: "137", label: "Polygon" },
      { id: "42161", label: "Arbitrum One" },
      { id: "8453", label: "Base" },
    ],
    defaultMarketId: "",
  },
  {
    id: "morpho",
    label: "Morpho",
    chains: [
      { id: "1", label: "Ethereum" },
      { id: "8453", label: "Base" },
      { id: "42161", label: "Arbitrum One" },
      { id: "137", label: "Polygon" },
      { id: "130", label: "Unichain" },
      { id: "10", label: "OP Mainnet" },
    ],
    defaultMarketId: "",
  },
  {
    id: "maple",
    label: "Maple",
    chains: [{ id: "1", label: "Ethereum" }],
    defaultMarketId: "",
  },
]

export function MarketRequestPanel({ loading, error, onLoad }: MarketRequestPanelProps) {
  const [protocol, setProtocol] = useState(PROTOCOLS[0].id)
  const [chainId, setChainId] = useState(PROTOCOLS[0].chains[0].id)
  const [marketId, setMarketId] = useState(PROTOCOLS[0].defaultMarketId)
  const [llm, setLlm] = useState("openai")

  const selectedProtocol = useMemo(
    () => PROTOCOLS.find((item) => item.id === protocol) ?? PROTOCOLS[0],
    [protocol],
  )

  const handleProtocolChange = (nextProtocol: string) => {
    const selected = PROTOCOLS.find((item) => item.id === nextProtocol) ?? PROTOCOLS[0]
    setProtocol(selected.id)
    setChainId(selected.chains[0].id)
    setMarketId(selected.defaultMarketId)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLoad({ protocol, chainId, marketId, llm })
  }

  return (
    <form className="flex shrink-0 flex-col gap-3" onSubmit={handleSubmit}>
      <h2 className="text-sm font-semibold text-card-foreground">Market graph</h2>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Protocol
          <select
            value={protocol}
            onChange={(event) => handleProtocolChange(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
          >
            {PROTOCOLS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Chain
          <select
            value={chainId}
            onChange={(event) => setChainId(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
          >
            {selectedProtocol.chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        Market address
        <input
          value={marketId}
          onChange={(event) => setMarketId(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground"
          placeholder="0x..."
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        LLM
        <select
          value={llm}
          onChange={(event) => setLlm(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
        >
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </label>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <Button type="submit" disabled={loading || !marketId.trim()} className="gap-1.5">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading
          </>
        ) : (
          <>
            <DownloadCloud className="h-4 w-4" /> Load graph
          </>
        )}
      </Button>
    </form>
  )
}
