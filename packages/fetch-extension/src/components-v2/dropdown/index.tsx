import React from "react";
import style from "./style.module.scss";
import closeIcon from "../../public/assets/svg/wireframe/closeImage.svg";
export interface DropdownProps {
  isOpen?: boolean;
  title: string;
  setIsOpen?: any;
  closeClicked: any;
  styleProp?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  title,
  setIsOpen,
  isOpen,
  closeClicked,
  styleProp,
}) => {
  return isOpen ? (
    <React.Fragment>
      <div
        onClick={() => {
          closeClicked;
          setIsOpen(false);
        }}
        className={style["overlay"]}
      />
      <div style={styleProp} className={style["dropdownContainer"]}>
        <div className={style["header"]}>
          {title}
          <img
            className={style["closeIcon"]}
            onClick={() => {
              closeClicked;
              setIsOpen(false);
            }}
            src={closeIcon}
          />
        </div>
        {children}
      </div>
    </React.Fragment>
  ) : null;
};