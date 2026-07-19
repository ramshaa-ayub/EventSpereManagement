import React from 'react';
import { G } from '@utils/theme.js';
import Btn from '@components/Btn';
import Card from '@components/Card';

export default function Discover({ setTab, expos = [], sessions = [], exhibitors = [], stats = {} }) {
  const today = new Date(); today.setHours(0,0,0,0);

  // ── All 4 stats from real DB data ──────────────────────────────
  const upcomingExposCount = expos.filter(e => {
    const d = e.date ? new Date(e.date) : null;
    return e.status === 'upcoming' || (d && d >= today);
  }).length;

  // Total seats registered across all sessions
  const totalSessionReg = sessions.reduce((acc, s) => acc + (s.reg || s.registered || 0), 0);

  // Exhibitor count: from users API (stats prop) OR fallback to exhibitors array length
  const exhibitorsCount = stats.exhibitorCount > 0 ? stats.exhibitorCount : exhibitors.length;

  // Total sessions in the system
  const sessionsCount = sessions.length;

  return (
    <div className="view">
      {/* HERO SECTION */}
      <div style={{position:'relative',minHeight:'calc(100vh - 58px)',display:'flex',alignItems:'flex-end',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80" alt="EventSphere" onError={e=>{e.target.style.display='none'}} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(7,7,15,.15) 0%,rgba(7,7,15,.55) 45%,rgba(7,7,15,.97) 90%)'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(7,7,15,.4) 0%,transparent 60%)'}} />
        <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'rgba(232,65,24,.08)',top:-100,right:-100,filter:'blur(100px)',animation:'float 6s ease-in-out infinite'}} />
        <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(124,58,237,.07)',bottom:100,left:-50,filter:'blur(80px)',animation:'float 8s ease-in-out infinite .5s'}} />
        <div style={{position:'relative',zIndex:2,padding:'40px 32px 52px',width:'100%'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(232,65,24,.1)',border:'1px solid rgba(232,65,24,.28)',borderRadius:50,padding:'5px 14px',fontSize:10,fontWeight:700,color:G.accent,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:18}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:G.accent,animation:'pulse 2s infinite'}} />Live Events — April 2026
          </div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(36px,8vw,80px)',fontWeight:800,lineHeight:1.0,letterSpacing:'-.03em',marginBottom:16,color:'#fff'}}>
            Discover the<br /><span style={{color:G.accent}}>Future</span> of<br />Innovation
          </h1>
          <p style={{fontSize:'clamp(13px,2vw,16px)',color:'rgba(255,255,255,.5)',maxWidth:520,lineHeight:1.65,marginBottom:28}}>
            Explore world-class expos, connect with industry leaders, and register for sessions that shape tomorrow.
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:36}}>
            <Btn size="lg" onClick={()=>setTab('schedule')}>📅 Browse Sessions</Btn>
            <Btn size="lg" variant="secondary" onClick={()=>setTab('exhibitors')}>🔍 Find Exhibitors</Btn>
          </div>
          <div style={{display:'flex',gap:36,paddingTop:24,borderTop:'1px solid rgba(255,255,255,.07)',flexWrap:'wrap'}}>
            {[
              [upcomingExposCount.toString(),           'Upcoming Expos'],
              [totalSessionReg.toString(),              'Seats Registered'],
              [`${exhibitorsCount}`,                    'Exhibitors'],
              [sessionsCount.toString(),                'Total Sessions']
            ].map(([n,l])=>(
              <div key={l}><div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#fff'}}>{n}</div><div style={{fontSize:10,color:'rgba(200,200,230,.4)',textTransform:'uppercase',letterSpacing:'.07em',marginTop:2}}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* EXPOS SECTION */}
      <div style={{padding:'40px 32px 56px'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:G.accent,marginBottom:6}}>All Events</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(22px,4vw,36px)',fontWeight:800,letterSpacing:'-.03em',marginBottom:6,color:G.text,lineHeight:1.1}}>
              Featured <span style={{color:G.accent}}>Expos</span>
            </h2>
            <p style={{fontSize:13,color:G.muted,lineHeight:1.6,maxWidth:480}}>World-class exhibitions — register for sessions, explore exhibitors, and navigate floor plans.</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <div style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${G.border}`,fontSize:11,color:G.muted}}>
              {expos.filter(e=>e.status==='upcoming').length} Upcoming
            </div>
            <div style={{padding:'6px 14px',borderRadius:20,border:`1px solid rgba(16,185,129,.3)`,fontSize:11,color:'#10B981',background:'rgba(16,185,129,.06)'}}>
              {expos.filter(e=>e.status==='completed').length} Completed
            </div>
          </div>
        </div>

        {expos.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px 0',color:G.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>🎪</div>
            <div style={{fontSize:14}}>No expos found.</div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:22}}>
            {expos.map(expo=>{
              const isUpcoming  = expo.status === 'upcoming';
              const isCompleted = expo.status === 'completed';
              const statusBg    = isUpcoming ? 'rgba(232,65,24,.18)' : isCompleted ? 'rgba(16,185,129,.18)' : 'rgba(100,100,130,.18)';
              const statusColor = isUpcoming ? G.accent : isCompleted ? '#10B981' : 'rgba(200,200,230,.5)';
              const statusLabel = isUpcoming ? '● Upcoming' : isCompleted ? '✓ Completed' : `○ ${expo.status}`;
              return (
                <div key={expo.id} style={{
                  background:G.card,border:`1px solid ${G.border}`,borderRadius:18,
                  overflow:'hidden',transition:'transform .25s,border-color .25s,box-shadow .25s',cursor:'pointer',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor=`${G.accent}50`;e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,0,0,.4)`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow='none';}}
                >
                  {/* Image */}
                  <div style={{height:200,position:'relative',overflow:'hidden',background:'#0e0e20'}}>
                    {expo.img ? (
                      <img src={expo.img} alt={expo.title} onError={e=>{e.target.style.display='none'}}
                        style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .5s'}}
                        onMouseEnter={e=>e.target.style.transform='scale(1.07)'}
                        onMouseLeave={e=>e.target.style.transform='scale(1)'}
                      />
                    ) : (
                      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',
                        background:`linear-gradient(135deg,${G.accent}22,${G.accent}05)`}}>
                        <span style={{fontSize:52,opacity:.25}}>🎪</span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 35%,rgba(7,7,15,.92) 100%)'}}/>
                    {/* Status badge */}
                    <div style={{position:'absolute',top:12,left:14,display:'inline-flex',alignItems:'center',gap:5,
                      padding:'4px 12px',borderRadius:50,fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',
                      background:statusBg,color:statusColor,backdropFilter:'blur(8px)',border:`1px solid ${statusColor}30`}}>
                      {statusLabel}
                    </div>
                    {/* Theme tag */}
                    {expo.theme && (
                      <div style={{position:'absolute',top:12,right:14,padding:'4px 10px',borderRadius:50,
                        background:'rgba(0,0,0,.45)',backdropFilter:'blur(8px)',fontSize:9,color:'rgba(255,255,255,.7)',fontWeight:600}}>
                        {expo.theme}
                      </div>
                    )}
                    {/* Title on image */}
                    <div style={{position:'absolute',bottom:14,left:14,right:14}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:'#fff',lineHeight:1.25,textShadow:'0 2px 8px rgba(0,0,0,.6)'}}>
                        {expo.title}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{padding:'16px 18px 18px'}}>
                    {/* Meta row */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 12px',marginBottom:14}}>
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:G.muted}}>
                        <span style={{fontSize:13}}>📅</span>
                        <span>{expo.date || 'TBA'}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:G.muted}}>
                        <span style={{fontSize:13}}>📍</span>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{expo.loc || 'TBA'}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:G.muted}}>
                        <span style={{fontSize:13}}>🏪</span>
                        <span>{expo.booths || 0} booths</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:G.muted}}>
                        <span style={{fontSize:13}}>👥</span>
                        <span>{expo.reg || 0} registered</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{display:'flex',gap:8}}>
                      {isUpcoming && (
                        <Btn size="sm" onClick={()=>setTab('schedule')} style={{flex:1,justifyContent:'center'}}>
                          📋 Register
                        </Btn>
                      )}
                      <Btn size="sm" variant="secondary" onClick={()=>setTab('schedule')} style={{flex:1,justifyContent:'center'}}>
                        📅 Sessions
                      </Btn>
                      <Btn size="sm" variant="secondary" onClick={()=>setTab('floorplan')} style={{padding:'6px 10px'}}>
                        🗺️
                      </Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ABOUT SECTION */}
        <div style={{marginTop:56,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:G.accent,marginBottom:10}}>About EventSphere</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(22px,3vw,30px)',fontWeight:800,letterSpacing:'-.02em',marginBottom:16,color:G.text,lineHeight:1.2}}>Pakistan's Premier <span style={{color:G.accent}}>Expo Platform</span></h2>
            <p style={{fontSize:13,color:G.muted,lineHeight:1.75,marginBottom:14}}>EventSphere connects thousands of innovators, businesses, and thought leaders at world-class expo events across Pakistan.</p>
            <div style={{display:'flex',gap:10}}>
              <Btn size="md" onClick={()=>setTab('exhibitors')}>Explore Exhibitors</Btn>
            </div>
          </div>
          <div style={{position:'relative'}}>
            <img src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=700&q=80" alt="EventSphere" style={{width:'100%',height:320,objectFit:'cover',borderRadius:16,border:`1px solid ${G.border}`}} />
          </div>
        </div>
      </div>
    </div>
  );
}