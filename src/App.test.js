import { render, screen } from '@testing-library/react';
import App from './App';

test('renders JSON Formatter UI', () => {
  render(<App />);
  expect(screen.getByText(/JSON Formatter/)).toBeInTheDocument();
  expect(screen.getByLabelText('formatted-output')).toBeInTheDocument();
});
