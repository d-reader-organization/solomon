import {
	BitKeepWalletAdapter,
	GlowWalletAdapter,
	LedgerWalletAdapter,
	PhantomWalletAdapter,
	SafePalWalletAdapter,
	SolflareWalletAdapter,
	SolletExtensionWalletAdapter,
	SolletWalletAdapter,
	SolongWalletAdapter,
	TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { phantomLedger } from './phantomLedgerAdapter'

export const getWallets = (network: WalletAdapterNetwork) => [
	new PhantomWalletAdapter(),
	new TorusWalletAdapter(),
	new SolflareWalletAdapter({ network }),
	new GlowWalletAdapter(),
	new SolongWalletAdapter(),
	phantomLedger,
	new SafePalWalletAdapter(),
	new LedgerWalletAdapter(),
	new SolletWalletAdapter({ network }),
	new SolletExtensionWalletAdapter({ network }),
	new BitKeepWalletAdapter(),
]

export const wallets = {
	[WalletAdapterNetwork.Mainnet]: getWallets(WalletAdapterNetwork.Mainnet),
	[WalletAdapterNetwork.Devnet]: getWallets(WalletAdapterNetwork.Devnet),
	[WalletAdapterNetwork.Testnet]: getWallets(WalletAdapterNetwork.Testnet),
}
