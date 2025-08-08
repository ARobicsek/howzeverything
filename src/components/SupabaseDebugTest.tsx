// src/components/SupabaseDebugTest.tsx
import React, { useState } from 'react';

const SupabaseDebugTest: React.FC = () => {
  const [name, setName] = useState('starbucks');
  const [street, setStreet] = useState('promenade');
  const [city, setCity] = useState('');
  const [bias, setBias] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState('');

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  const runTest = async (strategy: 'structured' | 'combined_text') => {
    setIsLoading(true);
    setError(null);
    setResults(null);

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
    } else {
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
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const labelClasses = "font-elegant text-sm font-medium text-text block mb-1";
  const inputClasses = "font-elegant p-3 rounded-md text-base bg-white/95 text-text box-border border-2 border-gray-200 w-full";
  const buttonClasses = "mt-4 mr-4 text-sm px-4 py-2.5 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors";

  return (
    <div className="p-8 max-w-3xl mx-auto text-text">
      <h1 className="font-elegant text-3xl">Geoapify API Testbed</h1>
      <p className="opacity-80 mb-8">
        Rapidly test different search strategies against the Geoapify API.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-name" className={labelClasses}>Name</label>
          <input id="test-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="test-street" className={labelClasses}>Street</label>
          <input id="test-street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="test-city" className={labelClasses}>City</label>
          <input id="test-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClasses} />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="test-bias" checked={bias} onChange={(e) => setBias(e.target.checked)} className="mr-2.5" />
          <label htmlFor="test-bias" className="font-elegant">Apply proximity bias (to Seattle)?</label>
        </div>
      </div>

      <div>
        <button onClick={() => runTest('structured')} disabled={isLoading} className={buttonClasses}>
          Test (Structured)
        </button>
        <button onClick={() => runTest('combined_text')} disabled={isLoading} className={buttonClasses}>
          Test (Combined Text)
        </button>
      </div>

      {isLoading && <p>Loading...</p>}

      {testUrl && (
        <div className="mt-8">
          <h2 className="font-elegant text-lg">Request URL:</h2>
          <pre className="bg-gray-800 text-gray-200 p-4 rounded-md break-words whitespace-pre-wrap text-xs">
            {testUrl}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-8 text-danger">
          <h2 className="font-elegant text-lg">Error:</h2>
          <pre className="bg-red-900/50 p-4 rounded-md">{error}</pre>
        </div>
      )}

      {results && (
        <div className="mt-8">
          <h2 className="font-elegant text-lg">API Response:</h2>
          <pre className="bg-gray-700 text-white p-4 rounded-md max-h-[500px] overflow-y-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebugTest;