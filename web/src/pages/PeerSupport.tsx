import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

interface PeerVeteran {
  id: string;
  name: string;
  service: string;
  bio: string;
  status: 'available' | 'limited' | 'offline';
  specialisms?: string[];
  avatar?: string;
  years_served?: number;
}

export default function PeerSupport() {
  const navigate = useNavigate();
  const [showVeteransList, setShowVeteransList] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [peerSupporters, setPeerSupporters] = useState<PeerVeteran[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (showVeteransList) {
      setIsLoading(true);
      fetch(`${API_URL}/api/peer-supporters/available`)
        .then(r => r.json())
        .then(data => setPeerSupporters(data))
        .catch(() => setPeerSupporters([]))
        .finally(() => setIsLoading(false));
    }
  }, [showVeteransList]);

  const availableCount = peerSupporters.filter(p => p.status === 'available' || p.status === 'limited').length;

  const handleRegister = async () => {
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/peer-support/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setRegistered(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'available') return '#22c55e';
    if (status === 'limited') return '#f59e0b';
    return '#94a3b8';
  };

  const statusLabel = (status: string) => {
    if (status === 'available') return 'Available';
    if (status === 'limited') return 'Limited availability';
    return 'Offline';
  };

  return (
    <div style={{minHeight:'100vh',backgroundColor:'#f8fafc',color:'#1a2332'}}>
      {/* Header */}
      <div style={{backgroundColor:'#fff',padding:'16px 20px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #e2e8f0',position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>navigate('/home',{replace:true})} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#64748b'}}>←</button>
        <h1 style={{margin:0,fontSize:'20px',fontWeight:'700'}}>Talk to a Veteran</h1>
      </div>

      <div style={{maxWidth:'500px',margin:'0 auto',padding:'20px 16px'}}>

        {/* Intro */}
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{fontSize:'48px',marginBottom:'12px'}}>🪖</div>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#1a2332',marginBottom:'8px'}}>Peer Support Network</h2>
          <p style={{fontSize:'14px',color:'#64748b',lineHeight:'1.6',margin:0}}>
            Connect with fellow veterans who understand what you've been through. All peer supporters have served and are trained to listen.
          </p>
        </div>

        {/* Available now */}
        <button onClick={()=>setShowVeteransList(!showVeteransList)}
          style={{width:'100%',backgroundColor:'#1a2332',color:'#fff',border:'none',borderRadius:'16px',padding:'20px',marginBottom:'16px',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'17px',fontWeight:'700',marginBottom:'4px'}}>🟢 Peer Supporters</div>
            <div style={{fontSize:'13px',color:'#94a3b8'}}>See who's available to talk</div>
          </div>
          <span style={{fontSize:'20px',color:'#94a3b8'}}>{showVeteransList?'▲':'▼'}</span>
        </button>

        {showVeteransList && (
          <div style={{marginBottom:'16px'}}>
            {isLoading ? (
              <div style={{textAlign:'center',padding:'32px',color:'#64748b'}}>Loading peer supporters...</div>
            ) : peerSupporters.length === 0 ? (
              <div style={{backgroundColor:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'24px',textAlign:'center'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>😔</div>
                <div style={{fontWeight:'600',color:'#1a2332',marginBottom:'4px'}}>No one available right now</div>
                <div style={{fontSize:'13px',color:'#64748b'}}>Try again later or request a callback below</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {availableCount > 0 && (
                  <div style={{fontSize:'13px',color:'#22c55e',fontWeight:'600',padding:'0 4px'}}>
                    {availableCount} veteran{availableCount!==1?'s':''} available now
                  </div>
                )}
                {peerSupporters.map(peer => (
                  <div key={peer.id} style={{backgroundColor:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:'12px',marginBottom:'12px'}}>
                      <div style={{width:'48px',height:'48px',borderRadius:'24px',backgroundColor:'#1a2332',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>
                        🪖
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                          <span style={{fontWeight:'700',fontSize:'16px',color:'#1a2332'}}>{peer.name}</span>
                          <span style={{width:'8px',height:'8px',borderRadius:'4px',backgroundColor:statusColor(peer.status),display:'inline-block'}}/>
                          <span style={{fontSize:'12px',color:statusColor(peer.status),fontWeight:'500'}}>{statusLabel(peer.status)}</span>
                        </div>
                        <div style={{fontSize:'13px',color:'#3b82f6',marginBottom:'6px'}}>{peer.service}</div>
                        <p style={{fontSize:'13px',color:'#64748b',lineHeight:'1.5',margin:0}}>{peer.bio}</p>
                      </div>
                    </div>
                    {peer.specialisms && peer.specialisms.length > 0 && (
                      <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px'}}>
                        {peer.specialisms.map(s => (
                          <span key={s} style={{backgroundColor:'#f1f5f9',color:'#475569',fontSize:'11px',fontWeight:'500',padding:'3px 8px',borderRadius:'20px'}}>{s}</span>
                        ))}
                      </div>
                    )}
                    {(peer.status === 'available' || peer.status === 'limited') && (
                      <button onClick={()=>navigate('/callback')}
                        style={{width:'100%',backgroundColor:'#22c55e',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
                        📞 Request to Talk with {peer.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Become a peer supporter */}
        <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',marginBottom:'16px'}}>
          <button onClick={()=>setShowRegisterForm(!showRegisterForm)}
            style={{width:'100%',padding:'20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
            <div>
              <div style={{fontWeight:'700',fontSize:'16px',color:'#1a2332',marginBottom:'2px'}}>🤝 Become a Peer Supporter</div>
              <div style={{fontSize:'13px',color:'#64748b'}}>Give back by supporting fellow veterans</div>
            </div>
            <span style={{color:'#64748b',fontSize:'20px'}}>{showRegisterForm?'▲':'▼'}</span>
          </button>

          {showRegisterForm && (
            <div style={{borderTop:'1px solid #e2e8f0',padding:'20px'}}>
              {registered ? (
                <div style={{textAlign:'center',padding:'16px'}}>
                  <div style={{fontSize:'40px',marginBottom:'12px'}}>✅</div>
                  <div style={{fontWeight:'700',fontSize:'18px',color:'#1a2332',marginBottom:'8px'}}>Thank you!</div>
                  <p style={{fontSize:'14px',color:'#64748b',margin:0}}>We'll be in touch soon with more information about joining our peer support network.</p>
                </div>
              ) : (
                <>
                  <p style={{fontSize:'14px',color:'#64748b',lineHeight:'1.6',marginBottom:'16px'}}>
                    Have you served? Help other veterans by volunteering as a peer supporter. Training and support is provided.
                  </p>
                  <label style={{fontSize:'14px',fontWeight:'500',color:'#1a2332',display:'block',marginBottom:'8px'}}>Your Email Address</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" type="email"
                    style={{width:'100%',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'12px',fontSize:'15px',color:'#1a2332',outline:'none',marginBottom:'12px',boxSizing:'border-box'}}/>
                  <button onClick={handleRegister} disabled={!email.trim()||isSubmitting}
                    style={{width:'100%',backgroundColor:!email.trim()?'#94a3b8':'#3b82f6',color:'#fff',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>
                    {isSubmitting?'Sending...':'Register Interest'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{backgroundColor:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
          <span style={{fontSize:'18px'}}>ℹ️</span>
          <p style={{fontSize:'12px',color:'#94a3b8',lineHeight:'1.6',margin:0}}>
            Peer supporters are fellow veterans, not professional counsellors. If you're in crisis please use the crisis support page or call Samaritans on 116 123.
          </p>
        </div>
      </div>
    </div>
  );
}
