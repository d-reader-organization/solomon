import React, { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { AppIdentity, Cluster, Base64EncodedAddress } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import useMobileAuthorization, { MobileAuthorizationHook } from '../hooks/useMobileAuthorization'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'

export type Account = Readonly<{
	address: Base64EncodedAddress
	label?: string
	publicKey: PublicKey
}>

export type MobileWalletContextState = MobileAuthorizationHook & {
	cluster: Cluster
	identity: AppIdentity
	signMessage: (message: Uint8Array) => Promise<Uint8Array>
	signTransaction: (transactions: Transaction) => Promise<Transaction>
	signTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
	signAndSendTransaction: (transaction: Transaction) => Promise<string>
}

const initialContextValue: MobileWalletContextState = {
	accounts: [],
	authorizeSession: async () => ({
		address: PublicKey.default.toBase58(),
		label: undefined,
		publicKey: PublicKey.default,
	}),
	deauthorizeSession: async () => {},
	onChangeAccount: () => {},
	signMessage: async () => Uint8Array.from([]),
	signTransaction: async () => new Transaction(),
	signTransactions: async ([]) => [new Transaction()],
	signAndSendTransaction: async () => '',
	selectedAccount: null,
	cluster: 'devnet',
	identity: {
		uri: undefined,
		icon: undefined,
		name: undefined,
	},
}

export const MobileWalletContext = createContext<MobileWalletContextState>(initialContextValue)

export interface MobileWalletProviderProps {
	children: ReactNode
	cluster: Cluster
	identity: AppIdentity
	// autoConnect?: boolean
}

export const MobileWalletProvider: React.FC<MobileWalletProviderProps> = ({ children, cluster, identity }) => {
	const authorization = useMobileAuthorization({ cluster, identity })
	const { selectedAccount, authorizeSession } = authorization
	const { connection } = useConnection()

	const signMessage = useCallback(
		async (message: Uint8Array) => {
			return transact(async (mobileWallet) => {
				const freshAccount = await authorizeSession(mobileWallet)
				const account = selectedAccount ?? freshAccount

				const [signedMessage] = await mobileWallet.signMessages({
					addresses: [account.address],
					payloads: [message],
				})

				const signature = signedMessage.slice(-64)
				return signature
			})
		},
		[selectedAccount, authorizeSession]
	)

	const signTransaction = useCallback(
		async (transaction: Transaction) => {
			return transact(async (mobileWallet) => {
				await authorizeSession(mobileWallet)

				const [signedTransaction] = await mobileWallet.signTransactions({
					transactions: [transaction],
				})

				return signedTransaction
			})
		},
		[authorizeSession]
	)

	const signTransactions = useCallback(
		async (transactions: Transaction[]) => {
			return transact(async (mobileWallet) => {
				await authorizeSession(mobileWallet)

				const signedTransactions = await mobileWallet.signTransactions({
					transactions,
				})

				return signedTransactions
			})
		},
		[authorizeSession]
	)

	const signAndSendTransaction = useCallback(
		async (transaction: Transaction) => {
			return transact(async (mobileWallet) => {
				await authorizeSession(mobileWallet)

				let minContextSlot: number | undefined = transaction.minNonceContextSlot
				if (!minContextSlot) {
					const { context } = await connection.getLatestBlockhashAndContext()
					minContextSlot = context.slot
				}

				const [signature] = await mobileWallet.signAndSendTransactions({
					transactions: [transaction],
					minContextSlot,
				})

				return signature
			})
		},
		[authorizeSession, connection]
	)

	const value = useMemo(
		() => ({
			signMessage,
			signTransaction,
			signTransactions,
			signAndSendTransaction,
			...authorization,
			cluster,
			identity,
		}),
		[authorization, signAndSendTransaction, signMessage, signTransaction, signTransactions, cluster, identity]
	)

	return <MobileWalletContext.Provider value={value}>{children}</MobileWalletContext.Provider>
}

export const useMobileWallet = () => useContext(MobileWalletContext)
export const useMobileWalletContext = useMobileWallet

export default MobileWalletProvider
