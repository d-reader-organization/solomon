import React, { useMemo, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { lsRemoveWalletAuth, lsSetWallet } from 'utils/localStorage'
import { addAuthHeaders, removeAuthHeaders } from 'utils/http'
import { useWallet } from '@solana/wallet-adapter-react'
import useWeb3Auth from 'hooks/useWeb3Auth'
import { AxiosInstance } from 'axios'
import { PublicKey } from '@solana/web3.js'

interface AuthContextState {
	isAuthenticated: boolean
	isAuthenticating: boolean
	authenticateWallet: (publicKey: PublicKey) => Promise<void>
}

const initialContextValue = {
	isAuthenticated: false,
	isAuthenticating: false,
	authenticateWallet: async () => {},
}

export const AuthContext = createContext<AuthContextState>(initialContextValue)

interface Props {
	http: AxiosInstance
	children: React.ReactNode
}

const AuthProvider: React.FC<Props> = ({ http, children }) => {
	const [isAuthenticating, setIsAuthenticating] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const { autoconnect, connect } = useWeb3Auth(http)
	const { wallet } = useWallet()
	// TODO: const toaster = useToaster() or throw errors properly

	const authenticateWallet = useCallback(
		async (publicKey: PublicKey) => {
			// Try autoconnecting
			const isConnected = await autoconnect(publicKey)

			// Start manual authentication process in case autoconnection failed
			if (!isConnected) {
				setIsAuthenticating(true)

				try {
					const authentication = await connect(publicKey)
					lsSetWallet(publicKey.toString(), authentication)
					addAuthHeaders(http, authentication.accessToken)
					setIsAuthenticated(true)
				} catch (error) {
					// const message = queryError(error)
					// toaster.add(message, 'error')
					removeAuthHeaders(http)
					lsRemoveWalletAuth(publicKey.toString())
				} finally {
					setIsAuthenticating(false)
				}
			} else setIsAuthenticated(true)
		},
		[autoconnect, connect, http]
	)

	useEffect(() => {
		if (
			wallet?.adapter.connected &&
			!wallet?.adapter.connecting &&
			wallet.adapter.publicKey &&
			wallet.readyState === 'Installed'
		) {
			authenticateWallet(wallet.adapter.publicKey)
		}
	}, [authenticateWallet, wallet])

	useEffect(() => {
		if (wallet) {
			function handleDisconnect() {
				removeAuthHeaders(http)
				if (wallet?.adapter.publicKey) {
					lsRemoveWalletAuth(wallet.adapter.publicKey?.toString())
				}
				setIsAuthenticated(false)
			}
			wallet.adapter.on('disconnect', handleDisconnect)
			// wallet.adapter.on('connect', authenticateWallet);
			return () => {
				wallet.adapter.off('disconnect', handleDisconnect)
				// wallet.adapter.off('connect', authenticateWallet);
			}
		}

		return
	}, [authenticateWallet, http, wallet])

	const value = useMemo(
		() => ({ isAuthenticated, isAuthenticating, authenticateWallet }),
		[isAuthenticated, isAuthenticating, authenticateWallet]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext)
