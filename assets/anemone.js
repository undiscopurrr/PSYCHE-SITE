/* The anemone beside the wordmark: one flower, drawn from a few numbers and colours,
   drifting from one coronaria to the next so slowly that the change is felt, not seen. */
(function(){
  var mark=document.querySelector("header.site .bar a.mark");
  if(!mark||document.querySelector(".anemone"))return;
  var NS="http://www.w3.org/2000/svg";
  var css=document.createElement("style");
  css.textContent=".anemone{display:block;width:34px;height:34px;flex:none;align-self:center;margin:-6px -13px -6px 0;pointer-events:none}"+
    ".anemone svg{display:block;width:100%;height:100%;overflow:visible}"+
    "@media (max-width:1120px){.anemone{width:30px;height:30px;margin-right:-15px}}";
  document.head.appendChild(css);

  /* the flowers it passes through: petals, their shape, the ring at the base, the eye, the facing */
  var LOOKS=[
    {n:7,L:44,W:.42,sh:.72,tc:1.03,tip:"#F6F2EE",mid:"#F1E4E7",ring:"#D81E5B",rw:.30,eye:"#1A0F1C",st:"#2A1430",hi:"#5A2040",rc:9.5,th:10,ph:0,sy:1},
    {n:7,L:45,W:.40,sh:.70,tc:1.04,tip:"#F3F1F6",mid:"#E6E1F1",ring:"#6E4FC9",rw:.36,eye:"#1B1740",st:"#2F2A78",hi:"#8F86D8",rc:10,th:-25,ph:30,sy:.90},
    {n:8,L:42,W:.36,sh:.66,tc:1.05,tip:"#EEE6F2",mid:"#D9A9D6",ring:"#8E3F9A",rw:.42,eye:"#3A2A4A",st:"#4A2F5A",hi:"#C97AB8",rc:9,th:60,ph:-20,sy:.93},
    {n:7,L:44,W:.41,sh:.72,tc:1.02,tip:"#F7F3F0",mid:"#F2DEE6",ring:"#C8175A",rw:.30,eye:"#1C1022",st:"#2B1536",hi:"#7A2B5A",rc:10,th:-10,ph:15,sy:.96},
    {n:6,L:46,W:.45,sh:.76,tc:1.01,tip:"#E8231F",mid:"#F0302A",ring:"#F7E9EA",rw:.28,eye:"#140A12",st:"#241026",hi:"#7A1F3C",rc:9.5,th:35,ph:-40,sy:1},
    {n:6,L:44,W:.44,sh:.74,tc:1.00,tip:"#D9261E",mid:"#E33A2E",ring:"#F6EDEE",rw:.25,eye:"#15101A",st:"#1E1430",hi:"#6E2B4A",rc:9,th:-50,ph:50,sy:.84}
  ];
  var HOLD=30000,TRANS=90000,SEG=HOLD+TRANS,PERIOD=SEG*LOOKS.length;
  var SLOTS=8,JA=[1.5,-2.5,3,-1,2,-3,1,-2],JL=[1,.97,1.03,.98,1.02,.96,1.01,.99];

  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e}
  function f(x){return Math.round(x*100)/100}
  function hex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
  function mixc(a,b,p){var A=hex(a),B=hex(b);return "rgb("+Math.round(A[0]+(B[0]-A[0])*p)+","+Math.round(A[1]+(B[1]-A[1])*p)+","+Math.round(A[2]+(B[2]-A[2])*p)+")"}
  function mix(a,b,p){return a+(b-a)*p}
  function smooth(u){return u<=0?0:u>=1?1:u*u*(3-2*u)}
  function petal(L,W,sh,tc){
    var w=W*L;
    return "M0 0C"+f(w*.5)+" "+f(-L*.08)+" "+f(w)+" "+f(-L*.42)+" "+f(w*sh)+" "+f(-L*.8)+
      "C"+f(w*.45)+" "+f(-L*tc)+" "+f(-w*.45)+" "+f(-L*tc)+" "+f(-w*sh)+" "+f(-L*.8)+
      "C"+f(-w)+" "+f(-L*.42)+" "+f(-w*.5)+" "+f(-L*.08)+" 0 0Z";
  }

  var box=document.createElement("span");box.className="anemone";box.setAttribute("aria-hidden","true");
  var svg=el("svg",{viewBox:"-50 -50 100 100"});
  var defs=el("defs",{}),grad=el("radialGradient",{id:"anemoneGrad",gradientUnits:"userSpaceOnUse",cx:0,cy:0,r:46});
  var stops=[0,.3,.5,1].map(function(o){var s=el("stop",{offset:o});grad.appendChild(s);return s});
  defs.appendChild(grad);svg.appendChild(defs);
  var flower=el("g",{}),petals=el("g",{}),slots=[];
  for(var k=SLOTS-1;k>=0;k--){var p=el("path",{fill:"url(#anemoneGrad)",stroke:"rgba(0,0,0,.22)","stroke-width":.8});petals.appendChild(p);slots[k]=p}
  var eye=el("circle",{cx:0,cy:0,r:10}),fil=el("g",{}),sta=el("g",{});
  for(k=0;k<18;k++){var a=k/18*Math.PI*2;fil.appendChild(el("circle",{cx:f(Math.cos(a)*10.5),cy:f(Math.sin(a)*10.5),r:1.25}))}
  for(k=0;k<26;k++){a=k/26*Math.PI*2+.1;sta.appendChild(el("circle",{cx:f(Math.cos(a)*13.5),cy:f(Math.sin(a)*13.5),r:1.6}))}
  flower.appendChild(petals);flower.appendChild(fil);flower.appendChild(eye);flower.appendChild(sta);
  svg.appendChild(flower);box.appendChild(svg);
  mark.insertAdjacentElement("beforebegin",box);

  function state(ms){
    var t=((ms%PERIOD)+PERIOD)%PERIOD,i=Math.floor(t/SEG),A=LOOKS[i],B=LOOKS[(i+1)%LOOKS.length],p=smooth((t-i*SEG-HOLD)/TRANS),s={};
    ["L","W","sh","tc","rw","rc","th","ph","sy"].forEach(function(k){s[k]=mix(A[k],B[k],p)});
    ["tip","mid","ring","eye","st","hi"].forEach(function(k){s[k]=mixc(A[k],B[k],p)});
    s.ang=[];s.pr=[];
    for(var k=0;k<SLOTS;k++){
      var aA=k<A.n?k*360/A.n:k*360/SLOTS,aB=k<B.n?k*360/B.n:k*360/SLOTS;
      s.ang.push(mix(aA,aB,p));s.pr.push(mix(k<A.n?1:0,k<B.n?1:0,p));
    }
    return s;
  }
  function draw(s){
    var d=petal(s.L,s.W,s.sh,s.tc);
    for(var k=0;k<SLOTS;k++){
      var sc=s.pr[k]*JL[k];
      slots[k].setAttribute("d",d);
      slots[k].setAttribute("transform","rotate("+f(s.ang[k]+JA[k])+") scale("+f(sc)+")");
      slots[k].style.display=s.pr[k]<.01?"none":"";
    }
    grad.setAttribute("r",f(s.L*1.02));
    var o=[0,s.rw,Math.min(.92,s.rw+.2),1],c=[s.ring,s.ring,s.mid,s.tip];
    for(k=0;k<4;k++){stops[k].setAttribute("offset",f(o[k]));stops[k].setAttribute("stop-color",c[k])}
    eye.setAttribute("r",f(s.rc));eye.setAttribute("fill",s.eye);
    fil.setAttribute("fill",s.hi);fil.setAttribute("transform","scale("+f(s.rc/10)+")");
    sta.setAttribute("fill",s.st);sta.setAttribute("transform","scale("+f(s.rc/10)+")");
    flower.setAttribute("transform","rotate("+f(s.ph)+") scale(1 "+f(s.sy)+") rotate("+f(s.th-s.ph)+")");
  }
  var calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,held=false;
  draw(state(calm?0:Date.now()));
  if(!calm){
    var tick=function(){if(!document.hidden&&!held)draw(state(Date.now()))};
    setInterval(tick,120);
    document.addEventListener("visibilitychange",tick);
  }
  window.__anemone={at:function(ms){held=true;draw(state(ms))},live:function(){held=false},period:PERIOD,seg:SEG,hold:HOLD};
})();
