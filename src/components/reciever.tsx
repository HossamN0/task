import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

export default function Receiver() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [isCallAvailable, setIsCallAvailable] = useState<boolean>(false);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);

  useEffect(() => {
    socket.on("offer", () => setIsCallAvailable(true));
    startReceiving();
    return () => {
      socket.off("offer");
      socket.off("candidate");
    };
  }, []);

  const startReceiving = async () => {
    if (isReceiving) return;
    setIsReceiving(true);
    setIsCallAvailable(false);

    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    peer.ontrack = (event: RTCTrackEvent) => {
      if (videoRef.current && event.streams.length > 0) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate);
      }
    };

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("candidate", async (candidate: RTCIceCandidateInit) => {
      if (peerRef.current && candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  };

  return (
    <div className="relative w-full min-h-screen h-screen">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-fill scale-x-[-1] brightness-75"
      />

<div className="absolute top-0 left-0 w-full h-[60px] bg-[#1A1A1A] flex justify-between items-center px-4">
  <div className="flex items-center">
    <img src="/logo.png" alt="logo" className="h-[50px] w-[140px] object-cover" />
    <p className="text-gray-500 ml-2">ControlWire</p>
  </div>

  <div className="flex items-center space-x-1">
    {[
      { label: "Distance", value: "2.456 m", bg: "#333333" },
      { label: "Running", value: "2h 34m", bg: "#333333" },
      { label: "Latitude", value: "60°16'58'' N", bg: "#4D4D4D" },
      { label: "Status", value: "OK", bg: "#00AA00", text: "text-white", rounded: "rounded-md px-3 py-1" },
      { label: "Longitude", value: "25°01'96'' E", bg: "#4D4D4D" },
      { label: "Elevation", value: "127 m", bg: "#333333" },
      { label: "Temperature", value: "21°C", bg: "#333333" },
    ].map(({ label, value, bg, text = "text-gray-200", rounded = "" }, idx) => (
      <div
        key={idx}
        className={`px-4 py-2 flex flex-col items-center ${rounded} ${idx === 0 ? "rounded-l-lg" : ""} ${
          idx === 6 ? "rounded-r-lg" : ""
        }`}
        style={{ backgroundColor: bg }}
      >
        <p className="text-xs text-[#858585]">{label}</p>
        <p className={`text-sm font-semibold ${text}`}>{value}</p>
      </div>
    ))}
  </div>

  <div className="flex items-center space-x-4 text-white">
    <div className="relative">
      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a6 6 0 00-6 6v4H5a1 1 0 000 2h14a1 1 0 000-2h-1V8a6 6 0 00-6-6zM7 18a5 5 0 0010 0H7z"></path>
      </svg>
      <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full px-1">2</span>
    </div>

    <div className="flex items-center space-x-1">
      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
        <path d="M20 10v4"></path>
      </svg>
      <p className="text-sm">89%</p>
    </div>

    <p className="text-sm">Wed, 26 Feb 23:58</p>
  </div>
</div>

    </div>
  );
}
