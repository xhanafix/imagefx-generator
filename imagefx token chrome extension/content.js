function extractToken() {
    const script = document.querySelector("#__NEXT_DATA__");
    if (!script) {
        return null;
    }
    
    try {
        const obj = JSON.parse(script.textContent);
        const authToken = obj?.props?.pageProps?.session?.access_token;
        return authToken;
    } catch (error) {
        console.error('Error extracting token:', error);
        return null;
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getToken") {
        const token = extractToken();
        sendResponse({ token: token });
    }
}); 