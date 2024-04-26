import React, { FunctionComponent, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { SelectAccountButton } from "components/new/select-account/select-account-button";
import { AddressCopyable } from "components/new/address-copyable";
import {
  DrawerActions,
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { useStore } from "stores/index";
import { IconButton } from "components/new/button/icon";
import {
  ManageWalletOption,
  WalletCardModel,
} from "components/new/wallet-card/wallet-card";
import { ChangeWalletCardModel } from "components/new/wallet-card/change-wallet";
import { useLoadingScreen } from "providers/loading-screen";
import { ChevronDownIcon } from "components/new/icon/chevron-down";
import { separateNumericAndDenom, titleCase } from "utils/format/format";
import { BlurButton } from "components/new/button/blur-button";
import { ThreeDotIcon } from "components/new/icon/three-dot";
import { useSmartNavigation } from "navigation/smart-navigation";
import { CameraPermissionModal } from "components/new/camera-permission-model/camera-permission";
import { Camera, PermissionStatus } from "expo-camera";
import {
  ModelStatus,
  handleOpenSettings,
} from "screens/register/import-from-extension/intro";
import { QRCodeIcon } from "components/new/icon/qrcode-icon";
import { NotificationIcon } from "components/new/icon/notification";
import { CameraPermissionOffIcon } from "components/new/icon/camerapermission-off";
import { CameraPermissionOnIcon } from "components/new/icon/camerapermission-on";

export const AccountSection: FunctionComponent<{
  containtStyle?: ViewStyle;
  tokenState: any;
}> = observer(({ containtStyle, tokenState }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const smartNavigation = useSmartNavigation();
  const loadingScreen = useLoadingScreen();
  const style = useStyle();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [changeWalletModal, setChangeWalletModal] = useState(false);

  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [openCameraModel, setIsOpenCameraModel] = useState(false);
  const [modelStatus, setModelStatus] = useState(ModelStatus.First);

  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    keyRingStore,
    analyticsStore,
  } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakableReward = rewards.stakableReward;

  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum).add(stakableReward);

  const totalPrice = priceStore.calculatePrice(total);

  const { numericPart: totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      total.shrink(true).trim(true).maxDecimals(6).toString()
    );

  const changeInDollarsValue =
    tokenState.type === "positive"
      ? (parseFloat(totalNumber) * tokenState.diff) / 100
      : -(parseFloat(totalNumber) * tokenState.diff) / 100;

  return (
    <View style={style.flatten(["padding-x-page"]) as ViewStyle}>
      <View style={style.flatten(["flex-row", "justify-between"]) as ViewStyle}>
        <SelectAccountButton
          backgroundBlur={false}
          containerStyle={
            style.flatten([
              "padding-x-12",
              "border-width-1",
              "border-color-white-400",
            ]) as ViewStyle
          }
          text={titleCase(chainStore.current.chainName)}
          icon={<ChevronDownIcon size={12} />}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <View style={style.flatten(["flex-row"])}>
          <IconButton
            borderRadius={32}
            icon={<QRCodeIcon />}
            backgroundBlur={false}
            onPress={() => {
              if (permission?.status == PermissionStatus.UNDETERMINED) {
                setIsOpenCameraModel(true);
              } else {
                if (!permission?.granted) {
                  setModelStatus(ModelStatus.Second);
                  setIsOpenCameraModel(true);
                } else {
                  smartNavigation.navigateSmart("Camera", {
                    showMyQRButton: false,
                  });
                }
              }
            }}
            iconStyle={
              style.flatten([
                "border-width-1",
                "border-color-white-400",
                "padding-x-18",
                "padding-y-8",
                "justify-center",
                "margin-right-12",
              ]) as ViewStyle
            }
          />
          <IconButton
            borderRadius={32}
            icon={<NotificationIcon />}
            backgroundBlur={false}
            onPress={() => smartNavigation.navigateSmart("Inbox", {})}
            iconStyle={
              style.flatten([
                "border-width-1",
                "border-color-white-400",
                "padding-x-18",
                "padding-y-8",
                "justify-center",
              ]) as ViewStyle
            }
          />
        </View>
      </View>
      <BlurBackground
        borderRadius={14}
        blurIntensity={16}
        containerStyle={
          [
            style.flatten([
              "flex-row",
              "justify-between",
              "items-center",
              "margin-top-24",
              "margin-bottom-12",
              "padding-x-8",
              "padding-y-6",
              "border-width-1",
              "border-color-indigo-200",
            ]),
            containtStyle,
          ] as ViewStyle
        }
      >
        <View
          style={style.flatten(["margin-x-10", "margin-bottom-2"]) as ViewStyle}
        >
          <Text
            style={
              style.flatten([
                "h6",
                "color-white",
                "margin-right-6",
              ]) as ViewStyle
            }
          >
            {account.name}
          </Text>
          <AddressCopyable address={account.bech32Address} maxCharacters={16} />
        </View>
        <IconButton
          backgroundBlur={false}
          icon={<ThreeDotIcon />}
          iconStyle={style.flatten(["padding-12"]) as ViewStyle}
          onPress={() => setIsOpenModal(true)}
        />
      </BlurBackground>
      <View style={style.flatten(["items-center"]) as ViewStyle}>
        <View
          style={
            style.flatten([
              "flex-row",
              "margin-top-14",
              "justify-center",
              "width-full",
            ]) as ViewStyle
          }
        >
          <Text
            style={
              style.flatten(["h1", "color-white", "font-medium"]) as ViewStyle
            }
          >
            {totalNumber}
          </Text>
          <Text
            style={
              style.flatten([
                "h1",
                "color-gray-400",
                "margin-left-8",
                "font-medium",
              ]) as ViewStyle
            }
          >
            {totalDenom}
          </Text>
        </View>
        <View style={style.flatten(["flex-row", "margin-y-4"]) as ViewStyle}>
          <Text
            style={
              style.flatten([
                "color-gray-300",
                "body3",
                "font-bold",
                "width-full",
                "text-center",
              ]) as ViewStyle
            }
          >
            {totalPrice &&
              ` ${totalPrice.toString()} ${priceStore.defaultVsCurrency.toUpperCase()}`}
          </Text>
        </View>
        {tokenState ? (
          <View style={style.flatten(["flex-row"]) as ViewStyle}>
            <Text
              style={
                style.flatten(
                  ["color-orange-400", "text-caption2"],
                  [tokenState.type === "positive" && "color-vibrant-green-500"]
                ) as ViewStyle
              }
            >
              {tokenState.type === "positive" && "+"}
              {changeInDollarsValue.toFixed(4)} {totalDenom}(
              {tokenState.type === "positive" ? "+" : "-"}
              {parseFloat(tokenState.diff).toFixed(2)} %)
            </Text>
            <Text
              style={
                style.flatten([
                  "color-gray-300",
                  "h7",
                  "margin-left-8",
                ]) as ViewStyle
              }
            >
              {tokenState.time}
            </Text>
          </View>
        ) : null}
        <BlurButton
          backgroundBlur={false}
          containerStyle={
            style.flatten([
              "padding-x-12",
              "border-width-1",
              "border-color-white-400",
              "margin-top-20",
              "border-radius-32",
            ]) as ViewStyle
          }
          textStyle={style.flatten(["h7"]) as ViewStyle}
          text={"View portfolio"}
          onPress={() => navigation.navigate("Portfolio")}
        />
      </View>
      <WalletCardModel
        isOpen={isOpenModal}
        title="Manage Wallet"
        close={() => setIsOpenModal(false)}
        onSelectWallet={(option: ManageWalletOption) => {
          switch (option) {
            case ManageWalletOption.addNewWallet:
              analyticsStore.logEvent("Add additional account started");
              navigation.navigate("Register", {
                screen: "Register.Intro",
              });
              break;

            case ManageWalletOption.changeWallet:
              setChangeWalletModal(true);
              setIsOpenModal(false);
              break;

            case ManageWalletOption.renameWallet:
              smartNavigation.navigateSmart("RenameWallet", {});
              setIsOpenModal(false);
              break;

            case ManageWalletOption.deleteWallet:
              smartNavigation.navigateSmart("DeleteWallet", {});
              setIsOpenModal(false);
              break;
          }
        }}
      />
      <ChangeWalletCardModel
        isOpen={changeWalletModal}
        title="Change Wallet"
        keyRingStore={keyRingStore}
        close={() => setChangeWalletModal(false)}
        onChangeAccount={async (keyStore) => {
          const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
          if (index >= 0) {
            loadingScreen.setIsLoading(true);
            await keyRingStore.changeKeyRing(index);
            loadingScreen.setIsLoading(false);
          }
        }}
      />
      <CameraPermissionModal
        title={
          modelStatus == ModelStatus.First
            ? "Camera permission"
            : "Camera permission is disabled"
        }
        icon={
          modelStatus == ModelStatus.First ? (
            <CameraPermissionOffIcon />
          ) : (
            <CameraPermissionOnIcon />
          )
        }
        buttonText={
          modelStatus == ModelStatus.First
            ? "Allow Fetch to use camera"
            : "Enable camera permission in settings"
        }
        isOpen={openCameraModel}
        close={() => setIsOpenCameraModel(false)}
        onPress={async () => {
          const permissionStatus = await requestPermission();
          if (
            !permission?.granted &&
            permissionStatus.status === PermissionStatus.DENIED
          ) {
            if (permissionStatus.canAskAgain) {
              setIsOpenCameraModel(false);
            } else {
              await handleOpenSettings();
              setIsOpenCameraModel(false);
            }
          } else {
            setIsOpenCameraModel(false);
            if (permissionStatus.status === PermissionStatus.GRANTED) {
              smartNavigation.navigateSmart("Camera", {
                showMyQRButton: false,
              });
            }
          }
        }}
      />
    </View>
  );
});
