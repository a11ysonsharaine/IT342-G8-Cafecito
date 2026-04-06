import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login button', () => {
  render(<App />);
  expect(screen.getByText(/log in/i)).toBeInTheDocument();
});
