export class CreateRoutineExerciseDto {
  exerciseId: string;
  sets: number;
  reps: number;
  order: number;
}

export class CreateRoutineDto {
  name: string;
  exercises: CreateRoutineExerciseDto[];
}
