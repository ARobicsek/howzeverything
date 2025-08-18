// src/components/SupabaseDebugTest.tsx
import React, { useState } from 'react';
import { BORDERS, COLORS, FONTS, STYLES } from '../constants';

const SupabaseDebugTest: React.FC = () => {
  const [name, setName] = useState('starbucks');
  const [street, setStreet] = useState('promenade');
  const [city, setCity] = useState('');
  const [bias, setBias] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState('');

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  const runTest = async (strategy: 'structured' | 'combined_text') => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    // Hardcoded user location for bias testing (Seattle)
    const userLat = 47.5398144;
    const userLon = -122.2541312;

    const params = new URLSearchParams({
      apiKey: apiKey,
      limit: '20',
      type: 'amenity',
    });

    if (strategy === 'structured') {
      if (name) params.append('name', name);
      if (street) params.append('street', street);
      if (city) params.append('city', city);
    } else { // 'combined_text'
      const textQuery = [name, street, city].filter(Boolean).join(' ');
      params.append('text', textQuery);
    }

    if (bias && userLat && userLon) {
      params.append('bias', `proximity:${userLon},${userLat}`);
    }

    const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;
    setTestUrl(url);
    console.log(`🧪 Testing URL: ${url}`);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    ...FONTS.elegant,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: COLORS.text,
    display: 'block',
    marginBottom: '4px',
  };

  const inputStyle: React.CSSProperties = {
    ...FONTS.elegant,
    padding: '12px 16px',
    borderRadius: BORDERS.radius.medium,
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: COLORS.text,
    boxSizing: 'border-box',
    border: `2px solid ${COLORS.gray200}`,
    width: '100%',
  };

  const buttonStyle: React.CSSProperties = {
    ...STYLES.addButton,
    marginTop: '1rem',
    marginRight: '1rem',
    fontSize: '0.9rem',
    padding: '10px 15px',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '768px', margin: 'auto', color: COLORS.text }}>
      <h1 style={{ ...FONTS.elegant, fontSize: '2rem' }}>Geoapify API Testbed</h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
        Rapidly test different search strategies against the Geoapify API.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-name" style={labelStyle}>Name</label>
          <input id="test-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="test-street" style={labelStyle}>Street</label>
          <input id="test-street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="test-city" style={labelStyle}>City</label>
          <input id="test-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="checkbox" id="test-bias" checked={bias} onChange={(e) => setBias(e.target.checked)} style={{ marginRight: '10px' }} />
          <label htmlFor="test-bias" style={{ ...FONTS.elegant }}>Apply proximity bias (to Seattle)?</label>
        </div>
      </div>

      <div>
        <button onClick={() => runTest('structured')} disabled={isLoading} style={buttonStyle}>
          Test (Structured)
        </button>
        <button onClick={() => runTest('combined_text')} disabled={isLoading} style={buttonStyle}>
          Test (Combined Text)
        </button>
      </div>

      {isLoading && <p>Loading...</p>}

      {testUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ ...FONTS.elegant, fontSize: '1.2rem' }}>Request URL:</h2>
          <pre style={{
            background: '#222',
            color: '#eee',
            padding: '1rem',
            borderRadius: '8px',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontSize: '0.8rem',
          }}>
            {testUrl}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', color: COLORS.danger }}>
          <h2 style={{ ...FONTS.elegant, fontSize: '1.2rem' }}>Error:</h2>
          <pre style={{ background: '#400', padding: '1rem', borderRadius: '8px' }}>{error}</pre>
        </div>
      )}

      {results !== null && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ ...FONTS.elegant, fontSize: '1.2rem' }}>API Response:</h2>
          <pre style={{
            background: '#333',
            color: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            maxHeight: '500px',
            overflowY: 'auto',
          }}>
            {JSON.stringify(results, null, 2) || 'No data'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebugTest;