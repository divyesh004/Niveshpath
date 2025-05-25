import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { RBI_NEWS_ENABLED } from '../config';

const RBINews = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRBINews = async () => {
      try {
        setLoading(true);
        
        // Check if RBI News API is enabled in configuration
        if (!RBI_NEWS_ENABLED) {
          throw new Error('RBI News API is disabled in configuration');
        }
        
        const response = await apiService.external.getRBIData();
        
        if (response.data && response.data.success) {
          setNewsData(response.data.data);
          setError(null);
        } else {
          throw new Error('Invalid data received from API');
        }
      } catch (err) {
        console.error('Error fetching RBI news:', err);
        setError('Problem loading RBI news');
        // Default fallback image URL - direct image URL from reliable source
        const fallbackImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Seal_of_the_Reserve_Bank_of_India.svg/2048px-Seal_of_the_Reserve_Bank_of_India.svg.png';
        
        // Fallback data with isFallback flag
        setNewsData([
          {
            id: 1,
            title: 'RBI Monetary Policy Update',
            summary: 'Reserve Bank of India maintains repo rate at current levels. Governor emphasizes focus on inflation control.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/',
            imageUrl: fallbackImageUrl,
            isFallback: true
          },
          {
            id: 2,
            title: 'Digital Currency Pilot Program Expansion',
            summary: 'RBI announces expansion of digital rupee pilot program to more cities and financial institutions.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
            imageUrl: fallbackImageUrl,
            isFallback: true
          },
          {
            id: 3,
            title: 'Financial Inclusion Initiatives',
            summary: 'New guidelines released for banks to enhance financial inclusion in rural areas through digital banking solutions.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/financialeducation',
            imageUrl: fallbackImageUrl,
            isFallback: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRBINews();
  }, []);

  return (
    <div className="mb-8 sm:mb-10">
      <h3 className="text-lg font-medium text-primary dark:text-white mb-3 sm:mb-4">RBI Updates</h3>
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 text-responsive">Loading RBI news...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500 text-responsive">{error}</p>
        </div>
      ) : (
        <>
          {newsData.some(news => news.isFallback) && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
              <p className="text-sm">⚠️ Problem retrieving data from API. Displaying temporary data.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
            {newsData.map((news) => (
              <div key={news.id} className={`card p-4 hover:shadow-md transition-shadow ${news.isFallback ? 'border border-yellow-400 dark:border-yellow-600' : ''}`}>
                <div className="mb-3">
                  <img 
                    src={news.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Seal_of_the_Reserve_Bank_of_India.svg/2048px-Seal_of_the_Reserve_Bank_of_India.svg.png'} 
                    alt={news.title} 
                    className="w-full h-40 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Seal_of_the_Reserve_Bank_of_India.svg/2048px-Seal_of_the_Reserve_Bank_of_India.svg.png';
                      e.target.className = "w-full h-40 object-contain p-2 rounded-md";
                    }}
                  />
                </div>
              <h4 className="text-lg font-medium text-primary dark:text-white mb-2">{news.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{news.summary}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{news.date}</span>
                <span>{news.source}</span>
              </div>
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-block text-accent hover:text-secondary transition-colors text-sm"
              >
                Read more →
              </a>
              {news.isFallback && (
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  (Temporary Data)
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
  );
};

export default RBINews;