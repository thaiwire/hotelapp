import React from "react";

function InfoMessage({ message }: { message: string }) {
  return (
    <div className="p-5 text-sm border border-gray-400 rounded bg-gray-100">
      {message}
    </div>
  );
}

export default InfoMessage;
