const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle directory selection
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// Handle image generation
ipcMain.handle('generate-images', async (event, args) => {
  const { prompt, count, model, aspectRatio, auth, saveDir } = args;
  const authToken = auth || fs.readFileSync('.auth', 'utf8').trim();

  // Create save directory if it doesn't exist
  if (saveDir && !fs.existsSync(saveDir)) {
    try {
      fs.mkdirSync(saveDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'aisandbox-pa.googleapis.com',
      path: '/v1:runImageFx',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    // Map aspect ratio to appropriate model
    let selectedModel = model;
    
    // Only apply aspect ratio mapping for base models that need it
    if (model === 'IMAGEN_3' && !model.includes('_PORTRAIT') && !model.includes('_LANDSCAPE')) {
      switch (aspectRatio) {
        case 'LANDSCAPE':
          selectedModel = 'IMAGEN_3_LANDSCAPE';
          break;
        case 'PORTRAIT':
          selectedModel = 'IMAGEN_3_PORTRAIT';
          break;
        case 'LANDSCAPE_FOUR_THREE':
          selectedModel = 'IMAGEN_3_LANDSCAPE_FOUR_THREE';
          break;
        case 'PORTRAIT_THREE_FOUR':
          selectedModel = 'IMAGEN_3_PORTRAIT_THREE_FOUR';
          break;
        // square is default for IMAGEN_3
      }
    } else if (model === 'IMAGEN_2' && !model.includes('_LANDSCAPE')) {
      switch (aspectRatio) {
        case 'LANDSCAPE':
          selectedModel = 'IMAGEN_2_LANDSCAPE';
          break;
        // square is default for IMAGEN_2
      }
    }
    // IMAGEN_4, IMAGEN_3_5, IMAGEN_3_1, and specific aspect ratio models use the base model with aspect ratio parameter

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (parsedData.error) {
            console.error('API Error Details:', JSON.stringify(parsedData.error, null, 2));
            reject(parsedData.error);
          } else {
            let msg = 'Success! Generated images:\n';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            parsedData.imagePanels.forEach((panel, panelIndex) => {
              panel.generatedImages.forEach((image, imageIndex) => {
                // Create unique filename with timestamp and random string
                const uniqueId = Math.random().toString(36).substring(2, 8);
                const imageName = `image-${timestamp}-${uniqueId}-${panelIndex + 1}-${imageIndex + 1}.png`;
                const imagePath = saveDir ? path.join(saveDir, imageName) : imageName;
                const imageData = image.encodedImage;
                fs.writeFileSync(imagePath, imageData, 'base64');
                msg += `Saved: ${imagePath}\n`;
              });
            });
            resolve(msg);
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          console.error('Raw response:', responseData);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    const data = {
      userInput: {
        candidatesCount: count || 2,
        prompts: [prompt],
        seed: null
      },
      clientContext: {
        sessionId: ";1740658431200",
        tool: "IMAGE_FX"
      },
      modelInput: {
        modelNameType: selectedModel
      },
      aspectRatio: `IMAGE_ASPECT_RATIO_${aspectRatio}`
    };

    console.log('Sending request with data:', JSON.stringify(data, null, 2));
    req.write(JSON.stringify(data));
    req.end();
  });
});

ipcMain.handle('delete-all-images', async () => {
  const options = {
    type: 'warning',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete all generated images in the output directory?',
  };

  const response = await dialog.showMessageBox(null, options);

  if (response.response === 0) { // 'Yes' button clicked
    const outputDir = path.join(__dirname, 'output');
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);

      if (files.length === 0) {
        return { success: true, message: 'Output directory is already empty.' };
      }

      try {
        files.forEach(file => {
          const filePath = path.join(outputDir, file);
          fs.unlinkSync(filePath);
        });
        return { success: true, message: `Successfully deleted ${files.length} image(s).` };
      } catch (error) {
        return { success: false, message: `Failed to delete images: ${error.message}` };
      }
    } else {
      return { success: true, message: 'Output directory does not exist.' };
    }
  } else {
    return { success: false, message: 'Deletion cancelled.' };
  }
}); 