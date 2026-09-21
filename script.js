const screens=[...document.querySelectorAll(".screen")];
const progress=document.getElementById("progress");
const counter=document.getElementById("counter");
let current=0;

screens.forEach(()=>progress.appendChild(document.createElement("span")));

function buzz(p=10){
  if(navigator.vibrate) navigator.vibrate(p);
}

function showStep(i){
  current=i;
  screens.forEach((s,n)=>s.classList.toggle("active",n===i));
  [...progress.children].forEach((d,n)=>d.classList.toggle("on",n<=i));
  counter.textContent=`${String(i+1).padStart(2,"0")} / ${String(screens.length).padStart(2,"0")}`;

  requestAnimationFrame(()=>{
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    window.scrollTo(0,0);
    setTimeout(()=>window.scrollTo(0,0),20);
  });

  buzz(10);
}

function floatBurst(count=15,chars=["♡","✦","🎀"]){
  const layer=document.getElementById("floatLayer");
  for(let i=0;i<count;i++){
    const el=document.createElement("span");
    el.className="floaty";
    el.textContent=chars[Math.floor(Math.random()*chars.length)];
    el.style.left=`${Math.random()*100}%`;
    el.style.setProperty("--drift",`${-42+Math.random()*84}px`);
    el.style.fontSize=`${13+Math.random()*16}px`;
    el.style.animationDuration=`${3+Math.random()*3.3}s`;
    el.style.animationDelay=`${Math.random()*.6}s`;
    layer.appendChild(el);
    setTimeout(()=>el.remove(),7000);
  }
}

/* =========================================================
   RELIABLE BIRTHDAY AUDIO
   Uses Web Audio instead of delayed HTMLMediaElement autoplay.
   The context is unlocked by a real user tap and the exact
   embedded MP3 is decoded before the candle moment.
   ========================================================= */
let birthdayCtx=null;
let birthdayBuffer=null;
let birthdayLoadPromise=null;
let birthdaySource=null;

function getAudioContext(){
  const A=window.AudioContext||window.webkitAudioContext;
  if(!A) return null;
  if(!birthdayCtx) birthdayCtx=new A();
  return birthdayCtx;
}

async function unlockAndPrepareBirthdayAudio(){
  try{
    const ctx=getAudioContext();
    if(!ctx) return false;

    if(ctx.state==="suspended"){
      await ctx.resume();
    }

    // Tiny silent buffer started from the user's tap keeps the context unlocked.
    const silent=ctx.createBuffer(1,1,ctx.sampleRate);
    const unlockSource=ctx.createBufferSource();
    unlockSource.buffer=silent;
    unlockSource.connect(ctx.destination);
    unlockSource.start(0);

    if(!birthdayLoadPromise){
      const audio=document.getElementById("birthdayAudio");
      if(!audio) return false;

      birthdayLoadPromise=fetch(audio.src)
        .then(r=>{
          if(!r.ok && !audio.src.startsWith("data:")) throw new Error("Birthday audio could not load");
          return r.arrayBuffer();
        })
        .then(ab=>ctx.decodeAudioData(ab.slice(0)))
        .then(buffer=>{
          birthdayBuffer=buffer;
          return true;
        })
        .catch(err=>{
          console.error("Birthday audio decode failed:",err);
          birthdayLoadPromise=null;
          return false;
        });
    }

    return true;
  }catch(err){
    console.error("Birthday audio unlock failed:",err);
    return false;
  }
}

async function playBirthdayAudio(){
  try{
    const ctx=getAudioContext();
    if(!ctx) return false;

    // The blow button already unlocked this context.
    if(ctx.state==="suspended"){
      try{ await ctx.resume(); }catch(e){}
    }

    if(!birthdayBuffer){
      if(!birthdayLoadPromise) await unlockAndPrepareBirthdayAudio();
      if(birthdayLoadPromise) await birthdayLoadPromise;
    }

    if(!birthdayBuffer) return false;

    if(birthdaySource){
      try{ birthdaySource.stop(); }catch(e){}
      birthdaySource=null;
    }

    const source=ctx.createBufferSource();
    const gain=ctx.createGain();

    source.buffer=birthdayBuffer;
    gain.gain.setValueAtTime(0.001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.92,ctx.currentTime+0.65);

    source.connect(gain);
    gain.connect(ctx.destination);

    birthdaySource=source;
    source.onended=()=>{
      if(birthdaySource===source) birthdaySource=null;
    };

    source.start(0);
    return true;
  }catch(err){
    console.error("Birthday audio playback failed:",err);
    return false;
  }
}

function stopBirthdayAudio(){
  if(birthdaySource){
    try{birthdaySource.stop()}catch(e){}
    birthdaySource=null;
  }
}

/* Prepare the MP3 on genuine user taps long before the cake page.
   This does not produce audible sound. */
document.addEventListener("click",()=>{
  unlockAndPrepareBirthdayAudio();
},{once:true,capture:true});

/* navigation */
document.querySelectorAll(".next").forEach(b=>{
  b.addEventListener("click",()=>{
    unlockAndPrepareBirthdayAudio();
    showStep(Math.min(current+1,screens.length-1));
  });
});

/* birthday mode */
const modeSwitch=document.getElementById("modeSwitch");
const modeLabel=document.getElementById("modeLabel");
const offDutyCard=document.getElementById("offDutyCard");
let modeDone=false;

modeSwitch.addEventListener("click",()=>{
  unlockAndPrepareBirthdayAudio();
  if(modeDone)return;
  modeDone=true;
  modeSwitch.classList.add("active");
  modeLabel.textContent="BIRTHDAY MODE";
  offDutyCard.classList.add("show");
  floatBurst(20,["♡","🎀","✦"]);
  buzz([18,30,18]);
  setTimeout(()=>showStep(2),1400);
});

/* prescription stamp */
const stampBtn=document.getElementById("stampBtn");
const stampMark=document.getElementById("stampMark");
const stampHint=document.getElementById("stampHint");
let stamped=false;

stampBtn.addEventListener("click",()=>{
  unlockAndPrepareBirthdayAudio();
  if(stamped)return;
  stamped=true;
  stampBtn.classList.add("stamped");
  stampMark.textContent="APPROVED ♡";
  stampHint.textContent="Officially prescribed for your 26th year.";
  floatBurst(12,["♡","✦"]);
  buzz(20);
  setTimeout(()=>showStep(3),1200);
});

/* blow sound */
function playBlowSound(){
  try{
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return;
    const ctx=new A(),now=ctx.currentTime,d=.82;
    const buf=ctx.createBuffer(1,ctx.sampleRate*d,ctx.sampleRate);
    const arr=buf.getChannelData(0);

    for(let i=0;i<arr.length;i++){
      const t=i/arr.length;
      arr[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)*(1-t*.28);
    }

    const src=ctx.createBufferSource();
    src.buffer=buf;

    const fil=ctx.createBiquadFilter();
    fil.type="bandpass";
    fil.frequency.setValueAtTime(1000,now);
    fil.frequency.exponentialRampToValueAtTime(360,now+d);

    const g=ctx.createGain();
    g.gain.setValueAtTime(.0001,now);
    g.gain.exponentialRampToValueAtTime(.18,now+.07);
    g.gain.exponentialRampToValueAtTime(.0001,now+d);

    src.connect(fil);
    fil.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now+d);

    setTimeout(()=>{
      if(ctx.state!=="closed")ctx.close();
    },1500);
  }catch(e){}
}

/* candles */
const blowBtn=document.getElementById("blowBtn");
const tapFallbackBtn=document.getElementById("tapFallbackBtn");
const cake=document.querySelector(".luxury-cake");
const candleHint=document.getElementById("candleHint");

let blown=false;
let micStream=null;
let micCtx=null;
let micFrame=null;

function cleanupMic(){
  try{
    if(micFrame)cancelAnimationFrame(micFrame);
    micFrame=null;

    if(micCtx&&micCtx.state!=="closed")micCtx.close();
    micCtx=null;

    if(micStream){
      micStream.getTracks().forEach(t=>t.stop());
      micStream=null;
    }
  }catch(e){}
}

function extinguish(){
  if(blown)return;
  blown=true;

  cleanupMic();
  playBlowSound();

  // Start the exact birthday song.
  playBirthdayAudio();

  cake.classList.add("out");
  candleHint.textContent="Wish sent ♡";
  blowBtn.textContent="Candles out ✨";
  blowBtn.style.opacity=".7";
  tapFallbackBtn.disabled=true;
  tapFallbackBtn.style.opacity=".4";

  floatBurst(34,["♡","✦","🎀","✨"]);
  confetti();
  buzz([30,20,40]);

  setTimeout(()=>showStep(5),1450);
}

async function startBreath(){
  if(blown)return;

  // Critical: unlock Web Audio directly from THIS button tap,
  // before waiting for microphone permission.
  await unlockAndPrepareBirthdayAudio();

  candleHint.textContent="Blow into your phone now 💨";

  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    candleHint.textContent="Mic unavailable — tap instead ♡";
    return;
  }

  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});

    const A=window.AudioContext||window.webkitAudioContext;
    micCtx=new A();

    const source=micCtx.createMediaStreamSource(micStream);
    const analyser=micCtx.createAnalyser();
    analyser.fftSize=1024;
    source.connect(analyser);

    const timeData=new Uint8Array(analyser.fftSize);

    let samples=[];
    let calibrating=true;
    let baseline=.02;
    let strongMs=0;
    let last=performance.now();
    const calibrationEnd=performance.now()+500;

    function loop(now){
      analyser.getByteTimeDomainData(timeData);

      let sum=0;
      for(let i=0;i<timeData.length;i++){
        const x=(timeData[i]-128)/128;
        sum+=x*x;
      }

      const rms=Math.sqrt(sum/timeData.length);

      if(calibrating){
        samples.push(rms);

        if(now>=calibrationEnd){
          baseline=samples.reduce((a,b)=>a+b,0)/Math.max(1,samples.length);
          calibrating=false;
          candleHint.textContent="Now blow gently toward the microphone 💨";
        }
      }else{
        const dt=Math.min(50,now-last);
        const threshold=Math.max(.075,baseline+.055);

        strongMs=rms>threshold
          ? strongMs+dt
          : Math.max(0,strongMs-dt*1.6);

        if(strongMs>210){
          extinguish();
          return;
        }
      }

      last=now;
      micFrame=requestAnimationFrame(loop);
    }

    micFrame=requestAnimationFrame(loop);
  }catch(e){
    candleHint.textContent="Mic blocked — tap instead ♡";
  }
}

blowBtn.addEventListener("click",startBreath);

tapFallbackBtn.addEventListener("click",async()=>{
  await unlockAndPrepareBirthdayAudio();
  extinguish();
});

/* final */
const secretBtn=document.getElementById("secretBtn");
const secretText=document.getElementById("secretText");

secretBtn.addEventListener("click",()=>{
  secretText.classList.toggle("show");
  floatBurst(12,["♡","✦"]);
});

document.getElementById("hugBtn").addEventListener("click",()=>{
  floatBurst(36,["♡","♥","🎀","✦"]);
});

document.getElementById("replayBtn").addEventListener("click",()=>{
  cleanupMic();
  stopBirthdayAudio();

  modeDone=false;
  modeSwitch.classList.remove("active");
  modeLabel.textContent="ON DUTY";
  offDutyCard.classList.remove("show");

  stamped=false;
  stampBtn.classList.remove("stamped");
  stampMark.textContent="APPROVE ♡";
  stampHint.textContent="Tap the seal to make it official.";

  blown=false;
  cake.classList.remove("out");
  candleHint.textContent="Make your wish first ♡";
  blowBtn.textContent="Blow out the candles 💨";
  blowBtn.style.opacity="1";
  tapFallbackBtn.disabled=false;
  tapFallbackBtn.style.opacity="1";

  secretText.classList.remove("show");

  showStep(0);
});

function confetti(){
  const c=document.getElementById("confetti");
  const x=c.getContext("2d");

  c.width=innerWidth;
  c.height=innerHeight;

  const p=Array.from({length:130},()=>({
    x:Math.random()*c.width,
    y:-20-Math.random()*c.height*.45,
    vx:-1.1+Math.random()*2.2,
    vy:2.5+Math.random()*4,
    w:4+Math.random()*5,
    h:7+Math.random()*8,
    r:Math.random()*6.28,
    vr:-.12+Math.random()*.24,
    a:1,
    h:[330,345,285,45][Math.floor(Math.random()*4)]
  }));

  let f=0;

  function draw(){
    x.clearRect(0,0,c.width,c.height);

    p.forEach(q=>{
      q.x+=q.vx;
      q.y+=q.vy;
      q.r+=q.vr;

      if(f>135)q.a-=.012;

      x.save();
      x.translate(q.x,q.y);
      x.rotate(q.r);
      x.globalAlpha=Math.max(0,q.a);
      x.fillStyle=`hsl(${q.h} 85% 76%)`;
      x.fillRect(-q.w/2,-q.h/2,q.w,q.h);
      x.restore();
    });

    f++;
    if(f<220)requestAnimationFrame(draw);
  }

  draw();
}

window.addEventListener("resize",()=>{
  const c=document.getElementById("confetti");
  c.width=innerWidth;
  c.height=innerHeight;
});

/* Mobile touch-scroll fallback — installed once, globally. */
(function installMobileScrollFallback(){
  let startY=0;
  let lastY=0;
  let startScrollY=0;
  let moved=false;

  document.addEventListener("touchstart",function(e){
    if(!e.touches||e.touches.length!==1)return;

    const t=e.touches[0];
    startY=t.clientY;
    lastY=t.clientY;
    startScrollY=window.scrollY||document.documentElement.scrollTop||0;
    moved=false;
  },{passive:true});

  document.addEventListener("touchmove",function(e){
    if(!e.touches||e.touches.length!==1)return;

    const target=e.target;
    if(target&&target.closest&&target.closest("button"))return;

    const y=e.touches[0].clientY;
    const delta=lastY-y;

    if(Math.abs(y-startY)>6)moved=true;

    const currentScroll=window.scrollY||document.documentElement.scrollTop||0;

    if(moved&&Math.abs(currentScroll-startScrollY)<2&&Math.abs(delta)>1){
      window.scrollBy(0,delta);
    }

    lastY=y;
  },{passive:true});
})();

showStep(0);
