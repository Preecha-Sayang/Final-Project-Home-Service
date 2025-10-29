"use client";

import React from "react";
import ButtonPrimary from "../../components/button/buttonprimary";
import ButtonSecondary from "../../components/button/buttonsecondary";

type FooterActionProps = {
  backTitle?: string;
  forwardTitle?: string;
  onBackClick?: () => void;
  onForwardClick?: () => void;
  actionType?: "button" | "submit" | "reset";
};

const FooterAction: React.FC<FooterActionProps> = ({
  backTitle,
  forwardTitle,
  onBackClick,
  onForwardClick,
  actionType,
}) => {
  return (
    <div className="bg-white border-t mt-36">
      <div className="flex flex-row items-center justify-between mx-36 py-4">
        <ButtonSecondary onClick={onBackClick}>{backTitle}</ButtonSecondary>
        <ButtonPrimary
          className="w-auto"
          type={actionType || "button"}
          onClick={onForwardClick}
        >
          {forwardTitle}
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default FooterAction;
