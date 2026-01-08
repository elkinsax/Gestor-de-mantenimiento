import { MaintenanceUnit, Status, Tool, WarehouseItem } from './types';

export const INITIAL_TOOLS: Tool[] = [
  { id: 't1', name: 'Taladro Percutor Makita', status: 'AVAILABLE' },
  { id: 't2', name: 'Escalera Aluminio 3m', status: 'AVAILABLE' }
];

export const INITIAL_WAREHOUSE: WarehouseItem[] = [
  { id: 'w1', name: 'Bombillo LED 12W', category: 'Eléctrico', quantity: 20, unit: 'Unidad' },
  { id: 'w2', name: 'Pintura Blanca', category: 'Pintura', quantity: 4, unit: 'Galón' }
];

export const INITIAL_UNITS: MaintenanceUnit[] = [
  {
    id: '1',
    campus: 'Sede Principal',
    name: 'Salón 3A',
    type: 'Aula',
    description: 'Todo en orden. Aire acondicionado revisado recientemente.',
    status: Status.OPERATIVE,
    images: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'],
    inventory: [{ id: 'i1', name: 'Pupitres', quantity: 30, condition: 'Good' }],
    requests: [],
    lastUpdated: new Date().toISOString()
  }
];