//Tell what chain to connect to
//Tell How to connect to the app

"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import {anvil, zksync, mainnet, sepolia} from 'wagmi/chains'

export default getDefaultConfig({
    appName: "TSender",
    projectId: "46161ab94fb7a4ff47717da2f698b05a",
    chains: [anvil, zksync, mainnet, sepolia],
    ssr: false //ssr = Server Side Rendering
})

