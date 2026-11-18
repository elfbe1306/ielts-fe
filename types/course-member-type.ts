import { User } from "./auth-type";

export type CourseMemberRole = "TEACHER" | "ASSISTANT" | "STUDENT";

export type AssignableCourseRole = Exclude<CourseMemberRole, "TEACHER">;

export type CourseMember = Pick<User, "id" | "fullName" | "email"> & {
    role: CourseMemberRole;
};

export type AddCourseMemberRequest = {
    userId: string;
    courseRole: AssignableCourseRole;
}

export type UpdateCourseMemberRequest = {
    courseRole: AssignableCourseRole;
}