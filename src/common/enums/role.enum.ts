// Roles from the TRD (section 7). Hardcoded for Week 1 per the "easy
// alternative" — swap for a DB-driven permissions table later without
// touching the guard/decorator API below.
export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  SCHOOL = 'SCHOOL',
}
