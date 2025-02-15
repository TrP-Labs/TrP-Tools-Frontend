"use client"
import { useState, useEffect } from "react";

const useFetchData = (fetchAction: () => Promise<any>) => {
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
    useEffect(() => {
      async function fetchData() {
        try {
          const result = await fetchAction();
          setData(result);
          setStatus("success");
        } catch (error) {
          setStatus("error");
        }
      }
  
      fetchData();
    }, [fetchAction]);
  
    return [ data, status ];
}

export default useFetchData