import { supabase } from '@/integrations/supabase/client';
import { toBase } from './money';

export interface PropertyPurchasePayload {
  user_address: string;
  property_id: number;
  currency: string;
  purchase_price_base: number;
  down_payment_base: number;
  apr_bps: number;
  term_months: number;
}

export const upsertPropertyPurchase = async (payload: PropertyPurchasePayload) => {
  const { data, error } = await supabase
    .from('user_properties')
    .upsert(payload, { 
      onConflict: 'user_address,property_id' 
    });
    
  if (error) throw error;
  return data;
};

export const updatePayment = async (
  userAddress: string, 
  propertyId: number, 
  principalPayment: number, 
  interestPayment: number
) => {
  const { data, error } = await supabase
    .from('user_properties')
    .update({
      principal_paid_base: supabase.rpc('int_add', {
        table: 'user_properties',
        column: 'principal_paid_base',
        by: principalPayment
      }),
      interest_paid_base: supabase.rpc('int_add', {
        table: 'user_properties',
        column: 'interest_paid_base',
        by: interestPayment
      })
    })
    .eq('user_address', userAddress)
    .eq('property_id', propertyId);
    
  if (error) throw error;
  return data;
};

export const getUserProperties = async (userAddress: string) => {
  const { data, error } = await supabase
    .from('user_properties')
    .select('*')
    .eq('user_address', userAddress)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const getPropertyDetails = async (propertyId: number) => {
  const { data, error } = await supabase
    .from('user_properties')
    .select('*')
    .eq('property_id', propertyId)
    .single();
    
  if (error) throw error;
  return data;
};

// Helper function to convert frontend values to base units
export const createPurchasePayload = (
  userAddress: string,
  propertyId: number,
  purchasePrice: number,
  downPayment: number,
  apr: number,
  termMonths: number
): PropertyPurchasePayload => ({
  user_address: userAddress,
  property_id: propertyId,
  currency: 'USDC-6',
  purchase_price_base: toBase(purchasePrice),
  down_payment_base: toBase(downPayment),
  apr_bps: Math.round(apr * 100), // Convert percentage to basis points
  term_months: termMonths
}); 