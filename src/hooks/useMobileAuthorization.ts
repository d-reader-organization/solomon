import { PublicKey } from '@solana/web3.js'
import {
	Account as AuthorizedAccount,
	AppIdentity,
	AuthorizationResult,
	AuthorizeAPI,
	AuthToken,
	Base64EncodedAddress,
	Cluster,
	DeauthorizeAPI,
	ReauthorizeAPI,
} from '@solana-mobile/mobile-wallet-adapter-protocol'
import { toUint8Array } from 'js-base64'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { Account } from '../providers/MobileWalletProvider'

type Authorization = Readonly<{
	accounts: Account[]
	authToken: AuthToken
	selectedAccount: Account
}>

function getAccountFromAuthorizedAccount(account: AuthorizedAccount): Account {
	return {
		...account,
		publicKey: getPublicKeyFromAddress(account.address),
	}
}

function getAuthorizationFromAuthorizationResult(
	authorizationResult: AuthorizationResult,
	previouslySelectedAccount?: Account
): Authorization {
	let selectedAccount: Account
	if (
		// We have yet to select an account.
		previouslySelectedAccount == null ||
		// The previously selected account is no longer in the set of authorized addresses.
		!authorizationResult.accounts.some(({ address }) => address === previouslySelectedAccount.address)
	) {
		const firstAccount = authorizationResult.accounts[0]
		selectedAccount = getAccountFromAuthorizedAccount(firstAccount)
	} else {
		selectedAccount = previouslySelectedAccount
	}
	return {
		accounts: authorizationResult.accounts.map(getAccountFromAuthorizedAccount),
		authToken: authorizationResult.auth_token,
		selectedAccount,
	}
}

function getUriForAppIdentity() {
	const location = globalThis.location
	if (location == null) return
	return `${location.protocol}//${location.host}`
}

function getPublicKeyFromAddress(address: Base64EncodedAddress): PublicKey {
	const publicKeyByteArray = toUint8Array(address)
	return new PublicKey(publicKeyByteArray)
}

export type MobileAuthorizationHook = {
	accounts: Account[] | null
	authorizeSession: (wallet: AuthorizeAPI & ReauthorizeAPI) => Promise<Account>
	deauthorizeSession: (wallet: DeauthorizeAPI) => Promise<void>
	onChangeAccount: (nextSelectedAccount: Account) => void
	selectedAccount: Account | null
}

export const useMobileAuthorization = (authorizeParams: {
	cluster: Cluster
	identity: AppIdentity
}): MobileAuthorizationHook => {
	const { data: authorization, mutate: setAuthorization } = useSWR<Authorization | null | undefined>('authorization')
	const { cluster, identity } = authorizeParams

	const handleAuthorizationResult = useCallback(
		async (authorizationResult: AuthorizationResult): Promise<Authorization> => {
			const nextAuthorization = getAuthorizationFromAuthorizationResult(
				authorizationResult,
				authorization?.selectedAccount
			)
			await setAuthorization(nextAuthorization)
			return nextAuthorization
		},
		[authorization, setAuthorization]
	)

	const authorizeSession = useCallback(
		async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
			const authorizationResult = await (authorization
				? wallet.reauthorize({
						auth_token: authorization.authToken,
				  })
				: wallet.authorize({
						cluster,
						identity: {
							// generate uri if identity.uri is undefined or null
							uri: identity.uri ?? getUriForAppIdentity(),
							icon: identity.icon,
							name: identity.name,
						},
				  }))
			return (await handleAuthorizationResult(authorizationResult)).selectedAccount
		},
		[cluster, identity, authorization, handleAuthorizationResult]
	)

	const deauthorizeSession = useCallback(
		async (wallet: DeauthorizeAPI) => {
			if (authorization?.authToken == null) {
				return
			}
			await wallet.deauthorize({ auth_token: authorization.authToken })
			setAuthorization(null)
		},
		[authorization, setAuthorization]
	)

	const onChangeAccount = useCallback(
		(nextSelectedAccount: Account) => {
			setAuthorization((currentAuthorization) => {
				if (!currentAuthorization?.accounts.some(({ address }) => address === nextSelectedAccount.address)) {
					throw new Error(`${nextSelectedAccount.address} is not one of the available addresses`)
				}
				return {
					...currentAuthorization,
					selectedAccount: nextSelectedAccount,
				}
			})
		},
		[setAuthorization]
	)

	return useMemo(
		() => ({
			accounts: authorization?.accounts ?? null,
			authorizeSession,
			deauthorizeSession,
			onChangeAccount,
			selectedAccount: authorization?.selectedAccount ?? null,
		}),
		[authorization?.accounts, authorization?.selectedAccount, authorizeSession, deauthorizeSession, onChangeAccount]
	)
}

export default useMobileAuthorization
