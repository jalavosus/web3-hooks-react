import {useState} from "react";

import {BigNumber} from "ethers";
import type {
	Signer,
	BigNumberish,
	ContractTransaction,
} from "ethers";
import type {Provider} from "@ethersproject/providers";

import {ERC20Abi, ERC20Abi__factory} from "./generated";

import {asError} from "./helpers";

/**
 * Parameters which are passed to various ERC20 hooks.
 *
 * @interface useERC20Params
 */
export interface useERC20Params {
	/**
	 * can be any of:
	 *  - window.ethereum
	 *  - an "ethereum" object returned by something like useMetamask
	 *  - an object implementing the ethersjs Provider interface (such as JsonRpcProvider or Web3Provider)
	 *  - an object implementing the ethersjs Signer interface.
	 */
	ethereum: any | Provider | Signer;
	/** Contract address of the ERC20-implementing contract. */
	contractAddress: string;
}

/**
 * Returned by {@link useERC20}, contains all functions of the ERC20 abi. Can be destructured based on desired use.
 *
 * @interface ERC20
 */
export interface ERC20 {
	name:        () => Promise<string>;
	symbol:      () => Promise<string>;
	decimals:    () => Promise<number>;
	totalSupply: () => Promise<BigNumber>;

	balanceOf: (owner: string) => Promise<BigNumber>;
	allowance: (owner: string, spender: string) => Promise<BigNumber>;

	approve:      (spender: string, amount: BigNumberish) => Promise<ContractTransaction>;
	transfer:     (to: string, amount: BigNumberish) => Promise<ContractTransaction>;
	transferFrom: (from: string, to: string, amount: BigNumberish) => Promise<ContractTransaction>;
}

/**
 * Contains the resultant ContractTransaction returned by a storage-modifying contract call (`payable` or `nonpayable` and not `view` or `pure`),
 * or an Error if the contract call failed.
 */
export type TransactionResult = {
	transaction?: ContractTransaction;
	error?:       Error;
}

/**
 *
 * @param {useERC20Params} params - ERC20 contract address and some sort of ethereum instance.
 *
 * @returns {ERC20} An object containing ERC20 contract functions.
 */
export function useERC20(params: useERC20Params): ERC20 {
	const connect = (e: any | Signer | Provider, addr: string): ERC20Abi => ERC20Abi__factory.connect(addr, e);

	const [contract, setContract] = useState<ERC20Abi>(connect(params.ethereum, params.contractAddress));

	return {
		name:         contract.name,
		symbol:       contract.symbol,
		decimals:     contract.decimals,
		totalSupply:  contract.totalSupply,
		balanceOf:    contract.balanceOf,
		allowance:    contract.allowance,
		approve:      contract.approve,
		transfer:     contract.transfer,
		transferFrom: contract.transferFrom,
	} as const
}

function useContract(params: useERC20Params) {
	const contract = useERC20(params);
	const [txn, setTxn] = useState<TransactionResult>();

	const setResult = (tx: ContractTransaction) => setTxn({transaction: tx})
	const setErr = (e: any) => setTxn({error: asError(e)})

	return [{contract, setResult, setErr}, txn] as const
}

/**
 * Returns a function which calls ERC20.approve() and sets the result of that function call in state,
 * along with the result.
 *
 * @param params - contract address and some form of ethereum instance.
 * @see {@link useERC20Params} for more details on params.
 *
 * @returns Const array containing (in order):
 * 	- `function(spender: string, amount: BigNumberish) => void`
 * 	- {@link TransactionResult}
 */
export function useApprove(params: useERC20Params) {
	const [{contract, setResult, setErr}, txn] = useContract(params);

	const fn = (spender: string, amount: BigNumberish) =>
		contract.approve(spender, amount)
			.then(setResult)
			.catch(setErr)

	return [fn, txn] as const
}

/**
 * Returns a function which calls ERC20.transfer() and sets the result of that function call in state,
 * along with the result.
 *
 * @param params - contract address and some form of ethereum instance.
 * @see {@link useERC20Params} for more details on params.
 *
 * @returns Const array containing (in order):
 * 	- `function(to: string, amount: BigNumberish) => void`
 * 	- {@link TransactionResult}
 */
export function useTransfer(params: useERC20Params) {
	const [{contract, setResult, setErr}, txn] = useContract(params);

	const fn = (to: string, amount: BigNumberish) =>
		contract.transfer(to, amount)
			.then(setResult)
			.catch(setErr)

	return [fn, txn] as const
}

/**
 * Returns a function which calls ERC20.transferFrom() and sets the result of that function call in state,
 * along with the result.
 *
 * @param params - contract address and some form of ethereum instance.
 * @see {@link useERC20Params} for more details on params.
 *
 * @returns Const array containing (in order):
 * 	- `function(from: string, to: string, amount: BigNumberish) => void`
 * 	- {@link TransactionResult}
 */
export function useTransferFrom(params: useERC20Params) {
	const [{contract, setResult, setErr}, txn] = useContract(params);

	const fn = (from: string, to: string, amount: BigNumberish) =>
		contract.transferFrom(from, to, amount)
			.then(setResult)
			.catch(setErr)

	return [fn, txn] as const
}