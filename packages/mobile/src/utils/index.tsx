import {
  CHAIN_ID_DORADO,
  CHAIN_ID_ERIDANUS,
  CHAIN_ID_FETCHHUB,
} from "../config";

export function isFeatureAvailable(chainId: string): boolean {
  return (
    chainId === CHAIN_ID_DORADO ||
    chainId === CHAIN_ID_FETCHHUB ||
    chainId === CHAIN_ID_ERIDANUS
  );
}
