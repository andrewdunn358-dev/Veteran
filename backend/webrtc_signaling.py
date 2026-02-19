"""
WebRTC Signaling Server
=======================
Handles real-time signaling for WebRTC peer-to-peer calls.
No PBX required - direct browser-to-browser audio/video.

Flow:
1. Staff connects and registers as available
2. User initiates call to staff
3. Signaling server exchanges offer/answer/ICE candidates
4. WebRTC establishes direct peer connection
"""

import socketio
import logging
from datetime import datetime
from typing import Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Configure for production
    logger=True,
    engineio_logger=True
)

# Track connected users
# Format: {socket_id: {user_id, user_type, name, status}}
connected_users: Dict[str, dict] = {}

# Track active calls
# Format: {call_id: {caller_sid, callee_sid, status, started_at}}
active_calls: Dict[str, dict] = {}

# Reverse lookup: user_id -> socket_id
user_to_socket: Dict[str, str] = {}


@sio.event
async def connect(sid, environ):
    """Handle new connection"""
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, to=sid)


@sio.event
async def disconnect(sid):
    """Handle disconnection"""
    logger.info(f"Client disconnected: {sid}")
    
    # Get user info before removing
    user_info = connected_users.get(sid)
    
    # Clean up user from tracking
    if sid in connected_users:
        user_id = connected_users[sid].get('user_id')
        if user_id and user_id in user_to_socket:
            del user_to_socket[user_id]
        del connected_users[sid]
    
    # End any active calls
    for call_id, call in list(active_calls.items()):
        if call['caller_sid'] == sid or call['callee_sid'] == sid:
            other_sid = call['callee_sid'] if call['caller_sid'] == sid else call['caller_sid']
            await sio.emit('call_ended', {
                'call_id': call_id,
                'reason': 'peer_disconnected'
            }, to=other_sid)
            del active_calls[call_id]
    
    # Notify others that staff member went offline
    if user_info and user_info.get('user_type') in ['counsellor', 'peer']:
        await sio.emit('staff_offline', {
            'user_id': user_info['user_id'],
            'name': user_info.get('name', 'Unknown')
        })


@sio.event
async def register(sid, data):
    """
    Register a user (staff or app user)
    Data: {user_id, user_type: 'counsellor'|'peer'|'user', name, status?}
    """
    user_id = data.get('user_id')
    user_type = data.get('user_type', 'user')
    name = data.get('name', 'Unknown')
    status = data.get('status', 'available')
    
    # Store connection info
    connected_users[sid] = {
        'user_id': user_id,
        'user_type': user_type,
        'name': name,
        'status': status,
        'connected_at': datetime.utcnow().isoformat()
    }
    user_to_socket[user_id] = sid
    
    logger.info(f"User registered: {name} ({user_type}) - {user_id}")
    
    await sio.emit('registered', {
        'success': True,
        'user_id': user_id,
        'user_type': user_type
    }, to=sid)
    
    # If staff, notify others
    if user_type in ['counsellor', 'peer']:
        await sio.emit('staff_online', {
            'user_id': user_id,
            'user_type': user_type,
            'name': name,
            'status': status
        })


@sio.event
async def update_status(sid, data):
    """Update staff availability status"""
    if sid in connected_users:
        connected_users[sid]['status'] = data.get('status', 'available')
        await sio.emit('staff_status_changed', {
            'user_id': connected_users[sid]['user_id'],
            'status': data.get('status')
        })


@sio.event
async def get_online_staff(sid, data):
    """Get list of online staff members"""
    online_staff = []
    for socket_id, user in connected_users.items():
        if user['user_type'] in ['counsellor', 'peer'] and user['status'] == 'available':
            online_staff.append({
                'user_id': user['user_id'],
                'user_type': user['user_type'],
                'name': user['name'],
                'status': user['status']
            })
    
    await sio.emit('online_staff_list', {'staff': online_staff}, to=sid)


@sio.event
async def call_initiate(sid, data):
    """
    User initiates a call to staff
    Data: {target_user_id, caller_name, call_type: 'audio'|'video'}
    """
    target_user_id = data.get('target_user_id')
    caller_info = connected_users.get(sid, {})
    call_type = data.get('call_type', 'audio')
    
    # Find target's socket
    target_sid = user_to_socket.get(target_user_id)
    
    if not target_sid:
        await sio.emit('call_failed', {
            'reason': 'user_offline',
            'message': 'The person you are trying to call is not available'
        }, to=sid)
        return
    
    target_info = connected_users.get(target_sid, {})
    
    if target_info.get('status') != 'available':
        await sio.emit('call_failed', {
            'reason': 'user_busy',
            'message': 'The person you are trying to call is busy'
        }, to=sid)
        return
    
    # Create call record
    call_id = f"call_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{sid[:8]}"
    active_calls[call_id] = {
        'caller_sid': sid,
        'caller_id': caller_info.get('user_id'),
        'caller_name': caller_info.get('name', data.get('caller_name', 'Unknown')),
        'callee_sid': target_sid,
        'callee_id': target_user_id,
        'callee_name': target_info.get('name'),
        'call_type': call_type,
        'status': 'ringing',
        'started_at': datetime.utcnow().isoformat()
    }
    
    # Update statuses
    connected_users[sid]['status'] = 'in_call'
    connected_users[target_sid]['status'] = 'ringing'
    
    logger.info(f"Call initiated: {call_id} from {caller_info.get('name')} to {target_info.get('name')}")
    
    # Notify caller
    await sio.emit('call_ringing', {
        'call_id': call_id,
        'target_name': target_info.get('name')
    }, to=sid)
    
    # Notify callee (incoming call)
    await sio.emit('incoming_call', {
        'call_id': call_id,
        'caller_id': caller_info.get('user_id'),
        'caller_name': caller_info.get('name', 'Unknown'),
        'call_type': call_type
    }, to=target_sid)


@sio.event
async def call_accept(sid, data):
    """Callee accepts the call"""
    call_id = data.get('call_id')
    
    if call_id not in active_calls:
        await sio.emit('call_failed', {'reason': 'call_not_found'}, to=sid)
        return
    
    call = active_calls[call_id]
    
    if call['callee_sid'] != sid:
        await sio.emit('call_failed', {'reason': 'not_authorized'}, to=sid)
        return
    
    call['status'] = 'accepted'
    connected_users[sid]['status'] = 'in_call'
    
    logger.info(f"Call accepted: {call_id}")
    
    # Notify caller to start WebRTC negotiation
    await sio.emit('call_accepted', {
        'call_id': call_id,
        'callee_name': call['callee_name']
    }, to=call['caller_sid'])
    
    # Notify callee
    await sio.emit('call_connected', {
        'call_id': call_id,
        'peer_name': call['caller_name']
    }, to=sid)


@sio.event
async def call_reject(sid, data):
    """Callee rejects the call"""
    call_id = data.get('call_id')
    reason = data.get('reason', 'rejected')
    
    if call_id not in active_calls:
        return
    
    call = active_calls[call_id]
    
    # Reset statuses
    if call['caller_sid'] in connected_users:
        connected_users[call['caller_sid']]['status'] = 'available'
    if call['callee_sid'] in connected_users:
        connected_users[call['callee_sid']]['status'] = 'available'
    
    logger.info(f"Call rejected: {call_id} - {reason}")
    
    # Notify caller
    await sio.emit('call_rejected', {
        'call_id': call_id,
        'reason': reason
    }, to=call['caller_sid'])
    
    del active_calls[call_id]


@sio.event
async def call_end(sid, data):
    """Either party ends the call"""
    call_id = data.get('call_id')
    
    if call_id not in active_calls:
        return
    
    call = active_calls[call_id]
    
    # Determine other party
    other_sid = call['callee_sid'] if call['caller_sid'] == sid else call['caller_sid']
    
    # Reset statuses
    if call['caller_sid'] in connected_users:
        connected_users[call['caller_sid']]['status'] = 'available'
    if call['callee_sid'] in connected_users:
        connected_users[call['callee_sid']]['status'] = 'available'
    
    logger.info(f"Call ended: {call_id}")
    
    # Notify other party
    await sio.emit('call_ended', {
        'call_id': call_id,
        'reason': 'ended_by_peer'
    }, to=other_sid)
    
    del active_calls[call_id]


# ============ WebRTC Signaling ============

@sio.event
async def webrtc_offer(sid, data):
    """Forward WebRTC offer to peer"""
    call_id = data.get('call_id')
    offer = data.get('offer')
    
    if call_id not in active_calls:
        return
    
    call = active_calls[call_id]
    target_sid = call['callee_sid'] if call['caller_sid'] == sid else call['caller_sid']
    
    await sio.emit('webrtc_offer', {
        'call_id': call_id,
        'offer': offer
    }, to=target_sid)


@sio.event
async def webrtc_answer(sid, data):
    """Forward WebRTC answer to peer"""
    call_id = data.get('call_id')
    answer = data.get('answer')
    
    if call_id not in active_calls:
        return
    
    call = active_calls[call_id]
    target_sid = call['callee_sid'] if call['caller_sid'] == sid else call['caller_sid']
    
    await sio.emit('webrtc_answer', {
        'call_id': call_id,
        'answer': answer
    }, to=target_sid)


@sio.event
async def webrtc_ice_candidate(sid, data):
    """Forward ICE candidate to peer"""
    call_id = data.get('call_id')
    candidate = data.get('candidate')
    
    if call_id not in active_calls:
        return
    
    call = active_calls[call_id]
    target_sid = call['callee_sid'] if call['caller_sid'] == sid else call['caller_sid']
    
    await sio.emit('webrtc_ice_candidate', {
        'call_id': call_id,
        'candidate': candidate
    }, to=target_sid)


# ============ API Endpoints ============

def get_online_staff_list():
    """Get list of online staff (for REST API)"""
    online = []
    for sid, user in connected_users.items():
        if user['user_type'] in ['counsellor', 'peer']:
            online.append({
                'user_id': user['user_id'],
                'user_type': user['user_type'],
                'name': user['name'],
                'status': user['status']
            })
    return online


def get_active_calls_list():
    """Get list of active calls (for admin)"""
    return list(active_calls.values())
