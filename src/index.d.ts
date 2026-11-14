export type StyleName = 'liquid'|'distortion'|'wobble'|'wind'|'ripple'|'perlin'|'cyber';
export type Style = 1|2|3|4|5|6|7|StyleName;
export interface Config { intensity?:number; speed?:number; frequency?:number; zoom?:number; chromatic?:number; damping?:number; edgeStrength?:number; }
export type ScrollEffect = 'none'|'depth'|'ribbon'|'shutter'|'lens';
export type HoverEdge = 'none'|'wave'|'blob'|'scallop'|'diamond'|'curtain'|'cut'|'orbit';
export type HoverMotion='none'|'tilt'|'swirl'|'fold'|'lift'|'ripple'|'stretch'|'glitch';
export type Transition='liquid'|'radial'|'ribbon'|'slide'|'zoom'|'diagonal'|'pixel';
export interface Options { hoverMotion?:HoverMotion|false; transition?:Transition; scrollEffect?:ScrollEffect|false; hoverEdge?:HoverEdge|false; style?:Style; config?:Config; preset?:string; debug?:boolean; gooey?:boolean; scroll?:boolean; scrollSnapping?:boolean; scrollSpeed?:number; touchSpeed?:number; click?:boolean; onProgress?:(progress:number)=>void; }
export interface Preset {version:1;hoverMotion:HoverMotion;transition:Transition;style:number;gooey:boolean;hoverEdge:HoverEdge;scrollEffect:ScrollEffect;config:Config;}
export interface Instance {ready:Promise<Instance>;loaded:boolean;destroyed:boolean;target:Element;config:Config;setOptions(options:Options):this;setProgress(progress:number):this;next():this;previous():this;pause():this;play():this;refresh():this;destroy():void;exportPreset():Preset;}
export interface EffectGroup {instances:Instance[];ready:Promise<Instance[]>;setOptions(options:Options):this;setProgress(progress:number):this;next():this;previous():this;pause():this;play():this;refresh():this;destroy():this;exportPreset():Preset;}
export declare const version:string;
export declare const styles:Readonly<Record<StyleName,number>>;
export declare function imageEffect(selector:string|Element|Iterable<Element>,options?:Options):EffectGroup;
export declare function destroyAll():void;
export type FollowerStyle='aura'|'orbit'|'comet'|'ribbon'|'magnetic'|'fireflies'|'pixel'|'ink'|'compass'|'text';
export interface FollowerOptions {target?:string|Element;style?:FollowerStyle;color?:string;accent?:string;size?:number;speed?:number;trail?:number;text?:string;idleAnimation?:boolean;hideCursor?:boolean;}
export type FollowerPreset=Required<Omit<FollowerOptions,'target'>>;
export interface Follower {target:Element;enabled:boolean;destroyed:boolean;setOptions(options:Omit<FollowerOptions,'target'>):this;setEnabled(enabled:boolean):this;exportPreset():FollowerPreset;destroy():void;}
export declare const followerStyles:Readonly<Record<FollowerStyle,{name:string;color:string;accent:string}>>;
export declare const imagePresets:Readonly<Record<string,Readonly<Options>>>;
export declare function mouseFollower(options?:FollowerOptions):Follower;
export declare function destroyFollowers():void;
declare const FlowFX:{imageEffect:typeof imageEffect;destroyAll:typeof destroyAll;styles:typeof styles;version:string;mouseFollower:typeof mouseFollower;destroyFollowers:typeof destroyFollowers;followerStyles:typeof followerStyles;imagePresets:typeof imagePresets};
export default FlowFX;
