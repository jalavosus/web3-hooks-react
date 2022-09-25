import type {Signer} from "ethers";
import type {Provider} from "@ethersproject/providers";

export interface UseContractParams {
	/**
	 * can be any of:
	 *  - window.ethereum
	 *  - an "ethereum" object returned by something like useMetamask
	 *  - an object implementing the ethersjs Provider interface (such as JsonRpcProvider or Web3Provider)
	 *  - an object implementing the ethersjs Signer interface.
	 */
	ethereum: any | Provider | Signer;
	/** Contract address. */
	contractAddress: string;
}