import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Lock, Eye, EyeOff, Timer } from "lucide-react";

type RecoveryStep = "email" | "otp" | "reset" | "success";

interface EmailInputs {
  email: string;
}

interface ResetInputs {
  password: string;
  confirmPassword: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>("email");
  const [emailAddress, setEmailAddress] = useState("");

  // OTP State
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);

  // Password View State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Forms setup
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailInputs>();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetInputs>();

  const watchPassword = watchReset("password");

  // Timer logic for OTP Resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Step 1: Submit Email
  const onEmailSubmit = async (data: EmailInputs) => {
    setSubmitLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitLoading(false);
    setEmailAddress(data.email);
    setStep("otp");
    setOtpTimer(60);
    setCanResend(false);
  };

  // OTP focus shifting helpers
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Allow numbers only
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setOtpError(null);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Submit OTP
  const onOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setSubmitLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitLoading(false);

    // Accept any code for testing (e.g. 123456 or other digits)
    if (code === "123456" || code === "111111" || code.startsWith("1") || code.length === 6) {
      setStep("reset");
    } else {
      setOtpError("Verification code is incorrect. Check your email or try again.");
    }
  };

  const handleResendOtp = () => {
    setOtp(new Array(6).fill(""));
    setOtpTimer(60);
    setCanResend(false);
    setOtpError(null);
  };

  // Step 3: Reset Password
  const onResetSubmit = async (data: ResetInputs) => {
    setSubmitLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitLoading(false);
    setStep("success");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Recovery Gateway</h2>
        <p className="text-sm text-muted-foreground">
          {step === "email" && "Enter your email to receive an verification code."}
          {step === "otp" && `We've sent a 6-digit security code to your email: ${emailAddress}`}
          {step === "reset" && "Secure your profile by choosing a new lock combination."}
          {step === "success" && "Your access key combination has been updated successfully."}
        </p>
      </div>

      {/* STEP 1: Email Input */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
          {emailErrors.email && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Alert</p>
                <p className="text-xs opacity-90">{emailErrors.email.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-foreground/80">
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="text"
                placeholder="student@college.edu or admin@college.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-sans"
                disabled={submitLoading}
                {...registerEmail("email", {
                  required: "Registered email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email format",
                  },
                })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Broadcasting Link...</span>
              </>
            ) : (
              <>
                <span>Request Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Verification UI */}
      {step === "otp" && (
        <form onSubmit={onOtpVerify} className="space-y-6">
          {otpError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">OTP Code Alert</p>
                <p className="text-xs opacity-90">{otpError}</p>
              </div>
            </div>
          )}

          {/* OTP Digit Blocks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 block text-center">
              Enter 6-Digit OTP Security Code
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  ref={(el) => {
                    if (el) otpRefs.current[index] = el;
                  }}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                  disabled={submitLoading}
                />
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Hint: Input <span className="font-bold text-foreground">123456</span> or any 6 digits to verify.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Countdown & Resend */}
          <div className="text-center text-xs">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend Code
              </button>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> Resend code in {otpTimer}s
              </span>
            )}
          </div>
        </form>
      )}

      {/* STEP 3: Reset Password Form */}
      {step === "reset" && (
        <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
          {resetErrors.password || resetErrors.confirmPassword ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Reset Alert</p>
                {resetErrors.password && <p className="text-xs opacity-90">{resetErrors.password.message}</p>}
                {resetErrors.confirmPassword && (
                  <p className="text-xs opacity-90">{resetErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          ) : null}

          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
              New Profile Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                disabled={submitLoading}
                {...registerReset("password", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                disabled={submitLoading}
                {...registerReset("confirmPassword", {
                  required: "Password confirmation is required",
                  validate: (val) => {
                    if (val !== watchPassword) {
                      return "Password combination entries do not match";
                    }
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving settings...</span>
              </>
            ) : (
              <>
                <span>Commit &amp; Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Success View */}
      {step === "success" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-semibold">Reset Completed</p>
              <p className="text-xs opacity-90">
                Your college account password combination has been successfully updated.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Foot Navigation */}
      {step !== "success" && (
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
          Remembered your credentials?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Go to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
