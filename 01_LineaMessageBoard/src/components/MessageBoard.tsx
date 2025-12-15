import {
  useWriteContract,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import type { Abi } from "viem";
import { abi } from "../lib/abi";
import CONSTANTS from "../constants";
import { useMemo, useState, useEffect, useRef } from "react";
import Toast from "./Toast";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import Spinner from "./Spinner";
import ConnectWallet from "./ConnectWallet";
import makeBlockie from 'ethereum-blockies-base64';

export default function MessageBoard() {
  const writeContract = useWriteContract();
  const { isConnected } = useWeb3AuthConnect();
  const { address: userAddress } = useAccount();
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
  const [limit, setLimit] = useState(50);
  const contracts = useMemo(
    () =>
      count
        ? (() => {
            const start = Math.max(0, count - limit);
            const length = count - start;
            return Array.from({ length }, (_, i) => ({
              abi: abi as Abi,
              address: contractAddress,
              functionName: "getMessage" as const,
              args: [BigInt(start + i)] as const,
              chainId: activeChainId,
            }));
          })()
        : [],
    [count, limit, contractAddress, activeChainId]
  );
  const { data: messagesData } = useReadContracts({ contracts });
  const listLoading = countLoading || (count > 0 && messagesData === undefined);

  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [waitForConfirm] = useState(true);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: waitingReceipt, isSuccess: receiptSuccess } =
    useWaitForTransactionReceipt({
      chainId: activeChainId,
      hash: waitForConfirm ? txHash : undefined,
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const avatarCache = useRef<Map<string, string>>(new Map());

  // 缓存头像生成函数，限制缓存大小
  const getAvatar = (address: string) => {
    if (!address) return '';
    if (!avatarCache.current.has(address)) {
      // 限制缓存大小，防止内存泄漏
      if (avatarCache.current.size >= 100) {
        const firstKey = avatarCache.current.keys().next().value;
        if (firstKey) {
          avatarCache.current.delete(firstKey);
        }
      }
      avatarCache.current.set(address, makeBlockie(address));
    }
    return avatarCache.current.get(address)!;
  };

  const messages = useMemo(
    () =>
      (messagesData ?? []).map((r) => {
        const tuple = r?.result as unknown as [string, string, bigint];
        const fullAddress = tuple?.[0] ?? "";
        const sender =
          typeof fullAddress === "string" && fullAddress.startsWith("0x")
            ? `${fullAddress.slice(0, 6)}…${fullAddress.slice(-4)}`
            : fullAddress;
        const isOwnMessage = userAddress && fullAddress.toLowerCase() === userAddress.toLowerCase();
        return {
          sender,
          fullAddress,
          content: tuple?.[1] ?? "",
          timestamp: tuple?.[2] ?? 0n,
          isOwnMessage,
        };
      }),
    [messagesData, userAddress]
  );

  const postMessage = async () => {
    if (!messageText.trim()) return;
    if (!isConnected) {
      setToastMsg("请先连接钱包");
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
        setMessageText("");
        setToastMsg("交易已提交");
        setToastType("success");
        setToastOpen(true);
        refetchCount?.();
      } else {
        setTxHash(hash as `0x${string}`);
        setToastMsg("等待钱包签名确认...");
        setToastType("info");
        setToastOpen(true);
      }
    } catch (e) {
      setSubmitting(false);
      let msg = "交易取消或失败";
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
    }
  };

  useEffect(() => {
    if (receiptSuccess && txHash) {
      setTxHash(undefined);
      setSubmitting(false);
      setMessageText("");
      setToastMsg("消息已成功发布到区块链");
      setToastType("success");
      setToastOpen(true);
      refetchCount?.();
    }
  }, [receiptSuccess, txHash, refetchCount]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息更新时滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      postMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部标题和控制栏 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Web3 消息板</h1>
            <p className="text-gray-600 text-sm mt-1">基于区块链的去中心化消息系统</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              {count > 0 ? `${count} 条消息` : '暂无消息'}
            </div>
            <ConnectWallet />
          </div>
        </div>
      </div>

      {/* 消息列表区域 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          {listLoading ? (
            <div className="card p-8 text-center">
              <Spinner size={20} />
              <p className="text-gray-500 mt-2 text-sm">加载消息中...</p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">还没有消息，开始聊天吧！</p>
            </div>
          ) : (
            <>
              {limit < count ? (
                <div className="flex justify-center mb-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setLimit((v) => Math.min(count, v + 50))}
                  >
                    加载更多
                  </button>
                </div>
              ) : null}
              {messages.map((m, idx) => (
                <div key={idx} className={`px-4 py-2 ${m.isOwnMessage ? 'flex justify-end' : ''}`}>
                  <div className={`w-full max-w-[70%] ${m.isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                    {m.isOwnMessage ? (
                      // 自己的消息 - 右侧
                      <div className="flex items-end gap-3 flex-row-reverse">
                        <img 
                          src={getAvatar(m.fullAddress)} 
                          alt="Avatar"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex flex-col items-end flex-1">
                          <div className="bg-black text-white rounded-2xl rounded-br-md px-4 py-3 mb-1 max-w-full">
                            <p className="text-sm leading-relaxed break-words">{m.content}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(Number(m.timestamp) * 1000).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // 其他人的消息 - 左侧
                      <div className="flex items-end gap-3">
                        <img 
                          src={getAvatar(m.fullAddress)} 
                          alt="Avatar"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex flex-col flex-1">
                          <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3 mb-1 max-w-full">
                            <p className="text-sm leading-relaxed break-words">{m.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">{m.sender}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(Number(m.timestamp) * 1000).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-3">
            <div className="flex items-center gap-3">
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "输入消息..." : "请先连接钱包"}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm"
                maxLength={500}
                disabled={!isConnected || submitting || waitingReceipt}
              />
              
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <button
                onClick={postMessage}
                disabled={!isConnected || !messageText.trim() || submitting || waitingReceipt}
                className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || waitingReceipt ? (
                  <Spinner size={14} />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
