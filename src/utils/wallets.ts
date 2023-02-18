import { phantomLedger } from '../constants/phantomLedgerAdapter'

export const getWallets = () => {
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
			phantomLedger,
		]
}
