import React, { FunctionComponent, useEffect, useState } from "react";
import { CardModal } from "../../../modals/card";
import { View, Text, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { IconView } from "../button/icon";
import { XmarkIcon } from "../../icon/new/xmark";
import { registerModal } from "../../../modals/base";
import { BorderlessButton } from "react-native-gesture-handler";
import { RectButton } from "../../rect-button";
import { TextInput } from "../../input";
import { BlurBackground } from "../blur-background/blur-background";
import { SearchIcon } from "../../icon/new/search-icon";
import { AddressBookConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { AddressBookIcon } from "../../icon";

export const AddressBookCardModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  addressBookConfig: AddressBookConfig;
}> = registerModal(
  observer(({ close, title, isOpen, addressBookConfig }) => {
    const style = useStyle();
    const [search, setSearch] = useState("");

    const [filterAddressBook, setFilterAddressBook] = useState(
      addressBookConfig.addressBookDatas
    );

    useEffect(() => {
      const searchTrim = search.trim();
      const newAddressBook = addressBookConfig.addressBookDatas.filter(
        (data) => {
          return data.name.toLowerCase().includes(searchTrim.toLowerCase());
        }
      );
      setFilterAddressBook(newAddressBook);
    }, [addressBookConfig.addressBookDatas, search]);

    if (!isOpen) {
      return null;
    }

    return (
      <CardModal
        title={title}
        disableGesture={true}
        right={
          <BorderlessButton
            rippleColor={style.get("color-rect-button-default-ripple").color}
            activeOpacity={0.3}
            onPress={() => close()}
          >
            <IconView
              img={<XmarkIcon />}
              backgroundBlur={true}
              blurIntensity={20}
              borderRadius={50}
              iconStyle={style.flatten(["padding-12"]) as ViewStyle}
            />
          </BorderlessButton>
        }
      >
        <BlurBackground borderRadius={12} blurIntensity={20}>
          <TextInput
            placeholder="Search"
            placeholderTextColor={"white"}
            style={style.flatten(["h6"])}
            inputContainerStyle={
              style.flatten([
                "border-width-0",
                "padding-x-18",
                "padding-y-12",
              ]) as ViewStyle
            }
            onChangeText={(text) => {
              setSearch(text);
            }}
            containerStyle={style.flatten(["padding-0"]) as ViewStyle}
            inputRight={<SearchIcon />}
          />
        </BlurBackground>
        {filterAddressBook.length > 0 ? (
          <View style={style.flatten(["margin-y-24"]) as ViewStyle}>
            {filterAddressBook.map((data, i) => {
              return (
                <RectButton
                  key={i.toString()}
                  onPress={() => {
                    addressBookConfig.selectAddressAt(i);
                    close();
                  }}
                  activeOpacity={0.5}
                  style={
                    style.flatten([
                      "padding-16",
                      "border-radius-12",
                    ]) as ViewStyle
                  }
                  underlayColor={style.flatten(["color-gray-50"]).color}
                >
                  <Text
                    style={
                      style.flatten([
                        "body2",
                        "color-white",
                        "padding-bottom-10",
                      ]) as ViewStyle
                    }
                  >
                    {data.name}
                  </Text>
                  <Text style={style.flatten(["color-white"]) as ViewStyle}>
                    {data.address}
                  </Text>
                </RectButton>
              );
            })}
          </View>
        ) : (
          <View
            style={
              style.flatten([
                "justify-center",
                "items-center",
                "margin-y-24",
              ]) as ViewStyle
            }
          >
            {addressBookConfig.addressBookDatas.length == 0 ? (
              <React.Fragment>
                <View style={style.flatten(["margin-bottom-21"]) as ViewStyle}>
                  <AddressBookIcon
                    color={style.flatten(["color-platinum-100"]).color}
                    height={56}
                  />
                </View>
                <Text
                  style={style.flatten([
                    "subtitle2",
                    "color-gray-100",
                    "dark:color-platinum-300",
                  ])}
                >
                  Address book is empty
                </Text>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <View style={style.flatten(["margin-bottom-21"]) as ViewStyle}>
                  <SearchIcon
                    color={style.flatten(["color-platinum-100"]).color}
                    size={56}
                  />
                </View>
                <Text
                  style={style.flatten([
                    "subtitle2",
                    "color-gray-100",
                    "dark:color-platinum-300",
                  ])}
                >
                  No search data
                </Text>
              </React.Fragment>
            )}
          </View>
        )}
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    // disableClosingOnBackdropPress: true,
  }
);
