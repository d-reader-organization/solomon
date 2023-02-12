import { FileCopy as CopyIcon, LinkOff as DisconnectIcon } from '@mui/icons-material'
import type { Theme } from '@mui/material'
import { Button, Collapse, Fade, ListItemIcon, Menu, MenuItem, styled } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import MobileWalletConnectButton, { MobileWalletConnectButtonProps } from './MobileWalletConnectButton'
import { WalletIcon } from '@solana/wallet-adapter-material-ui'
import { shortenString } from '../utils/helpers'
import { useMobileWallet } from '../providers'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { MobileWalletDisconnectButtonProps } from './MobileWalletDisconnectButton'

const StyledMenu = styled(Menu)(({ theme }: { theme: Theme }) => ({
	'& .MuiList-root': {
		padding: 0,
	},
	'& .MuiListItemIcon-root': {
		marginRight: theme.spacing(),
		minWidth: 'unset',
		'& .MuiSvgIcon-root': {
			width: 20,
			height: 20,
		},
	},
}))

const WalletActionMenuItem = styled(MenuItem)(({ theme }: { theme: Theme }) => ({
	padding: theme.spacing(1, 2),
	boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',

	'&:hover': {
		boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
	},
}))

const WalletMenuItem = styled(WalletActionMenuItem)(() => ({
	padding: 0,

	'& .MuiButton-root': {
		borderRadius: 0,
	},
}))

export type MobileWalletMultiButtonProps = MobileWalletConnectButtonProps & MobileWalletDisconnectButtonProps

export const MobileWalletMultiButton: FC<MobileWalletMultiButtonProps> = ({
	color = 'primary',
	variant = 'contained',
	type = 'button',
	onAuthorize,
	onDeauthorize,
	children,
	...props
}) => {
	const { wallet } = useWallet()
	const { selectedAccount, deauthorizeSession } = useMobileWallet()
	const [anchor, setAnchor] = useState<HTMLElement>()

	// TODO: replace this with stuff on `useAuthorize`
	const base58 = useMemo(() => selectedAccount?.publicKey.toBase58(), [selectedAccount?.publicKey])
	const content = useMemo(() => {
		if (children) return children
		if (!wallet || !base58) return null
		return shortenString(base58, 4)
	}, [children, wallet, base58])

	if (!base58) {
		return (
			<MobileWalletConnectButton color={color} variant={variant} type={type} onAuthorize={onAuthorize} {...props}>
				{children}
			</MobileWalletConnectButton>
		)
	}

	return (
		<>
			<Button
				color={color}
				variant={variant}
				type={type}
				startIcon={<WalletIcon wallet={wallet} />}
				onClick={(event) => setAnchor(event.currentTarget)}
				aria-controls='wallet-menu'
				aria-haspopup='true'
				{...props}
			>
				{content}
			</Button>
			<StyledMenu
				id='wallet-menu'
				anchorEl={anchor}
				open={!!anchor}
				onClose={() => setAnchor(undefined)}
				marginThreshold={0}
				TransitionComponent={Fade}
				transitionDuration={250}
				keepMounted
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<WalletMenuItem onClick={() => setAnchor(undefined)}>
					<Button
						color={color}
						variant={variant}
						type={type}
						startIcon={<WalletIcon wallet={wallet} />}
						onClick={() => setAnchor(undefined)}
						fullWidth
						{...props}
					>
						{/* Note: 'Mobile Wallet Adapter' is just too long... */}
						{'Mobile Wallet' || wallet?.adapter.name}
					</Button>
				</WalletMenuItem>
				<Collapse in={!!anchor}>
					<WalletActionMenuItem
						onClick={async () => {
							setAnchor(undefined)
							await navigator.clipboard.writeText(base58)
						}}
					>
						<ListItemIcon>
							<CopyIcon />
						</ListItemIcon>
						Copy address
					</WalletActionMenuItem>
					<WalletActionMenuItem
						onClick={async () => {
							setAnchor(undefined)
							await transact(async (mobileWallet) => {
								if (typeof onDeauthorize === 'function' && selectedAccount) {
									await onDeauthorize(selectedAccount)
									// TODO: create a disconnectMobileWallet function
								}

								await deauthorizeSession(mobileWallet)
							})
						}}
					>
						<ListItemIcon>
							<DisconnectIcon />
						</ListItemIcon>
						Disconnect
					</WalletActionMenuItem>
				</Collapse>
			</StyledMenu>
		</>
	)
}

export default MobileWalletMultiButton
