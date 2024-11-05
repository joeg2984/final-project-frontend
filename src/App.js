import React, { useState } from 'react';
import './App.css';

function App() {
  const [businessIdea, setBusinessIdea] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Log initial form data
    console.log('Form submitted:', {
      businessIdea,
      location,
    });

    try {
      // Construct the request
      const response = await fetch('http://127.0.0.1:8000/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          business_idea: businessIdea,
          location: location,
        }),
      });

      // Log response details
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server response was not valid JSON');
      }

      // Check if response was ok
      if (!response.ok) {
        // If the server returned an error message, use it
        const errorMessage = data.detail || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Set the result
      setResult(data);
      console.log('Request successful:', data);

    } catch (err) {
      // Log the full error
      console.error('Request failed:', {
        error: err,
        message: err.message,
        stack: err.stack,
      });

      // Set a user-friendly error message
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
};

  // Debug component renders
  console.log('Current state:', {
    businessIdea,
    location,
    hasResult: !!result,
    hasError: !!error,
    isLoading: loading,
  });

  return (
    <div className="App container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Business Idea Evaluator</h1>
      
      {/* Add a debug panel in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-xs">
              {JSON.stringify({
                state: {
                  businessIdea,
                  location,
                  result,
                  error,
                  loading,
                },
                serverUrl: 'http://127.0.0.1:8000/evaluate',
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Idea:
          </label>
          <textarea
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            required
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Evaluating...' : 'Evaluate'}
        </button>
      </form>

      {loading && (
        <div className="mt-4 text-blue-500">
          <p>Loading...</p>
          <p className="text-sm">Request sent at: {new Date().toLocaleTimeString()}</p>
        </div>
        
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold">Assessment: {result.rating}</h2>
          <p className="mt-2">{result.explanation}</p>

          {(result.corrected_location && result.corrected_location !== location) && (
            <p className="mt-2 text-yellow-600">
              Location corrected to: <strong>{result.corrected_location}</strong>
            </p>
          )}
          
          {(result.corrected_business_idea && result.corrected_business_idea !== businessIdea) && (
            <p className="mt-2 text-yellow-600">
              Business Idea corrected to: <strong>{result.corrected_business_idea}</strong>
            </p>
          )}

          {result.competitors && result.competitors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">Nearby Competitors:</h3>
              <ul className="list-disc list-inside">
                {result.competitors.map((comp, index) => (
                  <li key={index} className="mt-1">
                    <strong>{comp.name}</strong> - Rating: {comp.rating} (
                    {comp.user_ratings_total} reviews) - {comp.vicinity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;