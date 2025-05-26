# ImageFX Generator

A desktop application for generating images with amateur photography characteristics using AI. Built with Electron and featuring an intuitive interface for creating authentic-looking photos.

## Features

- **Amateur Photo Prompt Generator**
  - Custom subject input
  - Multiple subject types (portrait, landscape, street, etc.)
  - Various locations and settings
  - Different lighting conditions
  - Multiple camera types
  - Common photography mistakes
  - Time period selection
  - Adjustable amateur level (subtle, moderate, extreme)

- **Image Generation**
  - Multiple aspect ratios
  - Various AI models
  - Batch generation (up to 8 images)
  - Image preview
  - Direct download capability
  - Remember last output directory

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

3. Start the application:
```bash
npm start
```

## Usage

1. **Generate Amateur Photos**
   - Enter a custom subject (optional)
   - Select or randomize subject type
   - Choose location, lighting, camera type, and other settings
   - Click "Generate Prompt" or "Random" for quick generation
   - Adjust amateur level as needed

2. **Image Generation Settings**
   - Set the number of images to generate (1-8)
   - Choose aspect ratio
   - Select AI model
   - Set output directory
   - Enter auth token if required

3. **View and Download**
   - Generated images appear in the preview section
   - Hover over images to show download button
   - Click download to save individual images

## Configuration

- **Auth Token**: Optional authentication token for the AI service
- **Output Directory**: Set default save location for generated images
- **Remember Directory**: Toggle to remember last used output directory

## Development

Built with:
- Electron
- HTML/CSS/JavaScript
- Node.js

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
