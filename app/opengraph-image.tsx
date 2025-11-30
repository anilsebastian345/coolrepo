import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sage - Career Intelligence';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F8F7F1',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4dbc8 0%, #7A8E50 50%, #55613b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
          }}
        >
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
