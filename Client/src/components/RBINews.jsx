import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { RBI_NEWS_ENABLED } from '../config';

const RBINews = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    const fetchRBINews = async () => {
      try {
        setLoading(true);
        
        // Check if RBI News API is enabled in configuration
        if (!RBI_NEWS_ENABLED) {
          console.log('RBI News API is disabled in configuration. Enable it in .env file with VITE_RBI_NEWS_ENABLED=true');
          throw new Error('RBI News API is disabled in configuration');
        }
        
        const response = await apiService.external.getRBIData();
        
        if (response.data && response.data.success) {
          // Process the API response data
          const apiNewsData = response.data.data;
          
          // Check if we have valid news data
          if (apiNewsData && Array.isArray(apiNewsData) && apiNewsData.length > 0) {
           
            // Process each news item to ensure it has all required fields
            const processedData = apiNewsData.map((item, index) => ({
              id: item.id || index + 1,
              title: item.title || 'No Title',
              summary: item.summary || 'No description available',
              date: item.date || new Date().toISOString().split('T')[0],
              source: item.source || 'RBI',
              url: item.url || 'https://www.rbi.org.in',
              imageUrl: item.imageUrl || 'https://logowik.com/content/uploads/images/reserve-bank-of-india5662.jpg',
              darkModeImageUrl: item.darkModeImageUrl || 'https://rbidocs.rbi.org.in/rdocs/Content/Images/RBISEAL1.png',
              isFallback: false
            }));
            
            setNewsData(processedData);
            setError(null);
          } else {
            console.error('Invalid or empty news data received from API');
            throw new Error('Invalid or empty news data received');
          }
        } else if (response.data && !response.data.success) {
          // Handle API error response
          console.error('API returned error:', response.data.message || 'Unknown error');
          throw new Error(response.data.message || 'Error fetching RBI news');
        } else {
          throw new Error('Invalid data received from API');
        }
      } catch (err) {
        console.error('Error fetching RBI news:', err.message);
        setError('Problem loading RBI news: ' + err.message);
        
        // Default poster images for light and dark mode
        const lightModePosterUrl = 'https://logowik.com/content/uploads/images/reserve-bank-of-india5662.jpg';
        const darkModePosterUrl = 'https://rbidocs.rbi.org.in/rdocs/Content/Images/RBISEAL1.png';
        
        // Fallback data with isFallback flag
        setNewsData([
          {
            id: 1,
            title: 'RBI Monetary Policy Update',
            summary: 'Reserve Bank of India maintains repo rate at current levels. Governor emphasizes focus on inflation control.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/',
            imageUrl: lightModePosterUrl,
            darkModeImageUrl: darkModePosterUrl,
            isFallback: true
          },
          {
            id: 2,
            title: 'Digital Currency Pilot Program Expansion',
            summary: 'RBI announces expansion of digital rupee pilot program to more cities and financial institutions.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
            imageUrl: lightModePosterUrl,
            darkModeImageUrl: darkModePosterUrl,
            isFallback: true
          },
          {
            id: 3,
            title: 'Financial Inclusion Initiatives',
            summary: 'New guidelines released for banks to enhance financial inclusion in rural areas through digital banking solutions.',
            date: new Date().toISOString().split('T')[0],
            source: 'RBI Direct Source',
            url: 'https://www.rbi.org.in/financialeducation',
            imageUrl: lightModePosterUrl,
            darkModeImageUrl: darkModePosterUrl,
            isFallback: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRBINews();
  }, []);

  // Function to check if dark mode is active
  const isDarkMode = () => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  };

  // Handle image error
  const handleImageError = (id) => {
    setImageError(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Get appropriate image URL based on dark mode and error state
  const getImageUrl = (news) => {
    if (imageError[news.id]) {
      return 'https://logowik.com/content/uploads/images/reserve-bank-of-india5662.jpg';
    }
    return isDarkMode() ? news.darkModeImageUrl : news.imageUrl;
  };

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
              <div key={news.id} className={`card p-0 overflow-hidden hover:shadow-lg transition-shadow ${news.isFallback ? 'border border-yellow-400 dark:border-yellow-600' : ''}`}>
                <div className="relative">
                  <img 
                    src={getImageUrl(news)}
                    alt={news.title} 
                    className="w-full h-48 object-contain bg-white dark:bg-gray-800"
                    onError={() => handleImageError(news.id)}
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h4 className="text-lg font-bold text-white mb-1">{news.title}</h4>
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span>{news.date}</span>
                      <span>{news.source}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{news.summary}</p>
                  <div className="flex justify-between items-center">
                    <a 
                      href={news.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-accent hover:bg-secondary text-white rounded-md transition-colors text-sm font-medium"
                    >
                      Read more
                    </a>
                    {news.isFallback && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        (Temporary Data)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RBINews;