import { Course } from "@/types/course-type";
import React, { createContext, useContext } from "react";

const TeacherCourseContext = createContext<Course | null>(null);

export function TeacherCourseProvider({ course, children } : { course: Course; children: React.ReactNode }) {
    return (
        <TeacherCourseContext.Provider value={course}>
            {children}
        </TeacherCourseContext.Provider>
    );
}

export function useTeacherCourse(): Course {
    const course = useContext(TeacherCourseContext);
    if (!course) {
        throw new Error("useTeacherCourse must be used within TeacherCourseProvider");
    }
    return course;
}