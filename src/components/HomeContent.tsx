"use client"

import AidropForm from "./AirdropForm";
import { useAccount } from "wagmi";

export default function HomeContent() {
    const { isConnected } = useAccount();
    return (
        isConnected ? (
            <div>
                <AidropForm/>
            </div>
        ): (
            <div className="flex items-center justify-center">
                <h1>Please Connect Wallet</h1>
            </div>
        )
    );
}