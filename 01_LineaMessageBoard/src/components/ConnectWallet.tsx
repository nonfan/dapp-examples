import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useChainId, useSwitchChain, useAccount } from "wagmi";
import CONSTANTS from "../constants";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";

export default function ConnectWallet() {
  const {
    connect,
    isConnected,
    loading: connectLoading,
  } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const chainId = useChainId();
  const switchChain = useSwitchChain();
  const { address } = useAccount();
  const shortAddress =
    address && address.startsWith("0x")
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : undefined;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (
        open &&
        e.target instanceof Node &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (isConnected && chainId !== CONSTANTS.LINEA_CHAIN_ID) {
      switchChain.mutate({ chainId: CONSTANTS.LINEA_CHAIN_ID });
    }
  }, [isConnected, chainId, switchChain]);

  return (
    <div className="cursor-pointer relative">
      {!isConnected ? (
        <button
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
          disabled={connectLoading}
          onClick={connect}
        >
          {connectLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size={14} /> Connecting…
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      ) : (
        <div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-100 text-xs"
          >
            <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              {(shortAddress || userInfo?.email || userInfo?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="text-gray-800">
              {shortAddress || userInfo?.email || userInfo?.name || "User"}
            </div>
          </button>
          {open ? (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-40 card p-2 z-50"
            >
              <button
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"
                onClick={() => {
                  if (address) navigator.clipboard.writeText(address);
                  setOpen(false);
                }}
                disabled={!address}
              >
                Copy Address
              </button>
              <button
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"
                onClick={() => {
                  setOpen(false);
                  disconnect();
                }}
                disabled={disconnectLoading}
              >
                {disconnectLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size={12} /> Disconnecting…
                  </span>
                ) : (
                  "Disconnect"
                )}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
