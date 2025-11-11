import { defineChain, createPublicClient, http } from 'viem'
import { SDK } from '@somnia-chain/streams'

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] }, public: { http: ['https://dream-rpc.somnia.network'] } },
} as const)

export const leaderboardSchema = 'uint64 timestamp, address user, uint256 score'

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network'),
})

export const sdk = new SDK({ public: publicClient })
export const sdsClient = sdk.streams
