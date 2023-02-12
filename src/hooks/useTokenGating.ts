import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ParsedAccountData } from '@solana/web3.js'
import { useCancelablePromise } from '../hooks'

type TokenGatingHook = (hashlist: string[]) => boolean

// TODO: Check if wallet owns all of the specified NFTs (requiredHashlist)

// TODO: Check if wallet owns at least one of the whitelisted NFTs from each hashlist
// (multiple hashlists in case you want the wallet to be a holder of multiple collections)

/**
 * Check if wallet owns at least one whitelisted NFT
 * @param {string[]} hashlist List of NFTs, at least one should be owned
 * @returns Flag for wallet NFT ownership
 */
export const useTokenGating: TokenGatingHook = (hashlist: string[]) => {
	const [isHolder, setIsHolder] = useState(false)
	const { connection } = useConnection()
	const { publicKey } = useWallet()
	const makeCancelable = useCancelablePromise()

	const verifyWallet = useCallback(async () => {
		if (!publicKey) setIsHolder(false)
		else {
			const parsedAccounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
				filters: [
					{ dataSize: 165 },
					{ memcmp: { offset: 32, bytes: publicKey.toString() } },
					// Filter for NFTs: Base58 for [1,0,0,0,0,0,0,0]
					{ memcmp: { bytes: 'Ahg1opVcGX', offset: 64 } },
				],
			})

			const nftHoldings = parsedAccounts.reduce<string[]>((acc, parsedAccount) => {
				const mint = (parsedAccount.account.data as ParsedAccountData).parsed.info.mint
				if (hashlist.includes(mint)) return [...acc, mint]
				else return acc
			}, [])

			const holdsNfts = nftHoldings.length > 0
			setIsHolder(holdsNfts)
		}
	}, [connection, publicKey, hashlist])

	useEffect(() => {
		makeCancelable(verifyWallet())
	}, [publicKey, makeCancelable, verifyWallet])

	return isHolder
}

export default useTokenGating
