import React, { useState } from "react";
import { Trophy, Medal, RefreshCw, Users, LayoutGrid, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/cardninput";
import { Button } from "@/components/ui/buttonmsp";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Donor {
  _id: string;
  name: string;
  wave: number;
}

const LeaderboardSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [topDonors, setTopDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopDonors = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) {
        throw new Error(`Failed to fetch top donors: ${response.status}`);
      }
      const data = await response.json();
      setTopDonors(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

//  useEffect(() => {
//    if (isSidebarOpen) {
//      fetchTopDonors();
//    }
//  }, [isSidebarOpen]);

  //*useEffect(() => {
 //   const handleKeyDown = (event: KeyboardEvent) => {
  //    if (event.key === "L" || event.key === "l") {
 //       setIsSidebarOpen((prev) => !prev);
 //     }
//    };
//
//    window.addEventListener("keydown", handleKeyDown);
//    return () => window.removeEventListener("keydown", handleKeyDown);
//  }, []);

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
        onClick={() => setIsSidebarOpen(false)}
        className="fixed bottom-4 disabled  right-7 opacity-80 bg-blue-300/50 hover:bg-slate-800/50 z-[-100] text-slate-100 shadow-lg rounded-md px-4 py-2 flex items-center gap-2"
      >
        <LayoutGrid className="w-4 h-4 text-amber-400" />
        <span className="font-medium">Leaderboard (out of order)</span>
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
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : error ? (
              <Alert
                variant="warning"
                message="error"
                className="bg-red-950/50 border-red-900"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : Array.isArray(topDonors) && topDonors.length > 0 ? (
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
                      <span className="font-mono font-medium">{donor.wave}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-100">No donors available</p>
            )}
          </CardContent>

          <div className="flex justify-center items-center p-4 border-t border-slate-800">
            <Button
              onClick={fetchTopDonors}
              disabled={refreshing}
              variant="outline"
              className="w-full bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
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
