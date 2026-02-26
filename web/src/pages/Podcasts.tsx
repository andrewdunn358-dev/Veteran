import React from 'react';
import { useNavigate } from 'react-router-dom';

const PODCASTS = [
  {
    id: 'frankies-pod',
    name: "Frankie's Pod: Uncorking the Unforgettable",
    host: 'Frankie Dunn',
    description: 'Raw stories from British military veterans covering PTSD, resilience, and recovery after service.',
    focus: ['PTSD', 'Recovery', 'Veteran Stories'],
    logo: '/frankies-pod.png',
    spotifyUrl: 'https://open.spotify.com/show/7wrcVZ8zdtX5urzIvZSaUJ',
    appleUrl: 'https://podcasts.apple.com/us/podcast/frankies-pod-uncorking-the-unforgettable/id1729850191',
    youtubeUrl: 'https://www.youtube.com/@FrankiesPod',
  },
  {
    id: 'tom-petch',
    name: 'Speed. Aggression. Surprise.',
    host: 'Tom Petch',
    description: 'Raw, candid conversations with military figures including SAS veterans and commanders.',
    focus: ['Military History', 'Leadership', 'Personal Stories'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/55/e1/a4/55e1a412-6002-3594-3e01-3e9df23244dc/mza_2886434919509823568.jpg/600x600bb.jpg',
    spotifyUrl: 'https://open.spotify.com/show/0nqV8qef8CmvjurAPtV0qj',
    appleUrl: 'https://podcasts.apple.com/us/podcast/speed-aggression-surprise-the-untold-truth-behind/id1846864165',
    youtubeUrl: 'https://www.youtube.com/@speedaggressionsurprise',
  },
  {
    id: 'old-paratrooper',
    name: 'The Old Paratrooper Podcast',
    host: 'Chris Binch (ex-2 PARA)',
    description: 'Interviews with British Paras, SAS veterans, and special forces personnel on combat and mental health.',
    focus: ['Parachute Regiment', 'Special Forces', 'Combat Stories'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/16/8a/d9/168ad914-db3f-70f8-8e1f-481b80e14183/mza_3119811594421415273.jpg/600x600bb.jpg',
    spotifyUrl: 'https://open.spotify.com/show/4jm3x1EoBBcPqQUXTwD1xc',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-old-paratrooper-podcast/id1859991469',
    youtubeUrl: 'https://www.youtube.com/@TheOldParatrooperpodcast',
  },
  {
    id: 'beyond-barracks',
    name: 'Beyond the Barracks',
    host: 'RSL Victoria / Gina Allsop',
    description: 'Unfiltered stories from veterans covering transitions to civilian life, resilience, and recovery.',
    focus: ['Transition', 'Recovery', 'Family Support'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/71/da/c3/71dac30b-6a59-30a7-d5d3-878fa678afc8/mza_11916087358722418837.png/600x600bb.jpg',
    spotifyUrl: 'https://open.spotify.com/show/4MwejGmTY5CdDT8zsRkUTQ',
    youtubeUrl: 'https://www.youtube.com/channel/UCh_L_4t746PldKRfIKvj-0w',
  },
  {
    id: 'combat-stress-100',
    name: 'Combat Stress 100 Podcast',
    host: 'Combat Stress Charity',
    description: 'Clinical expertise combined with veteran testimonies on PTSD, depression, and substance misuse.',
    focus: ['PTSD', 'Depression', 'Clinical Support'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/85/7b/90/857b90f2-c285-191f-c296-4cff7e8bd158/mza_11603060415803986663.jpg/600x600bb.jpg',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-combat-stress-100-podcast/id1534726321',
    websiteUrl: 'https://combatstress.org.uk/combat-stress-100-podcast',
  },
];

const focusColors: Record<string, string> = {
  'PTSD': '#fce7f3',
  'Recovery': '#dcfce7',
  'Veteran Stories': '#dbeafe',
  'Military History': '#e0e7ff',
  'Leadership': '#fef3c7',
  'Personal Stories': '#f3e8ff',
  'Transition': '#d1fae5',
  'Family Support': '#ede9fe',
  'Depression': '#fef9c3',
  'Clinical Support': '#e0f2fe',
  'Parachute Regiment': '#fee2e2',
  'Special Forces': '#fef3c7',
  'Combat Stories': '#fce7f3',
};

export default function Podcasts() {
  const navigate = useNavigate();

  return (
    <div style={{minHeight:'100vh',backgroundColor:'#f8fafc',color:'#1a2332'}}>
      {/* Header */}
      <div style={{backgroundColor:'#fff',padding:'16px 20px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #e2e8f0',position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>navigate('/home',{replace:true})} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#64748b'}}>←</button>
        <h1 style={{margin:0,fontSize:'20px',fontWeight:'700'}}>Recommended Podcasts</h1>
      </div>

      <div style={{maxWidth:'600px',margin:'0 auto',padding:'20px 16px'}}>
        <p style={{color:'#64748b',fontSize:'14px',lineHeight:'1.6',marginBottom:'24px',textAlign:'center'}}>
          Veteran stories, mental health support and military life — curated podcasts from those who've been there.
        </p>

        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {PODCASTS.map(podcast => (
            <div key={podcast.id} style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden'}}>
              {/* Podcast header */}
              <div style={{padding:'16px',display:'flex',gap:'14px',alignItems:'flex-start'}}>
                <img src={podcast.logo} alt={podcast.name}
                  style={{width:'72px',height:'72px',borderRadius:'12px',objectFit:'cover',flexShrink:0,border:'1px solid #e2e8f0'}}
                  onError={e=>{(e.target as HTMLImageElement).src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎧</text></svg>'}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700',fontSize:'15px',color:'#1a2332',marginBottom:'2px',lineHeight:'1.4'}}>{podcast.name}</div>
                  <div style={{fontSize:'13px',color:'#3b82f6',fontWeight:'500',marginBottom:'6px'}}>🎙️ {podcast.host}</div>
                  <p style={{fontSize:'13px',color:'#64748b',lineHeight:'1.5',margin:'0 0 10px'}}>{podcast.description}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {podcast.focus.map(tag => (
                      <span key={tag} style={{backgroundColor: focusColors[tag]||'#f1f5f9',color:'#475569',fontSize:'11px',fontWeight:'500',padding:'3px 8px',borderRadius:'20px'}}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Listen links */}
              <div style={{borderTop:'1px solid #f1f5f9',padding:'12px 16px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {podcast.spotifyUrl && (
                  <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:'#1db954',color:'#fff',borderRadius:'20px',padding:'7px 14px',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>
                    🎵 Spotify
                  </a>
                )}
                {podcast.appleUrl && (
                  <a href={podcast.appleUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:'#fc3c44',color:'#fff',borderRadius:'20px',padding:'7px 14px',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>
                    🍎 Apple
                  </a>
                )}
                {podcast.youtubeUrl && (
                  <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:'#ff0000',color:'#fff',borderRadius:'20px',padding:'7px 14px',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>
                    ▶️ YouTube
                  </a>
                )}
                {podcast.websiteUrl && (
                  <a href={podcast.websiteUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:'6px',backgroundColor:'#f1f5f9',color:'#475569',borderRadius:'20px',padding:'7px 14px',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:'24px',paddingBottom:'24px'}}>
          <p style={{color:'#94a3b8',fontSize:'13px'}}>Know a great veteran podcast? Let us know 🎧</p>
        </div>
      </div>
    </div>
  );
}
