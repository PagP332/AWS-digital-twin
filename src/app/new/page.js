"use client";
import Button from "@/components/Button";
import FloatingWindow from "@/components/FloatingWindow";
import InputField from "@/components/InputField";
import Logos from "@/components/Logos";
import Image from "next/image";
import { useRouter } from "next/navigation";

// DEFAULT LANDING PAGE (LOGIN PAGE)

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-background font-sfpro relative flex h-dvh items-center justify-center p-8 text-center ">
      <FloatingWindow>
        <div className="my-10 mb-15">
          <h1 className="mt-5 text-xl font-light">Create New User</h1>
        </div>
        <InputField text="Username" />
        <InputField text="Password" secret={true} />
        <Button
          text="Submit"
          onClick={() => console.log("Login")}
          className="text-background !bg-accent"
        />
      </FloatingWindow>
      <p className="absolute bottom-8 text-xs opacity-50">©2025</p>
      <Logos />
    </div>
  );
}
