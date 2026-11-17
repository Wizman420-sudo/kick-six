(function(root){
'use strict';
const clamp=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(1.5,Number(value))):1;
class FollowMusic {
  constructor(film,track,{volume=1,onError=()=>{}}={}) {
    this.film=film;this.track=track;this.volume=clamp(volume);this.muted=false;
    this.waiting=false;this.unlocked=false;this.blocked=false;this.pending=null;this.lastSync=-Infinity;this.onError=onError;
    track.volume=1;
    for(const name of ['pause','ended','emptied'])film.addEventListener(name,()=>this.stop());
    for(const name of ['waiting','seeking'])film.addEventListener(name,()=>{this.waiting=true;this.stop();});
    for(const name of ['playing','seeked','canplay'])film.addEventListener(name,()=>{this.waiting=false;this.sync(true);});
    film.addEventListener('ratechange',()=>this.sync(true));
    track.addEventListener('loadedmetadata',()=>this.sync(true));
    track.addEventListener('playing',()=>{if(!this.shouldPlay())this.stop();else{this.align();this.applyGain();}});
    track.addEventListener('error',()=>{this.blocked=true;this.stop();this.onError();});
  }
  prepare(context) {
    if(this.context)return;
    this.context=context;
    this.gain=context.createGain();this.gain.gain.value=0;
    this.source=context.createMediaElementSource(this.track);
    this.source.connect(this.gain);this.gain.connect(context.destination);
    context.addEventListener('statechange',()=>this.sync(true));
  }
  shouldPlay() {
    return !!(this.context&&this.context.state==='running'&&this.unlocked&&!this.blocked&&!this.waiting&&!this.film.paused&&!this.film.ended&&!this.film.seeking);
  }
  applyGain() {
    if(!this.gain)return;
    const value=this.shouldPlay()&&!this.muted?.731*this.volume:0;
    // A separate gain works on phones whose HTMLMediaElement.volume is read-only.
    this.gain.gain.cancelScheduledValues(this.context.currentTime);
    this.gain.gain.setValueAtTime(value,this.context.currentTime);
  }
  setVolume(value){this.volume=clamp(value);this.applyGain();}
  setMuted(value){this.muted=!!value;this.applyGain();}
  align() {
    if(this.track.readyState<1)return;
    const drift=this.track.currentTime-this.film.currentTime,base=this.film.playbackRate||1;
    if(Math.abs(drift)>.12){try{this.track.currentTime=this.film.currentTime;}catch(_){}this.track.playbackRate=base;}
    else this.track.playbackRate=base+(Math.abs(drift)>.025?(drift>0?-.025:.025):0);
  }
  play(prime=false) {
    if(this.pending||(!prime&&!this.shouldPlay()))return;
    this.align();
    let result;
    try{result=this.track.play();}catch(_){this.blocked=true;this.stop();this.onError();return;}
    this.pending=Promise.resolve(result).then(()=>{this.pending=null;if(!this.shouldPlay())this.stop();else{this.align();this.applyGain();}},error=>{
      this.pending=null;
      // pause()/seek can interrupt an in-flight play without being a failure.
      if(error?.name!=='AbortError'&&this.shouldPlay()){this.blocked=true;this.onError();}
      if(!this.shouldPlay())this.stop();
    });
  }
  unlock() {
    if(!this.context)return;
    this.unlocked=true;this.blocked=false;
    // Call inside the same user gesture as film.play() for mobile autoplay rules.
    this.play(true);this.applyGain();
  }
  stop(){this.track.pause();if(this.gain){this.gain.gain.cancelScheduledValues(this.context.currentTime);this.gain.gain.setValueAtTime(0,this.context.currentTime);}}
  sync(force=false) {
    if(!this.shouldPlay()){this.stop();return;}
    const now=this.context.currentTime;
    if(!force&&now-this.lastSync<.25)return;
    this.lastSync=now;this.align();this.applyGain();
    if(this.track.paused)this.play();
  }
}
root.FollowMusic=FollowMusic;
if(typeof module==='object')module.exports=FollowMusic;
})(typeof window==='object'?window:globalThis);
