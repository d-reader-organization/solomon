import { useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import { useMobileWallet } from '../providers'
import { WalletName } from '@solana/wallet-adapter-base'

// https://discord.com/channels/988649555283308564/1103060569394786384
/*
const anchorWallet = {
  signTransaction: async (transaction: Transaction) => {
    const signedTransaction: Transaction = await transact(async wallet => {
      // Request for authorization
      await authorizeSession(wallet);

      // Construct a transaction then request for signing
      const transactions: Transaction[] = await wallet.signTransactions({
        transactions: [yourProgramTransaction],
      });

      return transactions[0];
    });
    return signedTransaction;
  },
  signAllTransactions: async (transactions: Transaction[]) => {
    const signedTransactions: Transaction = await transact(async wallet => {
      // Request for authorization
      await authorizeSession(wallet);

      // Construct a transaction then request for signing
      const transactions: Transaction[] = await wallet.signTransactions({
        transactions: [
          yourProgramTransaction1,
          yourProgramTransaction2,
          yourProgramTransaction3,
        ],
      });

      return transactions;
    });
    return signedTransactions;
  },
  get publicKey() {
    return account.publicKey; // insert however you store/get the publicKey here
  },
} as Wallet;
*/

type CrossDeviceWalletHook = {
	signMessage: (message: Uint8Array) => Promise<Uint8Array>
	signTransaction: (transaction: Transaction) => Promise<Transaction>
	signAndSendTransaction: (transaction: Transaction) => Promise<string>
	walletName: WalletName<string> | undefined
	isMobileWallet: boolean
}

export const useCrossDeviceWallet = (): CrossDeviceWalletHook => {
	const { signTransaction: walletSignTransaction, signMessage: walletSignMessage, wallet } = useWallet()
	const mobileWallet = useMobileWallet()
	const { connection } = useConnection()

	const walletName = wallet?.adapter.name
	const isMobileWallet = walletName === SolanaMobileWalletAdapterWalletName

	const signMessage = useCallback(
		async (message: Uint8Array) => {
			if (isMobileWallet) {
				return await mobileWallet.signMessage(message)
			} else {
				if (!walletSignMessage) {
					throw new Error('Wallet does not support message signing!')
				}
				return await walletSignMessage(message)
			}
		},
		[isMobileWallet, mobileWallet, walletSignMessage]
	)

	const signTransaction = useCallback(
		async (transaction: Transaction) => {
			// TODO: check if blockhash info is missing and fetch it if yes
			if (isMobileWallet) {
				return await mobileWallet.signTransaction(transaction)
			} else {
				if (!walletSignTransaction) {
					throw new Error('Wallet does not support transaction signing!')
				}
				return await walletSignTransaction(transaction)
			}
		},
		[isMobileWallet, mobileWallet, walletSignTransaction]
	)

	const signAndSendTransaction = useCallback(
		async (transaction: Transaction) => {
			const signedTransaction = await signTransaction(transaction)

			// signature
			return await connection.sendRawTransaction(signedTransaction.serialize())
		},
		[connection, signTransaction]
	)

	return { signMessage, signTransaction, signAndSendTransaction, walletName, isMobileWallet }
}

export default useCrossDeviceWallet
