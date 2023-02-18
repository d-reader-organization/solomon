/* eslint-disable import/no-extraneous-dependencies */
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { phantomLedger } from '../constants/phantomLedgerAdapter'

export const getWallets = (network: WalletAdapterNetwork) => {
	if (typeof window === 'undefined') return []
	else
		return [
			/**
			 * Wallets that implement either of these standards will be available automatically.
			 *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
			 *     (https://github.com/solana-mobile/mobile-wallet-adapter)
			 *   - Solana Wallet Standard
			 *     (https://github.com/solana-labs/wallet-standard)
			 */
			new SolflareWalletAdapter({ network }),
			phantomLedger,
		]
}

export const wallets = {
	[WalletAdapterNetwork.Mainnet]: getWallets(WalletAdapterNetwork.Mainnet),
	[WalletAdapterNetwork.Devnet]: getWallets(WalletAdapterNetwork.Devnet),
	[WalletAdapterNetwork.Testnet]: getWallets(WalletAdapterNetwork.Testnet),
}
