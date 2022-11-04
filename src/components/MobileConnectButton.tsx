import React, { useCallback } from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { useAuth } from '../providers/AuthProvider'
import useServerAuthorization from '../hooks/useServerAuthorization'

export const MobileConnectButton: React.FC<ButtonProps> = (props) => {
	const { http, isAuthenticating, setIsAuthenticating, mobileAuthorization, setIsAuthenticated } = useAuth()
	const { requestPassword, mobileSignPassword, connectWallet } = useServerAuthorization(http)
	const { authorizeSession, selectedAccount } = mobileAuthorization

	const handleConnectClick = useCallback(async () => {
		try {
			if (isAuthenticating) return

			setIsAuthenticating(true)
			await transact(async (wallet) => {
				const freshAccount = await authorizeSession(wallet)
				const account = selectedAccount ?? freshAccount

				const oneTimePassword = await requestPassword(account.publicKey.toString())
				const encoding = await mobileSignPassword(oneTimePassword, account.address, wallet)
				const authentication = await connectWallet(encoding, account.publicKey.toString())
				return authentication
			})
		} catch (e) {
			setIsAuthenticated(false)
			throw e
		} finally {
			setIsAuthenticated(true)
			setIsAuthenticating(false)
		}
	}, [
		isAuthenticating,
		setIsAuthenticating,
		authorizeSession,
		selectedAccount,
		requestPassword,
		mobileSignPassword,
		connectWallet,
		setIsAuthenticated,
	])

	return <Button {...props} disabled={isAuthenticating} onClick={handleConnectClick} />
}

export default MobileConnectButton
