import React from 'react';
import ZeroblockRenderer from './ZeroblockRenderer';
import type { Block } from '@/lib/services/blocks';

interface ZeroBlockPreviewProps {
	block: Block;
	viewportSize: 'mobile' | 'tablet' | 'desktop';
	zeroblockData: any; // Данные зероблока из API
}

// Компонент предпросмотра Zero Block - рендерит настоящий зероблок
export default function ZeroBlockPreview({ block, viewportSize, zeroblockData }: ZeroBlockPreviewProps) {
	if (!zeroblockData) {
		return (
			<div className="min-h-[300px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
				<div className="text-center text-gray-400 p-8">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
						Z
					</div>
					<p className="text-lg font-medium">Zero Block</p>
					<p className="text-sm mt-2">Загрузка...</p>
				</div>
			</div>
		);
	}

	return <ZeroblockRenderer zeroblockData={zeroblockData} viewportSize={viewportSize} />;
}
