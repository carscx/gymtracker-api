// src/common/data/base-routines.data.ts

export const BASE_ROUTINES = [
  {
    name: 'Día 1 - Espalda, Bíceps y Abdominales',
    exercises: [
      {
        name: 'Jalón al pecho',
        description: 'Espalda, polea alta',
        sets: 4,
        reps: 15,
      },
      {
        name: 'Remo sentado',
        description: 'Espalda, polea baja',
        sets: 4,
        reps: 15,
      },
      {
        name: 'Serrucho',
        description: 'Dorsal con mancuerna',
        sets: 3,
        reps: 12,
      }, // La hoja dice 12/12
      {
        name: 'Curl c/soga',
        description: 'Bíceps en polea',
        sets: 3,
        reps: 12,
      },
      {
        name: 'Banco Scott',
        description: 'Bíceps concentrado',
        sets: 3,
        reps: 12,
      },
      {
        name: 'Cortitos',
        description: 'Abdominales crunch',
        sets: 3,
        reps: 15,
      },
    ],
  },
  {
    name: 'Día 2 - Piernas',
    exercises: [
      {
        name: 'Sillón Cuádriceps',
        description: 'Extensión de piernas',
        sets: 4,
        reps: 15,
      },
      {
        name: 'Camilla Femoral',
        description: 'Flexión de piernas acostado',
        sets: 4,
        reps: 15,
      },
      { name: 'Curl Femoral', description: 'Isquiosurales', sets: 4, reps: 15 },
      {
        name: 'Gemelos',
        description: 'Elevación de talones',
        sets: 4,
        reps: 15,
      },
      {
        name: 'Ad/Abducción',
        description: 'Máquina de aductores/abductores',
        sets: 3,
        reps: 12,
      }, // La hoja dice 12/12
      {
        name: 'Plancha',
        description: 'Isométrico abdominal',
        sets: 4,
        reps: 0,
      }, // 0 reps = tiempo
    ],
  },
  {
    name: 'Día 3 - Pecho, Hombros y Tríceps',
    exercises: [
      {
        name: 'Chest Press',
        description: 'Prensa de pecho',
        sets: 4,
        reps: 15,
      },
      {
        name: 'Peck Fly',
        description: 'Aperturas en máquina',
        sets: 4,
        reps: 15,
      },
      {
        name: 'V. Lateral',
        description: 'Vuelos laterales hombros',
        sets: 3,
        reps: 10,
      },
      {
        name: 'V. Frontal',
        description: 'Vuelos frontales hombros',
        sets: 3,
        reps: 10,
      },
      {
        name: 'Extensión c/soga',
        description: 'Tríceps en polea',
        sets: 3,
        reps: 10,
      },
      { name: 'Copa', description: 'Tríceps con mancuerna', sets: 3, reps: 10 },
      {
        name: 'Twist Ruso',
        description: 'Oblicuos con giro',
        sets: 3,
        reps: 10,
      },
    ],
  },
];
