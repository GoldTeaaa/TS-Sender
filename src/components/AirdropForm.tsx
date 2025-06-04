"use client"

import { useEffect, useMemo, useState } from "react";
import InputField from "@/ui/InputField";
import TransactionDetails from "@/ui/TransactionDetails";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract, useReadContract, useReadContracts } from "wagmi";
import { readContract, waitForTransactionReceipt, readContracts } from "@wagmi/core";
import { calculateTotal } from "@/utils";
import { formatEther } from "viem";
import { ClipLoader } from "react-spinners";
import Spinner from "@/ui/SpinnerIcon";

export default function AidropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amount, setAmount] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    type txStatus =  "neutral" | "pending" | "confirming" | "confirmed" | "error";
    const [txStatus, setTxStatus] = useState<txStatus>("neutral");

    const total: number = useMemo(() => calculateTotal(amount), [amount]);
    // useMemo(() => console.log(calculateTotal(amount)), [amount])
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const { writeContractAsync } = useWriteContract();
    // const approvalReceipt = waitForTransactionReceipt();
    const {data: functionReturn, isLoading, error} = useReadContracts({ //this return an array
        contracts: [
            {
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "name",
            },
            {
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "decimals",
            }
        ],
    })

    useEffect(() => {
        const tempAddress = localStorage.getItem("tokenAddress");
        const tempRecipients = localStorage.getItem("recipients");
        const tempAmount = localStorage.getItem("amount");

        //IF there is a value in that key, set it to the state to be rendered
        if (tempAddress)
            setTokenAddress(tempAddress);
        if (tempRecipients)
            setRecipients(tempRecipients);
        if (tempAmount)
            setAmount(tempAmount);
    }, []);

    // Not sure better like this or make them individuals
    useEffect(() => {
        //Read the tokenAddress key in browser and assign it to the local tokenAddress state
        localStorage.setItem("tokenAddress", tokenAddress);
        localStorage.setItem("recipients", recipients);
        localStorage.setItem("amount", amount);
    }, [tokenAddress, recipients, amount]); //dependecies to trigger setItem when one of this changed

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address FOUND! Please use a supported chains!");
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        })

        return response as number;
    }


    // If already approved, 
    async function handleSubmit() {
        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log("Approved amount: ", approvedAmount);
        const formatedRecipients = recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(Boolean);
        const formatedAmounts = amount.split(/[,\n]+/).map(amt => amt.trim()).filter(Boolean);

        try {
          if (total > approvedAmount) {
            setTxStatus("pending");
            const approvalHash = await writeContractAsync({
              abi: erc20Abi,
              address: tokenAddress as `0x${string}`,
              functionName: "approve",
              args: [tSenderAddress as `0x${string}`, BigInt(total)],
            });
      
            setTxStatus("confirming");
            const approvalReceipt = await waitForTransactionReceipt(config, {
              hash: approvalHash as `0x${string}`,
            });
            console.log("Approval confirmed: ", approvalReceipt);
      
            const airdropHash = await writeContractAsync({
              abi: tsenderAbi,
              address: tSenderAddress as `0x${string}`,
              functionName: "airdropERC20",
              args: [
                tokenAddress,
                formatedRecipients,
                formatedAmounts,
                BigInt(total),
              ],
            });
      
            const airdropReceipt = await waitForTransactionReceipt(config, {
              hash: airdropHash as `0x${string}`,
            });
      
            console.log("Airdrop confirmed with hash: ", airdropReceipt);
            setTxStatus("confirmed");
          } else {
            setTxStatus("pending");
            const airdropHash = await writeContractAsync({
              abi: tsenderAbi,
              address: tSenderAddress as `0x${string}`,
              functionName: "airdropERC20",
              args: [
                tokenAddress,
                formatedRecipients,
                formatedAmounts,
                BigInt(total),
              ],
            });
      
            setTxStatus("confirming");
            const airdropReceipt = await waitForTransactionReceipt(config, {
              hash: airdropHash as `0x${string}`,
            });
      
            console.log("Airdrop confirmed with hash: ", airdropReceipt);
            setTxStatus("confirmed");
          }
        } catch (error) {
          console.error("Transaction failed:", error);
          setTxStatus("error");
        }
      }
      

    function getState(state:string) {
        switch(state){
            case "neutral":
                return <span>Send Transactions</span>
            case "pending":
                return <span className="flex items-center gap-2"><Spinner/>Confirming in wallet...</span>
            case "confirming":
                return <span className="flex items-center gap-2"><Spinner/>Mining Transaction....</span>
            case "confirmed":
                return <span>Transaction Confirmed!</span>
            case "error":
                return <span>Transaction Failed</span>
            default:
                return <span>Send Transactions</span>
        }
    }

    function tokenInEther(tokenAmount: number) {
        return parseFloat(formatEther(BigInt(tokenAmount))).toFixed(4);
    }

    return (
        <div className="flex flex-col gap-4 max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md space-y-4">
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
            <TransactionDetails
                tokenName={(functionReturn?.[0]?.result as string) ?? "Unknown"}
                totalTokenInWei={total}
                totalTokenInEther={tokenInEther(total)}
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-10 rounded shadow"
                disabled={isPending || isConfirming}
            >
                {getState(txStatus)}
            </button>

        </div>
    );
}