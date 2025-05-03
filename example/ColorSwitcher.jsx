import { atom, useAtom, createMemo } from '../src/index.js';

// Create a global atom for color state
export const colorAtom = atom('#333333');

// Helper function to generate random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const ColorSwitcher = () => {
  const [color, setColor] = useAtom(colorAtom);

  const boxStyle = createMemo(() => ({
    width: '100px',
    height: '100px',
    border: '2px solid #ccc',
    backgroundColor: color(),
    margin: '8px',
    transition: 'background-color 0.3s',
    borderRadius: '4px'
  }));

  const textStyle = createMemo(() => ({
    color: color(),
    transition: 'color 0.3s',
    fontSize: '16px',
    margin: '8px 0'
  }));

  const buttonStyle = createMemo(() => ({
    padding: '8px 16px',
    fontSize: '16px',
    margin: '8px',
    backgroundColor: color(),
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }));

  // Text is split to ensure only the color value is reactive
  return (
    <div>
      <div style={boxStyle} />
      <p style={textStyle}>
        Current Color: <span style={{ fontWeight: 'bold' }}>{color}</span>
      </p>
      <button
        onClick={() => setColor(getRandomColor())}
        style={buttonStyle}
      >
        Change Color
      </button>
    </div>
  );
};