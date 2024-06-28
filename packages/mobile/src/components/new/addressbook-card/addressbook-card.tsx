import React, { FunctionComponent, useEffect, useState } from "react";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { RectButton } from "components/rect-button";
import { AddressBookConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { SearchIcon } from "components/new/icon/search-icon";
import { EmptyView } from "../empty";
import { useStore } from "stores/index";
import { Button } from "components/button";
import { InputCardView } from "../card-view/input-card";

export const AddressBookCardModel: FunctionComponent<{
  hideCurrentAddress?: boolean;
  isOpen: boolean;
  close: () => void;
  title: string;
  addressBookConfig: AddressBookConfig;
  addAddressBook?: (add: boolean | undefined) => void;
}> = observer(
  ({
    close,
    title,
    hideCurrentAddress = true,
    isOpen,
    addressBookConfig,
    addAddressBook,
  }) => {
    const style = useStyle();
    const [search, setSearch] = useState("");
    const { chainStore, accountStore, analyticsStore } = useStore();
    const account = accountStore.getAccount(chainStore.current.chainId);

    const [filterAddressBook, setFilterAddressBook] = useState(
      addressBookConfig.addressBookDatas
    );

    useEffect(() => {
      const searchTrim = search.trim();
      const newAddressBook = addressBookConfig.addressBookDatas.filter(
        (data) => {
          return (
            data.name.toLowerCase().includes(searchTrim.toLowerCase()) &&
            hideCurrentAddress &&
            !data.address.includes(account.bech32Address)
          );
        }
      );
      setFilterAddressBook(newAddressBook);
    }, [addressBookConfig.addressBookDatas, search]);

    if (!isOpen) {
      return null;
    }

    return (
      <CardModal
        isOpen={isOpen}
        title={title}
        disableGesture={true}
        close={() => {
          setSearch("");
          close();
        }}
      >
        <InputCardView
          placeholder="Search"
          placeholderTextColor={"white"}
          value={search}
          onChangeText={(text: string) => {
            setSearch(text);
          }}
          rightIcon={<SearchIcon size={12} />}
          containerStyle={style.flatten(["margin-bottom-24"]) as ViewStyle}
        />
        {filterAddressBook.length > 0 ? (
          <View style={style.flatten(["margin-top-24"]) as ViewStyle}>
            {filterAddressBook.map((data, i) => {
              return (
                <RectButton
                  key={i.toString()}
                  onPress={() => {
                    addressBookConfig.selectAddressAt(i);
                    setSearch("");
                    close();
                  }}
                  activeOpacity={0.5}
                  style={
                    style.flatten([
                      "padding-12",
                      "border-radius-12",
                    ]) as ViewStyle
                  }
                  underlayColor={style.flatten(["color-gray-50"]).color}
                >
                  <Text
                    style={
                      style.flatten([
                        "body3",
                        "color-white",
                        "padding-bottom-10",
                      ]) as ViewStyle
                    }
                  >
                    {data.name}
                  </Text>
                  <Text
                    style={
                      style.flatten([
                        "color-white",
                        "text-caption2",
                      ]) as ViewStyle
                    }
                  >
                    {data.address}
                  </Text>
                </RectButton>
              );
            })}
          </View>
        ) : addressBookConfig.addressBookDatas.length == 0 ? (
          <React.Fragment>
            <Text
              style={
                style.flatten([
                  "body3",
                  "text-center",
                  "color-white",
                  "margin-y-24",
                ]) as ViewStyle
              }
            >
              You haven’t saved any addresses yet
            </Text>
            <Button
              containerStyle={
                style.flatten([
                  "border-radius-32",
                  "border-color-white@40%",
                ]) as ViewStyle
              }
              mode="outline"
              textStyle={style.flatten(["color-white", "body2", "font-normal"])}
              text="Add an address"
              onPress={() => {
                if (addAddressBook) {
                  addAddressBook(true);
                  analyticsStore.logEvent("add_an_address_click", {
                    pageName: "Send",
                  });
                }
                close();
              }}
            />
          </React.Fragment>
        ) : (
          <EmptyView
            containerStyle={
              style.flatten(["relative", "height-214"]) as ViewStyle
            }
          />
        )}
      </CardModal>
    );
  }
);
