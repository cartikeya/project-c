import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
function Dashboard() {
  const [roomCode, setRoomCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // When the server confirms the room is created, navigate the Admin there
    socket.on("room_created", (newRoomId) => {
      navigate(`/auction/${newRoomId}`);
    });

    // When the server confirms the room exists and you joined, navigate the Player there
    socket.on("room_joined", (joinedRoomId) => {
      // Tell the backend to create this team's wallet in the room
      socket.emit("join_game", { teamName, roomId: joinedRoomId });
      navigate(`/auction/${joinedRoomId}`);
    });

    // Catch invalid room codes
    socket.on("error_message", (msg) => {
      setError(msg);
    });

    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("error_message");
    };
  }, [socket, navigate, teamName]);

  const handleCreateRoom = () => {
    // Tells the backend to generate a 4-letter code and fire "room_created"
    socket.emit("create_room");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCode || !teamName) {
      setError("Please enter both a Room Code and a Team Name.");
      return;
    }
    setError("");
    // Tells the backend to check the code and fire "room_joined" if valid
    socket.emit("join_room", roomCode.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-6 text-[#1d1d1f]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT PANEL: Create a Room (Admin) */}
        <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Host an Auction
          </h2>
          <p className="text-[#86868b] mb-8 font-medium">
            Generate a unique room code and take control of the auctioneer
            podium.
          </p>
          <button
            onClick={handleCreateRoom}
            className="w-full bg-[#1d1d1f] text-white py-4 rounded-full font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Create New Room
          </button>
        </div>

        {/* RIGHT PANEL: Join a Room (Player) */}
        <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 text-2xl mx-auto md:mx-0">
            🏏
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center md:text-left">
            Join a Room
          </h2>
          <p className="text-[#86868b] mb-6 font-medium text-center md:text-left">
            Enter your invite code and secure your franchise name.
          </p>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2 ml-2">
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. A7X9"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-[#1d1d1f] placeholder-gray-400 uppercase tracking-widest font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2 ml-2">
                Team Name
              </label>
              <input
                type="text"
                placeholder="Chennai Super Kings"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-[#1d1d1f] placeholder-gray-400 font-medium"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold ml-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-white text-[#1d1d1f] border-2 border-gray-200 py-4 rounded-full font-bold text-lg hover:border-gray-900 hover:bg-gray-50 transition-all mt-4"
            >
              Enter Auction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
