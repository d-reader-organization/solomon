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
import { PhantomLedgerWalletAdapter } from 'wallet-adapter-wallets'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export const getWallets = (network: WalletAdapterNetwork) => [
	new PhantomWalletAdapter(),
	new TorusWalletAdapter(),
	new SolflareWalletAdapter({ network }),
	new GlowWalletAdapter(),
	new SolongWalletAdapter(),
	new PhantomLedgerWalletAdapter(),
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
