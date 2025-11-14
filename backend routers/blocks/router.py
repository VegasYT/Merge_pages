from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.blocks.schemas import (
    BlockCreate,
    BlockUpdate,
    BlockResponse,
    BlockPositionUpdate,
)
from app.modules.blocks.service import BlockService
from app.modules.blocks.dependencies import (
    get_block_and_verify_access,
    verify_page_access,
)
from app.modules.blocks.models import Block

router = APIRouter(tags=["Блоки"])


@router.get(
    "/api/pages/{page_id}/blocks",
    response_model=List[BlockResponse],
    description="Получение списка блоков на странице."
)
async def get_page_blocks(
    page_id: int = Depends(verify_page_access),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(100, ge=1, le=100, description="Максимальное количество записей"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка блоков на странице.

    Args:
        page_id: ID страницы
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        List[BlockResponse]: Список блоков, отсортированных по позиции

    Raises:
        HTTPException: 404 если страница не найдена или нет доступа
    """
    blocks = await BlockService.get_page_blocks(
        db=db,
        page_id=page_id,
        skip=skip,
        limit=limit
    )
    return blocks


@router.post(
    "/api/pages/{page_id}/blocks",
    response_model=BlockResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание нового блока на странице."
)
async def create_block(
    block_data: BlockCreate,
    page_id: int = Depends(verify_page_access),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание нового блока на странице.

    Args:
        page_id: ID страницы
        block_data: Данные для создания блока
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        BlockResponse: Созданный блок

    Raises:
        HTTPException: 404 если страница не найдена
        HTTPException: 400 если данные блока невалидны
    """
    try:
        block = await BlockService.create_block(
            db=db,
            page_id=page_id,
            block_data=block_data
        )
        return block
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/api/blocks/{block_id}",
    response_model=BlockResponse,
    description="Получение блока по ID."
)
async def get_block(
    block: Block = Depends(get_block_and_verify_access),
):
    """
    Получение блока по ID.

    Args:
        block: Блок (получен через dependency)

    Returns:
        BlockResponse: Данные блока

    Raises:
        HTTPException: 404 если блок не найден или нет доступа
    """
    return block


@router.patch(
    "/api/blocks/{block_id}",
    response_model=BlockResponse,
    description="Обновление настроек блока."
)
async def update_block(
    update_data: BlockUpdate,
    block: Block = Depends(get_block_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление настроек блока.

    Args:
        block_id: ID блока
        update_data: Новые настройки блока
        block: Блок (получен через dependency)
        db: Сессия БД

    Returns:
        BlockResponse: Обновленный блок

    Raises:
        HTTPException: 404 если блок не найден
    """
    updated_block = await BlockService.update_block(
        db=db,
        block=block,
        update_data=update_data
    )
    return updated_block


@router.patch(
    "/api/blocks/{block_id}/position",
    response_model=BlockResponse,
    description="Обновление позиции блока на странице."
)
async def update_block_position(
    position_data: BlockPositionUpdate,
    block: Block = Depends(get_block_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление позиции блока на странице.

    Args:
        block_id: ID блока
        position_data: Новая позиция
        block: Блок (получен через dependency)
        db: Сессия БД

    Returns:
        BlockResponse: Обновленный блок

    Raises:
        HTTPException: 404 если блок не найден
    """
    updated_block = await BlockService.update_block_position(
        db=db,
        block=block,
        position_data=position_data
    )
    return updated_block


@router.delete(
    "/api/blocks/{block_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление блока."
)
async def delete_block(
    block: Block = Depends(get_block_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаление блока.

    Args:
        block_id: ID блока
        block: Блок (получен через dependency)
        db: Сессия БД

    Raises:
        HTTPException: 404 если блок не найден
    """
    await BlockService.delete_block(db=db, block=block)
