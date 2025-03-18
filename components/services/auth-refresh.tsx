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
