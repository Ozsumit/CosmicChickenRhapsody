import React, { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  RefreshCw,
  Users,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonmsp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";

interface Donor {
  _id: string;
  name: string;
  wave: number;
}

interface ApiError {
  error: string;
  details: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: ApiError = await res.json();
    throw new Error(
      error.details || "An error occurred while fetching the data."
    );
  }
  return res.json();
};

const LeaderboardSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    data: topDonors,
    error,
    isValidating,
    mutate,
  } = useSWR<Donor[], Error>(
    isSidebarOpen ? "/api/leaderboard" : null,
    fetcher
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "L" || event.key === "l") {
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-amber-400 w-6 h-6" />;
      case 1:
        return <Medal className="text-slate-300 w-6 h-6" />;
      case 2:
        return <Medal className="text-amber-600 w-6 h-6" />;
      default:
        return <span className="text-slate-400 font-medium">{index + 1}</span>;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-4 right-7 opacity-50 bg-blue-300/50 hover:bg-slate-800/50 z-[100] text-slate-100 shadow-lg rounded-md px-4 py-2 flex items-center gap-2"
      >
        <LayoutGrid className="w-4 h-4 text-amber-400" />
        <span className="font-medium">Leaderboard</span>
      </Button>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[100] ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 transform transition-transform duration-300 ease-in-out z-[100] ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Card className="w-full h-full bg-slate-950/95 backdrop-blur-sm flex flex-col font-mono">
          <CardHeader className="border-b border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-amber-400 w-5 h-5" />
                <h2 className="text-lg font-semibold text-slate-100">
                  Highest Wave
                </h2>
              </div>
              <Button
                onClick={() => setIsSidebarOpen(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-grow overflow-y-auto">
            {isValidating ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : error ? (
              <Alert
              message=""
                variant="error"
                className="bg-red-950/50 border-red-900"
              >
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : topDonors && topDonors.length > 0 ? (
              <ul className="space-y-3">
                {topDonors.map((donor, index) => (
                  <li
                    key={donor._id}
                    className="group flex items-center justify-between bg-slate-900/50 rounded-lg p-3 transition-all hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      <span className="text-slate-100 font-medium group-hover:text-white transition-colors">
                        {donor.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="font-mono font-medium">
                        {donor.wave}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-400">
                No leaderboard data available
              </p>
            )}
          </CardContent>

          <div className="flex justify-center items-center p-4 border-t border-slate-800">
            <Button
              onClick={() => mutate()}
              disabled={isValidating}
              variant="outline"
              className="w-full bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
              />
              Refresh Leaderboard
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default LeaderboardSidebar;
