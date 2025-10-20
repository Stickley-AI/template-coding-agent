// Placeholder for fastembed - minimal implementation
export const fastembed = {
  embed: async (text: string) => {
    // Simple hash-based embedding for demonstration
    // In production, this would use a real embedding model
    const hash = Array.from(text).reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    // Generate a simple vector
    const vector = new Array(384).fill(0).map((_, i) => {
      return Math.sin((hash + i) / 100);
    });
    
    return vector;
  }
};
