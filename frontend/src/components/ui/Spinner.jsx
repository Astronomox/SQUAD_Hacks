import React from 'react';

export default function Spinner({ size = 48 }) {
  const s = size;
  const s2 = Math.round(s * 0.79);
  const s3 = Math.round(s * 0.58);
  return (
    <span style={{
      width: s, height: s,
      display: 'inline-block',
      position: 'relative',
      border: '2px solid #fff',
      boxSizing: 'border-box',
      animation: 'rotation 2s linear infinite',
    }}>
      <style>{`
        @keyframes rotation { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes rotationBack { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
      `}</style>
      <span style={{
        content:'', boxSizing:'border-box', position:'absolute',
        left:0,right:0,top:0,bottom:0, margin:'auto',
        border:'2px solid #E8501A',
        width:s2, height:s2,
        animation:'rotationBack 1.5s linear infinite',
        transformOrigin:'center center',
        display:'block',
      }}/>
      <span style={{
        content:'', boxSizing:'border-box', position:'absolute',
        left:0,right:0,top:0,bottom:0, margin:'auto',
        border:'2px solid #fff',
        width:s3, height:s3,
        animation:'rotation 1s linear infinite',
        transformOrigin:'center center',
        display:'block',
      }}/>
    </span>
  );
}
