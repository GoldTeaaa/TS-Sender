"use client"

import { useEffect, useMemo, useState } from "react";
import InputField from "@/ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AidropForm(){
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amount, setAmount] = useState("");

    const total:number = useMemo(() => calculateTotal(amount), [amount]);
    // useMemo(() => console.log(calculateTotal(amount)), [amount])
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const { data:hash, isPending, writeContractAsync} = useWriteContract();
    // const approvalReceipt = waitForTransactionReceipt();

    useEffect(() => {
        const tempAddress = localStorage.getItem("tokenAddress");
        const tempRecipients = localStorage.getItem("recipients");
        const tempAmount = localStorage.getItem("amount");

        if(tempAddress)
            setTokenAddress(tempAddress);
        if(tempRecipients)
            setRecipients(tempRecipients);
        if(tempAmount)
            setAmount(tempAmount);
        
    }, []);

    // Not sure better like this or make them individuals
    useEffect(() => {
        localStorage.setItem("tokenAddress", tokenAddress);
        localStorage.setItem("recipients", recipients);
        localStorage.setItem("amount", amount);
    },[tokenAddress, recipients, amount]);

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if(!tSenderAddress){
            alert("No address FOUND! Please use a supported chains!");
            return 0;
        }
        const response = await readContract(config,{
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName : "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        })

        return response as number;
    }
    

    // If already approved, 
    async function handleSubmit() {
        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log("Approved amount: ", approvedAmount);

        if(total > approvedAmount){
            //Initiate function call to blockchain and return a hash as proof of approval
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName : "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            })
            
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash as `0x${string}`
            })
            console.log("Approval confirmed: ", approvalReceipt);

            //refactor this when there is time
            const airdropHash = await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName : "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total), //Convert to erc20 decimals
                ]
            })
            console.log("Airdrop confirmed with hash: ", airdropHash);
            console.log(total);

        }
        else{
            const airdropHash = await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName : "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
            })
            console.log(total);
            console.log("Airdrop confirmed with hash: ", airdropHash);
        }
        
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
            <br />
            <button
            onClick={handleSubmit}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded shadow"
            >
            Submit
            </button>

        </div>
    );
}