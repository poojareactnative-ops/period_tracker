export const lightTheme = {
  primary: '#F8BBD0', // Soft Pink
  secondary: '#E1BEE7', // Lavender
  accent: '#F48FB1', // Stronger Pink
  background: '#FFFFFF',
  surface: '#FFF9FB',
  text: {
    primary: '#2D3436',
    secondary: '#636E72',
    light: '#B2BEC3',
    white: '#FFFFFF',
  },
  border: '#F1F2F6',
  error: '#FF7675',
  success: '#55E6C1',
  period: '#F06292',
  ovulation: '#BA68C8',
  fertile: '#F8BBD0',
  gradients: {
    pink: ['#F8BBD0', '#E1BEE7'],
    lavender: ['#E1BEE7', '#F8BBD0'],
    soft: ['#FFFFFF', '#FFF0F5'],
  }
};

export const darkTheme = {
  primary: '#C2185B', // Darker Pink
  secondary: '#9C27B0', // Darker Lavender
  accent: '#E91E63', // Vibrant Pink for dark mode
  background: '#121212',
  surface: '#1E1E1E',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    light: '#707070',
    white: '#FFFFFF',
  },
  border: '#2D2D2D',
  error: '#CF6679',
  success: '#69F0AE',
  period: '#FF6E9E',
  ovulation: '#CE93D8',
  fertile: '#E91E63',
  gradients: {
    pink: ['#C2185B', '#880E4F'],
    lavender: ['#9C27B0', '#6A1B9A'],
    soft: ['#121212', '#1E1E1E'],
  }
};

// For backward compatibility
export const colors = lightTheme;
