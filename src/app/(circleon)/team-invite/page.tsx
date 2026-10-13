'use client';
import {useEffect,useState} from 'react';
import {billingAction} from '@/lib/api';
import '@/components/pricing/pricing.css';
export default function Invitations(){const [rows,setRows]=useState<{id:string;workspaces:{name:string}}[]>([]),[message,setMessage]=useState('');useEffect(()=>{billingAction<{invitations:typeof rows}>('/invitations','GET').then(d=>setRows(d.invitations)).catch(e=>setMessage(e.message));},[]);return <main className="cp" style={{maxWidth:700,margin:'60px auto',padding:24}}><h1>Team invitations</h1><p role="status">{message}</p>{rows.map(r=><p key={r.id}>{r.workspaces?.name||'CircleOn workspace'} <button onClick={async()=>{try{await billingAction('/invitations/'+r.id+'/accept');window.location.assign('/dashboard');}catch(e){setMessage(e instanceof Error?e.message:'Could not accept.');}}}>Accept invitation</button></p>)}{!rows.length&&<p>No pending invitations. <a href="/login">Sign in</a> with the email your workspace owner invited.</p>}</main>;}
