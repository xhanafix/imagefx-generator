# ImageFX Generator

A modern desktop application for generating images using Google's ImageFX API. This application provides a user-friendly interface to create AI-generated images with various customization options.

![ImageFX Generator Screenshot](screenshot.png)

## Features

- 🎨 Modern dark-themed user interface
- 🖼️ Generate multiple images at once
- 📐 Customize aspect ratio
- 🎯 Choose from multiple AI models
- 📁 Save images to custom directories
- 🔄 Real-time generation status
- 🎯 Error handling and feedback

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xhanafix/imagefx-generator.git
cd imagefx-generator
```

2. Install dependencies:
```bash
npm install
```

3. Get your ImageFX authentication token:
   - Visit the [ImageFX page](https://imagefx.google/)
   - Open browser developer tools (F12)
   - Run this code in the console:
   ```javascript
   let script = document.querySelector("#__NEXT_DATA__");
   let obj = JSON.parse(script.textContent);
   let authToken = obj["props"]["pageProps"]["session"]["access_token"];
   window.prompt("Copy the auth token: ", authToken);
   ```
   - Create a `.auth` file in the project root and paste your token

## Usage

1. Start the application:
```bash
npm start
```

2. Fill in the form:
   - Enter your prompt
   - Select the number of images to generate
   - Choose aspect ratio
   - Select model
   - (Optional) Enter auth token
   - (Optional) Select save directory

3. Click "Generate Images" and wait for the results

## Configuration

The application supports various configuration options:

### Aspect Ratios
- Square
- Portrait
- Landscape
- Landscape 4:3
- Portrait 3:4

### Models
- IMAGEN_3 (default)
- IMAGEN_2
- IMAGEN_3_1
- IMAGEN_3_5
- And more...

## Development

To modify the application:

1. The main application logic is in `app.js`
2. The user interface is defined in `index.html`
3. The frontend logic is in `renderer.js`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google ImageFX API
- Electron.js
- All contributors and users of this project

## Disclaimer

This is an unofficial application and is not affiliated with Google. Use at your own risk.
