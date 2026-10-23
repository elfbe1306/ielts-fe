export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export type User = {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    createdAt: string;
};

export type AuthTokens = {
    accessToken: string;
};

export type AuthResponse = AuthTokens & {
    user: User;
};