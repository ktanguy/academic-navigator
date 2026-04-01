import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Auth from "../pages/Auth";
import { AuthContext } from "../contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Mock AuthContext values
const mockLogin = vi.fn(async () => ({ role: "student" }));
const mockRegister = vi.fn(async () => ({}));
const mockLogout = vi.fn(async () => {});

const renderAuth = (contextOverrides = {}) => {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        ...contextOverrides,
      }}
    >
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe("Auth Page", () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockRegister.mockClear();
    mockLogout.mockClear();
  });

  it("renders login form by default", () => {
    renderAuth();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("switches to signup form and validates required fields", async () => {
    renderAuth();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    // Submit without filling in anything — should show validation errors
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      // Either field validation or policy agreement error must appear
      const body = document.body.textContent ?? "";
      const hasValidationError =
        /name must be at least/i.test(body) ||
        /valid email/i.test(body) ||
        /password must be/i.test(body) ||
        /must agree/i.test(body) ||
        /privacy policy/i.test(body);
      expect(hasValidationError).toBe(true);
    });
  });

  it("calls login with valid credentials", async () => {
    renderAuth();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  // NOTE: Now that role selection is removed from signup, this test is valid and should check only name, email, and password.
  it("calls register with valid signup data", async () => {
    renderAuth();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    // Tick the Privacy Policy agreement checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "password123",
        name: "Jane Doe",
      });
    });
  });
});
