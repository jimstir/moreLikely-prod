import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletModal from '../components/WalletModal';

// Mock the AppConfig to force the mock data state
jest.mock('@/morelikely.config', () => ({
  AppConfig: {
    useMockData: true,
  },
}));

describe('WalletModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnInitiateConnect = jest.fn();
  const mockOnDisconnect = jest.fn();

  beforeAll(() => {
    // Mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        on: jest.fn(),
        removeListener: jest.fn(),
        request: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Connect Wallet" state when no address is provided', () => {
    render(
      <WalletModal 
        isOpen={true} 
        onClose={mockOnClose} 
        address="" 
        onInitiateConnect={mockOnInitiateConnect} 
        onDisconnect={mockOnDisconnect} 
      />
    );

    // Should display the connection prompt
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText(/Connect your wallet to predict/i)).toBeInTheDocument();
    
    // Should display the connect button
    const connectButton = screen.getByRole('button', { name: /Connect with MetaMask/i });
    expect(connectButton).toBeInTheDocument();

    // Clicking it should trigger onInitiateConnect
    fireEvent.click(connectButton);
    expect(mockOnInitiateConnect).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders "Wallet Details" state with correct network and balance when address is provided', async () => {
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    
    render(
      <WalletModal 
        isOpen={true} 
        onClose={mockOnClose} 
        address={mockAddress} 
        onInitiateConnect={mockOnInitiateConnect} 
        onDisconnect={mockOnDisconnect} 
      />
    );

    // Should display the details header
    expect(screen.getByText('Wallet Details')).toBeInTheDocument();

    // Should display the address
    expect(screen.getByText(mockAddress)).toBeInTheDocument();

    // Since AppConfig.useMockData is true, we expect the mock network and balance to appear
    await waitFor(() => {
      expect(screen.getByText('Mock Network')).toBeInTheDocument();
      expect(screen.getByText('1.25 MOCK')).toBeInTheDocument();
    });

    // Should display the disconnect button
    const disconnectButton = screen.getByRole('button', { name: /Disconnect Wallet/i });
    expect(disconnectButton).toBeInTheDocument();

    // Clicking it should trigger onDisconnect
    fireEvent.click(disconnectButton);
    expect(mockOnDisconnect).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render anything if isOpen is false', () => {
    const { container } = render(
      <WalletModal 
        isOpen={false} 
        onClose={mockOnClose} 
        address="" 
        onInitiateConnect={mockOnInitiateConnect} 
        onDisconnect={mockOnDisconnect} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
