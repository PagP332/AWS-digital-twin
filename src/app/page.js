"use client";
import Button from "@/components/Button";
import FloatingWindow from "@/components/FloatingWindow";
import InputField from "@/components/InputField";
import Logos from "@/components/Logos";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// DEFAULT LANDING PAGE (LOGIN PAGE)

export default function Home() {
  const router = useRouter();

  const logo_h = 626;
  const logo_w = 1228;
  const ratio = 4;

  return (
    <div className="font-sfpro bg-background font-sfpr relative flex h-dvh items-center justify-center p-8 text-center">
      <FloatingWindow>
        <div className="my-10 mb-15">
          <h1 className="my-3 font-light">Welcome to</h1>
          {/* <h1 className="font-bold text-3xl mt-5">AWS Digital Twin</h1> */}
          <Image
            src="/logo_black.png"
            alt="project awsome logo"
            height={logo_h / ratio}
            width={logo_w / ratio}
          />
        </div>
        <InputField text="Username" />
        <InputField text="Password" secret={true} />
        <Button
          text="Login"
          onClick={() => router.push("/home")}
          className="!bg-accent"
        />
        <p>or</p>
        <Button text="Create New User" onClick={() => router.push("/new")} />
      </FloatingWindow>
      <p className="absolute bottom-14 text-xs opacity-50">
        In collaboration with Philippines Atmospheric Geophysical and
        Astronomical Services Administration (PAGASA)
      </p>
      <p className="absolute bottom-8 text-xs opacity-50">©2025</p>
      <Logos />
    </div>
  );
}
