// Get element by path in structure
export const getElementByPath = (struct: any[], path: number[]): any => {
  let current: any = { children: struct };
  for (const index of path) {
    current = current.children[index];
  }
  return current;
};

// Default classes for elements
export const getDefaultClasses = (type: string): string => {
  switch (type) {
    case 'container':
      return 'py-12';
    case 'div':
      return '';
    case 'h1':
      return 'text-4xl font-bold mb-4';
    case 'h2':
      return 'text-3xl font-bold mb-4';
    case 'h3':
      return 'text-2xl font-bold mb-3';
    case 'h4':
      return 'text-xl font-bold mb-3';
    case 'h5':
      return 'text-lg font-bold mb-2';
    case 'h6':
      return 'text-base font-bold mb-2';
    case 'p':
      return 'text-base mb-4';
    case 'span':
      return 'text-base';
    case 'button':
      return 'px-6 py-3 rounded text-white font-semibold bg-blue-500 hover:bg-blue-600';
    case 'a':
      return 'text-blue-600 hover:underline';
    case 'form':
      return 'w-full space-y-4';
    case 'input':
      return 'w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
    case 'textarea':
      return 'w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical';
    case 'select':
      return 'w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
    case 'option':
      return '';
    case 'label':
      return 'block text-sm font-medium text-gray-700 mb-1';
    case 'img':
      return 'w-full h-auto';
    case 'video':
    case 'audio':
      return 'w-full';
    case 'iframe':
      return 'w-full h-96';
    case 'grid':
      return 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';
    case 'ul':
    case 'ol':
      return 'space-y-2';
    case 'li':
      return 'text-base';
    case 'strong':
      return 'font-bold';
    case 'em':
      return 'italic';
    case 'small':
      return 'text-sm';
    case 'hr':
      return 'my-4 border-gray-300';
    default:
      return '';
  }
};
