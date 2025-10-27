import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe("useAuth", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { name: "Test User" },
  };

  const mockSession = {
    user: mockUser,
    access_token: "mock-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AuthProvider initialization", () => {
    it("should initialize with loading state", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially loading should be true
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should load existing session on mount", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.loading).toBe(false);
      });
    });

    it("should set up auth state change listener", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  describe("signUp", () => {
    it("should sign up a new user", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        error: null,
        data: { user: mockUser },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123",
          "Test User",
        );
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            name: "Test User",
          },
        },
      });
      expect(signUpResult.error).toBeNull();
    });

    it("should return error on sign up failure", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const mockError = { message: "Email already exists" };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        error: mockError,
        data: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult: any;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123",
          "Test User",
        );
      });

      expect(signUpResult.error).toEqual(mockError);
    });

    it("should create user profile on SIGNED_IN event", async () => {
      const mockSubscription = { unsubscribe: jest.fn() };
      let authChangeCallback: any;

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          authChangeCallback = callback;
          return { data: { subscription: mockSubscription } };
        },
      );

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null });
      const mockInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
        insert: mockInsert,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await authChangeCallback("SIGNED_IN", mockSession);
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith("users");
        expect(mockInsert).toHaveBeenCalledWith([
          {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.user_metadata?.name || "",
            settings: {},
          },
        ]);
      });
    });
  });

  describe("signIn", () => {
    it("should sign in a user with email and password", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: null,
        data: { session: mockSession },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123",
        );
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(signInResult.error).toBeNull();
    });

    it("should return error on sign in failure", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const mockError = { message: "Invalid credentials" };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: mockError,
        data: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult: any;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "wrongpassword",
        );
      });

      expect(signInResult.error).toEqual(mockError);
    });
  });

  describe("signOut", () => {
    it("should sign out the current user", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockSubscription = { unsubscribe: jest.fn() };
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe("auth state changes", () => {
    it("should update user state on SIGNED_IN event", async () => {
      const mockSubscription = { unsubscribe: jest.fn() };
      let authChangeCallback: any;

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          authChangeCallback = callback;
          return { data: { subscription: mockSubscription } };
        },
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await authChangeCallback("SIGNED_IN", mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it("should clear user state on SIGNED_OUT event", async () => {
      const mockSubscription = { unsubscribe: jest.fn() };
      let authChangeCallback: any;

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          authChangeCallback = callback;
          return { data: { subscription: mockSubscription } };
        },
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await authChangeCallback("SIGNED_OUT", null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe("useAuth without provider", () => {
    it("should throw error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("should unsubscribe from auth changes on unmount", async () => {
      const mockSubscription = { unsubscribe: jest.fn() };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});

