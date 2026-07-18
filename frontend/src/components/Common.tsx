import type{ReactNode}from'react';
export const Loading=()=> <p className="muted">Loading…</p>;export const Empty=({children='No data available.'}:{children?:ReactNode})=><p className="muted">{children}</p>;export const ErrorMessage=({error}:{error:unknown})=><p className="error" role="alert">{error instanceof Error?error.message:'Unable to load data.'}</p>;
export const Badge=({value}:{value:string|null|undefined})=><span className={`badge badge-${value??'unknown'}`}>{(value??'unknown').replaceAll('_',' ')}</span>;
export const formatDate=(value:string|null|undefined)=>value?new Date(value).toLocaleString():'—';export const formatNumber=(value:number|null|undefined,digits=2)=>value===null||value===undefined?'—':Number(value).toLocaleString(undefined,{maximumFractionDigits:digits});
export function Section({title,children}:{title:string;children:ReactNode}){return <section className="panel"><h2>{title}</h2>{children}</section>}
export const JsonList=({value}:{value:unknown})=>{if(!Array.isArray(value)||!value.length)return <Empty/>;return <ul>{value.map((item,index)=><li key={index}>{typeof item==='string'?item:<pre>{JSON.stringify(item,null,2)}</pre>}</li>)}</ul>};
