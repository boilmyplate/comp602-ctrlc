import { render } from "@testing-library/react";
import Chat from "@/app/(component)/Chatbot/chatbot";

// Mock Firebase if necessary
vi.mock("@/app/(component)/Firebase/firebase", () => ({
  auth: { currentUser: { uid: "0123", displayName: "TestUser" } },
  db: vi.fn(),
}));

//test case 1
it('should display the first message asking the user’s name', async () => {
    render(<Chat />);
    await waitFor(() => expect(screen.getByText(/What is your name?/i)).toBeInTheDocument());
});

//test case2
it('should respond to FAQ about BlankWeb', async () => {
    render(<Chat />);

    // Simulate user selecting "FAQs About BlankWeb"
    fireEvent.click(screen.getByText(/FAQs About BlankWeb/i));

    // Simulate user selecting the FAQ "What is BlankWeb?"
    fireEvent.click(screen.getByText(/What is BlankWeb/i));

    // Wait for the response from the chatbot
    await waitFor(() => expect(screen.getByText(/BlankWeb is a platform/i)).toBeInTheDocument());
});

//test case 3
it('should allow the user to ask a question and get a response', async () => {
    render(<Chat />);

    // Simulate user clicking "Ask A Question"
    fireEvent.click(screen.getByText(/Ask A Question/i));

    // Simulate user typing a custom question
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'What is BlankWeb?' } });

    // Simulate user submitting the question
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the response from the chatbot
    await waitFor(() => expect(screen.getByText(/BlankWeb is a platform/i)).toBeInTheDocument());
});
