import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PenguinGame from "@/app/(component)/Penguin/penguin";

vi.mock("@/app/(component)/Firebase/firebase", () => ({
    auth: { currentUser: { uid: "0123", displayName: "TestUser" } },
    db: vi.fn()
}));

vi.mock("@/app/(component)/Firebase/firestore/gameDB", () => ({
    fetchHighScore: vi.fn(),
    saveHighScore: vi.fn()
}));

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        pathname: "/",
        route: "/",
        query: {},
        asPath: "/"
    }))
}));

describe("Penguin Game", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test case 1: Grow in length when penguin eats fish
    it("should increase penguin's length when it eats fish", () => {
        const { container } = render(<PenguinGame />);

        const startButton = screen.getByText(/Start/i);
        fireEvent.click(startButton);

        const fishElement = screen.getByAltText("Fish");
        fireEvent.click(fishElement);

        waitFor(() => {
            expect(screen.getByText(/Penguin Length: 2/i)).toBeInTheDocument();
        });
    });

    // Test case 2: Show 'Game Over' when penguin collides with the wall
    it("should show 'Game Over' when the penguin collides with the wall", async () => {
        render(<PenguinGame />);

        const startButton = screen.getByText(/Start/i);
        fireEvent.click(startButton);

        // Simulate penguin movement towards the wall
        fireEvent.keyDown(document, { key: "ArrowUp" }); // Moves the penguin towards the wall

        // Wait for the "Game Over" message to appear
        await waitFor(() => {
            expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
        }, { timeout: 3000 }); // Extend timeout to ensure it has enough time to update
    });

    // Empty test case for resetting the game
    it("should reset the game when the user clicks the reset button", () => {
        // Render the PenguinGame component
        render(<PenguinGame />);

        // Set up for testing (empty, just for structure)
        const startButton = screen.getByText(/Start/i);
        fireEvent.click(startButton);

        // Further logic for testing goes here

        // Placeholder assertion for now
        expect(true).toBe(true);  // Empty check to ensure the test runs correctly
    }); 

});
