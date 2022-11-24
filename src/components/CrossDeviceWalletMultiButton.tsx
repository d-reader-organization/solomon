import React from 'react'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import { useWallet } from '@solana/wallet-adapter-react'
import MobileWalletMultiButton from './MobileWalletMultiButton'
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui'
import { MobileWalletConnectButtonProps } from './MobileWalletConnectButton'
import { MobileWalletDisconnectButtonProps } from './MobileWalletDisconnectButton'

export type CrossDeviceWalletMultiButtonProps = MobileWalletConnectButtonProps & MobileWalletDisconnectButtonProps

const CrossDeviceWalletMultiButton: React.FC<CrossDeviceWalletMultiButtonProps> = ({ onAuthorize, onDeauthorize }) => {
	const { wallet } = useWallet()
	const isMobileWallet = wallet?.adapter.name === SolanaMobileWalletAdapterWalletName

	if (isMobileWallet) {
		return <MobileWalletMultiButton onAuthorize={onAuthorize} onDeauthorize={onDeauthorize} />
	}

	return <WalletMultiButton variant='contained' />
}

export default CrossDeviceWalletMultiButton
