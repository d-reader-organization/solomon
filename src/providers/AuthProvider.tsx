import React, { useMemo, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AppIdentity, Base64EncodedAddress, Cluster } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import useMobileAuthorization from '../hooks/useMobileAuthorization'
import useServerAuthorization from '../hooks/useServerAuthorization'
import { lsRemoveWalletAuth } from 'utils/localStorage'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import axios, { AxiosInstance } from 'axios'
import { removeAuthHeaders } from 'utils/http'

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
	setIsAuthenticated: () => {
		return
	},
	setIsAuthenticating: () => {
		return
	},
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

export const AuthProvider: React.FC<Props> = ({ http, cluster, identity, children }) => {
	const [isAuthenticating, setIsAuthenticating] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const { selectedAccount } = useMobileAuthorization({ cluster, identity })
	const serverAuthorization = useServerAuthorization(http)
	const { wallet, disconnecting, publicKey } = useWallet()

	const isMobileWallet = wallet?.adapter.name === SolanaMobileWalletAdapterWalletName
	const serverAutoconnect = serverAuthorization.autoconnect
	const serverConnect = serverAuthorization.connect

	// TODO: const toaster = useToaster() or throw errors properly

	/** TODO: Make this a CrossPlatformWallet (something like AnchorWallet) */
	const walletAccount: WalletAccount | undefined = useMemo(() => {
		const pubKey = wallet?.adapter.publicKey ?? selectedAccount?.publicKey
		const address = wallet?.adapter.publicKey?.toString() ?? selectedAccount?.address

		if (pubKey && address) return { publicKey: pubKey, address }
		else return undefined
	}, [wallet?.adapter.publicKey, selectedAccount])

	// Authenticate on server
	const authenticate = useCallback(
		async (account: WalletAccount) => {
			// Try autoconnecting
			const isConnected = await serverAutoconnect(account.publicKey.toString())

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
			} else if (!isMobileWallet) {
				setIsAuthenticated(isConnected)
			}
		},
		[http, isMobileWallet, serverAutoconnect, serverConnect]
	)

	// Try to authenticate whenever wallet account is (re)defined
	useEffect(() => {
		if (walletAccount) authenticate(walletAccount)
	}, [walletAccount, authenticate])

	// Clear http headers and localStorage when disconnecting
	useEffect(() => {
		if (publicKey && disconnecting) {
			removeAuthHeaders(http)
			lsRemoveWalletAuth(publicKey.toString())
			setIsAuthenticated(false)
		}
	}, [disconnecting, publicKey, http])

	// TODO: Make sure autoconnect and refresh-token work as intended

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

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
export const useAuthContext = useAuth

export default AuthProvider
