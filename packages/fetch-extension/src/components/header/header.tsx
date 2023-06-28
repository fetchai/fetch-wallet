import React, { FunctionComponent } from "react";
import classnames from "classnames";

import "./style";

export interface HeaderProps {
  fixed?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  notification?: React.ReactNode;
}

export const Header: FunctionComponent<HeaderProps> = ({
  fixed,
  left,
  right,
  children,
  notification,
}) => {
  return (
    <div className={classnames(["header", { fixed }])}>
      <div className="header-menu-left">{left}</div>
      <div className="header-section">{children}</div>
      <div className="header-menu-right">
        {notification} {right}
      </div>
    </div>
  );
};