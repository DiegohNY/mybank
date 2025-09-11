import React from "react";
import { IoArrowUp, IoArrowDown, IoWallet } from "react-icons/io5";

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
    case "transfer_in":
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center">
          <IoArrowUp className="w-5 h-5 text-emerald-600" />
        </div>
      );
    case "withdrawal":
    case "transfer_out":
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center">
          <IoArrowDown className="w-5 h-5 text-red-600" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
          <IoWallet className="w-5 h-5 text-blue-600" />
        </div>
      );
  }
};
