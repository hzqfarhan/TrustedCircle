"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { ROLE_LABELS, ROLE_COLORS, initials } from "@/lib/utils-tc";
import { cn } from "@/lib/utils";
import { NetworkGraph } from "@/components/NetworkGraph";
import { Users, Share2, UserPlus, Fingerprint, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addMemberToCircle } from "../actions";

export default function MembersPage() {
  const { currentUser } = useAuth();
  const users = (currentUser as any)?.users || [];
  const [viewMode, setViewMode] = useState<"list" | "network">("list");

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSelectedUserOpen, setIsSelectedUserOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("GENERAL");
  
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [isBiometricSuccess, setIsBiometricSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customAvatarMap: Record<string, string> = {
    u_akmal: "/pfp/akmal.png",
    u_ibad: "/pfp/ibad.png",
    u_paan: "/pfp/paan.png",
    u_wafi: "/pfp/wafi.png",
    u_abang: "/pfp/aizat.png",
    u_child: "/pfp/child.png",
  };

  const permissions: Record<string, string[]> = {
    PARENT: ["View funds", "Contribute", "Request withdrawal", "Approve withdrawal", "Monitor child", "Receive alerts", "Verify transfers"],
    COMPANION: ["View funds", "Contribute", "Request withdrawal", "Approve withdrawal", "Receive alerts", "Verify transfers"],
    FRIEND: ["View funds", "Contribute", "Request withdrawal", "Receive alerts"],
    GENERAL: ["View funds", "Contribute"],
    CHILD: ["Own wallet view", "Spend within limits"],
  };

  const handleAddSubmit = async () => {
    if (!newMemberName.trim()) return;
    setIsAddModalOpen(false);
    setIsBiometricScanning(true);

    // Simulate Biometric Scanning
    setTimeout(() => {
      setIsBiometricSuccess(true);
      
      // Simulate success delay before server action
      setTimeout(async () => {
        setIsSubmitting(true);
        await addMemberToCircle(newMemberName, newMemberRole);
        
        // Reset and close
        setIsBiometricScanning(false);
        setIsBiometricSuccess(false);
        setIsSubmitting(false);
        setNewMemberName("");
        setNewMemberRole("GENERAL");
      }, 1000);
    }, 2000);
  };

  return (
    <MobileShell>
      <WalletHeader 
        showBack 
        title="Circle Members" 
        rightElement={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center active:bg-blue-200 transition-colors text-blue-600"
            aria-label="Add Member"
          >
            <UserPlus size={16} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 relative pb-24">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
              viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Users size={16} /> List
          </button>
          <button
            onClick={() => setViewMode("network")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors",
              viewMode === "network" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Share2 size={16} /> Network
          </button>
        </div>

        {viewMode === "network" ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <NetworkGraph 
              users={users} 
              currentUser={currentUser} 
              edgeStyle="solid"
              customAvatarMap={customAvatarMap}
              onNodeClick={(u) => {
                setSelectedUser(u);
                setIsSelectedUserOpen(true);
              }}
            />
            <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Your Circle Map</h3>
              <p className="text-xs text-blue-600 leading-relaxed">
                This network visualizes connections between you and members of your Trusted Circle. 
                As the central hub, you can monitor and manage interactions and permissions seamlessly.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {users.map((u) => {
            const perms = permissions[u.role] || [];
            const isMe = u.id === currentUser?.id;
            const finalAvatar = u.avatar || customAvatarMap[u.id];

            return (
              <div key={u.id} className={cn("bg-white rounded-2xl p-4 border", isMe ? "border-blue-200" : "border-gray-100")}>
                <div className="flex items-center gap-3 mb-3">
                  {finalAvatar ? (
                    <img src={finalAvatar} alt={u.name} className="w-11 h-11 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0",
                        ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"
                      )}
                    >
                      {initials(u.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      {isMe && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full", ROLE_COLORS[u.role])}>
                    {u.role}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p) => (
                    <span key={p} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
                  <span>Wallet: RM {u.wallet?.balance?.toFixed(2) ?? "—"}</span>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-6"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">Add to Circle</h2>
              <p className="text-xs text-gray-500 mb-6">Expand your trusted network</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Enter member's name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assign Role</label>
                  <select 
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                  >
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAddSubmit}
                disabled={!newMemberName.trim()}
                className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                Proceed
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Authentication Modal */}
      <AnimatePresence>
        {isBiometricScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-[280px] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
            >
              {!isBiometricSuccess ? (
                <div className="relative mb-6">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-100 rounded-full"
                  />
                  <div className="relative bg-white p-4 rounded-full text-blue-600">
                    <Fingerprint size={48} strokeWidth={1.5} />
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-6 bg-emerald-100 text-emerald-600 p-4 rounded-full"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isBiometricSuccess ? "Authenticated" : "Verify Identity"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {isSubmitting 
                  ? "Adding member to circle..." 
                  : isBiometricSuccess 
                  ? "Biometrics confirmed successfully" 
                  : "Use Face ID or Touch ID to authorize adding a new member"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected User Profile Modal */}
      <AnimatePresence>
        {isSelectedUserOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-6"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSelectedUserOpen(false)}
                className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                {(selectedUser.avatar || customAvatarMap[selectedUser.id]) ? (
                  <img src={selectedUser.avatar || customAvatarMap[selectedUser.id]} alt={selectedUser.name} className="w-16 h-16 rounded-3xl object-cover shrink-0 shadow-sm" />
                ) : (
                  <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm", ROLE_COLORS[selectedUser.role] || "bg-gray-100 text-gray-700")}>
                    {initials(selectedUser.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedUser.name}</h2>
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full inline-block mt-1.5 shadow-sm", ROLE_COLORS[selectedUser.role])}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(permissions[selectedUser.role] || []).map((p: string) => (
                      <span key={p} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Wallet Balance</p>
                  <p className="text-xl font-bold text-gray-900">RM {selectedUser.wallet?.balance?.toFixed(2) ?? "0.00"}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileShell>
  );
}
