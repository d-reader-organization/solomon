import React, { useCallback } from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import { removeAuthHeaders } from '../utils/http'
import { lsRemoveWalletAuth } from '../utils/localStorage'
import { useAuth } from '../providers/AuthProvider'

export const DesktopDisconnectButton: React.FC<ButtonProps> = (props) => {
	const { connected, disconnect } = useWallet()
	const { http, walletAccount, setIsAuthenticated } = useAuth()

	const handleDisconnectClick = useCallback(async () => {
		try {
			await disconnect()
			removeAuthHeaders(http)
			if (walletAccount?.address) lsRemoveWalletAuth(walletAccount.address)
		} finally {
			setIsAuthenticated(false)
		}
	}, [disconnect, http, setIsAuthenticated, walletAccount?.address])

	return <Button {...props} disabled={!connected} onClick={handleDisconnectClick} />
}

export default DesktopDisconnectButton
