import { Router } from "@keplr-wallet/router";
import {
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  UpdateNameKeyRingMsg,
  ShowKeyRingMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  CreateLedgerKeyMsg,
  AddLedgerKeyMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  SetKeyStoreCoinTypeMsg,
  RestoreKeyRingMsg,
  CheckPasswordMsg,
  ExportKeyRingDatasMsg,
  RequestVerifyADR36AminoSignDoc,
  RequestSignEIP712CosmosTxMsg_v0,
  InitNonDefaultLedgerAppMsg,
  CreateKeystoneKeyMsg,
  AddKeystoneKeyMsg,
  RequestICNSAdr36SignaturesMsg,
  ChangeKeyRingNameMsg,
  StatusMsg,
  LockWalletMsg,
  UnlockWalletMsg,
  CurrentAccountMsg,
  GetKeyMsgFetchSigning,
  RequestSignAminoMsgFetchSigning,
  RequestSignDirectMsgFetchSigning,
  RequestVerifyADR36AminoSignDocFetchSigning,
  SwitchAccountMsg,
  ListAccountsMsg,
  GetAccountMsg,
  RestoreWalletMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(RestoreKeyRingMsg);
  router.registerMessage(DeleteKeyRingMsg);
  router.registerMessage(UpdateNameKeyRingMsg);
  router.registerMessage(ShowKeyRingMsg);
  router.registerMessage(CreateMnemonicKeyMsg);
  router.registerMessage(AddMnemonicKeyMsg);
  router.registerMessage(CreatePrivateKeyMsg);
  router.registerMessage(AddPrivateKeyMsg);
  router.registerMessage(CreateKeystoneKeyMsg);
  router.registerMessage(CreateLedgerKeyMsg);
  router.registerMessage(AddKeystoneKeyMsg);
  router.registerMessage(AddLedgerKeyMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(GetKeyMsg);
  router.registerMessage(RequestSignAminoMsg);
  router.registerMessage(RequestVerifyADR36AminoSignDoc);
  router.registerMessage(RequestSignDirectMsg);
  router.registerMessage(GetMultiKeyStoreInfoMsg);
  router.registerMessage(ChangeKeyRingMsg);
  router.registerMessage(GetIsKeyStoreCoinTypeSetMsg);
  router.registerMessage(SetKeyStoreCoinTypeMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(ExportKeyRingDatasMsg);
  router.registerMessage(RequestSignEIP712CosmosTxMsg_v0);
  router.registerMessage(InitNonDefaultLedgerAppMsg);
  router.registerMessage(RequestICNSAdr36SignaturesMsg);
  router.registerMessage(ChangeKeyRingNameMsg);
  router.registerMessage(StatusMsg);
  router.registerMessage(LockWalletMsg);
  router.registerMessage(UnlockWalletMsg);
  router.registerMessage(CurrentAccountMsg);
  router.registerMessage(GetKeyMsgFetchSigning);
  router.registerMessage(RequestSignAminoMsgFetchSigning);
  router.registerMessage(RequestSignDirectMsgFetchSigning);
  router.registerMessage(RequestVerifyADR36AminoSignDocFetchSigning);
  router.registerMessage(SwitchAccountMsg);
  router.registerMessage(ListAccountsMsg);
  router.registerMessage(GetAccountMsg);
  router.registerMessage(RestoreWalletMsg);
  router.addHandler(ROUTE, getHandler(service));
}
