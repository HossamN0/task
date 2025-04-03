import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

export default function Sender() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        async function startStream() {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(userStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = userStream;
                }

                const peer = new RTCPeerConnection();
                peerRef.current = peer;

                userStream.getTracks().forEach((track) => peer.addTrack(track, userStream));

                peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                    if (event.candidate) {
                        socket.emit("candidate", event.candidate);
                    }
                };

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit("offer", offer);

                socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
                    if (!peerRef.current) return;
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                });

                socket.on("candidate", async (candidate: RTCIceCandidateInit) => {
                    if (!peerRef.current || !candidate) return;
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                });
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        }

        startStream();

        return () => {
            if (peerRef.current) {
                peerRef.current.close();
            }
            socket.off("answer");
            socket.off("candidate");
        };
    }, []);

    return (
        null
    );
}
