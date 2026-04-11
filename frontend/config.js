const CONFIG = {
    // --- API URL CONFIGURATION ---
    // Change this to your backend URL when deployed (e.g., "https://cric-pro-backend.onrender.com")
    // Keep it as "http://127.0.0.1:8000" for local development
    API_BASE_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? "http://127.0.0.1:8000" 
        : "" // This empty string allows for relative paths if served by same domain, or can be replaced.
};

export default CONFIG;
