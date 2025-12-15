import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useChainId, useSwitchChain, useAccount } from "wagmi";
import CONSTANTS from "../constants";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import makeBlockie from 'ethereum-blockies-base64';

export default function ConnectWallet() {
  const {
    connect,
    isConnected,
    loading: connectLoading,
  } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect();
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
    <div className="relative">
      {!isConnected ? (
        <button
          className="btn btn-primary btn-sm"
          disabled={connectLoading}
          onClick={connect}
        >
          {connectLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size={12} /> 连接中
            </span>
          ) : (
            "连接钱包"
          )}
        </button>
      ) : (
        <div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn btn-secondary btn-sm font-mono flex items-center gap-2"
          >
            {address && (
              <img 
                src={makeBlockie(address)} 
                alt="Avatar"
                className="w-4 h-4 rounded-full"
              />
            )}
            {shortAddress || "已连接"}
          </button>
          {open ? (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50"
            >
              <button
                className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (address) navigator.clipboard.writeText(address);
                  setOpen(false);
                }}
                disabled={!address}
              >
                复制地址
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 text-red-600 transition-colors"
                onClick={() => {
                  setOpen(false);
                  disconnect();
                }}
                disabled={disconnectLoading}
              >
                {disconnectLoading ? "断开中..." : "断开连接"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
