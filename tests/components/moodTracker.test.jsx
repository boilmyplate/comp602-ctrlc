import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MoodTracker from "../../src/app/(component)/MoodTracker/MoodTracker";

// Mock Firebase and Firestore
vi.mock('@/app/(component)/Firebase/firebase', () => ({
  auth: {
    currentUser: { uid: '0123', displayName: 'TestUser' },
    onAuthStateChanged: vi.fn((callback) => callback({ uid: '0123', displayName: 'TestUser' })),
  },
}));

// Mock useRouter from next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    query: {},
    route: '/mock-route',
  }),
}));

test('should display past 7 days mood history after clicking the Show Insights button', async () => {
  // Render the MoodTracker component
  render(<MoodTracker />);

  // Simulate clicking the "Show Insights" button
  fireEvent.click(screen.getByText('Show Insights'));

  // Select "Last 7 Days" from the dropdown
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Last 7 Days' } });

  // Wait for mood history to appear and verify the moods are displayed for the last 7 days
  await waitFor(() => {
    expect(screen.getByText(/Happy/i)).toBeInTheDocument();  // Verify the 'Happy' entry is displayed
    expect(screen.getByText(/Sad/i)).toBeInTheDocument();    // Verify the 'Sad' entry is displayed
  });
});

test('should allow the user to select a mood and display it on the screen', async () => {
  // Render the MoodTracker component
  render(<MoodTracker />);

  // Select and click the "Happy" mood option
  fireEvent.click(screen.getByText('Happy'));

  // Click the "Show Insights" button to display mood history
  fireEvent.click(screen.getByText('Show Insights'));

  // Use waitFor to check both selected mood display and mood history
  await waitFor(() => {
    // Verify "You are feeling: Happy" and at least one "Happy" in history
    expect(screen.getByText(/You are feeling: Happy/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Happy/i).length).toBeGreaterThan(0);
  });
});
test('should display past 30 days mood history after clicking the Show Insights button', async () => {
  // Render the MoodTracker component
  render(<MoodTracker />);

  // Simulate clicking the "Show Insights" button
  fireEvent.click(screen.getByText('Show Insights'));

  // Select "Last 30 Days" from the dropdown
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Last 30 Days' } });

  // Wait for mood history to appear and verify the moods are displayed for the last 30 days
  await waitFor(() => {
    expect(screen.getByText(/Happy/i)).toBeInTheDocument();  // Verify the 'Happy' entry is displayed
    expect(screen.getByText(/Sad/i)).toBeInTheDocument();    // Verify the 'Sad' entry is displayed
  });
});
test('should display all-time mood history after clicking the Show Insights button', async () => {
  // Render the MoodTracker component
  render(<MoodTracker />);

  // Simulate clicking the "Show Insights" button
  fireEvent.click(screen.getByText('Show Insights'));

  // Select "All Time" from the dropdown
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'All Time' } });

  // Wait for mood history to appear and verify the moods are displayed for all time
  await waitFor(() => {
    expect(screen.getByText(/Happy/i)).toBeInTheDocument();  // Verify the 'Happy' entry is displayed
    expect(screen.getByText(/Sad/i)).toBeInTheDocument();    // Verify the 'Sad' entry is displayed
    expect(screen.getByText(/Neutral/i)).toBeInTheDocument(); // Verify the 'Neutral' entry is displayed
  });
});
