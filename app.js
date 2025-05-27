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
  const { prompt, count, model, auth, saveDir } = args;
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
        modelNameType: model || "IMAGEN_3"
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (parsedData.error) {
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
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}); 