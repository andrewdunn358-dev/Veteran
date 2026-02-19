/**
 * WebRTC Calling Hook for Expo Web
 * Handles in-app audio calls using WebRTC and Socket.IO
 * Works in browser environment
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// WebRTC configuration
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type CallState = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended';

interface CallInfo {
  callId: string;
  peerName: string;
  callType: 'audio' | 'video';
  isIncoming: boolean;
}

interface UseWebRTCCallReturn {
  callState: CallState;
  callInfo: CallInfo | null;
  isConnected: boolean;
  callDuration: number;
  initiateCall: (targetUserId: string, targetName: string) => Promise<void>;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  register: (userId: string, userType: string, userName: string) => void;
}

export function useWebRTCCall(): UseWebRTCCallReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentCallIdRef = useRef<string | null>(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (Platform.OS !== 'web' || socketRef.current?.connected) return;
    
    const backendUrl = API_URL.replace('/api', '');
    console.log('WebRTC: Connecting to', backendUrl);
    
    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('WebRTC: Connected to signaling server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebRTC: Disconnected');
      setIsConnected(false);
      cleanupCall();
    });

    socketRef.current.on('registered', (data: any) => {
      console.log('WebRTC: Registered', data);
    });

    // Incoming call
    socketRef.current.on('incoming_call', (data: any) => {
      console.log('WebRTC: Incoming call', data);
      currentCallIdRef.current = data.call_id;
      setCallInfo({
        callId: data.call_id,
        peerName: data.caller_name,
        callType: data.call_type || 'audio',
        isIncoming: true,
      });
      setCallState('ringing');
    });

    // Call accepted
    socketRef.current.on('call_accepted', async () => {
      console.log('WebRTC: Call accepted');
      setCallState('connecting');
      await startWebRTCConnection(true);
    });

    // Call connected
    socketRef.current.on('call_connected', () => {
      console.log('WebRTC: Call connected');
      setCallState('connected');
      startCallTimer();
    });

    // Call rejected/ended/failed
    socketRef.current.on('call_rejected', () => {
      Alert.alert('Call Declined', 'The call was declined.');
      cleanupCall();
    });

    socketRef.current.on('call_ended', () => {
      cleanupCall();
    });

    socketRef.current.on('call_failed', (data: any) => {
      Alert.alert('Call Failed', data.message || 'Unable to connect.');
      cleanupCall();
    });

    socketRef.current.on('call_ringing', () => {
      setCallState('ringing');
    });

    // WebRTC signaling
    socketRef.current.on('webrtc_offer', async (data: any) => {
      await handleOffer(data.offer);
    });

    socketRef.current.on('webrtc_answer', async (data: any) => {
      await handleAnswer(data.answer);
    });

    socketRef.current.on('webrtc_ice_candidate', async (data: any) => {
      await handleIceCandidate(data.candidate);
    });
  }, []);

  // Register with signaling server
  const register = useCallback((userId: string, userType: string, userName: string) => {
    if (Platform.OS !== 'web') return;
    
    initializeSocket();
    
    setTimeout(() => {
      socketRef.current?.emit('register', {
        user_id: userId,
        user_type: userType,
        name: userName,
        status: 'available',
      });
    }, 1000);
  }, [initializeSocket]);

  // Create remote audio element
  const ensureRemoteAudio = () => {
    if (Platform.OS !== 'web') return null;
    
    if (!remoteAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.id = 'webrtc-remote-audio';
      document.body.appendChild(audio);
      remoteAudioRef.current = audio;
    }
    return remoteAudioRef.current;
  };

  // Start WebRTC connection
  const startWebRTCConnection = async (createOffer: boolean) => {
    if (Platform.OS !== 'web') return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('webrtc_ice_candidate', {
            call_id: currentCallIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const audio = ensureRemoteAudio();
        if (audio) {
          audio.srcObject = event.streams[0];
          audio.play().catch(console.error);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCallState('connected');
          startCallTimer();
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          cleanupCall();
        }
      };

      if (createOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_offer', {
          call_id: currentCallIdRef.current,
          offer: offer,
        });
      }
    } catch (error) {
      console.error('WebRTC error:', error);
      Alert.alert('Error', 'Could not access microphone');
      cleanupCall();
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (Platform.OS !== 'web') return;
    
    if (!peerConnectionRef.current) {
      await startWebRTCConnection(false);
    }
    
    await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current?.createAnswer();
    await peerConnectionRef.current?.setLocalDescription(answer);
    
    socketRef.current?.emit('webrtc_answer', {
      call_id: currentCallIdRef.current,
      answer: answer,
    });
    
    setCallState('connected');
    startCallTimer();
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (Platform.OS !== 'web') return;
    await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    setCallState('connected');
    startCallTimer();
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (Platform.OS !== 'web' || !candidate) return;
    await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const initiateCall = async (targetUserId: string, targetName: string) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Supported', 'In-app calling is only available on web.');
      return;
    }
    
    if (callState !== 'idle') {
      Alert.alert('Busy', 'You are already in a call');
      return;
    }

    initializeSocket();
    
    setCallInfo({
      callId: '',
      peerName: targetName,
      callType: 'audio',
      isIncoming: false,
    });
    setCallState('connecting');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    socketRef.current?.emit('call_initiate', {
      target_user_id: targetUserId,
      caller_name: 'App User',
      call_type: 'audio',
    });
  };

  const acceptCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    socketRef.current?.emit('call_accept', { call_id: currentCallIdRef.current });
    setCallState('connecting');
    startWebRTCConnection(false);
  }, []);

  const rejectCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    socketRef.current?.emit('call_reject', {
      call_id: currentCallIdRef.current,
      reason: 'rejected',
    });
    cleanupCall();
  }, []);

  const endCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    socketRef.current?.emit('call_end', { call_id: currentCallIdRef.current });
    cleanupCall();
  }, []);

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const cleanupCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    currentCallIdRef.current = null;
    setCallState('idle');
    setCallInfo(null);
    setCallDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupCall();
      socketRef.current?.disconnect();
    };
  }, [cleanupCall]);

  return {
    callState,
    callInfo,
    isConnected,
    callDuration,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    register,
  };
}

export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
