import { defineChain, createPublicClient, http } from 'viem'
import { SDK } from '@somnia-chain/streams'

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] }, public: { http: ['https://dream-rpc.somnia.network'] } },
} as const)

// ✅ Somnia Mainnet Configuration
export const somniaMainnet = defineChain({
  id: 5031,
  name: 'Somnia Mainnet',
  network: 'somnia-mainnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { 
    default: { http: ['https://api.infra.mainnet.somnia.network'] }, 
    public: { http: ['https://api.infra.mainnet.somnia.network'] } 
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://mainnet.somnia.w3us.site' }
  }
} as const)

export const leaderboardSchema = 'uint64 timestamp, address user, uint256 score'

const publicClient = createPublicClient({
  chain: somniaMainnet,
  transport: http('https://api.infra.mainnet.somnia.network'),
})

export const sdk = new SDK({ public: publicClient })
export const sdsClient = sdk.streams
