import {
  useWriteContract,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
} from "wagmi";
import type { Abi } from "viem";
import { abi } from "../lib/abi";
import CONSTANTS from "../constants";
import { useMemo, useState, useEffect } from "react";
import Toast from "./Toast";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import Modal from "./Modal";
import Spinner from "./Spinner";
import Toggle from "./Toggle";
import ConnectWallet from "./ConnectWallet";

export default function MessageBoard() {
  const writeContract = useWriteContract();
  const { isConnected } = useWeb3AuthConnect();
  const activeChainId = CONSTANTS.LINEA_CHAIN_ID;
  const contractAddress = CONSTANTS.CONTRACT_ADDRESS as `0x${string}`;
  const { data: countData, refetch: refetchCount } = useReadContract({
    abi: abi as Abi,
    address: contractAddress,
    functionName: "getMessageCount" as const,
    chainId: activeChainId,
  });
  const countLoading = countData === undefined;
  const count = Number(countData ?? 0n);
  const contracts = useMemo(
    () =>
      count
        ? Array.from({ length: count }, (_, i) => ({
            abi: abi as Abi,
            address: contractAddress,
            functionName: "getMessage" as const,
            args: [BigInt(i)] as const,
            chainId: activeChainId,
          }))
        : [],
    [count, contractAddress, activeChainId]
  );
  const { data: messagesData } = useReadContracts({ contracts });
  const listLoading = countLoading || (count > 0 && messagesData === undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [waitForConfirm, setWaitForConfirm] = useState(true);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: waitingReceipt, isSuccess: receiptSuccess } =
    useWaitForTransactionReceipt({
      chainId: activeChainId,
      hash: waitForConfirm ? txHash : undefined,
    });

  const postMessage = async () => {
    if (!messageText.trim()) return;
    if (!isConnected) {
      setToastMsg("Please connect wallet");
      setToastType("error");
      setToastOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      const hash = await writeContract.mutateAsync({
        abi: abi as Abi,
        address: contractAddress,
        functionName: "postMessage" as const,
        args: [messageText.trim()] as const,
        chainId: activeChainId,
      });
      if (!waitForConfirm) {
        setSubmitting(false);
        setModalOpen(false);
        setMessageText("");
        setToastMsg("Transaction submitted");
        setToastType("success");
        setToastOpen(true);
        refetchCount?.();
      } else {
        setTxHash(hash as `0x${string}`);
        setToastMsg("Transaction submitted");
        setToastType("info");
        setToastOpen(true);
      }
    } catch (e) {
      setSubmitting(false);
      let msg = "Transaction cancelled or failed";
      if (typeof e === "string") {
        msg = e;
      } else if (typeof e === "object" && e) {
        const obj = e as { shortMessage?: unknown; message?: unknown };
        if (typeof obj.shortMessage === "string") msg = obj.shortMessage;
        else if (typeof obj.message === "string") msg = obj.message;
      }
      setToastMsg(msg);
      setToastType("error");
      setToastOpen(true);
    } finally {
      // continue if waiting for receipt triggered
    }
  };

  useEffect(() => {
    if (receiptSuccess && txHash) {
      setTxHash(undefined);
      setSubmitting(false);
      setModalOpen(false);
      setMessageText("");
      setToastMsg("Message confirmed on-chain");
      setToastType("success");
      setToastOpen(true);
      refetchCount?.();
    }
  }, [receiptSuccess, txHash, refetchCount]);

  const messages = useMemo(
    () =>
      (messagesData ?? []).map((r) => {
        const tuple = r?.result as unknown as [string, string, bigint];
        const sender =
          typeof tuple?.[0] === "string" && tuple[0].startsWith("0x")
            ? `${tuple[0].slice(0, 6)}…${tuple[0].slice(-4)}`
            : tuple?.[0] ?? "";
        return {
          sender,
          content: tuple?.[1] ?? "",
          timestamp: tuple?.[2] ?? 0n,
        };
      }),
    [messagesData]
  );

  return (
    <div className="max-w-4xl m-auto">
      <div className="px-2 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
          <div className="flex items-center gap-3">
            <Toggle
              checked={waitForConfirm}
              onChange={setWaitForConfirm}
              label="Wait for confirmation"
            />
            <button
              className="btn btn-primary btn-sm disabled:opacity-60"
              onClick={() => setModalOpen(true)}
              disabled={!isConnected}
              title={!isConnected ? "Please connect wallet" : undefined}
            >
              New Message
            </button>
            <ConnectWallet />
          </div>
        </div>
      </div>
      <div className="mt-2 text-left px-2">
        {listLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size={24} />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-gray-500 border border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
            No messages yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((m, idx) => (
              <div key={idx} className="card p-4">
                <div className="text-xs text-gray-600">{m.sender}</div>
                <div className="mt-2 text-[14px] leading-relaxed">
                  {m.content}
                </div>
                <div className="text-[11px] text-gray-500 mt-2">
                  {new Date(Number(m.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={modalOpen}
        title="New Message"
        onClose={() => setModalOpen(false)}
        onConfirm={postMessage}
        confirmText={submitting || waitingReceipt ? "Sending..." : "Send"}
        confirmLoading={submitting || waitingReceipt}
        confirmDisabled={!messageText.trim() || !isConnected}
        confirmTitle={!isConnected ? "Please connect wallet" : undefined}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Stored on-chain (Linea Sepolia)
          </div>
        </div>
      </Modal>
      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
