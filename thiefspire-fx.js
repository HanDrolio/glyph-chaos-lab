/* THIEFSPIRE: Signature Combat FX v1
   Pixel-canvas choreography only. No changes to combat math, save files or card rules.
   Every one of the 24 cards and 18 foes has its own visual signature.
*/
(function (global) {
"use strict";
var MOTION = {
  strike:"lunge",guard:"brace",quick:"flurry",feint:"weave",backstab:"phase",
  smoke:"vanish",poison:"cast",double:"flurry",trick:"weave",cloak:"vanish",
  siphon:"cast",gambit:"weave",pierce:"lunge",sharpen:"brace",rally:"pulse",
  hex:"cast",pickpocket:"flurry",evade:"weave",flash:"cast",ambush:"phase",
  sap:"slam",hook:"lunge",adrenaline:"pulse",shade:"phase"
};
var ENEMY_MOTION = {
  guard:"lunge",goblin:"flurry",slime:"pulse",cultist:"cast",rat:"flurry",
  knight:"slam",wraith:"phase",imp:"weave",ogre:"slam",warden:"slam",
  archer:"cast",jailer:"slam",mimic:"lunge",skeleton:"weave",monk:"cast",
  mage:"cast",captain:"phase",castellan:"slam"
};
var CLR={gold:"#ffe5a4",paper:"#fff8dc",red:"#ff9687",blue:"#8de4fa",
 purple:"#b2a1fc",toxic:"#c8e97c",green:"#9be6b0",gray:"#c9c8bf",orange:"#f1af6c",smoke:"#928aa2"};
var canvas,ctx,stage,live=[],raf=0,ready=false,resizeAdded=false,motionTimers=new WeakMap();
function clamp(x,a,b){return Math.min(b,Math.max(a,x))}
function ease(x){return 1-Math.pow(1-x,3)}
function mix(a,b,t){return a+(b-a)*t}
function fade(a){ctx.globalAlpha=clamp(a,0,1)}
function box(x,y,w,h,color,a){if(a<=0)return;fade(a===undefined?1:a);ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));fade(1)}
function stroke(x,y,u,v,color,width,a){if(a<=0)return;fade(a===undefined?1:a);ctx.lineWidth=width||3;ctx.lineCap="square";ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.stroke();fade(1)}
function poly(points,color,width,a){if(a<=0||!points.length)return;fade(a===undefined?1:a);ctx.strokeStyle=color;ctx.lineWidth=width||3;ctx.lineJoin="bevel";ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();fade(1)}
function ring(x,y,r,color,width,a){if(r<1||a<=0)return;fade(a===undefined?1:a);ctx.strokeStyle=color;ctx.lineWidth=width||3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();fade(1)}
function text(mark,x,y,color,size,a){if(a<=0)return;fade(a===undefined?1:a);ctx.font="bold "+(size||28)+"px Georgia,serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=color;ctx.fillText(mark,x,y);fade(1)}
function star(x,y,r,color,a){stroke(x-r,y,x+r,y,color,3,a);stroke(x,y-r,x,y+r,color,3,a);box(x-2,y-2,4,4,CLR.paper,a)}
function burst(x,y,p,color,r,n){for(var i=0;i<n;i++){var a=i*Math.PI*2/n;box(x+Math.cos(a)*p*r,y+Math.sin(a)*p*r,4+(i%2)*2,4,color,1-p)}}
function slash(x,y,a,p,color,len){var dx=Math.cos(a),dy=Math.sin(a),l=len||80,t=clamp((p-.06)/.45,0,1);stroke(x-dx*l*.5,y-dy*l*.5,x+dx*l*(t-.5),y+dy*l*(t-.5),CLR.paper,9,1-p);stroke(x-dx*l*.5,y-dy*l*.5,x+dx*l*(t-.5),y+dy*l*(t-.5),color,3,1-p)}
function shock(x,y,p,color,r){ring(x,y,8+p*r,color,6,1-p);ring(x,y,5+p*r*.68,CLR.paper,2,1-p)}
function shield(x,y,p,color){var r=20+20*Math.sin(p*Math.PI),a=1-p*.62;poly([[x,y-r],[x+r*.8,y-r*.5],[x+r*.69,y+r*.7],[x,y+r],[x-r*.69,y+r*.7],[x-r*.8,y-r*.5],[x,y-r]],color,5,a);star(x,y,9,CLR.paper,a)}
function fog(x,y,p,color,count){for(var i=0;i<count;i++){var dx=(i-count/2)*13+Math.sin(i*3.2)*12;ring(x+dx,y+(i%3)*13-p*58,8+i%4*3+p*13,color,3,(1-p)*.65)}}
function spiral(x,y,p,color,r){var points=[];for(var i=0;i<=28;i++){var t=i/28,a=t*16+p*7;points.push([x+Math.cos(a)*t*p*r,y+Math.sin(a)*t*p*r])}poly(points,color,4,1-p*.7)}
function rain(x,y,p,color,count){for(var i=0;i<count;i++){var dx=(i-count/2)*12+Math.sin(i*8)*6;box(x+dx,y-52+((p*105+i*17)%118),3,8+(i%3)*3,color,1-p*.8)}}
function projectile(A,B,p,color){var t=ease(p),x=mix(A.x,B.x,t),y=mix(A.y,B.y,t);for(var i=4;i>=0;i--){var v=clamp(t-i*.04,0,1);box(mix(A.x,B.x,v)-2,mix(A.y,B.y,v)-2,5+i,5+i,color,(1-p)*(1-i*.15))}star(x,y,11,CLR.paper,1-p*.45)}
function chain(A,B,p){var t=clamp(p*2,0,1);stroke(A.x,A.y,mix(A.x,B.x,t),mix(A.y,B.y,t),CLR.gray,7,1-p);for(var i=0;i<9*t;i++){var z=i/9;ring(mix(A.x,B.x,z),mix(A.y,B.y,z),5,CLR.gold,2,1-p)}}
function addCSS(){
 if(document.getElementById("tsfx-css"))return;
 var css=[
 "#tsfx-canvas{position:absolute;inset:0;z-index:5;width:100%;height:100%;pointer-events:none;image-rendering:pixelated}",
 "@keyframes tsfx-lunge{0%,100%{transform:translateX(0)}29%{transform:translate(35px,-8px)}53%{transform:translate(51px,2px)}78%{transform:translateX(12px)}}",
 "@keyframes tsfx-brace{0%,100%{transform:scale(1)}35%{transform:translateY(8px) scale(.94,1.08)}61%{transform:translateY(-5px) scale(1.07,.94)}}",
 "@keyframes tsfx-flurry{0%,100%{transform:translateX(0)}19%{transform:translate(13px,-6px)}36%{transform:translate(33px,2px)}57%{transform:translate(17px,-8px)}75%{transform:translate(41px,0)}}",
 "@keyframes tsfx-weave{0%,100%{transform:translateX(0)}25%{transform:translate(-17px,-8px)}49%{transform:translate(14px,2px)}70%{transform:translate(-8px)}}",
 "@keyframes tsfx-phase{0%,100%{opacity:1;transform:translate(0)}27%{opacity:.2;transform:translate(-17px,-7px)}46%{opacity:.35;transform:translate(34px,-12px)}73%{opacity:1;transform:translate(10px)}}",
 "@keyframes tsfx-vanish{0%,100%{opacity:1;transform:scale(1)}35%{opacity:.2;transform:translateY(8px) scale(.85)}65%{opacity:.3;transform:translateY(-8px)}}",
 "@keyframes tsfx-cast{0%,100%{transform:translateY(0) scale(1)}36%{transform:translateY(-12px) scale(1.07)}66%{transform:translateY(-4px) scale(1.05)}}",
 "@keyframes tsfx-slam{0%,100%{transform:translate(0) scale(1)}30%{transform:translateY(-23px)}54%{transform:translate(15px,12px) scale(1.12,.89)}75%{transform:translateY(5px)}}",
 "@keyframes tsfx-pulse{0%,100%{transform:scale(1)}30%{transform:scale(1.13,.94)}57%{transform:scale(.96,1.13)}79%{transform:scale(1.05)}}",
 "@media(prefers-reduced-motion:reduce){#tsfx-canvas{display:none!important}}"
 ];
 var node=document.createElement("style");node.id="tsfx-css";node.textContent=css.join("\n");document.head.appendChild(node)
}
function resize(){if(!canvas||!stage||!ctx)return;var r=stage.getBoundingClientRect(),w=Math.max(1,Math.round(r.width/2)),h=Math.max(1,Math.round(r.height/2));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false}
function init(){
 stage=document.getElementById("battlefx");if(!stage)return false;
 if(!canvas){addCSS();canvas=document.createElement("canvas");canvas.id="tsfx-canvas";canvas.setAttribute("aria-hidden","true");stage.appendChild(canvas);ctx=canvas.getContext("2d");if(!ctx)return false}
 if(!resizeAdded){global.addEventListener("resize",resize);resizeAdded=true}resize();return true
}
function locate(side){var area=stage.getBoundingClientRect(),el=document.querySelector("#"+(side==="enemy"?"enemy-side":"player-side")+" canvas.sprite");if(!el)return{x:area.width*(side==="enemy"?.75:.25),y:area.height*.57};var r=el.getBoundingClientRect();return{x:clamp(r.left-area.left+r.width*.5,24,area.width-24),y:clamp(r.top-area.top+r.height*.55,25,area.height-22)}}
function pose(actor,key){
 var el=document.querySelector("#"+(actor==="enemy"?"enemy-side":"player-side")+" .sprite-wrap");if(!el)return;
 var previous=motionTimers.get(el);if(previous)clearTimeout(previous);
 el.style.animation="none";void el.offsetWidth;
 el.style.animation="tsfx-"+(actor==="enemy"?ENEMY_MOTION[key]:MOTION[key])+" 700ms steps(8,end)";
 motionTimers.set(el,setTimeout(function(){el.style.animation="";motionTimers.delete(el)},725))
}
function drawCard(e,p,A,B){
 var x=A.x,y=A.y,u=B.x,v=B.y,f=1-p,q=ease(p);
 switch(e.key){
 case "strike":slash(u,v,-.75,p,CLR.orange,98);burst(u,v,p,CLR.gold,48,8);break;
 case "guard":shield(x,y,p,CLR.blue);ring(x,y,22+p*25,CLR.gold,2,f);break;
 case "quick":slash(u-11,v-11,-.85,clamp(p*1.6,0,1),CLR.gold,57);slash(u+11,v+8,.63,clamp((p-.21)*1.6,0,1),CLR.red,58);rain(u,v,p,CLR.red,5);break;
 case "feint":text("◇",u-21,v-17,CLR.purple,43,f);slash(u+11,v,.6,p,CLR.gray,42);shield(x,y,clamp((p-.3)*1.45,0,1),CLR.blue);break;
 case "backstab":fog(u+26,v,p,CLR.smoke,6);slash(u+17,v,1.18,p,CLR.purple,95);star(u-20,v-16,15,CLR.paper,f);break;
 case "smoke":fog(x,y,p,CLR.gray,10);fog(x-16,y+4,p,CLR.purple,6);break;
 case "poison":projectile(A,B,p,CLR.toxic);burst(u,v,p,CLR.green,53,13);rain(u,v,p,CLR.toxic,7);break;
 case "double":slash(u-13,v,-.7,clamp(p*1.65,0,1),CLR.gold,80);slash(u+13,v,.7,clamp((p-.24)*1.7,0,1),CLR.red,80);break;
 case "trick":text("?",u,v-21,CLR.gold,37,f);text("✧",u-25,v+18,CLR.purple,33,f);spiral(u,v,p,CLR.blue,29);break;
 case "cloak":fog(x,y,p,CLR.smoke,11);spiral(x,y,p,CLR.purple,48);break;
 case "siphon":projectile(B,A,p,CLR.purple);for(var i=0;i<4;i++){var t=clamp((p-i*.1)*1.4,0,1);ring(mix(u,x,t),mix(v,y,t)-Math.sin(t*7+i)*17,4+i*2,CLR.red,3,f)}star(x,y,18,CLR.green,q);break;
 case "gambit":text("⚄",x,y-23,CLR.gold,46,f);text("⚂",x+32,y+17,CLR.red,34,f);burst(x,y,p,CLR.orange,40,10);break;
 case "pierce":stroke(mix(x,u,q)-29,mix(y,v,q),mix(x,u,q)+29,mix(y,v,q),CLR.paper,7,f);shock(u,v,p,CLR.blue,50);stroke(x,y,u,v,CLR.gold,2,f*.6);break;
 case "sharpen":slash(x+10,y,-.3,p,CLR.blue,75);star(x-30,y-14,12,CLR.gold,f);star(x+19,y+22,13,CLR.paper,f);break;
 case "rally":for(var j=0;j<3;j++){var t2=clamp(p*1.5-j*.21,0,1);ring(x,y,15+57*t2,j%2?CLR.orange:CLR.blue,5,1-t2)}text("♪",x,y-25-p*28,CLR.gold,29,f);break;
 case "hex":spiral(u,v,p,CLR.red,53);text("ᚷ",u,v,CLR.orange,43,f);rain(u,v,p,CLR.red,9);break;
 case "pickpocket":for(var k=0;k<5;k++){var m=clamp((p-k*.09)*1.5,0,1);text("✦",mix(u,x,ease(m)),mix(v,y,m)-25*Math.sin(m*Math.PI)-k*8,CLR.gold,22,1-m*.55)}break;
 case "evade":for(var n=0;n<4;n++)ring(x-p*56-n*13,y-n*9,12+n*5,CLR.blue,3,f*.75);slash(x-13,y,-1.1,p,CLR.gray,47);break;
 case "flash":shock(u,v,p,CLR.paper,76);for(var h=0;h<11;h++){var a=h*2*Math.PI/11;star(u+Math.cos(a)*p*65,v+Math.sin(a)*p*65,6,CLR.gold,f)}break;
 case "ambush":fog(u,v,p,CLR.smoke,8);slash(u+17,v,-.49,p,CLR.paper,116);ring(u,v,12+p*57,CLR.purple,4,f);break;
 case "sap":shock(u,v,p,CLR.orange,54);text("✹",u,v-17,CLR.paper,49,f);stroke(u-29,v-30,u+26,v+29,CLR.red,8,f);break;
 case "hook":chain(A,B,p);ring(u,v,12+p*19,CLR.gold,4,f);stroke(u-21,v-10,u+13,v+19,CLR.paper,4,f);break;
 case "adrenaline":poly([[x-43,y+13],[x-23,y+13],[x-15,y-17],[x-4,y+33],[x+9,y-35],[x+18,y+13],[x+46,y+13]],CLR.green,5,f);for(var b=0;b<3;b++)star(x-21+b*21,y-30-p*30,8,CLR.gold,f);break;
 case "shade":fog(u,v,p,CLR.smoke,7);slash(u,v,-.97,p,CLR.purple,83);shield(x,y,clamp((p-.26)*1.4,0,1),CLR.blue);break;
 }
}
function drawEnemy(e,p,A,B){
 var x=A.x,y=A.y,u=B.x,v=B.y,f=1-p,q=ease(p),def=e.move==="defend"||e.move==="buff",T=def?A:B,X=T.x,Y=T.y;
 if(e.move==="defend")shield(x,y,p,CLR.gold);
 else if(e.move==="buff"){spiral(x,y,p,CLR.orange,42);text("↑",x,y-32,CLR.gold,35,f)}
 else if(e.move==="shoot"){projectile(A,B,p,CLR.orange);stroke(mix(x,u,q)-18,mix(y,v,q),mix(x,u,q)+24,mix(y,v,q),CLR.paper,4,f)}
 else if(e.move==="spell")projectile(A,B,p,CLR.purple);
 else if(e.move==="multi"){slash(u-15,v,-.71,clamp(p*1.65,0,1),CLR.red,68);slash(u+15,v,.64,clamp((p-.24)*1.7,0,1),CLR.gold,72)}
 else if(e.move==="bleed"){for(var s=0;s<3;s++)slash(u+(s-1)*14,v,-.91,clamp((p-s*.1)*1.5,0,1),CLR.red,52);rain(u,v,p,CLR.red,6)}
 else slash(u,v,.7,p,CLR.orange,79);
 switch(e.key){
 case "guard":poly([[X-27,Y+23],[X+16,Y-27],[X+32,Y-12]],CLR.paper,5,f);star(X+12,Y-18,11,CLR.gold,f);break;
 case "goblin":for(var i=0;i<3;i++)slash(X-15+i*17,Y+17-i*12,-.95,clamp((p-i*.12)*1.7,0,1),CLR.toxic,39);break;
 case "slime":for(var j=0;j<8;j++)box(X+(j-4)*13,Y+18-Math.sin((p+j*.13)*Math.PI)*35,8,12,CLR.green,f);ring(X,Y+19,p*37,CLR.toxic,5,f);break;
 case "cultist":text("ᚱ",X,Y,CLR.red,43,f);spiral(X,Y,p,CLR.orange,54);break;
 case "rat":for(var k=0;k<4;k++)slash(X+(k-2)*14,Y,-.86,clamp((p-k*.09)*1.65,0,1),CLR.red,41);break;
 case "knight":stroke(X-44,Y-43,X+38,Y+37,CLR.paper,14,f);shock(X,Y,p,CLR.gray,53);break;
 case "wraith":fog(X,Y,p,CLR.purple,10);text("◇",X,Y,CLR.paper,46,f);break;
 case "imp":burst(X,Y,p,CLR.red,76,16);rain(X,Y,p,CLR.orange,9);break;
 case "ogre":shock(X,Y+24,p,CLR.orange,87);stroke(X-43,Y+32,X+39,Y+32,CLR.gray,11,f);break;
 case "warden":for(var n=0;n<9;n++){var a=n*2*Math.PI/9+p*3;stroke(X+Math.cos(a)*12,Y+Math.sin(a)*12,X+Math.cos(a)*(14+p*66),Y+Math.sin(a)*(14+p*66),CLR.gold,6,f)}ring(X,Y,12+p*58,CLR.paper,4,f);break;
 case "archer":for(var z=0;z<3;z++){var tr=clamp((p-z*.13)*1.35,0,1);stroke(mix(x,u,tr)-16,mix(y,v,tr)+z*12-11,mix(x,u,tr)+18,mix(y,v,tr)+z*12-11,CLR.gold,4,1-tr)}break;
 case "jailer":chain(A,T,p);text("⛓",X,Y,CLR.gold,36,f);break;
 case "mimic":poly([[X-42,Y-19],[X-20,Y-41],[X,Y-19],[X+23,Y-41],[X+44,Y-19]],CLR.paper,8,f);poly([[X-42,Y+21],[X-22,Y+40],[X,Y+19],[X+22,Y+39],[X+43,Y+21]],CLR.red,8,f);break;
 case "skeleton":for(var t=0;t<5;t++){var theta=t*2*Math.PI/5+p*4;stroke(X,Y,X+Math.cos(theta)*p*58,Y+Math.sin(theta)*p*58,CLR.paper,5,f)}text("☠",X,Y,CLR.gray,29,f);break;
 case "monk":fog(X,Y,p,CLR.toxic,9);burst(X,Y,p,CLR.green,49,12);text("☣",X,Y,CLR.toxic,32,f);break;
 case "mage":for(var m=0;m<5;m++){var ang=m*2*Math.PI/5+p*3;star(X+Math.cos(ang)*(23+p*26),Y+Math.sin(ang)*(23+p*26),8,CLR.orange,f)}ring(X,Y,13+p*43,CLR.purple,4,f);break;
 case "captain":slash(X-20,Y,-1.05,p,CLR.purple,86);slash(X+19,Y,.69,clamp((p-.23)*1.6,0,1),CLR.blue,79);fog(X,Y,p,CLR.smoke,6);break;
 case "castellan":stroke(X-44,Y-37,X+37,Y+38,CLR.gray,13,f);shield(X,Y,clamp(p*1.3,0,1),CLR.gold);burst(X,Y,p,CLR.paper,58,9);break;
 }
}
function tick(now){
 raf=0;if(!ctx)return;resize();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.restore();ctx.setTransform(.5,0,0,.5,0,0);
 var next=[];for(var i=0;i<live.length;i++){var fx=live[i],p=clamp((now-fx.start)/fx.duration,0,1);if(p>=1)continue;if(fx.actor==="player")drawCard(fx,p,fx.from,fx.to);else drawEnemy(fx,p,fx.from,fx.to);next.push(fx)}live=next;
 if(live.length)raf=global.requestAnimationFrame(tick)
}
function play(actor,key,move){
 if(!(actor==="player"?MOTION:ENEMY_MOTION)[key])return false;
 if(global.matchMedia&&global.matchMedia("(prefers-reduced-motion: reduce)").matches)return false;
 if(!init())return false;
 var src=locate(actor==="player"?"player":"enemy"),dst=locate(actor==="player"?"enemy":"player");
 live.push({actor:actor,key:key,move:move||"attack",from:src,to:dst,start:global.performance.now(),duration:900});
 if(live.length>4)live.shift();pose(actor,key);if(!raf)raf=global.requestAnimationFrame(tick);return true
}
global.ThiefspireFX={playCard:function(key){return play("player",key,"card")},playEnemy:function(id,move){return play("enemy",id,move)},cards:Object.keys(MOTION),enemies:Object.keys(ENEMY_MOTION),version:"1.0.0"};
})(window);
