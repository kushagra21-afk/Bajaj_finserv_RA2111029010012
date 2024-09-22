import { useState } from 'react';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const filterOptions = [
    { label: "Alphabets", value: "Alphabets" },
    { label: "Numbers", value: "Numbers" },
    { label: "Highest lowercase alphabet", value: "Highest lowercase alphabet" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      setError('Invalid JSON format');
      return;
    }

    const formData = new FormData();
    parsedData.data.forEach(item => {
      formData.append('data[]', item);
    });

    if (fileInput) {
      formData.append('file', fileInput);
    }

    const res = await fetch('/api/bfhl', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    console.log(data);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedOptions((prev) => [...prev, value]);
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== value));
    }
  };

  const normalizeOptionKey = (option) => {
    return option.toLowerCase().replace(/ /g, '_');
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    return selectedOptions.map(option => {
      const normalizedKey = normalizeOptionKey(option);
      const dataArray = response[normalizedKey];

      return (
        <div key={normalizedKey} className="mb-4">
          <strong className="text-lg font-semibold">{option}:</strong>
          <ul className="list-disc list-inside pl-4 mt-2">
            {Array.isArray(dataArray) && dataArray.length > 0 ? (
              dataArray.map((item, index) => (
                <li key={index} className="text-gray-800">{item}</li>
              ))
            ) : (
              <li className="text-gray-600">No data available</li>
            )}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-6">Your Roll Number Application</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder='Enter JSON (e.g., {"data": ["A", "C", "z"]})'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFileInput(e.target.files[0])}
          className="mb-4 block w-full text-sm text-gray-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
        >
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && (
        <>
          <div className="my-6">
            <h2 className="text-2xl font-semibold mb-4">Select Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option.value}
                    onChange={handleCheckboxChange}
                    className="rounded text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Filtered Response:</h2>
            {renderFilteredResponse()}
          </div>
        </>
      )}
    </div>
  );
}
