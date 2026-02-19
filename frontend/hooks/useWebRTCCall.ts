/**
 * WebRTC Calling Hook for React Native
 * Handles in-app audio calls using WebRTC and Socket.IO
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

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
  // State
  callState: CallState;
  callInfo: CallInfo | null;
  isConnected: boolean;
  callDuration: number;
  
  // Actions
  initiateCall: (targetUserId: string, targetName: string) => Promise<void>;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  
  // Registration
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
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCallIdRef = useRef<string | null>(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    const backendUrl = API_URL.replace('/api', '');
    
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
      console.log('WebRTC: Disconnected from signaling server');
      setIsConnected(false);
      cleanupCall();
    });

    socketRef.current.on('registered', (data) => {
      console.log('WebRTC: Registered', data);
    });

    // Incoming call
    socketRef.current.on('incoming_call', (data) => {
      console.log('WebRTC: Incoming call', data);
      currentCallIdRef.current = data.call_id;
      setCallInfo({
        callId: data.call_id,
        peerName: data.caller_name,
        callType: data.call_type || 'audio',
        isIncoming: true,
      });
      setCallState('ringing');
      
      // Show alert for incoming call
      Alert.alert(
        'Incoming Call',
        `${data.caller_name} is calling...`,
        [
          { text: 'Decline', style: 'destructive', onPress: () => rejectCall() },
          { text: 'Accept', onPress: () => acceptCall() },
        ],
        { cancelable: false }
      );
    });

    // Call accepted by peer
    socketRef.current.on('call_accepted', async (data) => {
      console.log('WebRTC: Call accepted', data);
      setCallState('connecting');
      await startWebRTCConnection(true);
    });

    // Call connected
    socketRef.current.on('call_connected', (data) => {
      console.log('WebRTC: Call connected', data);
      setCallState('connected');
      startCallTimer();
    });

    // Call rejected
    socketRef.current.on('call_rejected', (data) => {
      console.log('WebRTC: Call rejected', data);
      Alert.alert('Call Declined', 'The call was declined.');
      cleanupCall();
    });

    // Call ended
    socketRef.current.on('call_ended', (data) => {
      console.log('WebRTC: Call ended', data);
      cleanupCall();
    });

    // Call failed
    socketRef.current.on('call_failed', (data) => {
      console.log('WebRTC: Call failed', data);
      Alert.alert('Call Failed', data.message || 'Unable to connect the call.');
      cleanupCall();
    });

    // Call is ringing
    socketRef.current.on('call_ringing', (data) => {
      console.log('WebRTC: Call ringing', data);
      setCallState('ringing');
    });

    // WebRTC signaling
    socketRef.current.on('webrtc_offer', async (data) => {
      console.log('WebRTC: Received offer');
      await handleOffer(data.offer);
    });

    socketRef.current.on('webrtc_answer', async (data) => {
      console.log('WebRTC: Received answer');
      await handleAnswer(data.answer);
    });

    socketRef.current.on('webrtc_ice_candidate', async (data) => {
      console.log('WebRTC: Received ICE candidate');
      await handleIceCandidate(data.candidate);
    });
  }, []);

  // Register with signaling server
  const register = useCallback((userId: string, userType: string, userName: string) => {
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

  // Start WebRTC connection
  const startWebRTCConnection = async (createOffer: boolean) => {
    try {
      // Get audio stream
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      // Create peer connection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('webrtc_ice_candidate', {
            call_id: currentCallIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('WebRTC: Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setCallState('connected');
          startCallTimer();
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          cleanupCall();
        }
      };

      // Create offer if we're the initiator
      if (createOffer) {
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_offer', {
          call_id: currentCallIdRef.current,
          offer: offer,
        });
      }
    } catch (error) {
      console.error('WebRTC: Error starting connection:', error);
      Alert.alert('Error', 'Could not access microphone');
      cleanupCall();
    }
  };

  // Handle incoming offer
  const handleOffer = async (offer: RTCSessionDescription) => {
    try {
      if (!peerConnectionRef.current) {
        await startWebRTCConnection(false);
      }
      
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer({});
      await peerConnectionRef.current?.setLocalDescription(answer);
      
      socketRef.current?.emit('webrtc_answer', {
        call_id: currentCallIdRef.current,
        answer: answer,
      });
      
      setCallState('connected');
      startCallTimer();
    } catch (error) {
      console.error('WebRTC: Error handling offer:', error);
    }
  };

  // Handle answer
  const handleAnswer = async (answer: RTCSessionDescription) => {
    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState('connected');
      startCallTimer();
    } catch (error) {
      console.error('WebRTC: Error handling answer:', error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidate) => {
    try {
      if (peerConnectionRef.current && candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('WebRTC: Error adding ICE candidate:', error);
    }
  };

  // Initiate a call
  const initiateCall = async (targetUserId: string, targetName: string) => {
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

    // Wait for socket to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    socketRef.current?.emit('call_initiate', {
      target_user_id: targetUserId,
      caller_name: 'App User',
      call_type: 'audio',
    });
  };

  // Accept incoming call
  const acceptCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    
    socketRef.current?.emit('call_accept', { call_id: currentCallIdRef.current });
    setCallState('connecting');
    startWebRTCConnection(false);
  }, []);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    
    socketRef.current?.emit('call_reject', {
      call_id: currentCallIdRef.current,
      reason: 'rejected',
    });
    cleanupCall();
  }, []);

  // End current call
  const endCall = useCallback(() => {
    if (!currentCallIdRef.current) return;
    
    socketRef.current?.emit('call_end', { call_id: currentCallIdRef.current });
    cleanupCall();
  }, []);

  // Start call timer
  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Cleanup call resources
  const cleanupCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Reset state
    currentCallIdRef.current = null;
    setCallState('idle');
    setCallInfo(null);
    setCallDuration(0);
  }, []);

  // Cleanup on unmount
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

// Format duration as MM:SS
export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
