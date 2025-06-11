// Mock Firebase auth and all named exports (must be before any imports that use it)
jest.mock('./firebase', () => ({
  auth: {
    currentUser: null,
  },
  onAuthStateChanged: jest.fn((...args) => () => {}),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Mock Nivo chart components to avoid ESM issues in Jest
jest.mock('@nivo/heatmap', () => ({ ResponsiveHeatMap: () => <div data-testid="mock-heatmap" /> }));
jest.mock('@nivo/line', () => ({ ResponsiveLine: () => <div data-testid="mock-line" /> }));
jest.mock('@nivo/pie', () => ({ ResponsivePie: () => <div data-testid="mock-pie" /> }));
jest.mock('@nivo/bar', () => ({ ResponsiveBar: () => <div data-testid="mock-bar" /> }));

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app without crashing', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Just test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
