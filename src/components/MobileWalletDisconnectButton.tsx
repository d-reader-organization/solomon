import React, { useCallback, useMemo, useState } from 'react'
import type { FC, MouseEventHandler } from 'react'
import { Button, ButtonProps } from '@mui/material'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { WalletIcon } from '@solana/wallet-adapter-material-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMobileWallet, Account } from '../providers'

export type MobileWalletDisconnectButtonProps = ButtonProps & {
	onDeauthorize?: (account: Account) => unknown
}

export const MobileWalletDisconnectButton: FC<MobileWalletDisconnectButtonProps> = ({
	color = 'primary',
	variant = 'contained',
	type = 'button',
	children,
	disabled,
	onClick,
	onDeauthorize,
	...props
}) => {
	const { wallet } = useWallet()
	const { deauthorizeSession, selectedAccount } = useMobileWallet()
	const [deauthorizationInProgress, setDeauthorizationInProgress] = useState(false)

	const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
		async (event) => {
			if (typeof onClick === 'function') onClick(event)
			if (!event.defaultPrevented)
				try {
					if (deauthorizationInProgress) return
					setDeauthorizationInProgress(true)

					await transact(async (mobileWallet) => {
						if (typeof onDeauthorize === 'function' && selectedAccount) {
							await onDeauthorize(selectedAccount)
						}

						await deauthorizeSession(mobileWallet)
					})
				} finally {
					setDeauthorizationInProgress(false)
				}
		},
		[onClick, deauthorizationInProgress, deauthorizeSession, onDeauthorize, selectedAccount]
	)

	const content = useMemo(() => {
		if (children) return children
		if (selectedAccount) return 'Disconnect'
		return 'Disconnect'
	}, [children, selectedAccount])

	return (
		<Button
			color={color}
			variant={variant}
			type={type}
			onClick={handleClick}
			disabled={disabled || !wallet || deauthorizationInProgress || !selectedAccount}
			startIcon={<WalletIcon wallet={wallet} />}
			{...props}
		>
			{content}
		</Button>
	)
}

export default MobileWalletDisconnectButton
