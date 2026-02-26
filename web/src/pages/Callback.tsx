import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

type CallbackType = 'counsellor' | 'peer';
type View = 'form' | 'success';

export default function Callback() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('form');
  const [type, setType] = useState<CallbackType>('counsellor');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/callbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message, request_type: type, is_urgent: isUrgent }),
      });
      setView('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'success') {
    return (
      <div style={{minHeight:'100vh',backgroundColor:'#f8fafc',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{maxWidth:'440px',width:'100%',textAlign:'center'}}>
          <div style={{fontSize:'72px',marginBottom:'24px'}}>✅</div>
          <h1 style={{fontSize:'24px',fontWeight:'700',color:'#1a2332',marginBottom:'16px'}}>Callback Requested</h1>
          <p style={{fontSize:'16px',color:'#64748b',lineHeight:'1.6',marginBottom:'8px'}}>
            Thank you {name}. We've received your request and will call you back on <strong>{phone}</strong> as soon as possible.
          </p>
          <p style={{fontSize:'14px',color:'#94a3b8',marginBottom:'24px'}}>
            Please keep your phone nearby and make sure it's charged.
          </p>
          <div style={{backgroundColor:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'12px',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'32px',textAlign:'left'}}>
            <span style={{fontSize:'20px'}}>⚠️</span>
            <p style={{fontSize:'14px',color:'#1a2332',lineHeight:'1.6',margin:0}}>
              While you wait, if things get worse please call <strong style={{color:'#f59e0b'}}>Samaritans on 116 123</strong> or in an emergency call <strong style={{color:'#f59e0b'}}>999</strong>.
            </p>
          </div>
          <button onClick={()=>navigate('/home', {replace:true})}
            style={{backgroundColor:'#3b82f6',color:'#fff',border:'none',borderRadius:'12px',padding:'14px 32px',fontSize:'16px',fontWeight:'600',cursor:'pointer'}}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',backgroundColor:'#f8fafc',color:'#1a2332'}}>
      {/* Header */}
      <div style={{backgroundColor:'#fff',padding:'16px 20px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #e2e8f0',position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>navigate('/home', {replace:true})} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#64748b'}}>←</button>
        <h1 style={{margin:0,fontSize:'20px',fontWeight:'700'}}>Request a Callback</h1>
      </div>

      <div style={{maxWidth:'500px',margin:'0 auto',padding:'24px 16px'}}>
        {/* Intro */}
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontSize:'48px',marginBottom:'12px'}}>📞</div>
          <p style={{fontSize:'16px',color:'#64748b',lineHeight:'1.6',margin:0}}>
            One of our team will call you back at a time that suits you. All calls are free and confidential.
          </p>
        </div>

        {/* Type selector */}
        <div style={{fontSize:'13px',fontWeight:'600',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Who would you like to speak with?</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'24px'}}>
          {[
            { id:'counsellor', icon:'🧠', label:'Counsellor', sub:'Professional mental health support' },
            { id:'peer', icon:'🪖', label:'Peer Supporter', sub:'Talk to a fellow veteran' },
          ].map(opt => (
            <button key={opt.id} onClick={()=>setType(opt.id as CallbackType)}
              style={{backgroundColor: type===opt.id ? '#3b82f6' : '#fff', border:`2px solid ${type===opt.id?'#3b82f6':'#e2e8f0'}`, borderRadius:'12px', padding:'16px', cursor:'pointer', textAlign:'center'}}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>{opt.icon}</div>
              <div style={{fontWeight:'600',fontSize:'14px',color: type===opt.id?'#fff':'#1a2332'}}>{opt.label}</div>
              <div style={{fontSize:'12px',color: type===opt.id?'rgba(255,255,255,0.8)':'#94a3b8',marginTop:'2px'}}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'24px'}}>
          <label style={{fontSize:'14px',fontWeight:'500',color:'#1a2332',marginBottom:'6px'}}>Your Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="First name is fine"
            style={{backgroundColor:'#fff',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'14px',fontSize:'16px',color:'#1a2332',outline:'none',marginBottom:'12px'}}/>

          <label style={{fontSize:'14px',fontWeight:'500',color:'#1a2332',marginBottom:'6px'}}>Phone Number</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xxx xxxxxx" type="tel"
            style={{backgroundColor:'#fff',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'14px',fontSize:'16px',color:'#1a2332',outline:'none',marginBottom:'12px'}}/>

          <label style={{fontSize:'14px',fontWeight:'500',color:'#1a2332',marginBottom:'6px'}}>Message (optional)</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Anything you'd like us to know before we call..."
            rows={4} style={{backgroundColor:'#fff',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'14px',fontSize:'16px',color:'#1a2332',outline:'none',resize:'none',fontFamily:'inherit',marginBottom:'12px'}}/>

          {/* Urgent toggle */}
          <button onClick={()=>setIsUrgent(!isUrgent)}
            style={{display:'flex',alignItems:'center',gap:'12px',background:'none',border:`1px solid ${isUrgent?'#ef4444':'#e2e8f0'}`,borderRadius:'8px',padding:'12px 16px',cursor:'pointer',backgroundColor: isUrgent?'#fef2f2':'#fff'}}>
            <div style={{width:'20px',height:'20px',borderRadius:'4px',border:`2px solid ${isUrgent?'#ef4444':'#e2e8f0'}`,backgroundColor: isUrgent?'#ef4444':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {isUrgent && <span style={{color:'#fff',fontSize:'12px'}}>✓</span>}
            </div>
            <span style={{fontSize:'14px',color: isUrgent?'#ef4444':'#64748b',fontWeight:'500'}}>This is urgent — I need to speak to someone today</span>
          </button>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!name||!phone||isSubmitting}
          style={{width:'100%',backgroundColor:(!name||!phone)?'#94a3b8':'#22c55e',color:'#fff',border:'none',borderRadius:'12px',padding:'16px',fontSize:'18px',fontWeight:'600',cursor:(!name||!phone)?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'16px'}}>
          {isSubmitting ? 'Sending...' : '📞 Request Callback'}
        </button>

        <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center'}}>
          <span style={{fontSize:'14px'}}>🔒</span>
          <span style={{fontSize:'12px',color:'#94a3b8'}}>Your details are kept strictly confidential and never shared</span>
        </div>
      </div>
    </div>
  );
}
