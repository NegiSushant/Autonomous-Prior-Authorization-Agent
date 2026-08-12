"use client";

import { CreateUserSchema } from "../../types/uitypes";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const data = {
        email: String(formData.get("email") ?? ""),
        name: String(formData.get("name") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      };

      // Validate form data
      const parsedData = CreateUserSchema.safeParse(data);

      if (!parsedData.success) {
        setError(
          parsedData.error.issues[0]?.message ||
            "Please enter valid information.",
        );
        return;
      }

      // Create account
      const response = await axios.post("/api/auth/signup", {
        email: parsedData.data.email,
        name: parsedData.data.name,
        password: parsedData.data.password,
      });

      if (response.status === 200 || response.status === 201) {
        router.push("/signin");
        return;
      }

      setError("Unable to create account.");
    } catch (error: unknown) {
      console.error("Signup error:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to create account. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setError(null);
    setGithubLoading(true);

    try {
      await signIn("github", {
        callbackUrl: "/apa-agent",
      });
    } catch (error) {
      console.error("GitHub signup error:", error);
      setError("Unable to continue with GitHub.");
      setGithubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-12 lg:px-8">
      {/* Heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Create your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-400">
          Get started with your account
        </p>
      </div>

      {/* Form */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Name
            </label>

            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="John Doe"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Email address
            </label>

            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Password
            </label>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Confirm password
            </label>

            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <div>
            <button
              type="submit"
              disabled={loading || githubLoading}
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="bg-black px-3 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* GitHub */}
        <button
          type="button"
          onClick={handleGithubSignUp}
          disabled={loading || githubLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {githubLoading ? (
            "Connecting to GitHub..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.936.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z"
                />
              </svg>
              Sign up with GitHub
            </>
          )}
        </button>

        {/* Sign In */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}