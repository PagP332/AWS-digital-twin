import Image from "next/image";
import React from "react";

export const PAGASA = ({ size = 42 }) => {
  return (
    <Image
      src="/Philippine_Atmospheric,_Geophysical_and_Astronomical_Services_Administration_(PAGASA)_logo.png"
      alt="pagasa seal"
      width={size}
      height={size}
    />
  );
};

export default function Logos() {
  return (
    <div className="absolute right-8 bottom-8 z-60 flex gap-1">
      {/* <Image src="/DOST_seal.png" alt="dost seal" width={42} height={42} /> */}
      <Image
        src="/logo_black.png"
        alt="project awsome logo"
        width={82}
        height={42}
      />
      <Image src="/T.I.P._Logo.png" alt="tip seal" width={57} height={42} />
    </div>
  );
}
