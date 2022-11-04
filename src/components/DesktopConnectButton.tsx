import React from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletDialog } from '@solana/wallet-adapter-material-ui'

export const DesktopConnectButton: React.FC<ButtonProps> = (props: ButtonProps) => {
	const { connect, connected, wallet } = useWallet()
	const { setOpen } = useWalletDialog()

	if (wallet != null) {
		return <Button {...props} disabled={connected} onClick={connect} />
	}

	return (
		<Button {...props} onClick={() => setOpen(true)}>
			Select Wallet
		</Button>
	)
}

export default DesktopConnectButton
