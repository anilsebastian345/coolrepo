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
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M32 18 L32 46 M18 32 L46 32" stroke="#55613b" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Sage AI Coach
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            marginTop: 20,
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
