
import { MaintenanceUnit, Status, Tool, WarehouseItem } from './types';

export const INITIAL_TOOLS: Tool[] = [
  // Add orgId: '' to satisfy TypeScript interface requirements
  { id: 't1', orgId: '', name: 'Taladro Percutor Makita', status: 'AVAILABLE', image: 'https://picsum.photos/id/1/200/200' },
  { id: 't2', orgId: '', name: 'Escalera Tijera 3m', status: 'IN_USE', assignedTo: 'Carlos Pérez', assignedDate: '2023-10-27', image: 'https://picsum.photos/id/2/200/200' },
  { id: 't3', orgId: '', name: 'Kit Destornilladores', status: 'AVAILABLE', image: 'https://picsum.photos/id/3/200/200' },
  { id: 't4', orgId: '', name: 'Pulidora Industrial', status: 'BROKEN', image: 'https://picsum.photos/id/4/200/200' }
];

export const INITIAL_WAREHOUSE: WarehouseItem[] = [
  // Add orgId: '' to satisfy TypeScript interface requirements
  { id: 'w1', orgId: '', name: 'Pintura Blanca Tipo 1', category: 'Pintura', quantity: 5, unit: 'Galón' },
  { id: 'w2', orgId: '', name: 'Bombillo LED 12W', category: 'Eléctrico', quantity: 24, unit: 'Unidad' },
  { id: 'w3', orgId: '', name: 'Cinta Aislante', category: 'Eléctrico', quantity: 10, unit: 'Rollo' },
  { id: 'w4', orgId: '', name: 'Tubo PVC 1/2"', category: 'Plomería', quantity: 8, unit: 'Tubo' }
];

export const INITIAL_UNITS: MaintenanceUnit[] = [
  {
    id: '1',
    orgId: '', // Add missing orgId
    campus: 'Sede Principal',
    name: 'Salón 3B - Matemáticas',
    type: 'Aula',
    description: 'El aire acondicionado presenta goteo leve. Las sillas están en buen estado general.',
    status: Status.PREVENTION, // Orange
    images: [
      'https://picsum.photos/id/1/800/800',
      'https://picsum.photos/id/180/800/800',
      'https://picsum.photos/id/20/800/800'
    ],
    inventory: [
      { id: 'i1', name: 'Sillas Estudiantes', quantity: 35, condition: 'Good' },
      { id: 'i2', name: 'Escritorio Profesor', quantity: 1, condition: 'Fair' },
      { id: 'i3', name: 'Aire Acondicionado', quantity: 2, condition: 'Fair' },
      { id: 'i4', name: 'Tablero Acrílico', quantity: 1, condition: 'Good' }
    ],
    requests: [
      { id: 'r1', item: 'Filtro Aire Acondicionado', quantity: 2, estimatedCost: 50000, approved: false, date: '2023-10-25' }
    ],
    lastUpdated: '2023-10-25'
  },
  {
    id: '2',
    orgId: '', // Add missing orgId
    campus: 'Sede Principal',
    name: 'Laboratorio de Química',
    type: 'Laboratorio',
    description: 'Todo operativo. Se realizó limpieza profunda de mesones la semana pasada.',
    status: Status.OPERATIVE, // Blue
    images: [
      'https://picsum.photos/id/2/800/800',
      'https://picsum.photos/id/250/800/800'
    ],
    inventory: [
      { id: 'i1', name: 'Mesas de Trabajo', quantity: 8, condition: 'Good' },
      { id: 'i2', name: 'Grifos de Agua', quantity: 8, condition: 'Good' },
      { id: 'i3', name: 'Extintor', quantity: 1, condition: 'Good' }
    ],
    requests: [],
    lastUpdated: '2023-10-20'
  },
  {
    id: '3',
    orgId: '', // Add missing orgId
    campus: 'Sede Bachillerato',
    name: 'Baños Planta Baja',
    type: 'Baño',
    description: 'Fuga importante en tubería principal. Se requiere cierre inmediato.',
    status: Status.REPAIR, // Red
    images: [
      'https://picsum.photos/id/3/800/800',
      'https://picsum.photos/id/400/800/800'
    ],
    inventory: [
      { id: 'i1', name: 'Lavamanos', quantity: 4, condition: 'Fair' },
      { id: 'i2', name: 'Sanitarios', quantity: 5, condition: 'Poor' }
    ],
    requests: [
      { id: 'r1', item: 'Tubo PVC 2"', quantity: 3, estimatedCost: 120000, approved: true, date: '2023-10-26' },
      { id: 'r2', item: 'Cemento Impermeabilizante', quantity: 1, estimatedCost: 45000, approved: true, date: '2023-10-26' }
    ],
    lastUpdated: '2023-10-26'
  },
  {
    id: '4',
    orgId: '', // Add missing orgId
    campus: 'Sede Bachillerato',
    name: 'Auditorio Principal',
    type: 'Auditorio',
    description: 'Luces del escenario requieren cambio. Video Beam funcionando correctamente.',
    status: Status.PREVENTION,
    images: [
      'https://picsum.photos/id/4/800/800',
      'https://picsum.photos/id/450/800/800'
    ],
    inventory: [
      { id: 'i1', name: 'Sillas Auditorio', quantity: 120, condition: 'Good' },
      { id: 'i2', name: 'Video Beam', quantity: 1, condition: 'Good' },
      { id: 'i3', name: 'Sistema de Sonido', quantity: 1, condition: 'Fair' }
    ],
    requests: [],
    lastUpdated: '2023-10-22'
  }
];
