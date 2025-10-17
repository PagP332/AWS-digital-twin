"use client"
import Button from "@/components/Button"
import FloatingWindow from "@/components/FloatingWindow"
import InputField from "@/components/InputField"
import Image from "next/image"
import { useRouter } from "next/navigation"

// DEFAULT LANDING PAGE (LOGIN PAGE)

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative flex items-center justify-center bg-background p-8 h-dvh text-center font-inter">
      <FloatingWindow>
        <div className="my-10 mb-15">
          <h1 className="font-light text-xl mt-5">Create New User</h1>
        </div>
        <InputField text="Username" />
        <InputField text="Password" />
        <Button text="Submit" onClick={() => console.log("Login")} className="text-background !bg-accent" />
      </FloatingWindow>
      <p className="absolute bottom-8 text-xs opacity-50">©2025</p>
      <div className="absolute bottom-8 right-8 flex gap-1">
        <Image src="/DOST_seal.png" alt="dost seal" width={42} height={42} />
        <Image
          src="/Philippine_Atmospheric,_Geophysical_and_Astronomical_Services_Administration_(PAGASA)_logo.png"
          alt="pagasa seal"
          width={42}
          height={42}
        />
        <Image src="/T.I.P._Logo.png" alt="tip seal" width={42} height={42} />
      </div>
    </div>
  )
}
