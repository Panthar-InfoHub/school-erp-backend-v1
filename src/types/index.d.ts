
export interface subject {
    name: string,
    code: string,
    theoryExam: boolean,
    practicalExam: boolean,
}

export interface subjectResult extends subject {
    obtainedMarksTheory: number | null,
    obtainedMarksPractical: number | null,
    totalMarksTheory: number | null,
    totalMarksPractical: number | null,
    totalMarks: number | null,
}

export interface identityEntry {
    idDocName:string,
    idDocValue:string
}