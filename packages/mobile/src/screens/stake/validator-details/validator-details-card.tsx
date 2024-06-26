import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody } from "components/card";
import { useStore } from "stores/index";
import { Staking } from "@keplr-wallet/stores";
import { Linking, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { Button } from "components/button";
import { useSmartNavigation } from "navigation/smart-navigation";
import { ValidatorThumbnail } from "components/thumbnail";
import { MarkdownView } from "react-native-markdown-view";

export const ValidatorDetailsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const validator = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators)
      .find((val) => val.operator_address === validatorAddress);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
    validatorAddress,
  ]);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  const thumbnail =
    bondedValidators.getValidatorThumbnail(validatorAddress) ||
    unbondingValidators.getValidatorThumbnail(validatorAddress) ||
    unbondedValidators.getValidatorThumbnail(validatorAddress);

  return (
    <Card style={containerStyle}>
      {validator ? (
        <CardBody>
          <View
            style={
              style.flatten([
                "flex-row",
                "items-center",
                "margin-bottom-16",
              ]) as ViewStyle
            }
          >
            <ValidatorThumbnail
              style={style.flatten(["margin-right-12"]) as ViewStyle}
              size={44}
              url={thumbnail}
            />
            <Text style={style.flatten(["h4", "color-text-middle"])}>
              {validator.description.moniker}
            </Text>
          </View>
          <View
            style={style.flatten(["flex-row", "margin-bottom-12"]) as ViewStyle}
          >
            <View style={style.flatten(["flex-1"])}>
              <Text
                style={
                  style.flatten([
                    "h6",
                    "color-text-middle",
                    "margin-bottom-4",
                  ]) as ViewStyle
                }
              >
                Commission
              </Text>
              <Text style={style.flatten(["body3", "color-text-middle"])}>
                {new IntPretty(
                  new Dec(validator.commission.commission_rates.rate)
                )
                  .decreasePrecision(2)
                  .maxDecimals(2)
                  .trim(true)
                  .toString() + "%"}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <Text
                style={
                  style.flatten([
                    "h6",
                    "color-text-middle",
                    "margin-bottom-4",
                  ]) as ViewStyle
                }
              >
                Voting Power
              </Text>
              <Text style={style.flatten(["body3", "color-text-middle"])}>
                {new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(validator.tokens)
                )
                  .maxDecimals(0)
                  .toString()}
              </Text>
            </View>
          </View>
          {validator.description.details ? (
            <View style={style.flatten(["margin-bottom-14"]) as ViewStyle}>
              <Text
                style={
                  style.flatten([
                    "h6",
                    "color-text-middle",
                    "margin-bottom-4",
                  ]) as ViewStyle
                }
              >
                Description
              </Text>
              <MarkdownView
                onLinkPress={(url: string) => {
                  Linking.openURL(url).catch((error) =>
                    console.warn("An error occurred: ", error)
                  );
                }}
              >
                {validator.description.details}
              </MarkdownView>
            </View>
          ) : null}
          <Button
            text="Stake"
            onPress={() => {
              smartNavigation.navigateSmart("Delegate", {
                validatorAddress,
              });
            }}
          />
        </CardBody>
      ) : null}
    </Card>
  );
});
