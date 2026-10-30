import { StudentCourse } from "@/types/course-type";
import React, { createContext, useContext } from "react";

const StudentCourseContext = createContext<StudentCourse | null>(null);

export function StudentCourseProvider({ course, children } : { course: StudentCourse; children: React.ReactNode }) {
    return (
        <StudentCourseContext.Provider value={course}>
            {children}
        </StudentCourseContext.Provider>
    );
}

export function useStudentCourse(): StudentCourse {
    const course = useContext(StudentCourseContext);
    if (!course) {
        throw new Error("useStudentCourse must be used within StudentCourseProvider");
    }
    return course;
}