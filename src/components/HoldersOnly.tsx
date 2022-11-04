import React from 'react'
import useTokenGating from '../hooks/useTokenGating'

interface Props {
	hashlist: string[]
	children: React.ReactNode
	altChildren?: React.ReactNode
}

/**
 * Wrapper component to display content only if wallet holds specified NFTs
 * @param {string[]} hashlist List of whitelisted NFTs
 * @param {React.ReactNode} altChildren Alternative content if wallet is not a holder
 * @param {React.ReactNode} children
 */
export const HoldersOnly: React.FC<Props> = ({ hashlist, children, altChildren }) => {
	const isHolder = useTokenGating(hashlist)

	if (isHolder) return <>{children}</>
	else if (altChildren) return <>{altChildren}</>
	else return null
}

export default HoldersOnly
