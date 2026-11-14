// Run: node tests/thiefspire-fx-smoke.js
// Dependency-free smoke test for the separate visual-only FX engine.
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");

const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"thiefspire-fx.js"),"utf8");
const html=fs.readFileSync(path.join(root,"thiefspire.html"),"utf8");

const cards=[
 "strike","guard","quick","feint","backstab","smoke","poison","double",
 "trick","cloak","siphon","gambit","pierce","sharpen","rally","hex",
 "pickpocket","evade","flash","ambush","sap","hook","adrenaline","shade"
];
const enemies=[
 "guard","goblin","slime","cultist","rat","knight","wraith","imp",
 "ogre","warden","archer","jailer","mimic","skeleton","monk","mage","captain","castellan"
];
const moves=["attack","bleed","shoot","spell","multi","defend","buff"];
assert.equal(cards.length,24);
assert.equal(enemies.length,18);

// Fake DOM and canvas implement only what the FX engine touches.
// The game itself is not booted; damage, save handling and combat balance
// have their own code paths and must not be modified by this feature.
let operations=0;
const context=new Proxy({},{
 get(target,key){if(key in target)return target[key];
  return function(){operations++}},
 set(target,key,value){target[key]=value;return true}
});
const canvas={style:{},width:0,height:0,setAttribute(){},getContext(){return context}};
const stage={getBoundingClientRect(){return{left:0,top:100,width:400,height:350}},appendChild(){}};
const playerSprite={getBoundingClientRect(){return{left:65,top:175,width:110,height:115}}};
const enemySprite={getBoundingClientRect(){return{left:263,top:160,width:110,height:130}}};
const playerWrap={style:{},offsetWidth:100},enemyWrap={style:{},offsetWidth:100};
const nodes={
 "#player-side canvas.sprite":playerSprite,"#enemy-side canvas.sprite":enemySprite,
 "#player-side .sprite-wrap":playerWrap,"#enemy-side .sprite-wrap":enemyWrap
};
const document={
 head:{appendChild(){}},
 getElementById(id){return id==="battlefx"?stage:null},
 createElement(tag){return tag==="canvas"?canvas:{textContent:"",style:{}}},
 querySelector(query){return nodes[query]||null}
};
let time=1000,frames=[];
const window={
 performance:{now(){return time}},
 matchMedia(){return{matches:false}},
 addEventListener(){},
 requestAnimationFrame(callback){frames.push(callback);return frames.length}
};
vm.runInNewContext(source,{window,document,setTimeout(){return 1},clearTimeout(){}},{filename:"thiefspire-fx.js"});
const api=window.ThiefspireFX;
assert.ok(api,"ThiefspireFX must be exported");
assert.deepEqual(Array.from(api.cards),cards);
assert.deepEqual(Array.from(api.enemies),enemies);
assert.equal(api.playCard("not-a-card"),false);
assert.equal(api.playEnemy("not-an-enemy","attack"),false);
function drain(){
 let count=0;
 while(frames.length){
  if(++count>12)throw Error("Frame loop did not settle");
  time+=170;
  frames.shift()(time);
 }
 time+=1000;
}
let checked=0;
for(const name of cards){
 operations=0;assert.equal(api.playCard(name),true,name);drain();
 assert.ok(operations>0,"Missing visible instructions for "+name);
 checked++;
}
for(const enemy of enemies){
 for(const move of moves){
  operations=0;assert.equal(api.playEnemy(enemy,move),true,enemy+"/"+move);drain();
  assert.ok(operations>0,"Missing visible instructions for "+enemy+"/"+move);
  checked++;
 }
}
window.matchMedia=()=>({matches:true});
assert.equal(api.playCard("strike"),false,"reduced motion must be honored");
assert.equal(api.playEnemy("warden","attack"),false,"reduced motion must be honored");
assert.ok(html.includes('<script src="./thiefspire-fx.js"></script>'));
assert.ok(html.includes("window.ThiefspireFX.playCard(type)"));
assert.ok(html.includes("window.ThiefspireFX.playEnemy(e.id,kind)"));
console.log("PASS: "+checked+" signature FX scenarios (24 cards, 18 foes × 7 moves).");
console.log("PASS: JS rendering, reduced motion, and both game integration hooks.");
