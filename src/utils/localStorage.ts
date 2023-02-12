import { Authorization } from '../models/authorization'

/**
 * This can be expanded to support additional wallet configuration.
 * Such as dark/light mode, disable push notifications, disable sounds etc.
 */
type LocalStorageWallet = Authorization

const defaultWallet: LocalStorageWallet = {
	accessToken: '',
	refreshToken: '',
}

const createNewWallet = (): LocalStorageWallet => Object.assign(defaultWallet)

export const lsGetWallet = (walletAddress: string): LocalStorageWallet | undefined => {
	const lsWallet = localStorage.getItem(walletAddress)
	if (lsWallet) return JSON.parse(lsWallet)
	else return undefined
}

export const lsRemoveWallet = (walletAddress: string) => {
	localStorage.removeItem(walletAddress)
}

export const lsSetWallet = (walletAddress: string, updatedValues: Partial<LocalStorageWallet>) => {
	const wallet = lsGetWallet(walletAddress) || createNewWallet()
	const newWallet = { ...wallet, ...updatedValues }
	localStorage.setItem(walletAddress, JSON.stringify(newWallet))
	return newWallet
}

export const lsRemoveWalletAuth = (walletAddress: string) => {
	lsSetWallet(walletAddress, { accessToken: '', refreshToken: '' })
}
