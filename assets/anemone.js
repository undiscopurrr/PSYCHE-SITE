/* The anemone beside the wordmark: six photographed Anemone coronaria, cut out and centred on
   their eyes, each held for a while and then warped and dissolved into the next so slowly that
   the change is felt rather than seen. Pixels come from the photographs alone. */
(function(){
  var mark=document.querySelector("header.site .bar a.mark");
  if(!mark||document.querySelector(".anemone"))return;
  var M={"size":256,"na":72,"looks":[{"name":"a_white_crimson","er":34.2,"prof":[83.4,91.8,97.2,102.1,105.9,108.3,111.4,111.2,110.6,108.7,105.2,100.9,94.9,101.5,110.4,112.9,112.0,110.2,103.6,99.9,95.7,87.5,79.4,86.2,95.9,101.9,107.3,107.3,101.7,96.6,91.4,85.8,78.4,84.8,90.8,95.9,100.5,104.2,107.1,108.7,108.3,107.3,105.2,100.9,102.1,107.1,108.9,110.0,106.9,103.0,98.8,90.2,96.6,101.5,104.6,105.6,107.7,106.9,106.5,104.0,100.7,96.4,87.9,91.2,95.3,97.2,98.6,97.8,95.3,94.3,89.6,84.0]},{"name":"i_white_red_top","er":40.2,"prof":[115.5,108.4,98.2,95.1,92.7,101.3,106.1,103.7,97.4,91.1,87.2,86.4,87.2,91.9,91.9,91.1,94.3,94.3,95.8,99.0,102.1,102.1,103.7,104.5,101.3,101.3,102.9,104.5,106.8,101.3,98.2,100.6,96.6,95.8,95.8,92.7,88.0,92.7,97.4,102.1,106.8,110.8,112.3,114.7,111.6,103.7,95.8,87.2,79.3,85.6,92.7,102.1,102.9,103.7,101.3,100.6,102.9,102.1,101.3,98.2,93.5,87.2,93.5,101.3,106.8,113.9,117.1,113.9,110.0,108.4,107.6,111.6]},{"name":"g_white_red_big","er":42.58,"prof":[98.0,102.5,99.5,94.2,91.1,94.2,98.7,102.5,110.1,112.4,113.2,109.4,103.3,100.3,100.3,97.2,95.7,94.2,91.1,92.7,95.7,91.1,90.4,93.4,94.9,96.5,98.7,102.5,104.1,103.3,104.1,102.5,103.3,107.1,112.4,116.2,117.0,116.2,114.7,113.2,111.7,107.9,105.6,83.6,89.6,92.7,92.7,93.4,94.9,98.0,98.7,98.7,99.5,103.3,98.0,94.2,94.9,95.7,96.5,94.9,95.7,96.5,100.3,104.1,101.8,98.7,93.4,96.5,98.0,98.0,98.0,96.5]},{"name":"h_red_white_edge","er":45.52,"prof":[91.3,90.0,88.7,87.4,87.4,84.9,84.9,83.6,86.2,86.2,91.3,93.9,99.0,106.7,115.7,118.3,108.0,104.2,104.2,104.2,105.4,105.4,108.0,109.3,110.6,111.9,105.4,102.9,101.6,100.3,100.3,99.0,97.7,95.2,96.4,95.2,93.9,95.2,96.4,97.7,95.2,92.6,93.9,93.9,93.9,93.9,95.2,97.7,96.4,96.4,97.7,99.0,101.6,104.2,115.7,117.0,113.2,106.7,99.0,102.9,104.2,104.2,102.9,105.4,102.9,104.2,104.2,115.7,109.3,102.9,99.0,95.2]},{"name":"d_scarlet","er":26.21,"prof":[108.0,111.7,113.1,115.3,118.4,122.9,100.7,92.6,80.0,70.4,70.7,71.0,71.8,72.4,73.8,73.5,76.6,80.8,85.0,88.6,92.0,95.1,98.2,101.3,103.5,105.2,105.2,103.8,100.4,97.3,90.9,92.6,97.3,101.8,105.5,108.3,110.5,111.1,111.7,113.9,113.3,110.8,107.7,100.7,89.8,92.3,97.1,100.2,101.6,102.7,102.7,102.1,99.6,96.2,95.9,105.2,112.8,117.8,117.5,114.5,109.4,103.2,97.3,103.8,111.7,116.7,115.6,113.6,107.7,101.3,94.8,101.6]},{"name":"e_red_tilted","er":29.0,"prof":[102.9,115.4,122.6,124.7,118.7,113.7,109.7,106.2,93.3,92.9,93.3,92.6,91.5,91.5,86.9,72.6,65.4,64.7,72.2,86.9,93.6,99.0,105.1,109.7,116.5,114.4,109.4,105.1,102.6,74.0,80.8,86.5,92.2,96.1,100.1,104.7,108.3,111.9,115.8,112.6,95.8,98.3,102.9,109.0,111.9,114.7,113.3,110.4,106.2,101.5,93.3,86.9,90.4,92.9,89.7,81.9,75.8,95.1,102.2,106.2,110.1,112.9,116.2,117.2,115.4,114.0,111.2,107.2,100.1,82.6,85.4,93.3]},{"name":"c_lilac","er":34.71,"prof":[110.2,105.7,102.2,103.2,102.9,101.7,99.4,98.9,97.6,95.9,94.4,91.6,89.9,87.4,86.6,84.1,84.1,80.6,80.8,82.1,83.1,83.1,84.3,86.9,90.4,94.9,100.2,104.4,111.0,117.0,119.0,121.2,123.5,123.3,107.7,95.1,101.4,104.4,102.9,97.1,99.9,100.7,99.7,103.7,106.2,100.9,100.9,95.9,90.6,93.4,95.6,95.9,95.6,90.6,94.1,95.6,89.6,88.1,88.4,90.1,91.9,94.1,99.7,115.5,117.0,115.0,111.2,120.7,126.8,125.0,122.0,115.7]},{"name":"b_white_violet","er":29.88,"prof":[101.2,112.5,109.1,108.3,106.6,104.3,103.2,100.4,95.6,89.4,96.2,99.0,99.0,99.0,98.4,98.7,99.0,97.3,95.3,93.3,93.9,93.3,92.5,91.4,90.2,88.5,86.9,84.6,66.6,68.8,70.2,82.9,88.8,95.0,101.8,110.3,113.9,116.5,116.2,115.6,116.5,117.6,116.5,112.8,110.3,100.4,104.3,109.1,111.7,112.5,110.3,108.3,104.6,104.1,105.2,105.7,105.2,104.3,102.9,102.4,100.7,98.1,95.3,91.4,94.8,99.0,102.1,98.1,91.1,90.2,97.9,102.9]}],"rot":[-45.0,45.0,-45.0,45.0,5.0,25.0,40.0,15.0]};
  var LOOKS=M.looks,NA=M.na,S=M.size,ROT=M.rot,N=LOOKS.length;
  var HOLD=30000,TRANS=90000,SEG=HOLD+TRANS,PERIOD=SEG*N;
  var css=document.createElement("style");
  css.textContent=".anemone{display:block;width:40px;height:40px;flex:none;align-self:center;margin:-9px -14px -9px -4px;pointer-events:none}"+
    "@media (max-width:1120px){.anemone{width:36px;height:36px;margin:-8px -16px -8px -3px}}";
  document.head.appendChild(css);
  var dpr=Math.min(3,window.devicePixelRatio||1),OUT=Math.round(40*dpr*1.25);
  var cv=document.createElement("canvas");cv.className="anemone";cv.setAttribute("aria-hidden","true");cv.width=OUT;cv.height=OUT;
  var ctx=cv.getContext("2d",{willReadFrequently:false}),out=ctx.createImageData(OUT,OUT),od=out.data;
  mark.insertAdjacentElement("beforebegin",cv);

  /* the photographs */
  var px=[],loaded=0,base=(function(){var s=document.querySelector('script[src*="anemone.js"]');var u=s?s.getAttribute("src"):"assets/anemone.js";return u.replace(/anemone\.js.*$/,"anemone/")})();
  LOOKS.forEach(function(L,i){
    var im=new Image();im.onload=function(){
      var c=document.createElement("canvas");c.width=S;c.height=S;var g=c.getContext("2d");g.drawImage(im,0,0,S,S);
      var d=g.getImageData(0,0,S,S).data,f=new Float32Array(S*S*4);
      for(var k=0;k<S*S;k++){var a=d[k*4+3]/255;f[k*4]=d[k*4]*a;f[k*4+1]=d[k*4+1]*a;f[k*4+2]=d[k*4+2]*a;f[k*4+3]=a}
      px[i]=f;loaded++;if(loaded===N)start();
    };
    im.src=base+L.name+".webp";
  });

  function prof(L,ang){var u=ang/(2*Math.PI)*NA;u=((u%NA)+NA)%NA;var i=Math.floor(u),t=u-i,p=L.prof;return p[i]*(1-t)+p[(i+1)%NA]*t}
  function sample(f,x,y,o){ /* bilinear, premultiplied, outside = clear */
    if(x<0||y<0||x>=S-1||y>=S-1){o[0]=o[1]=o[2]=o[3]=0;return}
    var x0=Math.floor(x),y0=Math.floor(y),tx=x-x0,ty=y-y0,i00=(y0*S+x0)*4,i10=i00+4,i01=i00+S*4,i11=i01+4;
    for(var c=0;c<4;c++){o[c]=(f[i00+c]*(1-tx)+f[i10+c]*tx)*(1-ty)+(f[i01+c]*(1-tx)+f[i11+c]*tx)*ty}
  }
  var sa=[0,0,0,0],sb=[0,0,0,0];
  function render(ms){
    var t=((ms%PERIOD)+PERIOD)%PERIOD,i=Math.floor(t/SEG),u=(t-i*SEG-HOLD)/TRANS;u=u<=0?0:u>=1?1:u*u*(3-2*u);
    var A=LOOKS[i],B=LOOKS[(i+1)%N],fa=px[i],fb=px[(i+1)%N],rot=ROT[i]*Math.PI/180;
    var eA=A.er,eB=B.er,eT=eA+(eB-eA)*u,half=OUT/2,K=118/half,c=S/2;
    for(var y=0;y<OUT;y++)for(var x=0;x<OUT;x++){
      var dx=(x+.5-half)*K,dy=(y+.5-half)*K,r=Math.sqrt(dx*dx+dy*dy),ph=Math.atan2(dy,dx);
      var phA=ph-u*rot,phB=ph+(1-u)*rot,RA=prof(A,phA),RB=prof(B,phB),RT=RA+(RB-RA)*u,o=(y*OUT+x)*4;
      if(r>RT+3){od[o]=od[o+1]=od[o+2]=od[o+3]=0;continue}
      var rA,rB;
      if(r<eT){rA=r*eA/eT;rB=r*eB/eT}else{var q=(r-eT)/Math.max(1,RT-eT);rA=eA+q*(RA-eA);rB=eB+q*(RB-eB)}
      if(u<=0){sample(fa,c+rA*Math.cos(phA),c+rA*Math.sin(phA),sa);sb[0]=sb[1]=sb[2]=sb[3]=0}
      else if(u>=1){sample(fb,c+rB*Math.cos(phB),c+rB*Math.sin(phB),sb);sa[0]=sa[1]=sa[2]=sa[3]=0}
      else{sample(fa,c+rA*Math.cos(phA),c+rA*Math.sin(phA),sa);sample(fb,c+rB*Math.cos(phB),c+rB*Math.sin(phB),sb)}
      var al=sa[3]*(1-u)+sb[3]*u;
      if(al<=.002){od[o]=od[o+1]=od[o+2]=od[o+3]=0;continue}
      od[o]=Math.round((sa[0]*(1-u)+sb[0]*u)/al);od[o+1]=Math.round((sa[1]*(1-u)+sb[1]*u)/al);od[o+2]=Math.round((sa[2]*(1-u)+sb[2]*u)/al);od[o+3]=Math.round(al*255);
    }
    ctx.putImageData(out,0,0);
  }
  var calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,held=false;
  function start(){
    render(calm?0:Date.now());
    if(!calm){var tick=function(){if(!document.hidden&&!held)render(Date.now())};setInterval(tick,100);document.addEventListener("visibilitychange",tick)}
  }
  window.__anemone={at:function(ms){held=true;if(loaded===N)render(ms)},live:function(){held=false},period:PERIOD,seg:SEG,hold:HOLD,ready:function(){return loaded===N}};
})();
