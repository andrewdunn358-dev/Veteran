# FreeSWITCH VoIP Server Setup Guide

## Overview

This guide explains how to set up a FreeSWITCH server for internal VoIP calls between the Veterans Support App and Staff Portal.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VOIP ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐                           ┌──────────────┐  │
│   │  Mobile App  │                           │  Staff       │  │
│   │  (Veteran)   │                           │  Portal      │  │
│   │  JsSIP/Web   │                           │  JsSIP/Web   │  │
│   └──────┬───────┘                           └──────┬───────┘  │
│          │                                          │          │
│          │  WSS (WebSocket Secure)                  │          │
│          │  Port 7443                               │          │
│          │                                          │          │
│          └────────────────┬─────────────────────────┘          │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │ FreeSWITCH  │                              │
│                    │   Server    │                              │
│                    │             │                              │
│                    │ - SIP       │                              │
│                    │ - WebRTC    │                              │
│                    │ - SRTP      │                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Option 1: Docker Deployment (Recommended)

### Prerequisites
- Linux VPS with Docker installed (DigitalOcean, Vultr, Linode - ~£5-20/month)
- Domain name pointing to your server (e.g., sip.yourdomain.com)
- SSL certificate (Let's Encrypt)

### Step 1: Create Docker Compose File

```yaml
# docker-compose.yml
version: '3.8'

services:
  freeswitch:
    image: signalwire/freeswitch-public:latest
    container_name: freeswitch
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./freeswitch/conf:/etc/freeswitch
      - ./freeswitch/sounds:/usr/share/freeswitch/sounds
      - ./freeswitch/recordings:/var/lib/freeswitch/recordings
      - ./certs:/etc/freeswitch/certs
    environment:
      - DEFAULT_PASSWORD=your_secure_password_here
    cap_add:
      - NET_ADMIN
      - SYS_NICE
```

### Step 2: Create Configuration Directory

```bash
mkdir -p freeswitch/conf
mkdir -p freeswitch/sounds
mkdir -p freeswitch/recordings
mkdir -p certs
```

### Step 3: Configure WebSocket for WebRTC

Create `freeswitch/conf/sip_profiles/internal.xml`:

```xml
<profile name="internal">
  <settings>
    <!-- Basic SIP settings -->
    <param name="sip-ip" value="$${local_ip_v4}"/>
    <param name="sip-port" value="5060"/>
    
    <!-- WebSocket for WebRTC -->
    <param name="ws-binding" value=":5066"/>
    <param name="wss-binding" value=":7443"/>
    
    <!-- TLS/SSL settings -->
    <param name="tls" value="true"/>
    <param name="tls-cert-dir" value="/etc/freeswitch/certs"/>
    
    <!-- RTP settings for WebRTC -->
    <param name="rtp-ip" value="$${local_ip_v4}"/>
    <param name="ext-rtp-ip" value="auto-nat"/>
    <param name="ext-sip-ip" value="auto-nat"/>
    
    <!-- Enable WebRTC -->
    <param name="apply-candidate-acl" value="rfc1918"/>
    <param name="apply-register-acl" value="any_v4.auto"/>
    
    <!-- SRTP for secure media -->
    <param name="inbound-codec-negotiation" value="generous"/>
    <param name="rtp-timeout-sec" value="300"/>
    <param name="rtp-hold-timeout-sec" value="1800"/>
  </settings>
</profile>
```

### Step 4: Create User Directory

Create `freeswitch/conf/directory/default.xml`:

```xml
<include>
  <domain name="$${domain}">
    <params>
      <param name="dial-string" value="{^^:sip_invite_domain=${dialed_domain}:presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(*/${dialed_user}@${dialed_domain})}"/>
    </params>
    
    <variables>
      <variable name="record_stereo" value="true"/>
      <variable name="default_gateway" value="$${default_provider}"/>
    </variables>
    
    <groups>
      <group name="default">
        <users>
          <!-- Staff extensions will be auto-created via API -->
          <!-- Or manually add here -->
          <user id="1001">
            <params>
              <param name="password" value="1234"/>
            </params>
            <variables>
              <variable name="user_context" value="default"/>
              <variable name="effective_caller_id_name" value="Dr Smith"/>
              <variable name="effective_caller_id_number" value="1001"/>
            </variables>
          </user>
          
          <user id="1002">
            <params>
              <param name="password" value="1234"/>
            </params>
            <variables>
              <variable name="user_context" value="default"/>
              <variable name="effective_caller_id_name" value="Peer Supporter"/>
              <variable name="effective_caller_id_number" value="1002"/>
            </variables>
          </user>
        </users>
      </group>
    </groups>
  </domain>
</include>
```

### Step 5: Create Dialplan

Create `freeswitch/conf/dialplan/default.xml`:

```xml
<include>
  <context name="default">
    <!-- Internal extension dialing -->
    <extension name="Local_Extension">
      <condition field="destination_number" expression="^(10[0-9]{2})$">
        <action application="set" data="call_timeout=30"/>
        <action application="set" data="hangup_after_bridge=true"/>
        <action application="bridge" data="user/${destination_number}@${domain_name}"/>
        <action application="voicemail" data="default ${domain_name} ${destination_number}"/>
      </condition>
    </extension>
    
    <!-- Echo test -->
    <extension name="echo">
      <condition field="destination_number" expression="^9196$">
        <action application="answer"/>
        <action application="echo"/>
      </condition>
    </extension>
  </context>
</include>
```

### Step 6: SSL Certificate Setup

```bash
# Using Let's Encrypt
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d sip.yourdomain.com

# Copy to FreeSWITCH certs directory
sudo cp /etc/letsencrypt/live/sip.yourdomain.com/fullchain.pem certs/wss.pem
sudo cp /etc/letsencrypt/live/sip.yourdomain.com/privkey.pem certs/wss.key
sudo cat certs/wss.pem certs/wss.key > certs/agent.pem
```

### Step 7: Firewall Configuration

```bash
# Open required ports
sudo ufw allow 5060/udp   # SIP
sudo ufw allow 5060/tcp   # SIP TCP
sudo ufw allow 5066/tcp   # WebSocket
sudo ufw allow 7443/tcp   # WebSocket Secure (WSS)
sudo ufw allow 16384:32768/udp  # RTP media
```

### Step 8: Start FreeSWITCH

```bash
docker-compose up -d

# Check logs
docker logs -f freeswitch

# Access FreeSWITCH console
docker exec -it freeswitch fs_cli
```

---

## Option 2: Manual Installation (Debian/Ubuntu)

### Step 1: Install FreeSWITCH

```bash
# Add FreeSWITCH repository
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fsstretch-archive-keyring.asc | apt-key add -
echo "deb http://files.freeswitch.org/repo/deb/debian-release/ bullseye main" > /etc/apt/sources.list.d/freeswitch.list

# Install
apt update
apt install -y freeswitch-meta-all
```

### Step 2: Configure for WebRTC

Edit `/etc/freeswitch/sip_profiles/internal.xml` and add:

```xml
<param name="wss-binding" value=":7443"/>
<param name="tls" value="true"/>
<param name="tls-cert-dir" value="/etc/freeswitch/certs"/>
```

### Step 3: Start Service

```bash
systemctl enable freeswitch
systemctl start freeswitch
```

---

## Integration with Your App

### Update SIP Configuration

In `/app/staff-portal/sip-phone.js`, update:

```javascript
const SIP_CONFIG = {
    wsServer: 'wss://sip.yourdomain.com:7443',
    domain: 'sip.yourdomain.com',
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ]
};
```

In `/app/frontend/hooks/useSIPPhone.ts`, update:

```typescript
const SIP_CONFIG = {
    wsServer: 'wss://sip.yourdomain.com:7443',
    domain: 'sip.yourdomain.com',
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};
```

### User Extension Assignment

Create extensions for staff members. Options:

1. **Static Assignment**: Add users to directory XML
2. **Dynamic Assignment**: Use FreeSWITCH mod_xml_curl to fetch user data from your API

Example API integration:

```python
# Add to backend/server.py
@api_router.get("/sip/directory/{user_id}")
async def get_sip_user(user_id: str):
    """FreeSWITCH XML directory lookup"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return Response(status_code=404)
    
    # Generate extension number from user ID
    extension = f"1{user_id[-3:]}"  # e.g., 1001, 1002
    
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
    <document type="freeswitch/xml">
      <section name="directory">
        <domain name="sip.yourdomain.com">
          <user id="{extension}">
            <params>
              <param name="password" value="{user_id}"/>
            </params>
            <variables>
              <variable name="user_context" value="default"/>
              <variable name="effective_caller_id_name" value="{user['name']}"/>
            </variables>
          </user>
        </domain>
      </section>
    </document>'''
    
    return Response(content=xml, media_type="application/xml")
```

---

## Testing

### Test WebSocket Connection

```javascript
// In browser console
const ws = new WebSocket('wss://sip.yourdomain.com:7443');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

### Test SIP Registration

```javascript
// Use the SIPPhone module
SIPPhone.init('1001', 'Test User', '1234');
// Check console for "Phone registered - Ready for calls"
```

### Make Test Call

```javascript
// After registration
SIPPhone.call('9196');  // Echo test - you should hear your voice echoed back
```

---

## TURN Server Setup (For NAT Traversal)

If calls don't connect through firewalls, you need a TURN server.

### Using coturn

```bash
# Install coturn
apt install coturn

# Edit /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
fingerprint
use-auth-secret
static-auth-secret=your_turn_secret_here
realm=sip.yourdomain.com
cert=/etc/letsencrypt/live/sip.yourdomain.com/fullchain.pem
pkey=/etc/letsencrypt/live/sip.yourdomain.com/privkey.pem

# Start
systemctl enable coturn
systemctl start coturn
```

Then update your ICE servers:

```javascript
iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
        urls: 'turn:sip.yourdomain.com:3478',
        username: 'turnuser',
        credential: 'your_turn_secret_here'
    }
]
```

---

## Security Considerations

1. **Use WSS (WebSocket Secure)** - Never use unencrypted WS in production
2. **Strong Passwords** - Use unique passwords for each extension
3. **Firewall Rules** - Only open necessary ports
4. **Fail2ban** - Install to prevent brute force attacks
5. **Regular Updates** - Keep FreeSWITCH updated

### Fail2ban Configuration

```bash
# Install
apt install fail2ban

# Create /etc/fail2ban/jail.local
[freeswitch]
enabled = true
filter = freeswitch
action = iptables-allports[name=freeswitch]
logpath = /var/log/freeswitch/freeswitch.log
maxretry = 5
bantime = 3600
```

---

## Estimated Costs

| Component | Provider | Cost |
|-----------|----------|------|
| VPS (2GB RAM) | DigitalOcean | £10/month |
| Domain | Namecheap | £10/year |
| SSL | Let's Encrypt | Free |
| **Total** | | **~£11/month** |

---

## Troubleshooting

### "Registration Failed"
- Check WebSocket URL is correct (wss://, not ws://)
- Verify SSL certificate is valid
- Check firewall allows port 7443

### "Call Failed"
- Enable STUN/TURN servers
- Check RTP ports are open (16384-32768 UDP)
- Verify both parties are registered

### "No Audio"
- Check browser microphone permissions
- Verify SRTP is configured
- Test with echo extension (9196)

### View FreeSWITCH Logs
```bash
docker logs -f freeswitch
# or
tail -f /var/log/freeswitch/freeswitch.log
```

---

## Next Steps

1. Set up FreeSWITCH on your VPS
2. Configure SSL certificate
3. Update SIP_CONFIG in staff portal and app
4. Test registration and calls
5. Add extensions for each staff member
6. Consider recording calls for safeguarding

---

*For additional help, see the FreeSWITCH documentation: https://freeswitch.org/confluence/*
