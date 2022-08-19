import {
	BaseSignerWalletAdapter,
	SendTransactionOptions,
	WalletName,
	WalletReadyState,
} from '@solana/wallet-adapter-base'
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js'

/* solana/wallet-adapter does not support Phantom-ledger wallets */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PhantomLedgerWalletAdapterConfig {}

export declare const PhantomLedgerWalletName: WalletName<'Phantom Ledger'>
export declare class PhantomLedgerWalletAdapter extends BaseSignerWalletAdapter {
	name: WalletName<'Phantom Ledger'>

	url: string

	icon: string

	private _connecting

	private _wallet

	private _publicKey

	private _readyState

	constructor(config?: PhantomLedgerWalletAdapterConfig)
	get publicKey(): PublicKey | null
	get connecting(): boolean
	get connected(): boolean
	get readyState(): WalletReadyState
	connect(): Promise<void>
	disconnect(): Promise<void>
	sendTransaction(
		transaction: Transaction,
		connection: Connection,
		options?: SendTransactionOptions
	): Promise<TransactionSignature>
	signTransaction(transaction: Transaction): Promise<Transaction>
	signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
	signMessage(message: Uint8Array): Promise<Uint8Array>
	private _disconnected
}
