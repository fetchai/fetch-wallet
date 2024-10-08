import React, { CSSProperties, FunctionComponent, useState } from "react";

import { useDropdown } from "@components-v2/dropdown/dropdown-context";
import { BottomNav } from "../bottom-nav";
import { Header, Props as HeaderProps } from "../header";
import { MenuContext, MenuProvider } from "../menu";
import { isRunningInSidePanel } from "@utils/side-panel";
import style from "./style.module.scss";

export interface Props extends HeaderProps {
  style?: CSSProperties;
  innerStyle?: CSSProperties;
  showBottomMenu?: boolean;
  showTopMenu?: boolean;
}

export const HeaderLayout: FunctionComponent<Props> = (props) => {
  const { children } = props;

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuContext: MenuContext = {
    open: () => {
      setMenuOpen(true);
    },
    close: () => {
      setMenuOpen(false);
    },
    toggle: () => {
      setMenuOpen(!isMenuOpen);
    },
  };

  const headerStyle = {
    paddingTop: props.showTopMenu ? "64px" : "0px",
  };

  const { isDropdownOpen } = useDropdown();

  return (
    <MenuProvider value={menuContext}>
      <div
        className={
          !isRunningInSidePanel()
            ? style["container"]
            : style["container-sidePanel"]
        }
        style={props.style}
      >
        {props.showTopMenu && <Header {...props} isMenuOpen={isMenuOpen} />}
        <div
          style={{ ...headerStyle, ...props.innerStyle }}
          className={
            props.showBottomMenu && isDropdownOpen === false
              ? style["innerContainerWithMask"]
              : !isRunningInSidePanel()
              ? style["innerContainer"]
              : style["innerContainer-sidePanel"]
          }
        >
          {children}
        </div>
        {(props.showBottomMenu ?? true) && <BottomNav />}
      </div>
    </MenuProvider>
  );
};
