const { ipcRenderer } = require('electron');

// Get DOM elements
const form = document.getElementById('genForm');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const output = document.getElementById('output');
const status = loading.querySelector('.status');

// Handle directory selection
document.getElementById('selectDir').addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('select-directory');
  if (result) {
    document.getElementById('saveDir').value = result;
  }
});

// Show loading state
function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  loading.classList.toggle('active', isLoading);
  if (isLoading) {
    output.textContent = '';
  }
}

// Update status message
function updateStatus(message, type = 'info') {
  status.textContent = message;
  status.className = 'status ' + type;
}

// Handle form submission
form.onsubmit = async (e) => {
  e.preventDefault();
  
  const prompt = document.getElementById('prompt').value;
  const count = parseInt(document.getElementById('count').value);
  const ratio = document.getElementById('ratio').value;
  const model = document.getElementById('model').value;
  const auth = document.getElementById('auth').value;
  const saveDir = document.getElementById('saveDir').value;

  setLoading(true);
  updateStatus('Generating images...', 'info');

  try {
    const result = await ipcRenderer.invoke('generate-images', { 
      prompt, 
      count, 
      ratio, 
      model, 
      auth,
      saveDir 
    });
    
    output.textContent = result;
    updateStatus('Images generated successfully!', 'success');
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
    updateStatus('Failed to generate images', 'error');
  } finally {
    setLoading(false);
  }
}; 