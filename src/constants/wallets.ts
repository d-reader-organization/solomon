/* eslint-disable import/no-extraneous-dependencies */
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { BitKeepWalletAdapter } from '@solana/wallet-adapter-bitkeep'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { SolongWalletAdapter } from '@solana/wallet-adapter-solong'
import { SolletWalletAdapter, SolletExtensionWalletAdapter } from '@solana/wallet-adapter-sollet'
import { phantomLedger } from './phantomLedgerAdapter'

export const getWallets = (network: WalletAdapterNetwork) => {
	if (typeof window === 'undefined') return []
	else
		return [
			new PhantomWalletAdapter(),
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
}

export const wallets = {
	[WalletAdapterNetwork.Mainnet]: getWallets(WalletAdapterNetwork.Mainnet),
	[WalletAdapterNetwork.Devnet]: getWallets(WalletAdapterNetwork.Devnet),
	[WalletAdapterNetwork.Testnet]: getWallets(WalletAdapterNetwork.Testnet),
}
