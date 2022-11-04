import { useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Authorization } from '../models/authorization'
import { addAuthHeaders, removeAuthHeaders } from '../utils/http'
import { lsGetWallet, lsRemoveWalletAuth, lsSetWallet } from '../utils/localStorage'
import { AxiosInstance } from 'axios'
import bs58 from 'bs58'
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'

type Web3AuthHook = {
	signPassword: (password: string, publicKey: PublicKey) => Promise<string>
	mobileSignPassword: (password: string, address: string, wallet: Web3MobileWallet) => Promise<string>
	requestPassword: (address: string) => Promise<string>
	connectWallet: (encodedPassword: string, address: string) => Promise<Authorization>
	connect: (publicKey: PublicKey) => Promise<Authorization>
	autoconnect: (address: string) => Promise<boolean>
}

/**
 * Process to authenticate your wallet on the server.
 *
 * The procedure is as follows:
 * 1. Request your backend to generate a nonce token for you
 * 2. Sign a message constructed from that nonce token.
 * In case your wallet does not support message signing (ledgers)
 * this will fallback to signing a transaction with an instruction
 * constructed from the nonce token
 * 3. Pass the encodedPassword back to server which will validate the signature
 * by using the publicKey of your wallet and generate auth tokens in case
 * verification went successfully
 * @param http - connection to your backend endpoint
 * @returns functions to handle authenticating your wallet to the backend
 */
export const useServerAuthorization = (http: AxiosInstance): Web3AuthHook => {
	const { signMessage, signTransaction, wallet } = useWallet()
	const { connection } = useConnection()

	/** Initialize the login process by requesting a one time password */
	const requestPassword = useCallback(
		async (address: string) => {
			const response = await http.get<string>(`auth/wallet/request-password/${address}`)
			return response.data
		},
		[http]
	)

	/** Sign and encode the string into a Message or Transaction object */
	const signPassword = useCallback(
		async (password: string, publicKey: PublicKey): Promise<string> => {
			const message = new TextEncoder().encode(password)

			// If wallet supports message signing, go with that option
			if (signMessage && wallet?.adapter.name !== 'Phantom Ledger') {
				// debugger;
				const signedMessage = await signMessage(message)
				return bs58.encode(signedMessage)
			}
			// Otherwise sign a transaction with OTP stored in its instruction
			else if (signTransaction) {
				const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

				const transaction = new Transaction({ feePayer: publicKey, blockhash, lastValidBlockHeight }).add({
					keys: [],
					programId: PublicKey.default,
					data: Buffer.from(message),
				})

				const signedTransaction = await signTransaction(transaction)
				return bs58.encode(signedTransaction.serialize())
			} else throw new Error('Wallet does not support message or transaction signing!')
		},
		[connection, signMessage, signTransaction, wallet]
	)

	/** Sign and encode the string into a Message or Transaction object via mobile adapter */
	const mobileSignPassword = useCallback(
		async (password: string, address: string, mobileWallet: Web3MobileWallet): Promise<string> => {
			const message = new TextEncoder().encode(password)

			const [signedMessage] = await mobileWallet.signMessages({
				addresses: [address],
				payloads: [message],
			})
			const signature = signedMessage.slice(-64)
			return bs58.encode(signature)
		},
		[]
	)

	/** Send the encoded password to backend in an attempt to connect to the server */
	const connectWallet = useCallback(
		async (encodedPassword: string, address: string) => {
			const response = await http.get<Authorization>(`auth/wallet/connect/${address}/${encodedPassword}`)
			lsSetWallet(address, response.data)
			addAuthHeaders(http, response.data.accessToken)
			return response.data
		},
		[http]
	)

	/** Refresh access token by using refresh token from the localStorage */
	const refreshAccessToken = useCallback(
		async (address: string) => {
			const lsWallet = lsGetWallet(address)
			if (!lsWallet?.refreshToken) throw new Error('No refresh token found in local storage!')

			const { data: accessToken } = await http.get<string>(`auth/wallet/refresh-token/${lsWallet.refreshToken}`)
			addAuthHeaders(http, accessToken)
			lsSetWallet(address, { accessToken })

			return accessToken
		},
		[http]
	)

	// Try autoconnecting in case accessToken is preserved in the localStorage
	const autoconnect = useCallback(
		async (address: string) => {
			const lsWallet = lsGetWallet(address)
			let isConnected = false

			// If auth token is preserved in the localStorage, refresh it
			if (lsWallet?.accessToken) {
				try {
					addAuthHeaders(http, lsWallet.accessToken)
					await refreshAccessToken(address)
					isConnected = true
				} catch (error) {
					removeAuthHeaders(http)
					lsRemoveWalletAuth(address)
					isConnected = false
				}
			}

			return isConnected
		},
		[http, refreshAccessToken]
	)

	const connect = useCallback(
		async (publicKey: PublicKey) => {
			const address = publicKey.toString()

			const oneTimePassword = await requestPassword(address)
			const encodedPassword = await signPassword(oneTimePassword, publicKey)
			const authentication = await connectWallet(encodedPassword, address)
			return authentication
		},
		[connectWallet, signPassword, requestPassword]
	)

	return { requestPassword, connectWallet, signPassword, mobileSignPassword, connect, autoconnect }
}

export default useServerAuthorization
