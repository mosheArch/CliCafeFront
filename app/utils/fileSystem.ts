export interface CoffeeFile {
  name: string;
  price: string;
  description: string;
}

export interface File {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: File[];
  coffeeInfo?: CoffeeFile;
}

export const fileSystem: File = {
  name: '/',
  type: 'directory',
  children: [
    {
      name: 'Molido',
      type: 'directory',
      children: [
        {
          name: 'Kilo',
          type: 'directory',
          children: [
            { 
              name: 'VeracruzBlend.coffee', 
              type: 'file', 
              content: 'Nombre: VeracruzBlend\nPrecio: $250\nDescripción: Mezcla suave con notas cítricas.',
              coffeeInfo: {
                name: 'Veracruz Blend',
                price: '$250',
                description: 'Una mezcla suave con delicadas notas cítricas. Perfecto para empezar la mañana.'
              }
            },
            { 
              name: 'OaxacaReserve.coffee', 
              type: 'file', 
              content: 'Nombre: OaxacaReserve\nPrecio: $300\nDescripción: Sabor intenso con toques de chocolate.',
              coffeeInfo: {
                name: 'Oaxaca Reserve',
                price: '$300',
                description: 'Un café de sabor intenso con deliciosos toques de chocolate. Ideal para los amantes del café fuerte.'
              }
            },
          ]
        },
        {
          name: 'MedioKilo',
          type: 'directory',
          children: [
            { 
              name: 'ChiapasOrganic.coffee', 
              type: 'file', 
              content: 'Nombre: ChiapasOrganic\nPrecio: $180\nDescripción: Café orgánico con notas florales.',
              coffeeInfo: {
                name: 'Chiapas Organic',
                price: '$180',
                description: 'Un café orgánico con delicadas notas florales. Cultivado de manera sostenible en las montañas de Chiapas.'
              }
            },
          ]
        },
      ]
    },
    {
      name: 'Grano',
      type: 'directory',
      children: [
        {
          name: 'Kilo',
          type: 'directory',
          children: [
            { 
              name: 'GuerreroEspresso.coffee', 
              type: 'file', 
              content: 'Nombre: GuerreroEspresso\nPrecio: $280\nDescripción: Blend perfecto para espresso.',
              coffeeInfo: {
                name: 'Guerrero Espresso',
                price: '$280',
                description: 'Un blend perfecto para espresso, con un sabor intenso y un aroma cautivador. Ideal para los amantes del café concentrado.'
              }
            },
          ]
        },
        {
          name: 'Sobre',
          type: 'directory',
          children: [
            { 
              name: 'PueblaDecaf.coffee', 
              type: 'file', 
              content: 'Nombre: PueblaDecaf\nPrecio: $30\nDescripción: Descafeinado suave y aromático.',
              coffeeInfo: {
                name: 'Puebla Decaf',
                price: '$30',
                description: 'Un café descafeinado suave y aromático. Perfecto para disfrutar en cualquier momento del día sin preocuparse por la cafeína.'
              }
            },
          ]
        },
      ]
    },
  ]
};

export function findFile(path: string[]): File | null {
  let current: File = fileSystem;
  for (const segment of path) {
    if (current.type !== 'directory' || !current.children) {
      return null;
    }
    const found = current.children.find(child => 
      child.name.toLowerCase() === segment.toLowerCase() ||
      child.name.toLowerCase().replace(/\.[^/.]+$/, "") === segment.toLowerCase().replace(/\.[^/.]+$/, "")
    );
    if (!found) {
      return null;
    }
    current = found;
  }
  return current;
}

export function listDirectory(path: string[]): string[] {
  const dir = findFile(path);
  if (!dir || dir.type !== 'directory' || !dir.children) {
    return [];
  }
  return dir.children.map(child => child.name + (child.type === 'directory' ? '/' : ''));
}

