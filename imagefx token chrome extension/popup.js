document.addEventListener('DOMContentLoaded', function() {
    const tokenDisplay = document.getElementById('tokenDisplay');
    const copyButton = document.getElementById('copyButton');
    const status = document.getElementById('status');

    // Function to get the current active tab
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    // Function to extract token
    async function extractToken() {
        const tab = await getCurrentTab();
        
        if (!tab.url.includes('labs.google/fx/tools/image-fx')) {
            tokenDisplay.textContent = 'Please navigate to ImageFX website';
            copyButton.disabled = true;
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getToken" });
            if (response && response.token) {
                tokenDisplay.textContent = response.token;
                copyButton.disabled = false;
            } else {
                tokenDisplay.textContent = 'No token found. Please make sure you are logged in.';
                copyButton.disabled = true;
            }
        } catch (error) {
            tokenDisplay.textContent = 'Error: Please refresh the page and try again';
            copyButton.disabled = true;
        }
    }

    // Copy token to clipboard
    copyButton.addEventListener('click', async () => {
        const token = tokenDisplay.textContent;
        if (token && token !== 'No token found' && token !== 'Please navigate to ImageFX website') {
            try {
                await navigator.clipboard.writeText(token);
                status.textContent = 'Token copied to clipboard!';
                setTimeout(() => {
                    status.textContent = '';
                }, 2000);
            } catch (err) {
                status.textContent = 'Failed to copy token';
            }
        }
    });

    // Initial token extraction
    extractToken();
}); 