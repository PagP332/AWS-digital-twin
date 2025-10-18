import Image from "next/image";
import React from "react";

export const PAGASA = ({ size = 42 }) => {
  return (
    <Image
      src="/Philippine_Atmospheric,_Geophysical_and_Astronomical_Services_Administration_(PAGASA)_logo.png"
      alt="pagasa seal"
      width={size}
      height={size}
      className="dark:drop-shadow-md/50 dark:drop-shadow-white"
    />
  );
};

export default function Logos() {
  return (
    <div className="absolute bottom-8 right-8 flex gap-1 z-60">
      <Image src="/DOST_seal.png" alt="dost seal" width={42} height={42} />
      <Image
        src="/Philippine_Atmospheric,_Geophysical_and_Astronomical_Services_Administration_(PAGASA)_logo.png"
        alt="pagasa seal"
        width={42}
        height={42}
      />
      <Image src="/T.I.P._Logo.png" alt="tip seal" width={42} height={42} />
    </div>
  );
}
