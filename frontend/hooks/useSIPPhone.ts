/**
 * SIP Phone Hook for React Native
 * Uses JsSIP for WebRTC-based VoIP calls
 * 
 * Note: This works in React Native Web. For native iOS/Android,
 * you would need react-native-pjsip or similar native module.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';

// SIP Configuration
const SIP_CONFIG = {
  // Update these with your FreeSWITCH server details
  wsServer: 'wss://sip.yourdomain.com:7443',
  domain: 'sip.yourdomain.com',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN server for NAT traversal
    // { urls: 'turn:turn.yourdomain.com:3478', username: 'user', credential: 'pass' }
  ],
};

export type CallState = 
  | 'idle'
  | 'connecting'
  | 'registered'
  | 'ringing'
  | 'incoming'
  | 'connected'
  | 'on-hold'
  | 'ended'
  | 'failed';

export interface CallInfo {
  id: string;
  direction: 'incoming' | 'outgoing';
  remoteUri: string;
  remoteName: string;
  startTime: Date | null;
  duration: number;
}

interface UseSIPPhoneReturn {
  // State
  isRegistered: boolean;
  callState: CallState;
  currentCall: CallInfo | null;
  error: string | null;
  
  // Actions
  initialize: (userId: string, displayName: string, password?: string) => Promise<boolean>;
  makeCall: (targetExtension: string) => boolean;
  answerCall: () => void;
  rejectCall: () => void;
  hangup: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  disconnect: () => void;
  
  // Status
  isMuted: boolean;
  isOnHold: boolean;
}

export function useSIPPhone(): UseSIPPhoneReturn {
  const [isRegistered, setIsRegistered] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [currentCall, setCurrentCall] = useState<CallInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  
  const uaRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Only works on web platform
  const isWebPlatform = Platform.OS === 'web';
  
  // Initialize audio element for web
  useEffect(() => {
    if (isWebPlatform && typeof window !== 'undefined') {
      remoteAudioRef.current = new Audio();
      remoteAudioRef.current.autoplay = true;
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isWebPlatform]);
  
  // Initialize SIP UA
  const initialize = useCallback(async (
    userId: string, 
    displayName: string, 
    password?: string
  ): Promise<boolean> => {
    if (!isWebPlatform) {
      setError('SIP calling is only available on web. Native support coming soon.');
      return false;
    }
    
    // Dynamically import JsSIP (only works on web)
    try {
      const JsSIP = (await import('jssip')).default;
      
      const sipUri = `sip:${userId}@${SIP_CONFIG.domain}`;
      const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsServer);
      
      const configuration = {
        sockets: [socket],
        uri: sipUri,
        password: password || userId,
        display_name: displayName,
        register: true,
        register_expires: 300,
        session_timers: false,
        pcConfig: {
          iceServers: SIP_CONFIG.iceServers,
        },
      };
      
      const ua = new JsSIP.UA(configuration);
      
      // Event handlers
      ua.on('connecting', () => {
        setCallState('connecting');
      });
      
      ua.on('connected', () => {
        console.log('SIP: Connected to server');
      });
      
      ua.on('disconnected', () => {
        setIsRegistered(false);
        setCallState('idle');
      });
      
      ua.on('registered', () => {
        setIsRegistered(true);
        setCallState('idle');
        setError(null);
        console.log('SIP: Registered successfully');
      });
      
      ua.on('registrationFailed', (e: any) => {
        setIsRegistered(false);
        setError(`Registration failed: ${e.cause}`);
        console.error('SIP: Registration failed:', e.cause);
      });
      
      ua.on('newRTCSession', (data: any) => {
        const session = data.session;
        sessionRef.current = session;
        
        if (session.direction === 'incoming') {
          handleIncomingCall(session);
        } else {
          setupCallHandlers(session);
        }
      });
      
      ua.start();
      uaRef.current = ua;
      
      return true;
      
    } catch (err: any) {
      setError(`Failed to initialize SIP: ${err.message}`);
      console.error('SIP initialization error:', err);
      return false;
    }
  }, [isWebPlatform]);
  
  // Handle incoming call
  const handleIncomingCall = useCallback((session: any) => {
    const remoteUri = session.remote_identity.uri.toString();
    const remoteName = session.remote_identity.display_name || remoteUri;
    
    setCurrentCall({
      id: session.id,
      direction: 'incoming',
      remoteUri,
      remoteName,
      startTime: null,
      duration: 0,
    });
    
    setCallState('incoming');
    setupCallHandlers(session);
    
    // Alert user about incoming call (web only)
    if (isWebPlatform && typeof window !== 'undefined') {
      // Play ringtone or show notification
      if (Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `Call from ${remoteName}`,
          icon: '/logo.png',
        });
      }
    }
  }, [isWebPlatform]);
  
  // Set up call session handlers
  const setupCallHandlers = useCallback((session: any) => {
    session.on('progress', () => {
      setCallState('ringing');
    });
    
    session.on('accepted', () => {
      setCallState('connected');
      startCallTimer();
    });
    
    session.on('confirmed', () => {
      // Attach remote audio stream
      if (session.connection && remoteAudioRef.current) {
        session.connection.ontrack = (event: any) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };
      }
    });
    
    session.on('ended', () => {
      cleanupCall();
    });
    
    session.on('failed', (e: any) => {
      setError(`Call failed: ${e.cause}`);
      cleanupCall();
    });
    
    session.on('hold', () => {
      setIsOnHold(true);
      setCallState('on-hold');
    });
    
    session.on('unhold', () => {
      setIsOnHold(false);
      setCallState('connected');
    });
  }, []);
  
  // Start call duration timer
  const startCallTimer = useCallback(() => {
    const startTime = new Date();
    setCurrentCall(prev => prev ? { ...prev, startTime, duration: 0 } : null);
    
    callTimerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setCurrentCall(prev => prev ? { ...prev, duration } : null);
    }, 1000);
  }, []);
  
  // Clean up after call ends
  const cleanupCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    sessionRef.current = null;
    setCurrentCall(null);
    setCallState('idle');
    setIsMuted(false);
    setIsOnHold(false);
  }, []);
  
  // Make outgoing call
  const makeCall = useCallback((targetExtension: string): boolean => {
    if (!uaRef.current || !isRegistered) {
      setError('Phone not registered');
      return false;
    }
    
    if (sessionRef.current) {
      setError('Already in a call');
      return false;
    }
    
    const targetUri = `sip:${targetExtension}@${SIP_CONFIG.domain}`;
    
    try {
      const session = uaRef.current.call(targetUri, {
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: SIP_CONFIG.iceServers },
      });
      
      setCurrentCall({
        id: session.id,
        direction: 'outgoing',
        remoteUri: targetUri,
        remoteName: targetExtension,
        startTime: null,
        duration: 0,
      });
      
      setCallState('ringing');
      return true;
      
    } catch (err: any) {
      setError(`Failed to make call: ${err.message}`);
      return false;
    }
  }, [isRegistered]);
  
  // Answer incoming call
  const answerCall = useCallback(() => {
    if (!sessionRef.current) return;
    
    try {
      sessionRef.current.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: SIP_CONFIG.iceServers },
      });
    } catch (err: any) {
      setError(`Failed to answer: ${err.message}`);
    }
  }, []);
  
  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!sessionRef.current) return;
    
    try {
      sessionRef.current.terminate({
        status_code: 486,
        reason_phrase: 'Busy Here',
      });
    } catch (err: any) {
      console.error('Failed to reject call:', err);
    }
    
    cleanupCall();
  }, [cleanupCall]);
  
  // Hang up current call
  const hangup = useCallback(() => {
    if (!sessionRef.current) return;
    
    try {
      sessionRef.current.terminate();
    } catch (err: any) {
      console.error('Failed to hang up:', err);
    }
    
    cleanupCall();
  }, [cleanupCall]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!sessionRef.current) return;
    
    try {
      if (isMuted) {
        sessionRef.current.unmute({ audio: true });
        setIsMuted(false);
      } else {
        sessionRef.current.mute({ audio: true });
        setIsMuted(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle mute:', err);
    }
  }, [isMuted]);
  
  // Toggle hold
  const toggleHold = useCallback(() => {
    if (!sessionRef.current) return;
    
    try {
      if (isOnHold) {
        sessionRef.current.unhold();
      } else {
        sessionRef.current.hold();
      }
    } catch (err: any) {
      console.error('Failed to toggle hold:', err);
    }
  }, [isOnHold]);
  
  // Disconnect SIP
  const disconnect = useCallback(() => {
    if (uaRef.current) {
      uaRef.current.unregister();
      uaRef.current.stop();
      uaRef.current = null;
    }
    
    setIsRegistered(false);
    setCallState('idle');
    cleanupCall();
  }, [cleanupCall]);
  
  return {
    isRegistered,
    callState,
    currentCall,
    error,
    initialize,
    makeCall,
    answerCall,
    rejectCall,
    hangup,
    toggleMute,
    toggleHold,
    disconnect,
    isMuted,
    isOnHold,
  };
}

// Helper to format call duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
