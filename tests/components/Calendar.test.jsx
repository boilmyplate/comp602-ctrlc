import { it, expect, describe, vi } from "vitest"; 
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Calendar from "@/app/(component)/Calendar/calendar";
import { deleteEvent, editEvent } from "@/app/(component)/Firebase/firestore/calendarDB"; 

// Mock Firebase and Firestore functions
vi.mock("@/app/(component)/Firebase/firebase", () => ({
  auth: { currentUser: { uid: "0123" } },
}));

vi.mock("@/app/(component)/Firebase/firestore/calendarDB", () => ({
  fetchEvents: vi.fn(() => Promise.resolve([
    { id: "1", title: "Meeting", start: "2024-10-20T10:00", end: "2024-10-20T11:00" }
  ])),
  addEvent: vi.fn(() => Promise.resolve([
    { title: "Meeting", start: "2024-10-20T10:00", end: "2024-10-20T11:00" }
  ])),
  deleteEvent: vi.fn(() => Promise.resolve()),

  editEvent: vi.fn(() => Promise.resolve([
    { title: "Meeting", start: "2024-10-20T10:00", end: "2024-10-20T11:00" }
  ])),
}));

describe('Calendar', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the window.confirm dialog to always return true
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });
  
  afterEach(() => {
    // Restore the original confirm function after each test
    window.confirm.mockRestore();
  });

  it('should allow user to add an event', async () => {
    render(<Calendar />);
    
    // Simulate adding an event
    const titleInput = screen.getByPlaceholderText('Event Title');
    const startTimeInput = screen.getByPlaceholderText('Start Time');
    const endTimeInput = screen.getByPlaceholderText('End Time');
    const addButton = screen.getByText('Add Event');

    fireEvent.change(titleInput, { target: { value: 'Meeting' } });
    fireEvent.change(startTimeInput, { target: { value: '2024-10-20T10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '2024-10-20T11:00' } });
    
    fireEvent.click(addButton);

    // Check that the event is added
    await waitFor(() => {
      expect(screen.queryByText("Meeting")).toBeInTheDocument();
    });
  });

  it('should allow user to delete an event', async () => {
    render(<Calendar />);

    // Wait for the mocked event to appear
    await waitFor(() => {
      expect(screen.queryByText("Meeting")).toBeInTheDocument();
    });

    // Simulate clicking the event to select it
    const event = screen.getByText("Meeting");
    fireEvent.click(event);

    // Simulate clicking the delete button
    const deleteButton = screen.getByText('Delete Event');
    fireEvent.click(deleteButton);

    // Confirm that the deleteEvent mock function was called
    await waitFor(() => {
      expect(deleteEvent).toHaveBeenCalledTimes(1);
    });

    // Ensure the event is removed from the document after deletion
    await waitFor(() => {
      expect(screen.queryByText("Meeting")).not.toBeInTheDocument();
    });
  });

  it("should allow user to edit an event", async () => {
    render(<Calendar />);

    // Wait for the mocked event to appear
    await waitFor(() => {
      expect(screen.queryByText("Meeting")).toBeInTheDocument();
    });

    // Simulate clicking the event to select it
    const event = screen.getByText("Meeting");
    fireEvent.click(event);

    // Ensure the form is displayed after clicking the event
    expect(screen.getByPlaceholderText('New Event Title')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('New Event Title');
    const startTimeInput = screen.getByPlaceholderText('New Start Time');
    const endTimeInput = screen.getByPlaceholderText('New End Time');
    const saveButton = screen.getByText('Save Changes'); 

    fireEvent.change(titleInput, { target: { value: 'Change Event' } });
    fireEvent.change(startTimeInput, { target: { value: '2024-10-22T10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '2024-10-22T11:00' } });
    
    fireEvent.click(saveButton);

    // Ensure the editEvent mock function was called
    await waitFor(() => {
      expect(editEvent).toHaveBeenCalledTimes(1);
    });

    // Check if the event's new title is displayed
    expect(screen.queryByText("Change Event")).toBeInTheDocument();
});

  
});
