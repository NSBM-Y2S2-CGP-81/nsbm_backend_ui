"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import SERVER_ADDRESS from "@/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_ADDRESS}/auth/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Login failed: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Login successful", data);

      if (data.access_token) {
        // Store the token securely in localStorage
        localStorage.setItem("NEXT_PUBLIC_SYS_API", data.access_token);

        // If using sessionStorage instead:
        // sessionStorage.setItem("NEXT_PUBLIC_SYS_API", data.access_token);

        // Redirect or update state after login
        window.location.href = "/home"; // Change to your desired route
      } else {
        throw new Error("Access token not received.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="h-screen flex items-center justify-center">
        <div className="p-10 flex flex-col items-center justify-center">
          <div className="flex flex-row items-center justify-center bg-gray-900 w-[1200px] h-[700px]">
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-700">
              <Image
                src="/assets/images/logo.png"
                width={150}
                height={150}
                alt="Logo"
                className="filter brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
              />
              <h1 className="text-white text-3xl font-semibold">
                Dashboard Login
              </h1>
              <h2 className="text-white text-sm font-medium">Administrator</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="flex flex-col space-y-2 w-full max-w-md p-10">
                <label
                  htmlFor="email"
                  className="text-white text-lg font-semibold"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Admin Email"
                  className="p-3 w-full rounded-lg border border-gray-300 bg-gray-900 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label
                  htmlFor="password"
                  className="text-white text-lg font-semibold"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Admin Password"
                  className="p-3 w-full rounded-lg border border-gray-300 bg-gray-900 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                onClick={handleLogin}
                className="py-2 px-4 bg-white text-black rounded-lg shadow-md hover:bg-black hover:text-white active:bg-gray-800 active:text-white transition duration-300 font-mono"
              >
                {"Continue ->"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
