import { useEffect } from 'react';

interface PageEditorLayoutProps {
	children: React.ReactNode;
}

/**
 * Layout для page-editor, который отключает встроенные Tailwind стили
 * и полагается только на CDN Tailwind для динамических классов из API
 */
export default function PageEditorLayout({ children }: PageEditorLayoutProps) {
	useEffect(() => {
		// Добавляем класс к body для идентификации page-editor контекста
		document.body.classList.add('page-editor-mode');

		return () => {
			document.body.classList.remove('page-editor-mode');
		};
	}, []);

	return <div className="page-editor-root">{children}</div>;
}
