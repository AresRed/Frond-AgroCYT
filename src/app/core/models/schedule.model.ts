// NOTA: Las horas se manejan como string (Ej: "07:00:00") para el backend.

// -----------------------------------------------------------
// 1. Catálogo de Cargos (WorkPosition)
// Necesario para el componente PositionManagement
// -----------------------------------------------------------
export interface WorkPosition {
    id: number;
    name: string; // Nombre del cargo (Ej: Supervisor de Campo)
}

// -----------------------------------------------------------
// 2. Plantilla de Turno (WorkSchedule - Lo que se crea)
// Refleja la entidad WorkSchedule.java
// -----------------------------------------------------------
export interface WorkSchedule {
    id: number;
    name: string;
    startTime: string; // Ej: "07:00"
    endTime: string;   // Ej: "16:00"
    toleranceMinutes: number; // Ej: 15
}

// -----------------------------------------------------------
// 3. Asignación de Turno (EmployeeScheduleAssignmentDTO - Lo que se envía al POST)
// -----------------------------------------------------------
export interface EmployeeScheduleAssignmentDTO {
    employeeId: number;
    scheduleId: number; // ID del WorkSchedule seleccionado
    validFrom: string; // Fecha de inicio de vigencia (YYYY-MM-DD)
    validTo: string | null; // Fecha de fin de vigencia
    workingDays: string; // Cadena de días separados por comas (Ej: "LUN,MAR,MIE")
}

// -----------------------------------------------------------
// 4. Entidad de Horario de Empleado (EmployeeSchedule - Lo que se recibe en GET /me)
// -----------------------------------------------------------
export interface EmployeeSchedule {
    id: number;
    validFrom: string;
    validTo: string | null;
    workingDays: string;
    
    // Objeto anidado de la plantilla de turno
    workSchedule: WorkSchedule; 
}