"use client";
import { toast } from "sonner";
import SERVER_ADDRESS from "@/config";

export default async function fetchData(tableName, key) {
  try {
    const response = await fetch(`${SERVER_ADDRESS}/data/${tableName}/fetch`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    const result = await response.json();

    // Check if session is expired
    if (response.status === 401 || result.error === "Session expired") {
      // Show a popup using toast
      toast.error("Session Expired", {
        description: "Your session has expired. Please log in again.",
        duration: 5000,
      });
      // Redirect to auth page after a short delay
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    }

    return result;
  } catch (error) {
    console.log("Fetch Failed !", error);
    toast("Automatic Logout", {
      description: "Authenticater Timed out, Please Log back in !",
    });
    window.location.href = "/auth";
    return error;
  }
}
