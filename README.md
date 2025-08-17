# 3D Hulk Interactive Portfolio

An interactive 3D portfolio website featuring the Hulk character with animations and project interactions.

## Features

- **3D Hulk Character**: Built with Three.js using basic geometry
- **Welcome Animation**: Hulk appears with a scaling entrance animation
- **Interactive Projects**: Click on project cards to trigger Hulk's smash animation
- **Responsive Design**: Works on desktop and mobile devices
- **Particle Effects**: Atmospheric particles and smash impact effects
- **Mouse Interaction**: Camera follows mouse movement for immersive experience

## Setup Instructions

1. **Clone or download** this project to your local machine
2. **Update project links** in `index.html`:
   - Replace `data-url` attributes in project cards with your actual project URLs
   - Customize project titles and descriptions

3. **Serve the files**:
   - Use a local server (required for Three.js to work properly)
   - Options:
     - Python: `python -m http.server 8000`
     - Node.js: `npx serve .`
     - VS Code: Use Live Server extension

4. **Open in browser**: Navigate to `http://localhost:8000`

## Customization

### Adding More Projects
Add new project cards in the `projects-container` div:
```html
<div class="project-card" data-url="your-project-url">
    <h3>Project Name</h3>
    <p>Project description</p>
</div>
```

### Styling
- Modify colors in the CSS variables
- Adjust animations timing and effects
- Change the background gradient

### 3D Model Enhancement
To use a real Hulk 3D model:
1. Find a Hulk 3D model (GLB/GLTF format)
2. Replace the `createHulk()` method with GLTFLoader
3. Add the model file to your project

## Technologies Used

- **Three.js**: 3D graphics and animations
- **HTML5/CSS3**: Structure and styling
- **Vanilla JavaScript**: Interactions and logic

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Tips

- The portfolio is optimized for modern browsers
- Uses hardware acceleration when available
- Particle count can be adjusted for lower-end devices

## License

Free to use and modify for personal portfolios.