# ImageFX Generator

A desktop application for generating images using Google's ImageFX API.

## Features

- Generate images using various Imagen models
- Support for multiple aspect ratios
- Save generated images to a specified directory
- Simple and intuitive user interface

## Available Models

- **Imagen 4** (IMAGEN_4)
- **Imagen 3.5** (IMAGEN_3_5)
- **Imagen 3.1** (IMAGEN_3_1)
- **Imagen 3** (IMAGEN_3)
  - IMAGEN_3_PORTRAIT
  - IMAGEN_3_LANDSCAPE
  - IMAGEN_3_PORTRAIT_THREE_FOUR
  - IMAGEN_3_LANDSCAPE_FOUR_THREE
- **Imagen 2** (IMAGEN_2)
  - IMAGEN_2_LANDSCAPE

## Aspect Ratios

- **Square** (1:1)
- **Portrait** (9:16)
- **Landscape** (16:9)
- **Portrait** (3:4)
- **Landscape** (4:3)
- **Unspecified**

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.auth` file in the root directory and add your ImageFX API token

## Usage

1. Start the application:
```bash
npm start
```

2. Enter your prompt in the text field
3. Select the desired model and aspect ratio
4. Choose the number of images to generate (4-8)
5. Click "Generate" to create images

## Settings

- **Auth Token**: Your ImageFX API token
- **Default Count**: Number of images to generate (default: 4)
- **Save Directory**: Where to save generated images

## Notes

- Different models support different aspect ratios
- IMAGEN_3 and IMAGEN_2 have specific model variants for different aspect ratios
- IMAGEN_4, IMAGEN_3_5, and IMAGEN_3_1 use the aspect ratio parameter for different ratios
- Generated images are saved with unique timestamps and random identifiers

## License

MIT License

## Configuration

- **Auth Token**: Required authentication token for the AI service. You can obtain it using one of these methods:

  1. **Chrome Extension Method**:
     - Install the ImageFX Token Chrome extension
     - Visit the ImageFX website
     - The extension will automatically extract and display your token

  2. **Manual Method**:
     - Visit the ImageFX website
     - Open Developer Tools (F12 or right-click > Inspect)
     - In the Console tab, paste the following code:
     ```javascript
     let script = document.querySelector("#__NEXT_DATA__");
     let obj = JSON.parse(script.textContent);
     let authToken = obj["props"]["pageProps"]["session"]["access_token"];
     window.prompt("Copy the auth token: ", authToken);
     ```
     - Copy the token from the prompt dialog

  3. **Saving the Token**:
     - Launch the ImageFX Generator application
     - Go to Settings or Configuration section
     - Paste your token in the "Auth Token" field
     - Click "Save" or "Apply" to store the token
     - The token will be securely saved for future use

  4. **Using .auth File Method**:
     - Create a file named `.auth` in the application's root directory
     - Open the file in a text editor
     - Paste your token as a single line
     - Save the file
     - The application will automatically read the token from this file on startup

- **Output Directory**: Set default save location for generated images
- **Remember Directory**: Toggle to remember last used output directory

## Development

Built with:
- Electron
- HTML/CSS/JavaScript
- Node.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Inspired by amateur photography aesthetics
- Built for creating authentic-looking photos
- Special thanks to the Electron and AI communities
