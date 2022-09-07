import React, { useMemo, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { lsRemoveWalletAuth, lsSetWallet } from 'utils/localStorage'
import { addAuthHeaders, removeAuthHeaders } from 'utils/http'
import { useWallet } from '@solana/wallet-adapter-react'
import useWeb3Auth from 'hooks/useWeb3Auth'
import { AxiosInstance } from 'axios'

interface AuthContextState {
	isAuthenticated: boolean
	isAuthenticating: boolean
}

const initialContextValue = {
	isAuthenticated: false,
	isAuthenticating: false,
}

export const AuthContext = createContext<AuthContextState>(initialContextValue)

interface Props {
	http: AxiosInstance
	children: React.ReactNode
}

const AuthProvider: React.FC<Props> = ({ http, children }) => {
	const [isAuthenticating, setIsAuthenticating] = useState(false)
	const { autoconnect, connect } = useWeb3Auth(http)
	const { publicKey, disconnecting } = useWallet()
	const walletAddress = useMemo(() => publicKey?.toString() || '', [publicKey])
	const isAuthenticated = !!http.defaults.headers.common.Authorization
	// TODO: const toaster = useToaster() or throw errors properly

	const authenticateWallet = useCallback(async () => {
		if (!walletAddress) return

		// Try autoconnecting
		const isConnected = await autoconnect()

		// Start manual authentication process in case autoconnection failed
		if (!isConnected) {
			setIsAuthenticating(true)

			try {
				const authorization = await connect()
				lsSetWallet(walletAddress, authorization)
				addAuthHeaders(http, authorization.accessToken)
			} catch (error) {
				// const message = queryError(error)
				// toaster.add(message, 'error')
				removeAuthHeaders(http)
				lsRemoveWalletAuth(walletAddress)
			} finally {
				setIsAuthenticating(false)
			}
		}
	}, [autoconnect, connect, http, walletAddress])

	/*
	If wallet is disconnecting - remove authorization
	If wallet is connected - add authorization
	*/
	useEffect(() => {
		if (walletAddress) {
			if (disconnecting) {
				removeAuthHeaders(http)
				lsRemoveWalletAuth(walletAddress)
			} else authenticateWallet()
		}
	}, [authenticateWallet, disconnecting, http, walletAddress])

	const value = useMemo(() => ({ isAuthenticated, isAuthenticating }), [isAuthenticated, isAuthenticating])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext)
