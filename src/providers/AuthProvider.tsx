import React, { useMemo, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { lsRemoveWalletAuth } from '../utils/localStorage'
import { removeAuthHeaders } from '../utils/http'
import { AppIdentity, Base64EncodedAddress, Cluster } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { useWallet } from '@solana/wallet-adapter-react'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import useMobileAuthorization from '../hooks/useMobileAuthorization'
import useServerAuthorization from '../hooks/useServerAuthorization'
import axios, { AxiosInstance } from 'axios'
import { PublicKey } from '@solana/web3.js'

interface AuthContextState {
	isAuthenticated: boolean
	isAuthenticating: boolean
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
	setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>
	walletAccount: WalletAccount | undefined
	isMobileWallet: boolean
	http: AxiosInstance
}

const initialContextValue = {
	isAuthenticated: false,
	isAuthenticating: false,
	setIsAuthenticated: () => {},
	setIsAuthenticating: () => {},
	walletAccount: {
		address: PublicKey.default.toString(),
		publicKey: PublicKey.default,
	},
	isMobileWallet: false,
	http: axios.create(),
}

export const AuthContext = createContext<AuthContextState>(initialContextValue)

interface Props {
	http: AxiosInstance
	cluster: Cluster
	identity: AppIdentity
	children: React.ReactNode
}

interface WalletAccount {
	publicKey: PublicKey
	address: Base64EncodedAddress
}

const AuthProvider: React.FC<Props> = ({ http, cluster, identity, children }) => {
	const [isAuthenticating, setIsAuthenticating] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const { selectedAccount } = useMobileAuthorization({ cluster, identity })
	const serverAuthorization = useServerAuthorization(http)
	const { wallet } = useWallet()

	const isMobileWallet = wallet?.adapter.name === SolanaMobileWalletAdapterWalletName
	const serverAutoconnect = serverAuthorization.autoconnect
	const serverConnect = serverAuthorization.connect

	// TODO: const toaster = useToaster() or throw errors properly

	/** TODO: Make this a CrossPlatformWallet (something like AnchorWallet) */
	const walletAccount: WalletAccount | undefined = useMemo(() => {
		const publicKey = wallet?.adapter.publicKey ?? selectedAccount?.publicKey
		const address = wallet?.adapter.publicKey?.toString() ?? selectedAccount?.address

		if (publicKey && address) return { publicKey, address }
		else return undefined
	}, [wallet?.adapter.publicKey, selectedAccount])

	// Authenticate on server
	const authenticate = useCallback(
		async (account: WalletAccount) => {
			// Try autoconnecting
			const isConnected = await serverAutoconnect(account.address)

			// Start manual authentication process in case autoconnection failed
			// Don't start manual authentication if it's mobile wallet adapter
			if (!isConnected && !isMobileWallet) {
				setIsAuthenticating(true)

				try {
					await serverConnect(account.publicKey)
					setIsAuthenticated(true)
				} catch (error) {
					// const message = queryError(error)
					// toaster.add(message, 'error')
					removeAuthHeaders(http)
					lsRemoveWalletAuth(account.address)
				} finally {
					setIsAuthenticating(false)
				}
			} else setIsAuthenticated(isConnected)
		},
		[http, isMobileWallet, serverAutoconnect, serverConnect]
	)

	// Try to authenticate whenever wallet account is (re)defined
	useEffect(() => {
		if (walletAccount) authenticate(walletAccount)
	}, [walletAccount, authenticate])

	const value = useMemo(
		() => ({
			isAuthenticated,
			isAuthenticating,
			setIsAuthenticating,
			setIsAuthenticated,
			walletAccount,
			isMobileWallet,
			http,
		}),
		[isAuthenticated, isAuthenticating, setIsAuthenticating, setIsAuthenticated, walletAccount, isMobileWallet, http]
	)

	// TODO: Make sure autoconnect and refresh-token work as intended
	// TODO: Make sure disconnect works as intended
	// const handleDisconnect = useCallback(
	// 	(publicKey?: PublicKey) => {
	// 		removeAuthHeaders(http)
	// 		if (publicKey) {
	// 			lsRemoveWalletAuth(publicKey.toString())
	// 		}
	// 		setIsAuthenticated(false)
	// 	},
	// 	[http]
	// )

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
export const useAuthContext = useAuth

export default AuthProvider
