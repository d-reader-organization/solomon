import React, { useCallback } from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { useAuth } from '../providers/AuthProvider'

interface Props extends ButtonProps {
	message: string
}

export const MobileSignMessageButton: React.FC<Props> = ({ children, message, ...props }) => {
	const { walletAccount, mobileAuthorization } = useAuth()
	const { authorizeSession } = mobileAuthorization

	const signMessage = useCallback(
		async (buffer: Uint8Array) => {
			const [signature] = await transact(async (wallet) => {
				const freshAccount = await authorizeSession(wallet)
				const signatures = await wallet.signMessages({
					addresses: [walletAccount?.address ?? freshAccount.address],
					payloads: [buffer],
				})
				return signatures
			})
			return signature
		},
		[authorizeSession, walletAccount?.address]
	)
	return (
		<Button
			disabled={walletAccount?.publicKey == null || !message}
			onClick={async () => {
				if (walletAccount?.publicKey == null) {
					return
				}
				const messageBuffer = new Uint8Array(message.split('').map((c) => c.charCodeAt(0)))
				const signature = await signMessage(messageBuffer)
				if (signature) console.log('Message signed: ', signature)
			}}
			{...props}
		>
			{children}
		</Button>
	)
}

export default MobileSignMessageButton
