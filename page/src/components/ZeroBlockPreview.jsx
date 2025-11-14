import React from 'react';
import ZeroblockRenderer from './ZeroblockRenderer';
import { mockZeroblock } from '../data/mockData';

// Компонент предпросмотра Zero Block - рендерит настоящий зероблок
export default function ZeroBlockPreview({ block, viewportSize }) {
  // Получаем данные зероблока по ID из настроек блока
  // В реальном приложении здесь будет запрос к API
  const zeroblockData = mockZeroblock; // Пока используем моковые данные

  return <ZeroblockRenderer zeroblockData={zeroblockData} viewportSize={viewportSize} />;
}
