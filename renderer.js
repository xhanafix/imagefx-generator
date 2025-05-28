const { ipcRenderer } = require('electron');

// Get DOM elements
const form = document.getElementById('genForm');
const generateBtn = document.getElementById('generate-button');
const loading = document.getElementById('loading');
const output = document.getElementById('output');
const status = loading.querySelector('.status');
const rememberDirCheckbox = document.getElementById('rememberDir');
const saveDirInput = document.getElementById('saveDir');

// Load saved directory on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedDir = localStorage.getItem('lastDirectory');
  if (savedDir) {
    saveDirInput.value = savedDir;
  }
});

// Helper function to get random option from select element
function getRandomOption(selectElement) {
  const options = Array.from(selectElement.options).filter(option => option.value !== '');
  if (options.length === 0) return '';
  return options[Math.floor(Math.random() * options.length)].value;
}

// Helper function to get amateur characteristics based on level
function getAmateurCharacteristics(level) {
  const subtle = ['casual snapshot', 'everyday photo', 'authentic moment'];
  const moderate = ['amateur photography', 'casual snapshot', 'everyday photo', 'authentic moment', 'candid shot', 'imperfect composition'];
  const extreme = ['amateur photography', 'casual snapshot', 'everyday photo', 'authentic moment', 'candid shot', 'imperfect composition', 'poor quality', 'low resolution', 'grainy', 'vintage look'];

  switch (level) {
    case 'subtle': return subtle;
    case 'extreme': return extreme;
    default: return moderate;
  }
}

// Generate random prompt
document.getElementById('generateRandomPrompt').addEventListener('click', () => {
  const customSubject = document.getElementById('customSubject').value;
  const subjectType = document.getElementById('subjectType');
  const location = document.getElementById('location');
  const lighting = document.getElementById('lighting');
  const cameraType = document.getElementById('cameraType');
  const mistakes = document.getElementById('mistakes');
  const timePeriod = document.getElementById('timePeriod');

  // Always randomly select subject type
  subjectType.value = getRandomOption(subjectType);
  
  // Randomly select other options
  location.value = getRandomOption(location);
  lighting.value = getRandomOption(lighting);
  cameraType.value = getRandomOption(cameraType);
  mistakes.value = getRandomOption(mistakes);
  timePeriod.value = getRandomOption(timePeriod);

  // Trigger the amateur prompt generation
  document.getElementById('generateAmateurPrompt').click();
});

// Amateur prompt generation
document.getElementById('generateAmateurPrompt').addEventListener('click', () => {
  const customSubject = document.getElementById('customSubject').value;
  const subjectType = document.getElementById('subjectType').value;
  const location = document.getElementById('location').value;
  const lighting = document.getElementById('lighting').value;
  const cameraType = document.getElementById('cameraType').value;
  const mistakes = document.getElementById('mistakes').value;
  const timePeriod = document.getElementById('timePeriod').value;
  const amateurLevel = document.getElementById('amateurLevel').value;

  // Build the amateur prompt
  let promptParts = [];
  
  // Use both custom subject and subject type if available
  if (customSubject && subjectType) {
    promptParts.push(`${customSubject} ${subjectType} photo`);
  } else if (customSubject) {
    promptParts.push(`${customSubject} photo`);
  } else if (subjectType) {
    promptParts.push(`${subjectType} photo`);
  }
  
  if (location) {
    promptParts.push(`taken at ${location}`);
  }
  
  if (lighting) {
    promptParts.push(`with ${lighting}`);
  }
  
  if (cameraType) {
    promptParts.push(`using ${cameraType}`);
  }
  
  if (mistakes && mistakes !== 'none') {
    promptParts.push(`showing ${mistakes}`);
  }

  if (timePeriod && timePeriod !== 'none') {
    promptParts.push(`from ${timePeriod}`);
  }

  // Add amateur characteristics based on level
  promptParts.push(...getAmateurCharacteristics(amateurLevel));
  
  // Combine all parts into a final prompt
  const finalPrompt = promptParts.join(', ');
  
  // Set the generated prompt in the main prompt input
  document.getElementById('prompt').value = finalPrompt;
});

// Handle directory selection
document.getElementById('selectDir').addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('select-directory');
  if (result) {
    saveDirInput.value = result;
    if (rememberDirCheckbox.checked) {
      localStorage.setItem('lastDirectory', result);
    }
  }
});

// Handle remember directory checkbox change
rememberDirCheckbox.addEventListener('change', (e) => {
  if (!e.target.checked) {
    localStorage.removeItem('lastDirectory');
  } else if (saveDirInput.value) {
    localStorage.setItem('lastDirectory', saveDirInput.value);
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
  const model = document.getElementById('model').value;
  const auth = document.getElementById('auth').value;
  const saveDir = document.getElementById('saveDir').value;

  setLoading(true);
  updateStatus('Generating images...', 'info');

  try {
    const result = await ipcRenderer.invoke('generate-images', { 
      prompt, 
      count, 
      model, 
      auth,
      saveDir 
    });
    
    output.textContent = result;
    updateStatus('Images generated successfully!', 'success');

    // Clear previous images
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';

    // Parse the result to get image paths
    const imagePaths = result.split('\n')
      .filter(line => line.trim().startsWith('Saved:'))
      .map(line => line.split('Saved:')[1].trim());

    // Create image previews
    imagePaths.forEach(path => {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'image-preview';

      const img = document.createElement('img');
      img.src = `file://${path}`;
      img.alt = 'Generated image';

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'download-btn';
      downloadBtn.textContent = 'Download';
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = path.split('/').pop();
        link.click();
      };

      previewDiv.appendChild(img);
      previewDiv.appendChild(downloadBtn);
      imagePreview.appendChild(previewDiv);
    });
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
    updateStatus('Failed to generate images', 'error');
  } finally {
    setLoading(false);
  }
};

// Handle delete button click
document.getElementById('delete-button').addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent form submission
  updateStatus('Deleting images...', 'info');
  try {
    const result = await ipcRenderer.invoke('delete-all-images');
    if (result.success) {
      updateStatus(result.message, 'success');
      // Clear image previews if deletion was successful and output directory existed
      if (result.message !== 'Output directory does not exist.' && result.message !== 'Output directory is already empty.') {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';
      }
    } else {
      updateStatus(result.message, 'error');
    }
  } catch (error) {
    updateStatus(`Error deleting images: ${error.message}`, 'error');
  }
}); 