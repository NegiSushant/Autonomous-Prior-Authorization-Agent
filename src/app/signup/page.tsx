"use client";

import { CreateUserSchema } from "../../types/uitypes";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      email: String(formData.get("email")),
      name: String(formData.get("name")),
      password: String(formData.get("password")),
    };

    const parsedata = CreateUserSchema.safeParse(data);
    console.log(parsedata);

    if (!parsedata.success) {
      setError("Invalid Inputs!");
      return;
    }

    const response = await axios.post("/api/auth/signup", {
      email: String(formData.get("email")),
      name: String(formData.get("name")),
      password: String(formData.get("password")),
    });
    if (response.status === 200) {
      router.push("/signin");
    }
  };
  return (
    <div>
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-black">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            Sign up to create account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={signUp} className="space-y-6">
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
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
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

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
                  type="name"
                  required
                  autoComplete="name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-100"
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
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
