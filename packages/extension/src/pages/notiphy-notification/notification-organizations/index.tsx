import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Button } from "reactstrap";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "@layouts/header-layout";
import { useHistory, useParams } from "react-router";
import style from "./style.module.scss";
import { NotificationOrg } from "@components/notification-org/notification-org";
import {
  fetchFollowedOrganisations,
  fetchOrganisations,
  followOrganisation,
  unfollowOrganisation,
} from "@utils/fetch-notification";
import { useStore } from "../../../stores";
import {
  NotificationSetup,
  NotyphiOrganisation,
  NotyphiOrganisations,
} from "@notificationTypes";
import { NotificationSearchInput } from "@components/notification-search-input";
import { notificationsDetails, setNotifications } from "@chatStore/user-slice";
import { store } from "@chatStore/index";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

const pageOptions = {
  edit: "edit",
  add: "add",
};

export const NotificationOrganizations: FunctionComponent = observer(() => {
  const { type } = useParams<{ type?: string }>();
  const history = useHistory();
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [inputVal, setInputVal] = useState("");

  const [mainOrgList, setMainOrgList] = useState<NotyphiOrganisation[]>([]);
  const [orgList, setOrgList] = useState<NotyphiOrganisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<NotyphiOrganisation[]>([]);

  const notificationInfo: NotificationSetup = useSelector(notificationsDetails);

  const [isLoading, setIsLoading] = useState(true);
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const followUnfollowObj = useRef<NotyphiOrganisations>({});

  useEffect(() => {
    fetchOrganisations().then((res) => {
      setIsLoading(false);
      setMainOrgList(res.items);
      setOrgList(res.items);

      if (type === pageOptions.edit) {
        const organisations = Object.values(notificationInfo.organisations);
        if (organisations.length == 0) {
          /// Updating the pre-selected orgs.
          fetchFollowedOrganisations(accountInfo.bech32Address).then(
            (followOrganisationList: NotyphiOrganisation[]) => {
              setSelectedOrg(followOrganisationList);

              /// Updating followed orgs in redux
              store.dispatch(
                setNotifications({
                  organisations: followOrganisationList,
                })
              );
            }
          );
        } else {
          setSelectedOrg(organisations);
        }
      }
    });
  }, [accountInfo.bech32Address, type]);

  const handleCheck = (isChecked: boolean, index: number) => {
    const item = orgList[index];

    if (isChecked) {
      setSelectedOrg([...selectedOrg, item]);
      followUnfollowObj.current[item.id] = {
        ...item,
        follow: isChecked,
      };
    } else {
      setSelectedOrg(selectedOrg.filter((element) => element.id != item.id));

      /// Unfollow is available in edit section only
      if (type === pageOptions.edit) {
        followUnfollowObj.current[item.id] = {
          ...item,
          follow: isChecked,
        };
      }
    }
  };

  const handleNextPage = async () => {
    setIsBtnLoading(true);
    const allPromises: any = [];

    Object.values(followUnfollowObj.current).map((element) => {
      if (element.follow) {
        allPromises.push(
          followOrganisation(accountInfo.bech32Address, element.id)
        );
      } else {
        allPromises.push(
          unfollowOrganisation(accountInfo.bech32Address, element.id)
        );
      }
    });

    Promise.allSettled(allPromises).then((_) => {
      store.dispatch(
        setNotifications({
          organisations: selectedOrg,
        })
      );

      if (type === pageOptions.edit) {
        history.goBack();
      } else {
        history.push({ pathname: "/notification/topics/add" });
      }
    });
  };

  const handleSearch = () => {
    const searchString = inputVal.trim();
    if (searchString.length == 0) {
      setOrgList(mainOrgList);
    } else {
      const filteredOrg: NotyphiOrganisation[] = mainOrgList.filter(
        (org: NotyphiOrganisation) =>
          org.name.toLowerCase().includes(searchString.toLowerCase())
      );
      setOrgList(filteredOrg);
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Organisations"}
      showBottomMenu={false}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.heading}>
        <FormattedMessage id="notification.organisation.header-message" />
      </div>
      <NotificationSearchInput
        handleSearch={handleSearch}
        inputVal={inputVal}
        setInputVal={setInputVal}
      />

      <div className={style.listContainer}>
        {isLoading ? (
          <div className={style.isLoading}>
            <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
          </div>
        ) : (
          <>
            {!orgList.length && (
              <div className={style.resultText}>
                <p>
                  No results found. <br /> Please refine your search.
                </p>
              </div>
            )}
            {orgList.map((elem: NotyphiOrganisation, index: number) => (
              <NotificationOrg
                handleCheck={(isChecked) => handleCheck(isChecked, index)}
                isChecked={
                  selectedOrg.find((item) => item.id === elem.id) ? true : false
                }
                elem={elem}
                key={elem.id}
              />
            ))}
          </>
        )}
      </div>
      <div className={style.buttonContainer}>
        <p>{selectedOrg.length} selected</p>
        <Button
          className={style.button}
          color="primary"
          disabled={Object.keys(followUnfollowObj.current).length === 0}
          onClick={handleNextPage}
        >
          {isBtnLoading ? (
            <i className="fa fa-spinner fa-spin fa-fw" />
          ) : type === pageOptions.edit ? (
            "Update Notification Preferences"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </HeaderLayout>
  );
});
