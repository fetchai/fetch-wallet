import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { EthereumEndpoint } from "../../../config.ui";
import { HeaderLayout } from "@layouts/index";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { ChatMember } from "@components/chat-member";
import { GroupMembers, NameAddress, NewGroupDetails } from "@chatTypes";
import { useSelector } from "react-redux";
import {
  newGroupDetails,
  resetNewGroup,
  setNewGroupInfo,
} from "@chatStore/new-group-slice";
import { store } from "@chatStore/index";
import { createGroup } from "@graphQL/groups-api";
import { Button } from "reactstrap";
import { setGroups } from "@chatStore/messages-slice";

export const ReviewGroupChat: FunctionComponent = observer(() => {
  const history = useHistory();

  const newGroupState: NewGroupDetails = useSelector(newGroupDetails);
  const selectedMembers: GroupMembers[] = newGroupState.group.members || [];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<NameAddress[]>([]);
  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;
  // address book values
  const queries = queriesStore.get(chainStore.current.chainId);
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.ibcTransfer,
    accountInfo.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  useEffect(() => {
    const userAddresses: NameAddress[] = addressBookConfig.addressBookDatas.filter(
      (element) => {
        const addressData = selectedMembers.find(
          (data) => data.address === element.address
        );

        if (addressData && addressData.address !== walletAddress)
          return {
            name: element.name,
            address: element.address,
          };
      }
    );
    setAddresses([{ name: "You", address: walletAddress }, ...userAddresses]);
  }, [addressBookConfig.addressBookDatas]);

  const handleRemoveMember = async (contactAddress: string) => {
    const tempAddresses = selectedMembers.filter(
      (item) => item.address !== contactAddress
    );
    store.dispatch(setNewGroupInfo({ members: tempAddresses }));
    setAddresses(addresses.filter((item) => item.address !== contactAddress));
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={newGroupState.group.name}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.tokens}>
        <img
          className={style.groupImage}
          src={require("@assets/group710.svg")}
        />
        <span className={style.recommendedSize}>
          {newGroupState.group.description}
        </span>
        {newGroupState.isEditGroup && (
          <Button
            className={style.button}
            size="large"
            onClick={async () => {
              history.push("/group-chat/edit-member");
            }}
          >
            Edit Chat Settings
          </Button>
        )}
      </div>
      <div className={style.membersContainer}>
        {addresses.map((address: NameAddress) => {
          return (
            <ChatMember
              address={address}
              key={address.address}
              /// showSelectedIcon: isEditGroup true means remove the cross icon
              showSelectedIcon={!newGroupState.isEditGroup}
              isSelected={true}
              isShowAdmin={
                selectedMembers.find(
                  (element) => element.address === address.address
                )?.isAdmin ?? false
              }
              onIconClick={() => {
                handleRemoveMember(address.address);
              }}
            />
          );
        })}
      </div>
      {!newGroupState.isEditGroup && (
        <Button
          className={style.button}
          size="large"
          data-loading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            const group = await createGroup(newGroupState.group);
            setIsLoading(false);

            if (group) {
              store.dispatch(resetNewGroup());
              const groupsObj: any = {};
              groupsObj[group.id] = group;

              store.dispatch(setGroups({ groups: groupsObj }));
              /// Todo handle backstack
              history.push(`/group-chat/chat-section/${group.id}`);
            }
          }}
        >
          Create Group Chat
        </Button>
      )}
    </HeaderLayout>
  );
});
