export interface TicketLine {
  name: string;
  quantity: number;
  unit: 'unit' | 'kg';
  unit_price: number;
  total_price: number;
  tva_code: string;
}

export const TICKET_20260423 = {
  store: 'E.Leclerc',
  store_address: 'E.LECLERC LA RESERVE, 14 rue du General de Gaulle, 97438 Sainte Marie',
  ticket_number: '23/04/26 0 0AWX 06700',
  cashier: 'Caisse 010-1110',
  purchased_at: '2026-04-23T13:36:00+04:00',
  total: 161.96,
  items_count: 42,
  lines: [
    { name: 'Pain de mie tranche Yami 420g', quantity: 1, unit: 'unit', unit_price: 2.55, total_price: 2.55, tva_code: '2' },
    { name: "Riz parfums d'Asie 10kg", quantity: 1, unit: 'unit', unit_price: 12.50, total_price: 12.50, tva_code: '1' },
    { name: 'Haricots blancs naturels 1/2', quantity: 1, unit: 'unit', unit_price: 1.75, total_price: 1.75, tva_code: '1' },
    { name: 'Haricots rouges naturels 1/2', quantity: 2, unit: 'unit', unit_price: 1.80, total_price: 3.60, tva_code: '1' },
    { name: 'Lentilles naturelles 1/2', quantity: 1, unit: 'unit', unit_price: 1.80, total_price: 1.80, tva_code: '1' },
    { name: 'Boeuf ass. pimenté Sevima 405g', quantity: 2, unit: 'unit', unit_price: 5.99, total_price: 11.98, tva_code: '2' },
    { name: 'Bouchons poulet combava x50 EMC', quantity: 1, unit: 'unit', unit_price: 8.99, total_price: 8.99, tva_code: '2' },
    { name: 'Manchon de canard congelé 1kg', quantity: 1, unit: 'unit', unit_price: 4.99, total_price: 4.99, tva_code: '2' },
    { name: 'Pilon poulet 1kg', quantity: 1, unit: 'unit', unit_price: 3.89, total_price: 3.89, tva_code: '2' },
    { name: 'Chair cuisse de poulet s/os s/p', quantity: 1, unit: 'unit', unit_price: 6.47, total_price: 6.47, tva_code: '2' },
    { name: 'Cordon bleu doux 400g', quantity: 1, unit: 'unit', unit_price: 3.39, total_price: 3.39, tva_code: '2' },
    { name: 'Croque poisson blanc 300g', quantity: 1, unit: 'unit', unit_price: 2.50, total_price: 2.50, tva_code: '1' },
    { name: 'Perroquet entier 900g', quantity: 1, unit: 'unit', unit_price: 7.68, total_price: 7.68, tva_code: '2' },
    { name: 'Camaron 20 pièces 225g', quantity: 1, unit: 'unit', unit_price: 2.49, total_price: 2.49, tva_code: '2' },
    { name: 'Épinard branche 1kg', quantity: 1, unit: 'unit', unit_price: 2.33, total_price: 2.33, tva_code: '2' },
    { name: 'Coca Cola PET shrink 6x50cl', quantity: 1, unit: 'unit', unit_price: 6.60, total_price: 6.60, tva_code: '2' },
    { name: 'Desperados Tropical bière 3x33', quantity: 1, unit: 'unit', unit_price: 6.92, total_price: 6.92, tva_code: '3' },
    { name: 'Kokot x12 gros oeufs frais', quantity: 1, unit: 'unit', unit_price: 3.78, total_price: 3.78, tva_code: '1' },
    { name: 'Yop 450g fruits exotiques', quantity: 1, unit: 'unit', unit_price: 1.49, total_price: 1.49, tva_code: '2' },
    { name: 'Danone ferme sucré 12x125g', quantity: 1, unit: 'unit', unit_price: 3.99, total_price: 3.99, tva_code: '2' },
    { name: 'Baguette 250g', quantity: 1, unit: 'unit', unit_price: 0.62, total_price: 0.62, tva_code: '2' },
    { name: 'Mini Babybel filet de 10 200g', quantity: 1, unit: 'unit', unit_price: 4.99, total_price: 4.99, tva_code: '2' },
    { name: 'Camembert Gérard 125g', quantity: 2, unit: 'unit', unit_price: 2.85, total_price: 5.70, tva_code: '1' },
    { name: 'Crème fraîche 20cl Yoplait', quantity: 1, unit: 'unit', unit_price: 2.00, total_price: 2.00, tva_code: '1' },
    { name: 'Banane Réunion', quantity: 0.880, unit: 'kg', unit_price: 1.85, total_price: 1.63, tva_code: '2' },
    { name: 'Citron vert vrac', quantity: 0.616, unit: 'kg', unit_price: 1.89, total_price: 1.16, tva_code: '2' },
    { name: 'Ananas pièce', quantity: 1, unit: 'unit', unit_price: 2.69, total_price: 2.69, tva_code: '2' },
    { name: 'Raisin blanc bouquet 500g', quantity: 1, unit: 'unit', unit_price: 3.99, total_price: 3.99, tva_code: '2' },
    { name: 'Tomate allongée sous serre', quantity: 0.758, unit: 'kg', unit_price: 4.69, total_price: 3.56, tva_code: '2' },
    { name: 'Oignon Inde filet 1.5kg', quantity: 1, unit: 'unit', unit_price: 2.79, total_price: 2.79, tva_code: '2' },
    { name: 'Petit piment vert bouquet 150g', quantity: 1, unit: 'unit', unit_price: 2.79, total_price: 2.79, tva_code: '2' },
    { name: 'Fromage poulet SLZ', quantity: 1, unit: 'unit', unit_price: 1.28, total_price: 1.28, tva_code: '2' },
    { name: 'Boucané volaille SDB', quantity: 1, unit: 'unit', unit_price: 9.79, total_price: 9.79, tva_code: '2' },
    { name: 'Chipolatas poulet', quantity: 1, unit: 'unit', unit_price: 3.54, total_price: 3.54, tva_code: '2' },
    { name: 'Lessive liquide Orchidée Moreva 1.5L', quantity: 1, unit: 'unit', unit_price: 4.15, total_price: 4.15, tva_code: '1' },
    { name: 'Sacs poubelles 30L PPX x20', quantity: 1, unit: 'unit', unit_price: 1.41, total_price: 1.41, tva_code: '3' },
    { name: 'Klx Original étuis mini x24', quantity: 1, unit: 'unit', unit_price: 3.61, total_price: 3.61, tva_code: '1' },
    { name: 'Papier toilette éco blanc 4 rouleaux', quantity: 1, unit: 'unit', unit_price: 4.58, total_price: 4.58, tva_code: '3' },
    { name: 'Eau détox', quantity: 1, unit: 'unit', unit_price: 1.99, total_price: 1.99, tva_code: '2' },
  ] as TicketLine[],
};
