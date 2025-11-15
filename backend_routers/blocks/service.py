from typing import Optional, List

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.blocks.models import Block
from app.modules.blocks.schemas import BlockCreate, BlockUpdate, BlockPositionUpdate
from app.modules.block_templates.models import BlockTemplate


class BlockService:
    """Сервис для работы с блоками"""

    @staticmethod
    async def create_block(
        db: AsyncSession,
        page_id: int,
        block_data: BlockCreate
    ) -> Block:
        """
        Создает новый блок на странице.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы
            block_data: Данные для создания блока

        Returns:
            Block: Созданный блок

        Raises:
            ValueError: Если шаблон блока не существует (для типа template) или позиция занята
        """
        # Проверяем, нет ли уже блока с такой позицией на странице
        existing_block = await db.execute(
            select(Block).where(
                and_(
                    Block.page_id == page_id,
                    Block.position == block_data.position
                )
            )
        )
        if existing_block.scalar_one_or_none():
            raise ValueError(f"Блок с позицией {block_data.position} уже существует на этой странице")

        # Проверяем существование шаблона блока для обычных блоков
        if block_data.type == "template" and block_data.block_template_id is not None:
            template_result = await db.execute(
                select(BlockTemplate).where(BlockTemplate.id == block_data.block_template_id)
            )
            template = template_result.scalar_one_or_none()

            if not template:
                raise ValueError(
                    f"Шаблон блока с ID {block_data.block_template_id} не найден"
                )

        new_block = Block(
            page_id=page_id,
            block_template_id=block_data.block_template_id,
            type=block_data.type,
            position=block_data.position,
            settings=block_data.settings,
        )

        db.add(new_block)
        await db.commit()
        await db.refresh(new_block)

        return new_block

    @staticmethod
    async def get_page_blocks(
        db: AsyncSession,
        page_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Block]:
        """
        Получает список блоков на странице.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы
            skip: Количество пропускаемых записей
            limit: Максимальное количество возвращаемых записей

        Returns:
            List[Block]: Список блоков, отсортированных по позиции
        """
        result = await db.execute(
            select(Block)
            .options(selectinload(Block.block_template))
            .where(Block.page_id == page_id)
            .order_by(Block.position.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_block_by_id(
        db: AsyncSession,
        block_id: int,
        load_template: bool = False
    ) -> Optional[Block]:
        """
        Получает блок по ID.

        Args:
            db: Асинхронная сессия БД
            block_id: ID блока
            load_template: Загружать ли связанный шаблон блока

        Returns:
            Block | None: Блок или None
        """
        query = select(Block).where(Block.id == block_id)

        if load_template:
            query = query.options(selectinload(Block.block_template))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_block(
        db: AsyncSession,
        block: Block,
        update_data: BlockUpdate
    ) -> Block:
        """
        Обновляет настройки блока.

        Args:
            db: Асинхронная сессия БД
            block: Блок для обновления
            update_data: Новые настройки

        Returns:
            Block: Обновленный блок
        """
        block.settings = update_data.settings

        await db.commit()
        await db.refresh(block)

        return block

    @staticmethod
    async def update_block_position(
        db: AsyncSession,
        block: Block,
        position_data: BlockPositionUpdate
    ) -> Block:
        """
        Обновляет позицию блока.

        Args:
            db: Асинхронная сессия БД
            block: Блок для обновления
            position_data: Новая позиция

        Returns:
            Block: Обновленный блок
        """
        old_position = block.position
        new_position = position_data.position

        # Если позиция не изменилась, ничего не делаем
        if old_position == new_position:
            return block

        # Обновляем позицию текущего блока напрямую
        # Не двигаем другие блоки, так как позиции могут быть с пропусками
        block.position = new_position

        await db.commit()
        await db.refresh(block)

        return block

    @staticmethod
    async def delete_block(db: AsyncSession, block: Block) -> None:
        """
        Удаляет блок.

        Args:
            db: Асинхронная сессия БД
            block: Блок для удаления
        """
        page_id = block.page_id
        position = block.position

        await db.delete(block)
        await db.commit()

        # Пересортировываем оставшиеся блоки
        await BlockService._reorder_blocks_after_delete(db, page_id, position)

    @staticmethod
    async def reorder_blocks(
        db: AsyncSession,
        page_id: int,
        block_positions: List[tuple[int, int]]
    ) -> List[Block]:
        """
        Пересортировывает блоки на странице.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы
            block_positions: Список кортежей (block_id, new_position)

        Returns:
            List[Block]: Обновленные блоки
        """
        # Обновляем позиции блоков
        for block_id, new_position in block_positions:
            await db.execute(
                update(Block)
                .where(and_(Block.id == block_id, Block.page_id == page_id))
                .values(position=new_position)
            )

        await db.commit()

        # Получаем обновленные блоки
        return await BlockService.get_page_blocks(db, page_id)

    @staticmethod
    async def _reorder_blocks_on_move(
        db: AsyncSession,
        page_id: int,
        old_position: int,
        new_position: int
    ) -> None:
        """
        Пересортировывает блоки при перемещении одного блока.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы
            old_position: Старая позиция
            new_position: Новая позиция
        """
        if old_position < new_position:
            # Перемещение вниз: уменьшаем position блоков между старой и новой позицией
            await db.execute(
                update(Block)
                .where(
                    and_(
                        Block.page_id == page_id,
                        Block.position > old_position,
                        Block.position <= new_position
                    )
                )
                .values(position=Block.position - 1)
            )
        else:
            # Перемещение вверх: увеличиваем position блоков между новой и старой позицией
            await db.execute(
                update(Block)
                .where(
                    and_(
                        Block.page_id == page_id,
                        Block.position >= new_position,
                        Block.position < old_position
                    )
                )
                .values(position=Block.position + 1)
            )

    @staticmethod
    async def _reorder_blocks_after_delete(
        db: AsyncSession,
        page_id: int,
        deleted_position: int
    ) -> None:
        """
        Пересортировывает блоки после удаления.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы
            deleted_position: Позиция удаленного блока
        """
        # Уменьшаем position у всех блоков, находящихся после удаленного
        await db.execute(
            update(Block)
            .where(
                and_(
                    Block.page_id == page_id,
                    Block.position > deleted_position
                )
            )
            .values(position=Block.position - 1)
        )
        await db.commit()

    @staticmethod
    async def get_blocks_count(db: AsyncSession, page_id: int) -> int:
        """
        Получает количество блоков на странице.

        Args:
            db: Асинхронная сессия БД
            page_id: ID страницы

        Returns:
            int: Количество блоков
        """
        result = await db.execute(
            select(func.count(Block.id)).where(Block.page_id == page_id)
        )
        return result.scalar_one()
