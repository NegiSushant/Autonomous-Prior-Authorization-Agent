import { Send, Sparkles, X, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function RequestAccessModal({
  onClose,
  userEmail,
}: {
  onClose: () => void;
  userEmail?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields
  const [email, setEmail] = useState(userEmail || "");
  const [organizationName, setOrganizationName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("HOSPITAL");
  const [monthlyVolume, setMonthlyVolume] = useState("<100");

  // Email verification state
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  // ---------- Real API calls ----------
  const sendOtpApi = async (emailToVerify: string) => {
    console.log("excuteing the send opt method");
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToVerify }),
    });

    const data = await res.json();
    console.log(`Resoponse from send otp method: ${data}`)

    if (!res.ok) {
      console.log(`Error from send otp method: ${data}`)
      return {
        success: false,
        message: data.error || "Failed to send OTP",
      };
    }

    return { success: true, message: data.message };
  };

  const verifyOtpApi = async (emailToVerify: string, otpCode: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailToVerify,
        otp: otpCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.error || "Invalid OTP",
      };
    }

    return { success: true, message: data.message };
  };
  // ------------------------------------

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError("Please enter a valid email address first.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");
    setOtpMessage("");

    try {
      const result = await sendOtpApi(email);
      if (result.success) {
        setIsOtpSent(true);
        setOtpMessage(
          result.message || "OTP sent successfully. Check your email.",
        );
      } else {
        setOtpError(result.message || "Failed to send OTP. Please try again.");
      }
    } catch {
      setOtpError("Something went wrong while sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");
    setOtpMessage("");

    try {
      const result = await verifyOtpApi(email, otp.trim());
      if (result.success) {
        setIsEmailVerified(true);
        setOtpMessage(result.message || "Email verified successfully!");
      } else {
        setOtpError(result.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setOtpError("Something went wrong while verifying OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setOtpError("Please verify your email before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Final API call with all data (you can implement this later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/40">
              <Sparkles className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Request Sent!</h3>
            <p className="mt-2 text-sm text-slate-400">
              Our team will review your request and upgrade your workspace
              shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-1">
              Unlock Full Access
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Upgrade from the demo environment to process actual patient
              authorizations.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Organization Name - Full width */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Organization Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="e.g. Memorial Healthcare"
                />
              </div>

              {/* Type + Domain Name - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  >
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="CLINIC">CLINIC</option>
                    <option value="LAB">LAB</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="hospital.com"
                  />
                </div>
              </div>

              {/* Email + Phone - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsOtpSent(false);
                      setIsEmailVerified(false);
                      setOtp("");
                      setOtpError("");
                      setOtpMessage("");
                    }}
                    required
                    disabled={isEmailVerified}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all disabled:opacity-60"
                    placeholder="admin@hospital.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* OTP Verification Row */}
              <div className="flex items-center gap-2">
                {!isEmailVerified ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || !email}
                      className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {isOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>

                    {isOtpSent && (
                      <>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          className="flex-1 rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otp.length < 6}
                          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isVerifyingOtp ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Email verified
                  </div>
                )}
              </div>

              {/* Status messages */}
              {(otpError || otpMessage) && (
                <p
                  className={`text-sm ${
                    otpError ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {otpError || otpMessage}
                </p>
              )}

              {/* Address - Full width */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                  placeholder="123 Medical Center Drive"
                />
              </div>

              {/* Expected Monthly Volume */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Expected Monthly Volume
                </label>
                <select
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                >
                  <option value="<100">Less than 100 requests</option>
                  <option value="100-500">100 - 500 requests</option>
                  <option value="500+">500+ requests</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isEmailVerified}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>

              {!isEmailVerified && (
                <p className="text-center text-xs text-slate-500">
                  Verify your email to enable submission
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
