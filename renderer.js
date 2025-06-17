const { ipcRenderer } = require('electron');

// Get DOM elements
const form = document.getElementById('genForm');
const generateBtn = document.getElementById('generate-button');
const loading = document.getElementById('loading');
const output = document.getElementById('output');
const status = loading.querySelector('.status');
const rememberDirCheckbox = document.getElementById('rememberDir');
const saveDirInput = document.getElementById('saveDir');
const authInput = document.getElementById('auth');

// Load saved directory and auth token on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedDir = localStorage.getItem('lastDirectory');
  if (savedDir) {
    saveDirInput.value = savedDir;
  }
  
  const savedToken = localStorage.getItem('authToken');
  if (savedToken) {
    authInput.value = savedToken;
  }
});

// Save auth token when it changes
authInput.addEventListener('change', (e) => {
  const token = e.target.value.trim();
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
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
  const pose = document.getElementById('pose');
  const timePeriod = document.getElementById('timePeriod');

  // Always randomly select subject type
  subjectType.value = getRandomOption(subjectType);
  
  // Randomly select other options
  location.value = getRandomOption(location);
  lighting.value = getRandomOption(lighting);
  cameraType.value = getRandomOption(cameraType);
  pose.value = getRandomOption(pose);
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
  const pose = document.getElementById('pose').value;
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

  if (pose && pose !== 'none') {
    promptParts.push(`in ${pose} pose`);
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
  const aspectRatio = document.getElementById('aspectRatio').value;
  const auth = document.getElementById('auth').value;
  const saveDir = document.getElementById('saveDir').value;

  setLoading(true);
  updateStatus('Generating images...', 'info');

  try {
    const result = await ipcRenderer.invoke('generate-images', { 
      prompt, 
      count, 
      model,
      aspectRatio,
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

    // Store the image paths for lightbox
    generatedImages = imagePaths;

    // Create image previews
    imagePaths.forEach((path, index) => {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'image-preview';

      const img = document.createElement('img');
      img.src = `file://${path}`;
      img.alt = 'Generated image';

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'download-btn';
      downloadBtn.textContent = 'Download';
      downloadBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent lightbox from opening when clicking download
        const link = document.createElement('a');
        link.href = img.src;
        link.download = path.split('/').pop();
        link.click();
      };

      previewDiv.appendChild(img);
      previewDiv.appendChild(downloadBtn);

      // Add click event to open lightbox
      previewDiv.addEventListener('click', () => {
        showLightbox(index);
      });

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

// Lightbox functionality
let currentImageIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const closeLightbox = document.querySelector('.close-lightbox');
const prevButton = document.querySelector('.lightbox-nav.prev');
const nextButton = document.querySelector('.lightbox-nav.next');
let generatedImages = [];

// Function to update the lightbox image
function updateLightboxImage(index) {
  if (generatedImages.length === 0) return;
  
  currentImageIndex = index;
  lightboxImage.src = generatedImages[currentImageIndex];
  
  // Update navigation buttons
  prevButton.style.display = currentImageIndex === 0 ? 'none' : 'block';
  nextButton.style.display = currentImageIndex === generatedImages.length - 1 ? 'none' : 'block';
}

// Function to show lightbox
function showLightbox(index) {
  updateLightboxImage(index);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
}

// Function to hide lightbox
function hideLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

// Event listeners for lightbox
closeLightbox.addEventListener('click', hideLightbox);
prevButton.addEventListener('click', () => {
  if (currentImageIndex > 0) {
    updateLightboxImage(currentImageIndex - 1);
  }
});
nextButton.addEventListener('click', () => {
  if (currentImageIndex < generatedImages.length - 1) {
    updateLightboxImage(currentImageIndex + 1);
  }
});

// Close lightbox when clicking outside the image
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    hideLightbox();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  
  switch (e.key) {
    case 'Escape':
      hideLightbox();
      break;
    case 'ArrowLeft':
      if (currentImageIndex > 0) {
        updateLightboxImage(currentImageIndex - 1);
      }
      break;
    case 'ArrowRight':
      if (currentImageIndex < generatedImages.length - 1) {
        updateLightboxImage(currentImageIndex + 1);
      }
      break;
  }
});

// Modify the image preview creation to include lightbox functionality
function createImagePreview(imagePath) {
  const preview = document.createElement('div');
  preview.className = 'image-preview';
  
  const img = document.createElement('img');
  img.src = imagePath;
  img.alt = 'Generated image';
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'download-btn';
  downloadBtn.textContent = 'Download';
  downloadBtn.onclick = (e) => {
    e.stopPropagation(); // Prevent lightbox from opening when clicking download
    // Your existing download logic here
  };
  
  preview.appendChild(img);
  preview.appendChild(downloadBtn);
  
  // Add click event to open lightbox
  preview.addEventListener('click', () => {
    const index = generatedImages.indexOf(imagePath);
    if (index !== -1) {
      showLightbox(index);
    }
  });
  
  return preview;
}

// Modify your existing image generation code to store the image paths
// Add this where you handle the generated images:
function handleGeneratedImages(images) {
  generatedImages = images; // Store the array of image paths
  const imagePreview = document.getElementById('imagePreview');
  imagePreview.innerHTML = '';
  
  images.forEach(imagePath => {
    const preview = createImagePreview(imagePath);
    imagePreview.appendChild(preview);
  });
} 