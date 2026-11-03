'use client';

import Navbar from "@/components/Navbar";
import { useState } from "react";


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <Navbar isLoggedIn={false} />
      <h1>Welcome to Online Docs</h1>
    </>
  )
}