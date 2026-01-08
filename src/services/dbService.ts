
import { supabase } from '../supabase';
import { MaintenanceUnit, Tool, WarehouseItem } from '../types';

export const dbService = {
  // --- UNITS ---
  async getUnits(organizationId: string): Promise<MaintenanceUnit[]> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('organization_id', organizationId)
      .order('last_updated', { ascending: false });
    
    if (error) throw error;
    return data as MaintenanceUnit[];
  },

  async updateUnit(unit: MaintenanceUnit): Promise<void> {
    const { error } = await supabase
      .from('units')
      .update({
        status: unit.status,
        description: unit.description,
        images: unit.images,
        inventory: unit.inventory,
        requests: unit.requests,
        last_updated: new Date().toISOString()
      })
      .eq('id', unit.id);
    
    if (error) throw error;
  },

  async createUnit(unit: Omit<MaintenanceUnit, 'id'>, organizationId: string): Promise<MaintenanceUnit> {
    const { data, error } = await supabase
      .from('units')
      .insert([{ ...unit, organization_id: organizationId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as MaintenanceUnit;
  },

  // --- TOOLS ---
  async getTools(organizationId: string): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return data as Tool[];
  },

  // --- WAREHOUSE ---
  async getWarehouse(organizationId: string): Promise<WarehouseItem[]> {
    const { data, error } = await supabase
      .from('warehouse_items')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return data as WarehouseItem[];
  }
};
