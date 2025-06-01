import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import { Providers } from "@/app/providers";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="text-xl font-bold text-red-700">TSender</div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/GoldTeaaa/TS-Sender.git"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-900"
        >
          <FaGithub size={24} />
        </a>
        <Providers>
            <ConnectButton />
        </Providers>
      </div>
    </header>
  );
}
