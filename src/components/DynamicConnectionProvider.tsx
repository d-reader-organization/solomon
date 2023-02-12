import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import type { ConnectionConfig } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { ConnectionContext } from '@solana/wallet-adapter-react'
import { RpcNodeProvider } from '../constants/rpcNodeProviders'
import { SelectChangeEvent } from '@mui/material'
import { useCancelablePromise, useIsMounted } from '../hooks'
import RpcEndpointSelect from './RpcEndpointSelect'

export interface DynamicConnectionProviderProps {
	children: ReactNode
	rpcNodeProviders: RpcNodeProvider[]
	config?: ConnectionConfig
}

export const DynamicConnectionProvider: React.FC<DynamicConnectionProviderProps> = ({
	children,
	rpcNodeProviders,
	config = { commitment: 'confirmed' },
}) => {
	const [connection, setConnection] = useState(new Connection(rpcNodeProviders[0].endpoint, config))
	const makeCancelable = useCancelablePromise()
	const isMounted = useIsMounted()

	const createNewConnection = useCallback(
		async (endpoint: string) => {
			try {
				const newConnection = new Connection(endpoint, config)

				// Test the new connection with a dummy request
				await makeCancelable(newConnection.getVersion())
				if (isMounted()) {
					localStorage.setItem('endpoint', endpoint)
					setConnection(newConnection)
				}
			} catch (e) {
				console.log('Errored while trying to make a new RPC connection: ', e)
			}
		},
		[config, isMounted, makeCancelable]
	)

	const handleChange = async (event: SelectChangeEvent) => {
		const { value: endpoint } = event.target
		await createNewConnection(endpoint)
	}

	useEffect(() => {
		const endpoint = localStorage.getItem('endpoint')
		if (endpoint && endpoint !== connection.rpcEndpoint) makeCancelable(createNewConnection(endpoint))
	}, [connection.rpcEndpoint, createNewConnection, makeCancelable])

	return (
		<ConnectionContext.Provider value={{ connection }}>
			{children}
			<RpcEndpointSelect value={connection.rpcEndpoint} options={rpcNodeProviders} onChange={handleChange} />
		</ConnectionContext.Provider>
	)
}

export default DynamicConnectionProvider
