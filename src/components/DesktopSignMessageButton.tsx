import React from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuth } from '../providers/AuthProvider'

interface Props extends ButtonProps {
	message: string
}

export const DesktopSignMessageButton: React.FC<Props> = ({ children, message, ...props }) => {
	const { signMessage } = useWallet()
	const { walletAccount } = useAuth()

	return (
		<Button
			disabled={!walletAccount?.publicKey || !message}
			onClick={async () => {
				if (!walletAccount?.publicKey) return
				if (!signMessage) return

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

export default DesktopSignMessageButton
