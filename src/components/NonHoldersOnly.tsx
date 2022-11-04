import React from 'react'
import useTokenGating from '../hooks/useTokenGating'

interface Props {
	hashlist: string[]
	children: React.ReactNode
	altChildren?: React.ReactNode
}

/**
 * Wrapper component to display content only if wallet does not hold specified NFTs
 * @param {string[]} hashlist List of blacklisted NFTs
 * @param {React.ReactNode} altChildren Alternative content if wallet is a holder
 * @param {React.ReactNode} children
 */
export const NonHoldersOnly: React.FC<Props> = ({ hashlist, children, altChildren }) => {
	const isHolder = useTokenGating(hashlist)

	if (!isHolder) return <>{children}</>
	else if (altChildren) return <>{altChildren}</>
	else return null
}

export default NonHoldersOnly
