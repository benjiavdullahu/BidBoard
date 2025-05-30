"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { UploadButton } from "@/utils/uploadthing";

// Types
interface Entry {
  id: string;
  name: string;
  amount: number;
  link?: string;
  message?: string;
  logoUrl?: string;
  createdAt: string;
}

// Separate component that uses useSearchParams
function PaymentStatus() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success or cancel params
    if (searchParams.get("success") === "true") {
      toast.success(
        "Payment successful! You should appear on the leaderboard soon."
      );
      // Clean up URL
      window.history.replaceState({}, "", "/");
    } else if (searchParams.get("canceled") === "true") {
      toast.error("Payment canceled. Ready to try again?");
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  return null;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    logoUrl: "",
    message: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsLightMode(savedTheme === "light");
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      // Ensure entries is always an array
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Ensure entries remains an array even on error
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check if the bid amount would make them #1
  const wouldBeFirst = () => {
    const bidAmount = Number(formData.amount) * 100; // Convert to cents
    if (!entries.length) return true;
    return bidAmount > entries[0]?.amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(formData.amount) < 1) {
      toast.error("Minimum bid is $1");
      return;
    }

    // Validate message length if provided
    if (formData.message && formData.message.length > 100) {
      toast.error("Message must be 100 characters or less");
      return;
    }

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.sessionId) {
        throw new Error("No session ID returned from server");
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isLightMode ? "bg-gray-50 text-gray-900" : "bg-black text-white"
      }`}
    >
      <Toaster position="top-center" />

      {/* Add Suspense boundary for useSearchParams */}
      <Suspense fallback={null}>
        <PaymentStatus />
      </Suspense>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-40 p-3 rounded-full shadow-lg hover:scale-110 transition-transform ${
          isLightMode ? "bg-white" : "bg-gray-800"
        }`}
        aria-label="Toggle theme"
      >
        {isLightMode ? (
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isLightMode
              ? "bg-gradient-to-br from-blue-100 via-white to-purple-100"
              : "bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"
          }`}
        />
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1
              className={`text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
                isLightMode
                  ? "from-blue-600 to-purple-600"
                  : "from-purple-400 to-blue-400"
              }`}
            >
              BIDBOARD
            </h1>
            <p
              className={`text-xl md:text-2xl mb-8 ${
                isLightMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Pay to flex. The internet&apos;s most expensive leaderboard.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-lg hover:scale-105 transition-transform text-white"
            >
              CLAIM YOUR SPOT
            </button>
          </motion.div>
        </div>
      </div>

      {/* Current Leader */}
      {entries.length > 0 && entries[0] && (
        <div
          className={`py-12 ${
            isLightMode
              ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-y border-yellow-300"
              : "bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-y border-yellow-600/30"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <span
                className={`font-bold text-sm ${
                  isLightMode ? "text-yellow-600" : "text-yellow-500"
                }`}
              >
                👑 CURRENT LEADER 👑
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              {entries[0].logoUrl && (
                <div className="mb-4">
                  <img
                    src={entries[0].logoUrl}
                    alt={entries[0].name}
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-yellow-500 shadow-xl"
                  />
                </div>
              )}
              <h2
                className={`text-4xl font-black ${
                  isLightMode ? "text-yellow-600" : "text-yellow-500"
                }`}
              >
                {entries[0].name}
              </h2>
              <p
                className={`text-5xl font-black ${
                  isLightMode ? "text-gray-900" : "text-white"
                }`}
              >
                {formatAmount(entries[0].amount)}
              </p>
              {entries[0].message && (
                <p
                  className={`mt-4 text-lg italic max-w-2xl mx-auto ${
                    isLightMode ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  "{entries[0].message}"
                </p>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">THE LEADERBOARD</h2>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {entries.map((entry, index) => {
                // Different styles for different tiers
                const isTop3 = index < 3;
                const isTop10 = index < 10;
                const isTop25 = index < 25;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className={`backdrop-blur-sm border rounded-lg mb-4 transition-all ${
                      isLightMode ? "bg-white shadow-md" : "bg-gray-900/50"
                    } ${
                      // Border colors based on rank
                      index === 0
                        ? "border-yellow-500 border-2"
                        : index === 1
                        ? "border-gray-400 border-2"
                        : index === 2
                        ? "border-orange-600 border-2"
                        : isTop10
                        ? isLightMode
                          ? "border-purple-300"
                          : "border-purple-600"
                        : isTop25
                        ? isLightMode
                          ? "border-blue-200"
                          : "border-blue-800"
                        : isLightMode
                        ? "border-gray-200"
                        : "border-gray-800"
                    } ${
                      // Padding based on tier
                      isTop3 ? "p-6" : isTop10 ? "p-5" : isTop25 ? "p-4" : "p-3"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className={`
                          font-black
                          ${
                            // Rank number size based on tier
                            isTop3
                              ? "text-4xl"
                              : isTop10
                              ? "text-3xl"
                              : isTop25
                              ? "text-2xl"
                              : "text-xl"
                          }
                          ${
                            // Rank colors
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-400"
                              : index === 2
                              ? "text-orange-600"
                              : isTop10
                              ? "text-purple-500"
                              : isTop25
                              ? "text-blue-500"
                              : "text-gray-500"
                          }
                        `}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <h3
                            className={`font-bold ${
                              isTop3
                                ? "text-2xl"
                                : isTop10
                                ? "text-xl"
                                : isTop25
                                ? "text-lg"
                                : "text-base"
                            }`}
                          >
                            {entry.name}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            isTop3
                              ? "text-3xl"
                              : isTop10
                              ? "text-2xl"
                              : isTop25
                              ? "text-xl"
                              : "text-lg"
                          }`}
                        >
                          {formatAmount(entry.amount)}
                        </p>
                        {isTop25 && (
                          <p className="text-xs text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show section dividers */}
            {entries.length > 10 && (
              <div className="text-center my-8 text-gray-500 text-sm">
                — Showing top {entries.length} contributors —
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-xl mb-4">No entries yet. Be the first!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold hover:scale-105 transition-transform text-white"
            >
              Claim #1 Spot
            </button>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
              isLightMode ? "bg-black/50" : "bg-black/80"
            }`}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`rounded-xl p-8 max-w-md w-full ${
                isLightMode ? "bg-white shadow-2xl" : "bg-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6">Claim Your Spot</h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isLightMode ? "bg-gray-100" : "bg-gray-800"
                      }`}
                      placeholder="Your name or handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isLightMode ? "bg-gray-100" : "bg-gray-800"
                      }`}
                      placeholder="100.00"
                    />
                  </div>

                  {/* Show additional fields if bidding for #1 */}
                  {wouldBeFirst() && (
                    <>
                      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm font-bold text-yellow-500 mb-3">
                          👑 You're bidding for the #1 spot! Add your picture
                          and message:
                        </p>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Upload Your Picture (optional)
                            </label>
                            {formData.logoUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={formData.logoUrl}
                                  alt="Uploaded"
                                  className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-yellow-500"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({ ...formData, logoUrl: "" })
                                  }
                                  className="w-full px-3 py-1 text-sm bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                                >
                                  Remove Image
                                </button>
                              </div>
                            ) : (
                              <UploadButton
                                endpoint="imageUploader"
                                onUploadBegin={() => {
                                  setIsUploading(true);
                                }}
                                onClientUploadComplete={(res) => {
                                  setIsUploading(false);
                                  if (res?.[0]?.url) {
                                    setFormData({
                                      ...formData,
                                      logoUrl: res[0].url,
                                    });
                                    toast.success(
                                      "Image uploaded successfully!"
                                    );
                                  }
                                }}
                                onUploadError={(error: Error) => {
                                  setIsUploading(false);
                                  toast.error(
                                    `Upload failed: ${error.message}`
                                  );
                                }}
                                appearance={{
                                  button: `ut-ready:bg-gradient-to-r ut-ready:from-purple-600 ut-ready:to-blue-600 ut-uploading:cursor-not-allowed ut-uploading:bg-gray-500 ${
                                    isLightMode
                                      ? "ut-ready:text-white ut-uploading:text-gray-300"
                                      : "ut-ready:text-white ut-uploading:text-gray-400"
                                  }`,
                                  container: "w-full",
                                  allowedContent: "text-xs text-gray-500",
                                }}
                              />
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Max 4MB, JPG/PNG/GIF/WebP
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Your Message (optional)
                            </label>
                            <textarea
                              value={formData.message}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  message: e.target.value,
                                })
                              }
                              maxLength={100}
                              rows={2}
                              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                isLightMode ? "bg-gray-100" : "bg-gray-800"
                              }`}
                              placeholder="Your message to the world (max 100 characters)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.message.length}/100 characters
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      isLightMode
                        ? "bg-gray-200 hover:bg-gray-300"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold hover:scale-105 transition-transform text-white ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUploading ? "Uploading..." : "Pay Now"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
