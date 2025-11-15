from typing import Optional, List

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.zero_blocks.models import (
    ZeroBaseElement,
    ZeroBlock,
    ZeroLayer,
    ZeroBlockResponsive,
    ZeroLayerResponsive
)
from app.modules.zero_blocks.schemas import (
    ZeroBlockCreate,
    ZeroBlockUpdate,
    ZeroLayerCreate,
    ZeroLayerUpdate,
    ZeroLayerPositionUpdate,
    ZeroBlockResponsiveCreate,
    ZeroBlockResponsiveUpdate,
    ZeroLayerResponsiveCreate,
    ZeroLayerResponsiveUpdate,
)


class ZeroBaseElementService:
    """Сервис для работы с базовыми элементами"""

    @staticmethod
    async def create_base_element(
        db: AsyncSession,
        type_name: str,
        display_name: str,
        icon: str,
        schema: dict
    ) -> ZeroBaseElement:
        """
        Создает новый базовый элемент.

        Args:
            db: Асинхронная сессия БД
            type_name: Название типа элемента
            display_name: Отображаемое название элемента
            icon: Иконка элемента
            schema: JSON схема элемента

        Returns:
            ZeroBaseElement: Созданный базовый элемент

        Raises:
            ValueError: Если элемент с таким type_name уже существует
        """
        # Проверяем уникальность type_name
        existing = await db.execute(
            select(ZeroBaseElement).where(ZeroBaseElement.type_name == type_name)
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Базовый элемент с type_name '{type_name}' уже существует")

        new_element = ZeroBaseElement(
            type_name=type_name,
            display_name=display_name,
            icon=icon,
            schema=schema
        )

        db.add(new_element)
        await db.commit()
        await db.refresh(new_element)

        return new_element

    @staticmethod
    async def get_all_base_elements(db: AsyncSession) -> List[ZeroBaseElement]:
        """
        Получает список всех базовых элементов.

        Args:
            db: Асинхронная сессия БД

        Returns:
            List[ZeroBaseElement]: Список базовых элементов
        """
        result = await db.execute(
            select(ZeroBaseElement).order_by(ZeroBaseElement.type_name.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_base_element_by_id(
        db: AsyncSession,
        element_id: int
    ) -> Optional[ZeroBaseElement]:
        """
        Получает базовый элемент по ID.

        Args:
            db: Асинхронная сессия БД
            element_id: ID базового элемента

        Returns:
            ZeroBaseElement | None: Базовый элемент или None
        """
        result = await db.execute(
            select(ZeroBaseElement).where(ZeroBaseElement.id == element_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_base_element_by_type_name(
        db: AsyncSession,
        type_name: str
    ) -> Optional[ZeroBaseElement]:
        """
        Получает базовый элемент по названию типа.

        Args:
            db: Асинхронная сессия БД
            type_name: Название типа элемента

        Returns:
            ZeroBaseElement | None: Базовый элемент или None
        """
        result = await db.execute(
            select(ZeroBaseElement).where(ZeroBaseElement.type_name == type_name)
        )
        return result.scalar_one_or_none()


class ZeroBlockService:
    """Сервис для работы с zero-блоками"""

    @staticmethod
    async def create_zero_block(
        db: AsyncSession,
        block_id: int,
        zero_block_data: ZeroBlockCreate
    ) -> ZeroBlock:
        """
        Создает zero-блок для существующего блока.

        Args:
            db: Асинхронная сессия БД
            block_id: ID блока
            zero_block_data: Данные для создания zero-блока

        Returns:
            ZeroBlock: Созданный zero-блок
        """
        new_zero_block = ZeroBlock(
            block_id=block_id
        )

        db.add(new_zero_block)
        await db.commit()
        await db.refresh(new_zero_block)

        return new_zero_block

    @staticmethod
    async def get_zero_block_by_block_id(
        db: AsyncSession,
        block_id: int,
        load_relations: bool = False
    ) -> Optional[ZeroBlock]:
        """
        Получает zero-блок по ID блока.

        Args:
            db: Асинхронная сессия БД
            block_id: ID блока
            load_relations: Загружать ли связанные данные (слои, breakpoints)

        Returns:
            ZeroBlock | None: Zero-блок или None
        """
        query = select(ZeroBlock).where(ZeroBlock.block_id == block_id)

        if load_relations:
            query = query.options(
                selectinload(ZeroBlock.layers),
                selectinload(ZeroBlock.responsive_settings)
            )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_zero_block_by_id(
        db: AsyncSession,
        zero_block_id: int
    ) -> Optional[ZeroBlock]:
        """
        Получает zero-блок по ID.

        Args:
            db: Асинхронная сессия БД
            zero_block_id: ID zero-блока

        Returns:
            ZeroBlock | None: Zero-блок или None
        """
        result = await db.execute(
            select(ZeroBlock).where(ZeroBlock.id == zero_block_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_zero_block(
        db: AsyncSession,
        zero_block: ZeroBlock,
        update_data: ZeroBlockUpdate
    ) -> ZeroBlock:
        """
        Обновляет zero-блок.

        Args:
            db: Асинхронная сессия БД
            zero_block: Zero-блок для обновления
            update_data: Новые данные

        Returns:
            ZeroBlock: Обновленный zero-блок
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(zero_block, field, value)

        await db.commit()
        await db.refresh(zero_block)

        return zero_block

    @staticmethod
    async def delete_zero_block(db: AsyncSession, zero_block: ZeroBlock) -> None:
        """
        Удаляет zero-блок.

        Args:
            db: Асинхронная сессия БД
            zero_block: Zero-блок для удаления
        """
        await db.delete(zero_block)
        await db.commit()


class ZeroLayerService:
    """Сервис для работы со слоями zero-блоков"""

    @staticmethod
    async def create_layer(
        db: AsyncSession,
        zero_block_id: int,
        layer_data: ZeroLayerCreate
    ) -> ZeroLayer:
        """
        Создает слой в zero-блоке.

        Args:
            db: Асинхронная сессия БД
            zero_block_id: ID zero-блока
            layer_data: Данные для создания слоя

        Returns:
            ZeroLayer: Созданный слой

        Raises:
            ValueError: Если слой с такой позицией уже существует или базовый элемент не найден
        """
        # Проверяем существование базового элемента
        base_element = await db.execute(
            select(ZeroBaseElement).where(ZeroBaseElement.id == layer_data.zero_base_element_id)
        )
        if not base_element.scalar_one_or_none():
            raise ValueError(f"Базовый элемент с ID {layer_data.zero_base_element_id} не найден")

        # Проверяем, нет ли уже слоя с такой позицией
        existing = await db.execute(
            select(ZeroLayer).where(
                and_(
                    ZeroLayer.zero_block_id == zero_block_id,
                    ZeroLayer.position == layer_data.position
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Слой с позицией {layer_data.position} уже существует в этом zero-блоке")

        new_layer = ZeroLayer(
            zero_block_id=zero_block_id,
            zero_base_element_id=layer_data.zero_base_element_id,
            data=layer_data.data,
            position=layer_data.position,
        )

        db.add(new_layer)
        await db.commit()
        await db.refresh(new_layer)

        return new_layer

    @staticmethod
    async def get_zero_block_layers(
        db: AsyncSession,
        zero_block_id: int,
        load_responsive: bool = False
    ) -> List[ZeroLayer]:
        """
        Получает список слоев zero-блока.

        Args:
            db: Асинхронная сессия БД
            zero_block_id: ID zero-блока
            load_responsive: Загружать ли адаптивные настройки

        Returns:
            List[ZeroLayer]: Список слоев, отсортированных по позиции
        """
        query = select(ZeroLayer).where(ZeroLayer.zero_block_id == zero_block_id).order_by(ZeroLayer.position.asc())

        if load_responsive:
            query = query.options(selectinload(ZeroLayer.responsive_settings))

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_layer_by_id(
        db: AsyncSession,
        layer_id: int,
        load_responsive: bool = False
    ) -> Optional[ZeroLayer]:
        """
        Получает слой по ID.

        Args:
            db: Асинхронная сессия БД
            layer_id: ID слоя
            load_responsive: Загружать ли адаптивные настройки

        Returns:
            ZeroLayer | None: Слой или None
        """
        query = select(ZeroLayer).where(ZeroLayer.id == layer_id)

        if load_responsive:
            query = query.options(selectinload(ZeroLayer.responsive_settings))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_layer(
        db: AsyncSession,
        layer: ZeroLayer,
        update_data: ZeroLayerUpdate
    ) -> ZeroLayer:
        """
        Обновляет слой.

        Args:
            db: Асинхронная сессия БД
            layer: Слой для обновления
            update_data: Новые данные

        Returns:
            ZeroLayer: Обновленный слой

        Raises:
            ValueError: Если при изменении position создается конфликт или базовый элемент не найден
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        # Если изменяется zero_base_element_id, проверяем существование базового элемента
        if 'zero_base_element_id' in update_dict:
            base_element = await db.execute(
                select(ZeroBaseElement).where(ZeroBaseElement.id == update_dict['zero_base_element_id'])
            )
            if not base_element.scalar_one_or_none():
                raise ValueError(f"Базовый элемент с ID {update_dict['zero_base_element_id']} не найден")

        # Если изменяется position, проверяем на уникальность
        if 'position' in update_dict and update_dict['position'] != layer.position:
            existing = await db.execute(
                select(ZeroLayer).where(
                    and_(
                        ZeroLayer.zero_block_id == layer.zero_block_id,
                        ZeroLayer.position == update_dict['position'],
                        ZeroLayer.id != layer.id
                    )
                )
            )
            if existing.scalar_one_or_none():
                raise ValueError(
                    f"Слой с позицией {update_dict['position']} уже существует в этом zero-блоке. "
                    f"Используйте endpoint /api/zero-layers/{{layer_id}}/position для изменения позиции с автоматической пересортировкой"
                )

        for field, value in update_dict.items():
            setattr(layer, field, value)

        await db.commit()
        await db.refresh(layer)

        return layer

    @staticmethod
    async def update_layer_position(
        db: AsyncSession,
        layer: ZeroLayer,
        position_data: ZeroLayerPositionUpdate
    ) -> ZeroLayer:
        """
        Обновляет позицию слоя.
        Если новая позиция занята другим слоем, они меняются местами.

        Args:
            db: Асинхронная сессия БД
            layer: Слой для обновления
            position_data: Новая позиция

        Returns:
            ZeroLayer: Обновленный слой
        """
        old_position = layer.position
        new_position = position_data.position

        if old_position == new_position:
            return layer

        # Проверяем, занята ли новая позиция другим слоем
        existing_layer_result = await db.execute(
            select(ZeroLayer).where(
                and_(
                    ZeroLayer.zero_block_id == layer.zero_block_id,
                    ZeroLayer.position == new_position,
                    ZeroLayer.id != layer.id
                )
            )
        )
        existing_layer = existing_layer_result.scalar_one_or_none()

        if existing_layer:
            # Если позиция занята, меняем слои местами
            # Временно ставим текущему слою отрицательную позицию
            layer.position = -1
            await db.flush()

            # Перемещаем существующий слой на старую позицию текущего
            existing_layer.position = old_position
            await db.flush()

            # Перемещаем текущий слой на новую позицию
            layer.position = new_position
        else:
            # Если позиция свободна, просто меняем
            layer.position = new_position

        await db.commit()
        await db.refresh(layer)

        return layer

    @staticmethod
    async def delete_layer(db: AsyncSession, layer: ZeroLayer) -> None:
        """
        Удаляет слой.

        Args:
            db: Асинхронная сессия БД
            layer: Слой для удаления
        """
        zero_block_id = layer.zero_block_id
        position = layer.position

        await db.delete(layer)
        await db.commit()

        # Пересортировываем оставшиеся слои
        await ZeroLayerService._reorder_layers_after_delete(db, zero_block_id, position)

    @staticmethod
    async def _reorder_layers_on_move(
        db: AsyncSession,
        zero_block_id: int,
        old_position: int,
        new_position: int
    ) -> None:
        """Пересортировывает слои при перемещении"""
        if old_position < new_position:
            await db.execute(
                update(ZeroLayer)
                .where(
                    and_(
                        ZeroLayer.zero_block_id == zero_block_id,
                        ZeroLayer.position > old_position,
                        ZeroLayer.position <= new_position
                    )
                )
                .values(position=ZeroLayer.position - 1)
            )
        else:
            await db.execute(
                update(ZeroLayer)
                .where(
                    and_(
                        ZeroLayer.zero_block_id == zero_block_id,
                        ZeroLayer.position >= new_position,
                        ZeroLayer.position < old_position
                    )
                )
                .values(position=ZeroLayer.position + 1)
            )

    @staticmethod
    async def _reorder_layers_after_delete(
        db: AsyncSession,
        zero_block_id: int,
        deleted_position: int
    ) -> None:
        """Пересортировывает слои после удаления"""
        await db.execute(
            update(ZeroLayer)
            .where(
                and_(
                    ZeroLayer.zero_block_id == zero_block_id,
                    ZeroLayer.position > deleted_position
                )
            )
            .values(position=ZeroLayer.position - 1)
        )
        await db.commit()


class ZeroBlockResponsiveService:
    """Сервис для работы с адаптивными настройками zero-блоков"""

    @staticmethod
    async def create_responsive(
        db: AsyncSession,
        responsive_data: ZeroBlockResponsiveCreate
    ) -> ZeroBlockResponsive:
        """
        Создает адаптивные настройки для zero-блока.

        Args:
            db: Асинхронная сессия БД
            responsive_data: Данные для создания адаптивных настроек

        Returns:
            ZeroBlockResponsive: Созданные адаптивные настройки

        Raises:
            ValueError: Если zero_block не найден или уже существуют настройки для этой ширины
        """
        # Проверяем существование zero_block
        zero_block = await db.execute(
            select(ZeroBlock).where(ZeroBlock.id == responsive_data.zero_block_id)
        )
        if not zero_block.scalar_one_or_none():
            raise ValueError(f"ZeroBlock с ID {responsive_data.zero_block_id} не найден")

        # Проверяем, нет ли уже настроек для этой ширины
        existing = await db.execute(
            select(ZeroBlockResponsive).where(
                and_(
                    ZeroBlockResponsive.zero_block_id == responsive_data.zero_block_id,
                    ZeroBlockResponsive.width == responsive_data.width
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Адаптивные настройки для ширины {responsive_data.width} уже существуют")

        new_responsive = ZeroBlockResponsive(
            zero_block_id=responsive_data.zero_block_id,
            width=responsive_data.width,
            height=responsive_data.height,
            props=responsive_data.props or {}
        )

        db.add(new_responsive)
        await db.commit()
        await db.refresh(new_responsive)

        return new_responsive

    @staticmethod
    async def get_responsive_by_id(
        db: AsyncSession,
        responsive_id: int
    ) -> Optional[ZeroBlockResponsive]:
        """
        Получает адаптивные настройки по ID.

        Args:
            db: Асинхронная сессия БД
            responsive_id: ID адаптивных настроек

        Returns:
            ZeroBlockResponsive | None: Адаптивные настройки или None
        """
        result = await db.execute(
            select(ZeroBlockResponsive).where(ZeroBlockResponsive.id == responsive_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_responsive_by_zero_block_and_width(
        db: AsyncSession,
        zero_block_id: int,
        width: int
    ) -> Optional[ZeroBlockResponsive]:
        """
        Получает адаптивные настройки по ID zero-блока и ширине.

        Args:
            db: Асинхронная сессия БД
            zero_block_id: ID zero-блока
            width: Ширина экрана

        Returns:
            ZeroBlockResponsive | None: Адаптивные настройки или None
        """
        result = await db.execute(
            select(ZeroBlockResponsive).where(
                and_(
                    ZeroBlockResponsive.zero_block_id == zero_block_id,
                    ZeroBlockResponsive.width == width
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_responsive_by_zero_block(
        db: AsyncSession,
        zero_block_id: int
    ) -> List[ZeroBlockResponsive]:
        """
        Получает все адаптивные настройки для zero-блока.

        Args:
            db: Асинхронная сессия БД
            zero_block_id: ID zero-блока

        Returns:
            List[ZeroBlockResponsive]: Список адаптивных настроек
        """
        result = await db.execute(
            select(ZeroBlockResponsive)
            .where(ZeroBlockResponsive.zero_block_id == zero_block_id)
            .order_by(ZeroBlockResponsive.width.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_responsive(
        db: AsyncSession,
        responsive: ZeroBlockResponsive,
        update_data: ZeroBlockResponsiveUpdate
    ) -> ZeroBlockResponsive:
        """
        Обновляет адаптивные настройки.

        Args:
            db: Асинхронная сессия БД
            responsive: Адаптивные настройки для обновления
            update_data: Новые данные

        Returns:
            ZeroBlockResponsive: Обновленные адаптивные настройки
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(responsive, field, value)

        await db.commit()
        await db.refresh(responsive)

        return responsive

    @staticmethod
    async def delete_responsive(db: AsyncSession, responsive: ZeroBlockResponsive) -> None:
        """
        Удаляет адаптивные настройки.

        Args:
            db: Асинхронная сессия БД
            responsive: Адаптивные настройки для удаления
        """
        await db.delete(responsive)
        await db.commit()


class ZeroLayerResponsiveService:
    """Сервис для работы с адаптивными настройками слоев"""

    @staticmethod
    async def create_responsive(
        db: AsyncSession,
        layer_id: int,
        responsive_data: ZeroLayerResponsiveCreate
    ) -> ZeroLayerResponsive:
        """
        Создает адаптивные настройки для слоя.

        Args:
            db: Асинхронная сессия БД
            layer_id: ID слоя
            responsive_data: Данные для создания настроек

        Returns:
            ZeroLayerResponsive: Созданные настройки

        Raises:
            ValueError: Если настройки для данного responsive уже существуют или responsive не найден
        """
        # Получаем слой для проверки zero_block_id
        layer = await db.execute(
            select(ZeroLayer).where(ZeroLayer.id == layer_id)
        )
        layer_obj = layer.scalar_one_or_none()
        if not layer_obj:
            raise ValueError(f"Слой с ID {layer_id} не найден")

        # Проверяем существование zero_block_responsive
        responsive_result = await db.execute(
            select(ZeroBlockResponsive).where(ZeroBlockResponsive.id == responsive_data.zero_block_responsive_id)
        )
        responsive_obj = responsive_result.scalar_one_or_none()
        if not responsive_obj:
            raise ValueError(f"ZeroBlockResponsive с ID {responsive_data.zero_block_responsive_id} не найден")

        # Проверяем что responsive принадлежит тому же zero-блоку
        if responsive_obj.zero_block_id != layer_obj.zero_block_id:
            raise ValueError(
                f"ZeroBlockResponsive {responsive_data.zero_block_responsive_id} не принадлежит "
                f"zero-блоку слоя (zero_block_id={layer_obj.zero_block_id})"
            )

        # Проверяем, нет ли уже настроек для этого responsive
        existing = await db.execute(
            select(ZeroLayerResponsive).where(
                and_(
                    ZeroLayerResponsive.zero_layer_id == layer_id,
                    ZeroLayerResponsive.zero_block_responsive_id == responsive_data.zero_block_responsive_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(
                f"Адаптивные настройки для responsive {responsive_data.zero_block_responsive_id} уже существуют"
            )

        new_responsive = ZeroLayerResponsive(
            zero_layer_id=layer_id,
            zero_block_responsive_id=responsive_data.zero_block_responsive_id,
            x=responsive_data.x,
            y=responsive_data.y,
            width=responsive_data.width,
            height=responsive_data.height,
            direction=responsive_data.direction,
            data=responsive_data.data,
        )

        db.add(new_responsive)
        await db.commit()
        await db.refresh(new_responsive)

        return new_responsive

    @staticmethod
    async def get_layer_responsive_settings(
        db: AsyncSession,
        layer_id: int
    ) -> List[ZeroLayerResponsive]:
        """
        Получает список адаптивных настроек слоя.

        Args:
            db: Асинхронная сессия БД
            layer_id: ID слоя

        Returns:
            List[ZeroLayerResponsive]: Список адаптивных настроек
        """
        result = await db.execute(
            select(ZeroLayerResponsive)
            .where(ZeroLayerResponsive.zero_layer_id == layer_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_responsive_by_id(
        db: AsyncSession,
        responsive_id: int
    ) -> Optional[ZeroLayerResponsive]:
        """
        Получает адаптивные настройки по ID.

        Args:
            db: Асинхронная сессия БД
            responsive_id: ID настроек

        Returns:
            ZeroLayerResponsive | None: Настройки или None
        """
        result = await db.execute(
            select(ZeroLayerResponsive).where(ZeroLayerResponsive.id == responsive_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_responsive(
        db: AsyncSession,
        responsive: ZeroLayerResponsive,
        update_data: ZeroLayerResponsiveUpdate
    ) -> ZeroLayerResponsive:
        """
        Обновляет адаптивные настройки.

        Args:
            db: Асинхронная сессия БД
            responsive: Настройки для обновления
            update_data: Новые данные

        Returns:
            ZeroLayerResponsive: Обновленные настройки
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(responsive, field, value)

        await db.commit()
        await db.refresh(responsive)

        return responsive

    @staticmethod
    async def delete_responsive(db: AsyncSession, responsive: ZeroLayerResponsive) -> None:
        """
        Удаляет адаптивные настройки.

        Args:
            db: Асинхронная сессия БД
            responsive: Настройки для удаления
        """
        await db.delete(responsive)
        await db.commit()
