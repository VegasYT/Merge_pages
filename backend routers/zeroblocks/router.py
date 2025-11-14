from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.dependencies import get_current_user, get_admin_user
from app.modules.auth.models import User
from app.modules.zero_blocks.schemas import (
    ZeroBaseElementCreate,
    ZeroBaseElementResponse,
    ZeroBlockCreate,
    ZeroBlockUpdate,
    ZeroBlockResponse,
    ZeroBlockWithLayersResponse,
    ZeroLayerCreate,
    ZeroLayerUpdate,
    ZeroLayerPositionUpdate,
    ZeroLayerResponse,
    ZeroLayerWithResponsiveResponse,
    ZeroBlockResponsiveCreate,
    ZeroBlockResponsiveUpdate,
    ZeroBlockResponsiveResponse,
    ZeroLayerResponsiveCreate,
    ZeroLayerResponsiveUpdate,
    ZeroLayerResponsiveResponse,
)
from app.modules.zero_blocks.service import (
    ZeroBaseElementService,
    ZeroBlockService,
    ZeroLayerService,
    ZeroBlockResponsiveService,
    ZeroLayerResponsiveService,
)
from app.modules.zero_blocks.dependencies import (
    get_zero_block_and_verify_access,
    get_zero_block_by_id_and_verify_access,
    get_layer_and_verify_access,
    get_block_responsive_and_verify_access,
    get_layer_responsive_and_verify_access,
)
from app.modules.zero_blocks.models import ZeroBlock, ZeroLayer, ZeroBlockResponsive, ZeroLayerResponsive

router = APIRouter(tags=["Zero-блоки"])


# ==================== ZeroBaseElement Endpoints ====================

@router.post(
    "/api/zero-base-elements",
    response_model=ZeroBaseElementResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание нового базового элемента (только для администраторов)."
)
async def create_base_element(
    element_data: ZeroBaseElementCreate,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание нового базового элемента.
    Требуются права администратора.

    Args:
        element_data: Данные для создания базового элемента
        admin_user: Текущий авторизованный администратор
        db: Сессия БД

    Returns:
        ZeroBaseElementResponse: Созданный базовый элемент

    Raises:
        HTTPException: 403 если пользователь не является администратором
        HTTPException: 400 если элемент с таким type_name уже существует
    """
    try:
        element = await ZeroBaseElementService.create_base_element(
            db=db,
            type_name=element_data.type_name,
            display_name=element_data.display_name,
            icon=element_data.icon,
            schema=element_data.schema
        )
        return element
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/api/zero-base-elements",
    response_model=List[ZeroBaseElementResponse],
    description="Получение списка всех базовых элементов для zero-блоков."
)
async def get_all_base_elements(
    # current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка всех базовых элементов.

    Args:
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        List[ZeroBaseElementResponse]: Список базовых элементов
    """
    elements = await ZeroBaseElementService.get_all_base_elements(db=db)
    return elements


@router.get(
    "/api/zero-base-elements/{element_id}",
    response_model=ZeroBaseElementResponse,
    description="Получение базового элемента по ID."
)
async def get_base_element_by_id(
    element_id: int,
    # current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение базового элемента по ID.

    Args:
        element_id: ID базового элемента
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        ZeroBaseElementResponse: Базовый элемент

    Raises:
        HTTPException: 404 если элемент не найден
    """
    element = await ZeroBaseElementService.get_base_element_by_id(db=db, element_id=element_id)

    if not element:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Базовый элемент не найден"
        )

    return element


# ==================== ZeroBlock Endpoints ====================

@router.post(
    "/api/blocks/{block_id}/zero-block",
    response_model=ZeroBlockResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание zero-блока для существующего блока."
)
async def create_zero_block(
    block_id: int,
    zero_block_data: ZeroBlockCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание zero-блока для существующего блока.

    Args:
        block_id: ID блока
        zero_block_data: Данные для создания zero-блока
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        ZeroBlockResponse: Созданный zero-блок

    Raises:
        HTTPException: 404 если блок не найден или нет доступа
        HTTPException: 400 если zero-блок уже существует для данного блока
    """
    from app.modules.blocks.dependencies import get_block_and_verify_access

    # Проверяем доступ к блоку
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=block_id)

    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блок не найден"
        )

    # Проверяем, что блок типа zeroblock
    if block.type != "zeroblock":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zero-блок можно создать только для блоков типа 'zeroblock'"
        )

    # Получаем страницу блока
    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блок не найден"
        )

    # Проверяем, что проект принадлежит пользователю
    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блок не найден"
        )

    # Проверяем, не существует ли уже zero-блок для данного блока
    existing_zero_block = await ZeroBlockService.get_zero_block_by_block_id(
        db=db,
        block_id=block_id
    )

    if existing_zero_block:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zero-блок для данного блока уже существует"
        )

    # Создаем zero-блок
    zero_block = await ZeroBlockService.create_zero_block(
        db=db,
        block_id=block_id,
        zero_block_data=zero_block_data
    )

    return zero_block


@router.get(
    "/api/zero-blocks/{zero_block_id}",
    response_model=ZeroBlockWithLayersResponse,
    description="Получение zero-блока по ID zero-блока со всеми слоями и breakpoints."
)
async def get_zero_block(
    zero_block_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение zero-блока по ID zero-блока со всеми слоями и breakpoints.

    Args:
        zero_block_id: ID zero-блока
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        ZeroBlockWithLayersResponse: Данные zero-блока со слоями и breakpoints

    Raises:
        HTTPException: 404 если zero-блок не найден или нет доступа
    """
    # Получаем zero-блок
    zero_block = await ZeroBlockService.get_zero_block_by_id(db=db, zero_block_id=zero_block_id)

    if not zero_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Проверяем доступ через блок
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=zero_block.block_id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Загружаем связанные данные
    zero_block_with_data = await ZeroBlockService.get_zero_block_by_block_id(
        db=db,
        block_id=zero_block.block_id,
        load_relations=True
    )
    return zero_block_with_data


@router.patch(
    "/api/zero-blocks/{zero_block_id}",
    response_model=ZeroBlockResponse,
    description="Обновление настроек zero-блока."
)
async def update_zero_block(
    zero_block_id: int,
    update_data: ZeroBlockUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление настроек zero-блока.

    Args:
        zero_block_id: ID zero-блока
        update_data: Новые данные
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        ZeroBlockResponse: Обновленный zero-блок

    Raises:
        HTTPException: 404 если zero-блок не найден
    """
    # Получаем и проверяем доступ
    zero_block = await ZeroBlockService.get_zero_block_by_id(db=db, zero_block_id=zero_block_id)

    if not zero_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Проверяем доступ
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=zero_block.block_id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    updated_zero_block = await ZeroBlockService.update_zero_block(
        db=db,
        zero_block=zero_block,
        update_data=update_data
    )
    return updated_zero_block


@router.delete(
    "/api/zero-blocks/{zero_block_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление zero-блока."
)
async def delete_zero_block(
    zero_block_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаление zero-блока.

    Args:
        zero_block_id: ID zero-блока
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Raises:
        HTTPException: 404 если zero-блок не найден
    """
    # Получаем и проверяем доступ
    zero_block = await ZeroBlockService.get_zero_block_by_id(db=db, zero_block_id=zero_block_id)

    if not zero_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Проверяем доступ
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=zero_block.block_id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    await ZeroBlockService.delete_zero_block(db=db, zero_block=zero_block)


# ==================== ZeroLayer Endpoints ====================

@router.get(
    "/api/zero-blocks/{zero_block_id}/layers",
    response_model=List[ZeroLayerResponse],
    description="Получение списка слоев zero-блока."
)
async def get_zero_block_layers(
    zero_block_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка слоев zero-блока.

    Args:
        zero_block_id: ID zero-блока
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        List[ZeroLayerResponse]: Список слоев

    Raises:
        HTTPException: 404 если zero-блок не найден или нет доступа
    """
    # Получаем и проверяем доступ
    zero_block = await ZeroBlockService.get_zero_block_by_id(db=db, zero_block_id=zero_block_id)

    if not zero_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Проверяем доступ
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=zero_block.block_id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    layers = await ZeroLayerService.get_zero_block_layers(
        db=db,
        zero_block_id=zero_block.id
    )
    return layers


@router.post(
    "/api/zero-blocks/{zero_block_id}/layers",
    response_model=ZeroLayerResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание нового слоя в zero-блоке."
)
async def create_layer(
    zero_block_id: int,
    layer_data: ZeroLayerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание нового слоя в zero-блоке.

    Args:
        zero_block_id: ID zero-блока
        layer_data: Данные для создания слоя
        current_user: Текущий авторизованный пользователь
        db: Сессия БД

    Returns:
        ZeroLayerResponse: Созданный слой

    Raises:
        HTTPException: 404 если zero-блок не найден
    """
    # Получаем и проверяем доступ
    zero_block = await ZeroBlockService.get_zero_block_by_id(db=db, zero_block_id=zero_block_id)

    if not zero_block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    # Проверяем доступ
    from app.modules.blocks.service import BlockService
    from app.modules.pages.service import PageService
    from app.modules.projects.service import ProjectService

    block = await BlockService.get_block_by_id(db=db, block_id=zero_block.block_id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    page = await PageService.get_page_by_id(db=db, page_id=block.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    project = await ProjectService.get_project_by_id(
        db=db,
        project_id=page.project_id,
        user_id=current_user.id
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zero-блок не найден"
        )

    try:
        layer = await ZeroLayerService.create_layer(
            db=db,
            zero_block_id=zero_block.id,
            layer_data=layer_data
        )
        return layer
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/api/zero-layers/{layer_id}",
    response_model=ZeroLayerWithResponsiveResponse,
    description="Получение слоя по ID с адаптивными настройками."
)
async def get_layer(
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение слоя по ID с адаптивными настройками.

    Args:
        layer_id: ID слоя
        layer: Слой (получен через dependency)
        db: Сессия БД

    Returns:
        ZeroLayerWithResponsiveResponse: Данные слоя с адаптивными настройками

    Raises:
        HTTPException: 404 если слой не найден или нет доступа
    """
    # Загружаем с адаптивными настройками
    layer_with_responsive = await ZeroLayerService.get_layer_by_id(
        db=db,
        layer_id=layer.id,
        load_responsive=True
    )
    return layer_with_responsive


@router.patch(
    "/api/zero-layers/{layer_id}",
    response_model=ZeroLayerResponse,
    description="Обновление слоя."
)
async def update_layer(
    update_data: ZeroLayerUpdate,
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление слоя.

    Args:
        layer_id: ID слоя
        update_data: Новые данные
        layer: Слой (получен через dependency)
        db: Сессия БД

    Returns:
        ZeroLayerResponse: Обновленный слой

    Raises:
        HTTPException: 404 если слой не найден
    """
    try:
        updated_layer = await ZeroLayerService.update_layer(
            db=db,
            layer=layer,
            update_data=update_data
        )
        return updated_layer
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch(
    "/api/zero-layers/{layer_id}/position",
    response_model=ZeroLayerResponse,
    description="Изменение позиции слоя (z-index)."
)
async def update_layer_position(
    position_data: ZeroLayerPositionUpdate,
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Изменение позиции слоя (z-index).

    Args:
        layer_id: ID слоя
        position_data: Новая позиция
        layer: Слой (получен через dependency)
        db: Сессия БД

    Returns:
        ZeroLayerResponse: Обновленный слой

    Raises:
        HTTPException: 404 если слой не найден
    """
    updated_layer = await ZeroLayerService.update_layer_position(
        db=db,
        layer=layer,
        position_data=position_data
    )
    return updated_layer


@router.delete(
    "/api/zero-layers/{layer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление слоя."
)
async def delete_layer(
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаление слоя.

    Args:
        layer_id: ID слоя
        layer: Слой (получен через dependency)
        db: Сессия БД

    Raises:
        HTTPException: 404 если слой не найден
    """
    await ZeroLayerService.delete_layer(db=db, layer=layer)


# ==================== ZeroBlockResponsive Endpoints ====================

@router.get(
    "/api/zero-blocks/{zero_block_id}/responsive",
    response_model=List[ZeroBlockResponsiveResponse],
    description="Получение списка адаптивных настроек zero-блока."
)
async def get_zero_block_responsive_settings(
    zero_block: ZeroBlock = Depends(get_zero_block_by_id_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """Получение списка адаптивных настроек zero-блока."""
    responsive_settings = await ZeroBlockResponsiveService.get_all_responsive_by_zero_block(
        db=db,
        zero_block_id=zero_block.id
    )
    return responsive_settings


@router.post(
    "/api/zero-blocks/{zero_block_id}/responsive",
    response_model=ZeroBlockResponsiveResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание адаптивных настроек для zero-блока."
)
async def create_zero_block_responsive(
    responsive_data: ZeroBlockResponsiveCreate,
    zero_block: ZeroBlock = Depends(get_zero_block_by_id_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """Создание адаптивных настроек для zero-блока."""
    try:
        responsive = await ZeroBlockResponsiveService.create_responsive(
            db=db,
            responsive_data=responsive_data
        )
        return responsive
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/api/zero-block-responsive/{responsive_id}",
    response_model=ZeroBlockResponsiveResponse,
    description="Получение адаптивных настроек по ID."
)
async def get_zero_block_responsive_by_id(
    responsive: ZeroBlockResponsive = Depends(get_block_responsive_and_verify_access),
):
    """Получение адаптивных настроек по ID."""
    return responsive


@router.put(
    "/api/zero-block-responsive/{responsive_id}",
    response_model=ZeroBlockResponsiveResponse,
    description="Обновление адаптивных настроек."
)
async def update_zero_block_responsive(
    update_data: ZeroBlockResponsiveUpdate,
    responsive: ZeroBlockResponsive = Depends(get_block_responsive_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """Обновление адаптивных настроек."""
    updated_responsive = await ZeroBlockResponsiveService.update_responsive(
        db=db,
        responsive=responsive,
        update_data=update_data
    )
    return updated_responsive


@router.delete(
    "/api/zero-block-responsive/{responsive_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление адаптивных настроек."
)
async def delete_zero_block_responsive(
    responsive: ZeroBlockResponsive = Depends(get_block_responsive_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """Удаление адаптивных настроек."""
    await ZeroBlockResponsiveService.delete_responsive(db=db, responsive=responsive)


# ==================== ZeroLayerResponsive Endpoints ====================

@router.get(
    "/api/zero-layers/{layer_id}/responsive",
    response_model=List[ZeroLayerResponsiveResponse],
    description="Получение списка адаптивных настроек слоя."
)
async def get_layer_responsive_settings(
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка адаптивных настроек слоя.

    Args:
        layer_id: ID слоя
        layer: Слой (получен через dependency)
        db: Сессия БД

    Returns:
        List[ZeroLayerResponsiveResponse]: Список адаптивных настроек

    Raises:
        HTTPException: 404 если слой не найден или нет доступа
    """
    responsive_settings = await ZeroLayerResponsiveService.get_layer_responsive_settings(
        db=db,
        layer_id=layer.id
    )
    return responsive_settings


@router.post(
    "/api/zero-layers/{layer_id}/responsive",
    response_model=ZeroLayerResponsiveResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание адаптивных настроек для слоя."
)
async def create_responsive(
    responsive_data: ZeroLayerResponsiveCreate,
    layer: ZeroLayer = Depends(get_layer_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание адаптивных настроек для слоя.

    Args:
        layer_id: ID слоя
        responsive_data: Данные для создания настроек
        layer: Слой (получен через dependency)
        db: Сессия БД

    Returns:
        ZeroLayerResponsiveResponse: Созданные настройки

    Raises:
        HTTPException: 404 если слой не найден
        HTTPException: 400 если настройки для данного breakpoint уже существуют или breakpoint не найден
    """
    try:
        responsive = await ZeroLayerResponsiveService.create_responsive(
            db=db,
            layer_id=layer.id,
            responsive_data=responsive_data
        )
        return responsive
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/api/zero-layer-responsive/{responsive_id}",
    response_model=ZeroLayerResponsiveResponse,
    description="Получение адаптивных настроек по ID."
)
async def get_responsive(
    responsive: ZeroLayerResponsive = Depends(get_layer_responsive_and_verify_access),
):
    """
    Получение адаптивных настроек по ID.

    Args:
        responsive_id: ID настроек
        responsive: Настройки (получены через dependency)

    Returns:
        ZeroLayerResponsiveResponse: Адаптивные настройки

    Raises:
        HTTPException: 404 если настройки не найдены или нет доступа
    """
    return responsive


@router.patch(
    "/api/zero-layer-responsive/{responsive_id}",
    response_model=ZeroLayerResponsiveResponse,
    description="Обновление адаптивных настроек."
)
async def update_responsive(
    update_data: ZeroLayerResponsiveUpdate,
    responsive: ZeroLayerResponsive = Depends(get_layer_responsive_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление адаптивных настроек.

    Args:
        responsive_id: ID настроек
        update_data: Новые данные
        responsive: Настройки (получены через dependency)
        db: Сессия БД

    Returns:
        ZeroLayerResponsiveResponse: Обновленные настройки

    Raises:
        HTTPException: 404 если настройки не найдены
    """
    updated_responsive = await ZeroLayerResponsiveService.update_responsive(
        db=db,
        responsive=responsive,
        update_data=update_data
    )
    return updated_responsive


@router.delete(
    "/api/zero-layer-responsive/{responsive_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление адаптивных настроек."
)
async def delete_responsive(
    responsive: ZeroLayerResponsive = Depends(get_layer_responsive_and_verify_access),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаление адаптивных настроек.

    Args:
        responsive_id: ID настроек
        responsive: Настройки (получены через dependency)
        db: Сессия БД

    Raises:
        HTTPException: 404 если настройки не найдены
    """
    await ZeroLayerResponsiveService.delete_responsive(db=db, responsive=responsive)
