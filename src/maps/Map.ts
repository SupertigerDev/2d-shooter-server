export interface Map { 
  id: string; 
  name: string; 
  description: string; 
  tiles: { collision: boolean; }[];
  layout: number[][]; 
  payloadRoute: { y: number; x: number; }[]; 
};