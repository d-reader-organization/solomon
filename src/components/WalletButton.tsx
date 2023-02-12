import React from 'react'
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import CrossDeviceWalletMultiButton, { CrossDeviceWalletMultiButtonProps } from './CrossDeviceWalletMultiButton'
import { useServerAuthorization } from 'hooks'
import { Account, useAuth } from 'providers'
import { lsRemoveWalletAuth, removeAuthHeaders } from 'utils'
import { AxiosInstance } from 'axios'

type Props = {
	http: AxiosInstance
} & Omit<CrossDeviceWalletMultiButtonProps, 'onAuthorize' | 'onDeauthorize'>

const WalletButton: React.FC<Props> = ({ http, ...props }) => {
	const { setIsAuthenticated } = useAuth()
	const { mobileConnect } = useServerAuthorization(http)

	const onAuthorize = async (mobileWallet: Web3MobileWallet, account: Account) => {
		setIsAuthenticated(true)
		await mobileConnect(mobileWallet, account)
	}

	const onDeauthorize = (account: Account) => {
		setIsAuthenticated(false)
		removeAuthHeaders(http)
		if (account?.address) lsRemoveWalletAuth(account.address)
	}

	return <CrossDeviceWalletMultiButton onAuthorize={onAuthorize} onDeauthorize={onDeauthorize} {...props} />
}

export default WalletButton
