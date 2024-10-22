import { render, fireEvent, screen, act } from "@testing-library/react"; 
import Alphabet2048 from "../../src/app/(component)/Game_2048/game_2048";

// Mock Firebase and Next.js Router
vi.mock("@/app/(component)/Firebase/firebase", () => ({
  auth: { currentUser: { uid: "0123", displayName: "TestUser" } },
  db: vi.fn(),
}));

vi.mock("@/app/(component)/Firebase/firestore/gameDB", () => ({
  fetchHighScore: vi.fn(),
  saveHighScore: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/"
  })),
}));


//test case 1
it('should reset the score to 0 when the restart button is clicked', async () => {
    // Render the 2048 game component
    render(<Alphabet2048 />);

    // Click the "Start Game" button to transition into the game
    const startButton = screen.getByText(/Start Game/i);
    fireEvent.click(startButton);

    // Wait for the game to start and render the "Restart" button
    const restartButton = await screen.findByText(/Restart/i);

    // Simulate a move to change the score
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Click the restart button
    fireEvent.click(restartButton);

    // Check if the score has been reset to 0
    const scoreElement = screen.getByText(/Current Score: 0/i);
    expect(scoreElement).toBeInTheDocument();
});

//test case 2
it('should reset the grid to the initial state when the restart button is clicked', async () => {
    // Render the 2048 game component
    render(<Alphabet2048 />);

    // Click the "Start Game" button to transition into the game
    const startButton = screen.getByText(/Start Game/i);
    fireEvent.click(startButton);

    // Wait for the game to start and render the "Restart" button
    const restartButton = await screen.findByText(/Restart/i);

    // Simulate a move to change the grid
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Click the restart button
    fireEvent.click(restartButton);

    // Check that the grid is reset to the initial state (2 tiles should be initialized with 'A')
    const tiles = screen.getAllByText("A");
    expect(tiles.length).toBe(2);  // Expect exactly 2 'A' tiles after reset
  });

  //test case 3
  it('should display the correct game title when the game starts', () => {
    // Render the 2048 game component
    render(<Alphabet2048 />);

    // Check if the correct game title is displayed
    const titleElement = screen.getByText(/Alphabet 2048/i); 
    expect(titleElement).toBeInTheDocument();
});




