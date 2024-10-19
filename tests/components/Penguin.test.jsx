import { auth, db } from "@/app/(component)/Firebase/firebase";
import {
    fetchHighScore,
    saveHighScore
} from "@/app/(component)/Firebase/firestore/gameDB";
import PenguinGame from "@/app/(component)/Penguin/penguin";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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

describe("Penguin", () => {
    // clear all mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch and display the initial high score", async () => {
        fetchHighScore.mockResolvedValue(5);

        render(<PenguinGame />);

        // wait for the high score to be fetched and set
        expect(await screen.findByText(/Best Score: 5/i)).toBeInTheDocument();
    });

    it("should start the game when the 'Start' button is clicked", () => {
        render(<PenguinGame />);

        const startButton = screen.getByText(/Start/i);
        expect(startButton).toBeInTheDocument();

        fireEvent.click(startButton);

        const pauseButton = screen.getByText(/Pause/i);
        expect(pauseButton).toBeInTheDocument();
    });

    it("should resume the game when the 'Resume' button is clicked", async () => {
        render(<PenguinGame />);

        const startButton = screen.getByText(/Start/i);
        fireEvent.click(startButton);

        const pauseButton = screen.getByText(/Pause/i);
        fireEvent.click(pauseButton);

        const resumeButton = screen.getByText(/Resume/i);
        fireEvent.click(resumeButton);

        await waitFor(() => {
            expect(screen.getByText(/Pause/i)).toBeInTheDocument();
        });
    });
});
