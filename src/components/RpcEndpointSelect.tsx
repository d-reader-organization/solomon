import React from 'react'
import { FormControl, InputLabel, MenuItem, Select, Box, SelectProps } from '@mui/material'
import { RpcNodeProvider } from 'constants/rpcNodeProviders'
import { useWindowScrollPositions } from 'hooks'

interface Props extends SelectProps<string> {
	options: RpcNodeProvider[]
}

export const RpcEndpointSelect: React.FC<Props> = ({ options, ...props }) => {
	const { scrollY } = useWindowScrollPositions()

	return (
		<Box
			style={{
				position: 'fixed',
				bottom: 0,
				right: 0,
				zIndex: 1,
				padding: '1rem',
				maxWidth: '100%',
				transform: `translateY(${scrollY / 2}px)`,
			}}
		>
			<FormControl fullWidth>
				<InputLabel id='rpc-endpoint-select-label'>RPC Endpoint</InputLabel>
				<Select
					labelId='rpc-endpoint-select-label'
					id='rpc-endpoint-select'
					label='rpc-endpoint'
					style={{ fontSize: '1rem' }}
					MenuProps={{
						PaperProps: {
							className: 'rpc-endpoint-select-paper',
							style: { backgroundImage: 'none' },
						},
						MenuListProps: {
							className: 'rpc-endpoint-select-option-list',
							style: { width: 'min-content', maxWidth: '100%' },
						},
					}}
					className='rpc-endpoint-select'
					{...props}
				>
					{options.map((option) => (
						<MenuItem
							value={option.endpoint}
							key={option.name}
							style={{
								fontSize: '1rem',
								textOverflow: 'ellipsis',
								width: '100%',
								overflow: 'hidden',
								display: 'inline-block',
							}}
							className='rpc-endpoint-select-option-item'
						>
							{option.name} ({option.endpoint})
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	)
}

export default RpcEndpointSelect
