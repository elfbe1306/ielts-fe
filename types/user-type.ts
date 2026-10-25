import { CourseStatus } from "./course-type";

export type CreateStudentRequest = {
    fullName: string;
    email: string;
    phoneNumber: string;
    courseIds: string[];
}

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

export type CourseSummary = {
    id: string;
    name: string;
    status: CourseStatus;
};

export type Student = {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    courses: CourseSummary[];
}

export type StudentListResponse = {
    content: Student[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};