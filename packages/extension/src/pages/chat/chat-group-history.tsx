import React, { createRef, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import {
  userChatGroupPagination,
  userChatGroups,
} from "@chatStore/messages-slice";
import { recieveGroups } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { useStore } from "../../stores";
import { formatAddress } from "../../utils/format";
import style from "./style.module.scss";
import { userDetails } from "@chatStore/user-slice";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { Groups, NameAddress, Pagination } from "@chatTypes";
import { ChatUser } from "./chat-user";
import { ChatGroupUser } from "./chat-group-user";

export const ChatsGroupHistory: React.FC<{
  chainId: string;
  searchString: string;
  addresses: NameAddress;
  setLoadingChats: any;
}> = ({ chainId, addresses, setLoadingChats, searchString }) => {
  const history = useHistory();
  const userState = useSelector(userDetails);
  const groups: Groups = useSelector(userChatGroups);
  const groupsPagination: Pagination = useSelector(userChatGroupPagination);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  //Scrolling Logic
  const messagesEndRef: any = createRef();
  const messagesEncRef: any = useRef(null);
  const isOnScreen = useOnScreen(messagesEndRef);

  useEffect(() => {
    const getChats = async () => {
      await loadUserGroups();
      messagesEncRef.current.scrollIntoView(true);
    };
    if (isOnScreen) getChats();
  }, [isOnScreen]);

  const loadUserGroups = async () => {
    if (!loadingGroups) {
      const page = groupsPagination?.page + 1 || 0;
      setLoadingGroups(true);
      await recieveGroups(page, accountInfo.bech32Address);
      setLoadingGroups(false);
      setLoadingChats(false);
    }
  };

  const filterGroups = (contact: string) => {
    const contactAddressBookName = addresses[contact];

    if (userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts) {
      if (searchString.length > 0) {
        if (
          !contactAddressBookName
            ?.toLowerCase()
            .includes(searchString.trim().toLowerCase())
        )
          return false;
      }

      return !!contactAddressBookName;
    } else {
      /// PrivacySetting.Everybody
      if (searchString.length > 0) {
        if (
          !contactAddressBookName
            ?.toLowerCase()
            .includes(searchString.trim().toLowerCase()) &&
          !contact.toLowerCase().includes(searchString.trim().toLowerCase())
        )
          return false;
      }
      return true;
    }
  };

  if (!Object.keys(groups).length)
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          No results. Don&apos;t worry you can create a new chat by clicking on
          the icon beside the search box.
        </div>
      </div>
    );

  if (
    !Object.keys(groups).filter((contact) => filterGroups(contact)).length &&
    userState.messagingPubKey.privacySetting &&
    userState.messagingPubKey.privacySetting === PrivacySetting.Contacts
  )
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          If you are searching for an address not in your address book, you
          can&apos;t see them due to your selected privacy settings being
          &quot;contact only&quot;. Please add the address to your address book
          to be able to chat with them or change your privacy settings.
          <br />
          <a
            href="#"
            style={{
              textDecoration: "underline",
            }}
            onClick={(e) => {
              e.preventDefault();
              history.push("/setting/chat/privacy");
            }}
          >
            Go to chat privacy settings
          </a>
        </div>
      </div>
    );

  if (!Object.keys(groups).filter((contact) => filterGroups(contact)).length)
    return (
      <div className={style.groupsArea}>
        <div className={style.resultText}>
          No results found. Please refine your search.
        </div>
      </div>
    );

  return (
    <div className={style.groupsArea}>
      {Object.keys(groups)
        .sort(
          (a, b) =>
            parseFloat(groups[b].lastMessageTimestamp) -
            parseFloat(groups[a].lastMessageTimestamp)
        )
        .filter((contact) => filterGroups(contact))
        .map((contact, index) => {
          // translate the contact address into the address book name if it exists
          const contactAddressBookName = addresses[contact];
          return (
            <div key={groups[contact].id}>
              {groups[contact].isDm ? (
                <ChatUser
                  group={groups[contact]}
                  contactName={
                    contactAddressBookName
                      ? formatAddress(contactAddressBookName)
                      : formatAddress(contact)
                  }
                  targetAddress={contact}
                  chainId={chainId}
                />
              ) : (
                <ChatGroupUser chainId={chainId} group={groups[contact]} />
              )}
              {index === Object.keys(groups).length - 10 && (
                <div ref={messagesEncRef} />
              )}
            </div>
          );
        })}
      {groupsPagination?.lastPage > groupsPagination?.page && (
        <div className={style.loader} ref={messagesEndRef}>
          Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      )}
    </div>
  );
};
