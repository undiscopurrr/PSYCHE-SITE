/* The anemone beside the wordmark: six photographed Anemone coronaria, cut out and centred on
   their eyes, each held for a while and then warped and dissolved into the next so slowly that
   the change is felt rather than seen. Pixels come from the photographs alone. */
(function(){
  var mark=document.querySelector("header.site .bar a.mark");
  if(!mark||document.querySelector(".anemone"))return;
  var M={"size":256,"na":72,"looks":[{"name":"R_L","er":29.17,"prof":[129.3,128.7,126.6,121.4,105.3,107.1,106.5,105.3,103.8,100.8,96.2,92.9,91.3,88.6,84.1,77.4,72.2,64.0,58.9,54.3,51.9,53.4,57.7,61.6,66.8,70.4,72.2,74.0,75.6,77.7,82.8,92.3,101.7,110.2,114.4,117.1,122.3,124.4,122.9,113.8,98.3,104.7,116.5,121.1,117.7,114.7,112.9,109.3,100.5,97.4,98.3,98.9,98.3,97.1,96.8,98.9,102.0,103.2,101.7,102.0,109.6,115.9,119.3,120.5,123.8,123.2,118.7,111.4,109.9,123.2,127.8,128.7]},{"name":"R_F","er":30.95,"prof":[105.9,99.9,99.1,101.5,102.7,102.5,102.0,99.4,95.0,91.1,98.6,102.2,103.8,104.3,105.6,105.9,104.8,103.3,101.2,98.1,92.9,96.8,100.2,103.3,103.3,102.2,100.4,97.6,93.4,88.5,84.6,91.4,98.1,103.0,105.6,106.1,106.1,106.1,105.1,102.2,97.1,99.9,103.5,103.8,103.8,104.0,104.8,104.3,102.7,99.9,96.3,89.5,86.2,90.3,93.7,96.0,97.8,98.1,96.8,94.7,91.6,88.5,83.3,90.8,99.9,104.6,108.4,110.5,111.5,112.1,111.5,110.3]},{"name":"M_F","er":27.27,"prof":[92.4,92.4,90.9,89.4,87.6,85.3,81.5,76.3,79.4,84.8,89.1,93.2,95.8,97.0,97.5,98.6,99.3,98.3,95.2,90.9,86.3,80.7,79.2,87.1,91.2,93.2,95.0,96.5,97.3,96.8,96.3,103.4,109.5,113.4,116.4,118.0,118.2,117.5,115.4,110.8,104.7,102.6,107.5,109.3,109.5,109.8,109.3,107.2,102.6,97.5,99.3,105.7,109.3,110.3,111.8,112.9,112.9,110.6,106.5,99.6,102.1,105.5,106.7,107.8,108.3,108.5,107.5,104.4,100.1,92.7,88.9,91.4]},{"name":"M_L","er":28.44,"prof":[112.2,112.2,123.4,127.4,129.7,129.4,127.7,120.3,110.8,102.5,92.4,82.1,76.3,73.5,69.7,66.0,63.7,61.7,60.3,58.8,57.1,55.7,54.0,56.0,57.7,60.3,63.7,67.5,71.8,76.3,84.1,91.8,96.4,99.9,103.6,107.1,106.8,103.6,103.6,113.4,123.4,128.0,129.2,124.9,118.3,105.9,101.0,110.2,113.7,114.2,114.5,114.2,112.2,109.6,107.6,107.3,109.4,111.9,115.1,116.8,115.7,113.9,113.1,110.8,106.8,109.6,115.7,120.0,120.6,119.1,118.5,118.0]},{"name":"V_L","er":26.27,"prof":[83.7,84.6,90.2,94.2,95.1,93.7,90.5,84.6,78.0,74.0,72.6,70.9,69.5,67.2,64.9,61.8,64.6,67.5,70.6,73.7,78.0,82.0,84.3,85.4,86.3,86.8,89.1,92.0,94.8,95.4,93.7,80.3,85.1,99.4,114.2,121.6,126.1,125.6,120.7,124.1,124.4,119.9,114.7,111.9,108.8,101.9,93.4,97.9,109.0,113.3,116.7,119.3,120.7,120.4,121.6,122.7,118.7,108.2,114.7,121.0,123.3,122.7,122.4,123.0,122.7,118.7,114.7,116.7,116.2,115.0,110.5,98.2]},{"name":"V_F","er":29.53,"prof":[112.1,109.5,103.9,96.3,98.6,103.4,106.5,106.5,105.7,105.2,102.9,98.8,93.5,87.1,86.6,88.4,88.9,89.4,90.2,90.4,89.9,87.4,84.6,79.2,79.2,87.6,93.7,97.8,100.6,102.9,103.9,104.7,104.4,102.6,101.1,99.6,95.5,88.6,93.0,97.8,101.1,103.1,103.9,104.7,102.9,99.3,99.6,104.4,105.7,105.7,106.2,105.4,103.4,100.6,96.5,89.9,89.9,99.6,104.9,107.7,108.8,109.3,109.5,108.8,107.0,104.4,102.4,107.2,110.5,112.3,113.8,113.6]},{"name":"V_R","er":32.21,"prof":[113.7,116.2,119.9,120.7,119.9,118.7,115.9,109.7,100.2,94.4,100.4,103.2,104.4,102.9,99.4,94.2,90.7,86.7,82.0,78.2,80.7,82.7,84.5,86.4,88.7,89.7,88.7,86.9,86.2,85.4,84.9,84.0,82.0,79.2,75.2,67.2,74.5,81.7,88.9,93.2,96.9,99.2,102.2,103.2,101.2,103.9,109.4,111.7,110.7,107.9,105.2,101.2,94.7,102.7,110.7,113.2,114.4,113.7,113.7,114.9,114.7,109.4,97.7,92.9,101.7,107.7,113.7,117.2,117.7,118.2,118.9,117.2]},{"name":"M_R","er":28.04,"prof":[89.0,83.5,79.6,76.0,71.8,67.6,62.4,64.0,67.1,69.7,72.6,75.2,77.8,80.9,83.5,85.6,86.7,87.7,90.1,91.9,91.4,89.0,92.4,97.6,102.3,106.2,109.1,111.2,113.3,112.5,109.1,101.0,82.2,96.3,110.4,119.0,122.2,123.2,122.4,119.5,117.7,114.8,109.1,110.9,112.0,111.5,110.7,109.6,104.9,97.9,90.6,105.5,114.1,119.0,120.6,119.0,117.2,115.6,112.2,106.0,112.2,115.9,117.2,117.5,116.9,114.8,109.4,102.1,96.3,96.8,95.5,93.4]},{"name":"R_R","er":26.79,"prof":[98.6,96.2,95.2,93.8,91.5,86.5,80.1,72.2,65.9,68.3,69.6,70.4,70.4,70.7,70.9,71.2,70.9,69.1,75.7,82.2,90.2,97.8,101.8,104.4,106.2,108.3,111.2,111.5,109.9,104.7,96.0,107.8,115.5,119.4,120.2,119.4,117.8,112.6,112.3,114.7,114.9,113.4,111.8,113.1,113.4,112.8,109.7,103.6,101.2,105.4,106.8,107.6,108.9,108.6,104.4,98.6,91.7,100.4,110.7,115.2,116.3,116.5,116.5,115.5,113.4,109.7,101.0,99.4,102.3,103.1,102.3,101.0]}],"rot":[15.0,-10.0,45.0,-35.0,40.0,35.0,-45.0,25.0,45.0]};
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
