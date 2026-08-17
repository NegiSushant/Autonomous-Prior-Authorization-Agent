"use client";

import { SignInSchema } from "../../../types/uitypes";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const router = useRouter();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const parsedData = SignInSchema.safeParse(data);

      if (!parsedData.success) {
        setError("Please enter a valid email and password.");
        return;
      }

      const result = await signIn("credentials", {
        email: parsedData.data.email,
        password: parsedData.data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/apa-agent");
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setGithubLoading(true);
    try {
      await signIn("github", {
        callbackUrl: "/apa-agent",
      });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setError("Unable to sign in with GitHub.");
      setGithubLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white flex flex-col justify-center px-6 py-12 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
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
                className="block w-full rounded-md px-3 py-1.5 text-base sm:text-sm/6 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 transition-colors bg-white text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
              >
                Password
              </label>
            </div>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md px-3 py-1.5 text-base sm:text-sm/6 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 transition-colors bg-white text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={loading || githubLoading}
              className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-white/10" />
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-slate-900 px-3 text-gray-500 dark:text-gray-400 transition-colors">
              Or continue with
            </span>
          </div>
        </div>

        {/* GitHub Sign In */}
        <button
          type="button"
          onClick={handleGithubSignIn}
          disabled={loading || githubLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-0 dark:hover:bg-white/20 shadow-sm dark:shadow-none"
        >
          {githubLoading ? (
            "Connecting to GitHub..."
          ) : (
            <>
              {/* GitHub Icon */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.936.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z"
                />
              </svg>
              Sign in with GitHub
            </>
          )}
        </button>

        {/* Sign Up */}
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Dont have an account?{" "}
          <a
            href="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
