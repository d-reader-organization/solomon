import React, { useCallback, useMemo, useState } from 'react'
import type { FC, MouseEventHandler } from 'react'
import { Button, ButtonProps } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import { Account, useMobileWallet } from '../providers/MobileWalletProvider'
import { WalletIcon } from '@solana/wallet-adapter-material-ui'
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'

export type MobileWalletConnectButtonProps = ButtonProps & {
	onAuthorize?: (wallet: Web3MobileWallet, account: Account) => Promise<unknown>
}

export const MobileWalletConnectButton: FC<MobileWalletConnectButtonProps> = ({
	color = 'primary',
	variant = 'contained',
	type = 'button',
	children,
	disabled,
	onClick,
	onAuthorize,
	...props
}) => {
	const { authorizeSession, selectedAccount } = useMobileWallet()
	const [authorizationInProgress, setAuthorizationInProgress] = useState(false)
	const { wallet } = useWallet()

	const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
		async (event) => {
			if (typeof onClick === 'function') onClick(event)
			if (!event.defaultPrevented)
				try {
					if (authorizationInProgress) return

					setAuthorizationInProgress(true)
					await transact(async (mobileWallet) => {
						const freshAccount = await authorizeSession(mobileWallet)
						if (typeof onAuthorize === 'function') {
							const account = selectedAccount ?? freshAccount
							await onAuthorize(mobileWallet, account)
						}
					})
				} finally {
					setAuthorizationInProgress(false)
				}
		},
		[onClick, authorizationInProgress, authorizeSession, onAuthorize, selectedAccount]
	)

	const content = useMemo(() => {
		if (children) return children
		if (authorizationInProgress) return 'Connecting ...'
		if (selectedAccount) return 'Connected'
		if (wallet) return 'Connect'
		return 'Connect Wallet'
	}, [children, authorizationInProgress, selectedAccount, wallet])

	return (
		<Button
			color={color}
			variant={variant}
			type={type}
			onClick={handleClick}
			disabled={disabled || !wallet || authorizationInProgress}
			startIcon={<WalletIcon wallet={wallet} />}
			{...props}
		>
			{content}
		</Button>
	)
}

export default MobileWalletConnectButton
