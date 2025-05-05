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
    if (response.status === 401 || response.status === 422) {
      // Show popup instead of toast
      if (typeof window !== "undefined") {
        alert("Invalid API or Session has expired, Please log back in");
        window.location.href = "/a_selection";
      }
    }
    return result;
  } catch (error) {
    console.log("Fetch Failed !", error);
    // Show popup instead of toast for error case as well
    // if (typeof window !== "undefined") {
    //   alert("Invalid API or Session has expired, Please log back in");
    //   window.location.href = "/a_selection";
    // }
    return error;
  }
}
