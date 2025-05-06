console.log('Application is starting...');

// Function to check DOM loading
function checkDOMContent() {
  console.log('DOM Content:', document.body.innerHTML);
  console.log('Root element exists:', !!document.getElementById('root'));
  
  // Check if content is invisible due to CSS
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('Root element visibility:', window.getComputedStyle(rootElement).display);
    console.log('Root element dimensions:', rootElement.offsetWidth, 'x', rootElement.offsetHeight);
  }
}

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  checkDOMContent();
  
  // Try to detect any React rendering issues
  setTimeout(checkDOMContent, 1000);
});

// Check for global errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});
