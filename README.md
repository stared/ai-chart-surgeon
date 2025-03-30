# Chart Roast 🔥

Chart Roast is a playful web application that uses Anthropic's AI to analyze and "roast" your data visualizations. Upload your chart and get instant feedback on:

- Chart type identification
- General feedback on structure and clarity
- Aesthetics feedback
- Accessibility suggestions
- A tongue-in-cheek "roast" of your chart
- Data extraction from the image
- A suggested remake using Observable Plot

## Features

- Drag and drop file upload for charts and visualizations
- Instant AI analysis via Anthropic (simulated in this demo)
- Side-by-side comparison of original and remade charts
- Detailed feedback across multiple categories

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn dev
   ```
4. Open your browser to the URL shown in the terminal

## Implementation Notes

This is a proof of concept that shows how AI can be used to analyze and improve data visualizations. In a production version:

- The Anthropic API would be integrated with proper authentication
- The Observable Plot library would be used to render the improved chart
- Additional options for customizing the suggested improvements would be available

## Technology Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
