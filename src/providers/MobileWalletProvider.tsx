import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { AppIdentity, Cluster, Base64EncodedAddress } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { MobileAuthorizationHook, useMobileAuthorization } from '../hooks'
import { PublicKey } from '@solana/web3.js'

export type Account = Readonly<{
	address: Base64EncodedAddress
	label?: string
	publicKey: PublicKey
}>

interface MobileWalletContextState extends MobileAuthorizationHook {
	cluster: Cluster
	identity: AppIdentity
}

const initialContextValue: MobileWalletContextState = {
	accounts: [],
	authorizeSession: async () => ({
		address: PublicKey.default.toBase58(),
		label: undefined,
		publicKey: PublicKey.default,
	}),
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	deauthorizeSession: async () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onChangeAccount: () => {},
	selectedAccount: null,
	cluster: 'devnet',
	identity: {
		uri: undefined,
		icon: undefined,
		name: undefined,
	},
}

export const MobileWalletContext = createContext<MobileWalletContextState>(initialContextValue)

export interface MobileWalletProviderProps {
	children: ReactNode
	cluster: Cluster
	identity: AppIdentity
	// autoConnect?: boolean
}

export function MobileWalletProvider({ children, cluster, identity }: MobileWalletProviderProps) {
	const authorization = useMobileAuthorization({ cluster, identity })

	const value = useMemo(() => ({ ...authorization, cluster, identity }), [authorization, cluster, identity])

	return <MobileWalletContext.Provider value={value}>{children}</MobileWalletContext.Provider>
}

export const useMobileWallet = () => useContext(MobileWalletContext)
export const useMobileWalletContext = useMobileWallet

export default MobileWalletProvider
