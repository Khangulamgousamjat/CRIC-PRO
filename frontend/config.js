const CONFIG = {
    // --- API URL CONFIGURATION ---
    // Live Backend URL: https://cric-pro.onrender.com
    API_BASE_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? "http://127.0.0.1:8000" 
        : "https://cric-pro.onrender.com"
};

export default CONFIG;
