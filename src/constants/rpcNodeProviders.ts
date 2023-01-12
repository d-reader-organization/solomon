import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export interface RpcNodeProvider {
	name: string
	endpoint: string
}

const mainnetRpcNodeProviders: RpcNodeProvider[] = [
	{
		name: 'Ankr',
		endpoint: 'https://rpc.ankr.com/solana',
	},
	{
		name: 'Holaplex',
		endpoint: 'https://holaplex.rpcpool.com',
	},
	{
		name: 'Metaplex',
		endpoint: 'https://api.metaplex.solana.com',
	},
	{
		name: 'Solana',
		endpoint: 'https://api.mainnet-beta.solana.com',
	},
	{
		name: 'SolPatrol',
		endpoint: 'https://rpc.solpatrol.io',
	},
	{
		name: 'GenesysGo',
		endpoint: 'https://ssc-dao.genesysgo.net',
	},
	{
		name: 'Serum',
		endpoint: 'https://solana-api.projectserum.com',
	},
]

const devnetRpcNodeProviders: RpcNodeProvider[] = [
	{
		name: 'Ankr',
		endpoint: 'https://rpc.ankr.com/solana',
	},
	{
		name: 'Solana',
		endpoint: 'https://api.devnet.solana.com',
	},
	{
		name: 'GenesysGo',
		endpoint: 'https://devnet.genesysgo.net',
	},
	{
		name: 'Serum',
		endpoint: 'https://solana-devnet-rpc.allthatnode.com',
	},
]

const testnetRpcNodeProviders: RpcNodeProvider[] = [
	{
		name: 'Solana',
		endpoint: 'https://api.testnet.solana.com',
	},
]

export const getRpcNodeProviders = (network: WalletAdapterNetwork) => {
	switch (network) {
		case WalletAdapterNetwork.Mainnet:
			return mainnetRpcNodeProviders
		case WalletAdapterNetwork.Devnet:
			return devnetRpcNodeProviders
		case WalletAdapterNetwork.Testnet:
			return testnetRpcNodeProviders
		default:
			return []
	}
}

export const rpcNodeProviders = {
	[WalletAdapterNetwork.Mainnet]: mainnetRpcNodeProviders,
	[WalletAdapterNetwork.Devnet]: devnetRpcNodeProviders,
	[WalletAdapterNetwork.Testnet]: testnetRpcNodeProviders,
}
