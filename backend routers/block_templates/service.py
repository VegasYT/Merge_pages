from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.block_templates.models import BlockTemplate, BlockTemplateCategory
from app.modules.block_templates.schemas import (
    BlockTemplateCreate,
    BlockTemplateUpdate,
    BlockTemplateCategoryCreate,
)


class BlockTemplateService:
    """Сервис для работы с шаблонами блоков"""

    # Методы для работы с категориями

    @staticmethod
    async def create_category(
        db: AsyncSession,
        category_data: BlockTemplateCategoryCreate
    ) -> BlockTemplateCategory:
        """
        Создает новую категорию шаблонов.

        Args:
            db: Асинхронная сессия БД
            category_data: Данные для создания категории

        Returns:
            BlockTemplateCategory: Созданная категория

        Raises:
            ValueError: Если категория с таким именем уже существует
        """
        # Проверяем, существует ли категория с таким именем
        existing = await BlockTemplateService.get_category_by_name(
            db, category_data.name
        )
        if existing:
            raise ValueError(f"Категория '{category_data.name}' уже существует")

        new_category = BlockTemplateCategory(name=category_data.name)

        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)

        return new_category

    @staticmethod
    async def get_all_categories(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[BlockTemplateCategory]:
        """
        Получает список всех категорий.

        Args:
            db: Асинхронная сессия БД
            skip: Количество пропускаемых записей
            limit: Максимальное количество возвращаемых записей

        Returns:
            List[BlockTemplateCategory]: Список категорий
        """
        result = await db.execute(
            select(BlockTemplateCategory)
            .order_by(BlockTemplateCategory.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_category_by_id(
        db: AsyncSession,
        category_id: int
    ) -> Optional[BlockTemplateCategory]:
        """
        Получает категорию по ID.

        Args:
            db: Асинхронная сессия БД
            category_id: ID категории

        Returns:
            BlockTemplateCategory | None: Категория или None
        """
        result = await db.execute(
            select(BlockTemplateCategory).where(
                BlockTemplateCategory.id == category_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_category_by_name(
        db: AsyncSession,
        name: str
    ) -> Optional[BlockTemplateCategory]:
        """
        Получает категорию по названию.

        Args:
            db: Асинхронная сессия БД
            name: Название категории

        Returns:
            BlockTemplateCategory | None: Категория или None
        """
        result = await db.execute(
            select(BlockTemplateCategory).where(
                BlockTemplateCategory.name == name
            )
        )
        return result.scalar_one_or_none()

    # Методы для работы с шаблонами

    @staticmethod
    async def create_template(
        db: AsyncSession,
        template_data: BlockTemplateCreate
    ) -> BlockTemplate:
        """
        Создает новый шаблон блока.

        Args:
            db: Асинхронная сессия БД
            template_data: Данные для создания шаблона

        Returns:
            BlockTemplate: Созданный шаблон

        Raises:
            ValueError: Если категория не найдена
        """
        # Проверяем существование категории
        category = await BlockTemplateService.get_category_by_id(
            db, template_data.category_id
        )
        if not category:
            raise ValueError(f"Категория с ID {template_data.category_id} не найдена")

        new_template = BlockTemplate(
            category_id=template_data.category_id,
            template_name=template_data.template_name,
            name=template_data.name,
            settings=template_data.settings or {},
            default_data=template_data.default_data or {},
            preview_url=template_data.preview_url,
        )

        db.add(new_template)
        await db.commit()
        await db.refresh(new_template)

        return new_template

    @staticmethod
    async def get_all_templates(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[BlockTemplate]:
        """
        Получает список всех шаблонов.

        Args:
            db: Асинхронная сессия БД
            skip: Количество пропускаемых записей
            limit: Максимальное количество возвращаемых записей

        Returns:
            List[BlockTemplate]: Список шаблонов
        """
        result = await db.execute(
            select(BlockTemplate)
            .options(selectinload(BlockTemplate.category))
            .order_by(BlockTemplate.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_template_by_id(
        db: AsyncSession,
        template_id: int
    ) -> Optional[BlockTemplate]:
        """
        Получает шаблон по ID.

        Args:
            db: Асинхронная сессия БД
            template_id: ID шаблона

        Returns:
            BlockTemplate | None: Шаблон или None
        """
        result = await db.execute(
            select(BlockTemplate)
            .options(selectinload(BlockTemplate.category))
            .where(BlockTemplate.id == template_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_templates_by_category(
        db: AsyncSession,
        category_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[BlockTemplate]:
        """
        Получает шаблоны по категории.

        Args:
            db: Асинхронная сессия БД
            category_id: ID категории
            skip: Количество пропускаемых записей
            limit: Максимальное количество возвращаемых записей

        Returns:
            List[BlockTemplate]: Список шаблонов
        """
        result = await db.execute(
            select(BlockTemplate)
            .options(selectinload(BlockTemplate.category))
            .where(BlockTemplate.category_id == category_id)
            .order_by(BlockTemplate.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_template(
        db: AsyncSession,
        template: BlockTemplate,
        update_data: BlockTemplateUpdate
    ) -> BlockTemplate:
        """
        Обновляет шаблон блока.

        Args:
            db: Асинхронная сессия БД
            template: Шаблон для обновления
            update_data: Новые данные

        Returns:
            BlockTemplate: Обновленный шаблон

        Raises:
            ValueError: Если новая категория не найдена
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        # Если обновляется category_id, проверяем существование категории
        if "category_id" in update_dict:
            category = await BlockTemplateService.get_category_by_id(
                db, update_dict["category_id"]
            )
            if not category:
                raise ValueError(f"Категория с ID {update_dict['category_id']} не найдена")

        # Обновляем только переданные поля
        for field, value in update_dict.items():
            setattr(template, field, value)

        await db.commit()
        await db.refresh(template)

        return template

    @staticmethod
    async def delete_template(db: AsyncSession, template: BlockTemplate) -> None:
        """
        Удаляет шаблон блока.

        Args:
            db: Асинхронная сессия БД
            template: Шаблон для удаления
        """
        await db.delete(template)
        await db.commit()

    @staticmethod
    async def get_templates_count_by_category(
        db: AsyncSession,
        category_id: int
    ) -> int:
        """
        Получает количество шаблонов в категории.

        Args:
            db: Асинхронная сессия БД
            category_id: ID категории

        Returns:
            int: Количество шаблонов
        """
        result = await db.execute(
            select(func.count(BlockTemplate.id)).where(
                BlockTemplate.category_id == category_id
            )
        )
        return result.scalar_one()
