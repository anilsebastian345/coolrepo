import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sage AI Coach';
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
          background: 'linear-gradient(135deg, #d4dbc8 0%, #7A8E50 50%, #55613b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 160, height: 20, background: '#55613b', borderRadius: 10 }} />
              <div style={{ width: 20, height: 160, background: '#55613b', borderRadius: 10, marginTop: -90 }} />
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Sage AI Coach
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            marginTop: 20,
            letterSpacing: '-0.01em',
          }}
        >
          Your personalized AI career coaching assistant
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
