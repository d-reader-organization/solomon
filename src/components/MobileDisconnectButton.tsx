import React, { useCallback } from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { useAuth } from '../providers/AuthProvider'
import { removeAuthHeaders } from '../utils/http'
import { lsRemoveWalletAuth } from '../utils/localStorage'

export const MobileDisconnectButton: React.FC<ButtonProps> = (props) => {
	const { http, mobileAuthorization, walletAccount, setIsAuthenticated } = useAuth()
	const { deauthorizeSession } = mobileAuthorization

	const handleDisconnectPress = useCallback(async () => {
		try {
			await transact(async (wallet) => {
				await deauthorizeSession(wallet)
				removeAuthHeaders(http)
				if (walletAccount?.address) lsRemoveWalletAuth(walletAccount.address)
			})
		} finally {
			setIsAuthenticated(false)
		}
	}, [deauthorizeSession, http, walletAccount?.address, setIsAuthenticated])

	return <Button {...props} disabled={!walletAccount?.publicKey} onClick={handleDisconnectPress} />
}

export default MobileDisconnectButton
