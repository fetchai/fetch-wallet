import React, { FunctionComponent, useEffect, useState } from "react";
import { GovernanceCardBody } from "./card";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { View, ViewStyle } from "react-native";
import { useSmartNavigation } from "navigation/smart-navigation";
import { HeaderRightButton } from "components/header";
import { ChipButton } from "components/new/chip";
import { FilterIcon } from "components/new/icon/filter-icon";
import { ProposalFilterModal } from "./filter-modal";
import { fetchProposals, fetchVote } from "utils/proposals/fetch-proposals";
import { ProposalType } from "src/@types/proposals-type";
import { PageWithScrollView } from "components/page";
import { InputCardView } from "components/new/card-view/input-card";
import { SearchIcon } from "components/new/icon/search-icon";
import { EmptyView } from "components/new/empty";

export const proposalOptions = {
  ProposalActive: "PROPOSAL_STATUS_VOTING_PERIOD",
  ProposalPassed: "PROPOSAL_STATUS_PASSED",
  ProposalRejected: "PROPOSAL_STATUS_REJECTED",
  ProposalFailed: "PROPOSAL_STATUS_FAILED",
};

export const GovernanceScreen: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, proposalStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const [search, setSearch] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [proposals, setProposals] = useState<ProposalType[]>([]);

  const queries = queriesStore.get(chainStore.current.chainId);
  const storedProposals = proposalStore.proposals;

  useEffect(() => {
    smartNavigation.setOptions({
      headerRight: () => (
        <HeaderRightButton
          onPress={() => {
            setIsOpenModal(true);
          }}
        >
          <ChipButton
            text="Filter"
            icon={<FilterIcon />}
            iconStyle={style.get("padding-top-2") as ViewStyle}
            containerStyle={
              style.flatten([
                "border-width-1",
                "border-color-white@20%",
              ]) as ViewStyle
            }
            backgroundBlur={false}
          />
        </HeaderRightButton>
      ),
    });
  }, [queries, chainStore, smartNavigation]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchProposals(chainStore.current.chainId);

        const votedProposals: ProposalType[] = [];
        const allProposals = response.proposals.reverse();
        let activeProposals = allProposals.filter((proposal: ProposalType) => {
          return proposal.status === proposalOptions.ProposalActive;
        });

        const promises = activeProposals.map(async (proposal: ProposalType) => {
          try {
            const vote = await fetchVote(
              proposal.proposal_id,
              accountInfo.bech32Address,
              chainStore.current.rest
            );
            if (vote.vote.option && vote.vote.option != "Unspecified")
              return proposal.proposal_id;
          } catch (e) {}
        });

        const voteArray = await Promise.all(promises);

        activeProposals = activeProposals.filter((proposal: ProposalType) => {
          if (voteArray.indexOf(proposal.proposal_id) != -1) {
            votedProposals.push(proposal);
            return false;
          }
          return true;
        });
        const closedProposals = allProposals.filter(
          (proposal: ProposalType) => {
            return (
              proposal.status === proposalOptions.ProposalPassed ||
              proposal.status === proposalOptions.ProposalRejected ||
              proposal.status === proposalOptions.ProposalFailed
            );
          }
        );
        proposalStore.setProposalsInStore({
          activeProposals,
          closedProposals,
          votedProposals,
          allProposals,
        });

        if (selectedIndex === 1) {
          setProposals(activeProposals);
          return;
        }
        if (selectedIndex === 2) {
          setProposals(closedProposals);
          return;
        }

        if (selectedIndex === 3) {
          setProposals(votedProposals);
          return;
        }

        setProposals(allProposals);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    let newProposal: ProposalType[];

    if (selectedIndex === 1) {
      newProposal = storedProposals.activeProposals;
    } else if (selectedIndex === 3) {
      newProposal = storedProposals.closedProposals;
    } else if (selectedIndex === 2) {
      newProposal = storedProposals.votedProposals;
    } else {
      newProposal = storedProposals.allProposals;
    }

    newProposal = newProposal.filter((proposal: ProposalType) => {
      if (
        proposal.content.title
          .toLowerCase()
          .includes(search.trim().toLowerCase()) ||
        proposal.proposal_id.includes(search)
      )
        return true;
    });

    setProposals(newProposal);
  }, [selectedIndex, search]);

  return (
    <PageWithScrollView
      backgroundMode="image"
      style={style.flatten(["padding-x-page"]) as ViewStyle}
      containerStyle={style.flatten(["overflow-scroll"]) as ViewStyle}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View
        style={style.flatten(["margin-top-16", "margin-bottom-8"]) as ViewStyle}
      >
        <InputCardView
          placeholder="Search by title or Proposal ID"
          placeholderTextColor={"white"}
          value={search}
          onChangeText={(text: string) => {
            setSearch(text);
          }}
          rightIcon={<SearchIcon size={12} />}
        />
      </View>
      {proposals.length !== 0 ? (
        proposals.map((item: ProposalType) => {
          return (
            <BlurBackground
              key={item.proposal_id}
              borderRadius={12}
              blurIntensity={16}
              containerStyle={style.flatten(["margin-y-6"]) as ViewStyle}
            >
              <GovernanceCardBody proposalId={item.proposal_id} />
            </BlurBackground>
          );
        })
      ) : (
        <EmptyView containerStyle={style.flatten(["flex-1"])} />
      )}
      <ProposalFilterModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </PageWithScrollView>
  );
});

export { GovernanceCardBody };
export * from "./details";
