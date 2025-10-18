"use client"
import Button from "@/components/Button"
import FloatingWindow from "@/components/FloatingWindow"
import InputField from "@/components/InputField"
import Logos from "@/components/Logos"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

// DEFAULT LANDING PAGE (LOGIN PAGE)

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative flex items-center justify-center bg-background p-8 h-dvh text-center font-inter dark:text-white">
      <FloatingWindow>
        <div className="my-10 mb-15">
          <h1 className="font-light my-3">Welcome to</h1>
          <h1 className="font-bold text-3xl mt-5">AWS Digital Twin</h1>
        </div>
        <InputField text="Username" />
        <InputField text="Password" />
        <Button text="Login" onClick={() => router.push("/home")} className="!bg-accent" />
        <p>or</p>
        <Button text="Create New User" onClick={() => router.push("/new")} />
      </FloatingWindow>
      <p className="absolute bottom-8 text-xs opacity-50">©2025</p>
      <Logos />
    </div>
  )
}
