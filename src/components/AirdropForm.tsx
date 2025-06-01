"use client"

import { useState } from "react";
import InputField from "@/ui/InputField";

export default function AidropForm(){
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amount, setAmount] = useState("");

    async function handleSubmit() {
        console.log(tokenAddress);
    }

    return(
        <div>
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x1234,0x123431"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />
            <InputField
                label="Amount"
                placeholder="100.200.300"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                large={true}
            />
            <button onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}