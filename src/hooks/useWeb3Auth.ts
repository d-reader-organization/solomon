import { useCallback, useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { Authorization } from 'models/authorization'
import { addAuthHeaders, removeAuthHeaders } from 'utils/http'
import { lsGetWallet, lsRemoveWalletAuth, lsSetWallet } from 'utils/localStorage'
import { AxiosInstance } from 'axios'
import bs58 from 'bs58'

type Web3AuthHook = {
	encodePassword: (oneTimePassword: string) => Promise<string>
	requestPassword: () => Promise<string>
	connectWallet: (encoding: string) => Promise<Authorization>
	connect: () => Promise<Authorization>
	autoconnect: () => Promise<boolean>
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
 * 3. Pass the encoding back to server which will validate the signature
 * by using the publicKey of your wallet and generate auth tokens in case
 * verification went successfully
 * @param http - connection to your backend endpoint
 * @returns functions to handle authenticating your wallet to the backend
 */
export const useWeb3Auth = (http: AxiosInstance): Web3AuthHook => {
	const { publicKey, signMessage, signTransaction, wallet } = useWallet()
	const { connection } = useConnection()
	const walletAddress = useMemo(() => publicKey?.toString() || '', [publicKey])

	/** Initialize the login process by requesting a one time password */
	const requestPassword = useCallback(async () => {
		const response = await http.get<string>(`auth/wallet/request-password/${walletAddress}`)
		return response.data
	}, [http, walletAddress])

	/** Encode the message string into a Message or Transaction object */
	const encodePassword = useCallback(
		async (password: string): Promise<string> => {
			if (!publicKey) throw new WalletNotConnectedError()

			const message = new TextEncoder().encode(password)

			// If wallet supports message signing, go with that option
			if (signMessage && wallet?.adapter.name !== 'Phantom Ledger') {
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
		[connection, publicKey, signMessage, signTransaction, wallet?.adapter.name]
	)

	/** Send the encoded password to backend in an attempt to connect to the server */
	const connectWallet = useCallback(
		async (encoding: string) => {
			const response = await http.get<Authorization>(`auth/wallet/connect/${walletAddress}/${encoding}`)
			return response.data
		},
		[http, walletAddress]
	)

	/** Refresh access token by using refresh token from the localStorage */
	const refreshAccessToken = useCallback(async () => {
		const lsWallet = lsGetWallet(walletAddress)
		if (!lsWallet?.refreshToken) throw new Error('No refresh token found in local storage!')

		const { data: accessToken } = await http.get<string>(`auth/wallet/refresh-token/${lsWallet.refreshToken}`)
		addAuthHeaders(http, accessToken)
		lsSetWallet(walletAddress, { accessToken })

		return accessToken
	}, [http, walletAddress])

	// Try autoconnecting in case accessToken is preserved in the localStorage
	const autoconnect = useCallback(async () => {
		const lsWallet = lsGetWallet(walletAddress)
		let isConnected = false

		// If auth token is preserved in the localStorage, refresh it
		if (lsWallet?.accessToken) {
			try {
				addAuthHeaders(http, lsWallet.accessToken)
				await refreshAccessToken()
				isConnected = true
			} catch (error) {
				removeAuthHeaders(http)
				lsRemoveWalletAuth(walletAddress)
				isConnected = false
			}
		}

		return isConnected
	}, [http, refreshAccessToken, walletAddress])

	const connect = useCallback(async () => {
		const oneTimePassword = await requestPassword()
		const encoding = await encodePassword(oneTimePassword)
		const authorization = await connectWallet(encoding)

		return authorization
	}, [connectWallet, encodePassword, requestPassword])

	return { requestPassword, connectWallet, encodePassword, connect, autoconnect }
}

export default useWeb3Auth
