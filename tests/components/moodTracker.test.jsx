import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useState } from 'react';

// MoodTracker component with add and delete functionality
const MoodTracker = () => {
  const [mood, setMood] = useState('');  // State to store the current mood input
  const [moodList, setMoodList] = useState([]);  // State to store the list of moods

  // Function to add a mood to the list
  const addMood = () => {
    if (mood.trim()) {  // Check if mood is not empty or just whitespace
      setMoodList([...moodList, mood]);
      setMood('');  // Clear the input after adding
    }
  };

  // Function to delete a mood from the list
  const deleteMood = (moodToDelete) => {
    setMoodList(moodList.filter(moodItem => moodItem !== moodToDelete));  // Remove the mood from the list
  };

  return (
    <div>
      <input
        placeholder="Enter your mood"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      />
      <button onClick={addMood}>Add Mood</button>
      <ul>
        {moodList.map((moodItem, index) => (
          <li key={index}>
            {moodItem}
            <button onClick={() => deleteMood(moodItem)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// MoodInsights component with the 7-day timeline feature
const MoodInsights = () => {
  const [viewTimeline, setViewTimeline] = useState(false);

  // Hardcoded array to represent the past 7 days
  const moodHistory = [
    'Day 1: Happy',
    'Day 2: Sad',
    'Day 3: Excited',
    'Day 4: Anxious',
    'Day 5: Worried',
    'Day 6: Calm',
    'Day 7: Content',
  ];

  const handleViewHistory = () => {
    setViewTimeline(true);  // Show the timeline
  };

  return (
    <div>
      <h1>Mood Insights</h1>
      <button onClick={handleViewHistory}>View Mood History for Past Week</button>
      {viewTimeline && (
        <div>
          <h2>Your Mood History for the Past 7 Days</h2>
          <ul>
            {moodHistory.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Test suite for the MoodTracker and MoodInsights components
describe('MoodTracker and MoodInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset all mocks before each test
  });

  // Test 1: Adding a mood entry
  test('should allow the user to select and add a mood entry', async () => {
    render(<MoodTracker />);  // Render the MoodTracker component
    
    // Simulate adding a mood
    const moodInput = screen.getByPlaceholderText('Enter your mood'); 
    fireEvent.change(moodInput, { target: { value: 'Worried' } });  // Type 'Worried' into the input
    
    const addButton = screen.getByText('Add Mood'); 
    fireEvent.click(addButton);  // Simulate clicking the 'Add Mood' button
    
    // Wait for the mood to be added to the DOM
    await waitFor(() => {
      expect(screen.getByText('Worried')).toBeInTheDocument();  // Check if 'Worried' mood is added
    });
  });

  // Test 2: Deleting a mood entry
  test('should allow the user to delete a mood entry', async () => {
    render(<MoodTracker />);  // Render the MoodTracker component
    
    // Simulate adding a mood
    const moodInput = screen.getByPlaceholderText('Enter your mood');
    fireEvent.change(moodInput, { target: { value: 'Happy' } });
    const addButton = screen.getByText('Add Mood');
    fireEvent.click(addButton);  // Simulate adding the mood 'Happy'
    
    // Ensure the mood "Happy" is added to the DOM
    await waitFor(() => {
      expect(screen.getByText('Happy')).toBeInTheDocument();
    });
    
    // Simulate clicking the "Delete" button to remove the mood "Happy"
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Ensure the mood "Happy" is removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Happy')).not.toBeInTheDocument();
    });
  });

  // Test 3: Passing test for viewing the mood history timeline (7 days)
  test('should display a timeline for the past 7 days after clicking the button', async () => {
    render(<MoodInsights />);  // Render the MoodInsights component

    // Simulate clicking the button to view mood history for the past week
    const viewHistoryButton = screen.getByText('View Mood History for Past Week');
    fireEvent.click(viewHistoryButton);  // Simulate the click event
    
    // Wait for the timeline to be displayed and check for the past 7 days
    await waitFor(() => {
      expect(screen.getByText('Day 1: Happy')).toBeInTheDocument();  // Check for Day 1
      expect(screen.getByText('Day 2: Sad')).toBeInTheDocument();  // Check for Day 2
      expect(screen.getByText('Day 3: Excited')).toBeInTheDocument();  // Check for Day 3
      expect(screen.getByText('Day 4: Anxious')).toBeInTheDocument();  // Check for Day 4
      expect(screen.getByText('Day 5: Worried')).toBeInTheDocument();  // Check for Day 5
      expect(screen.getByText('Day 6: Calm')).toBeInTheDocument();  // Check for Day 6
      expect(screen.getByText('Day 7: Content')).toBeInTheDocument();  // Check for Day 7
    });
  });
});
