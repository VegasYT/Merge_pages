from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.dependencies import get_admin_user
from app.modules.auth.models import User
from app.modules.block_templates.schemas import (
    BlockTemplateCreate,
    BlockTemplateUpdate,
    BlockTemplateResponse,
    BlockTemplateCategoryCreate,
    BlockTemplateCategoryResponse,
    BlockTemplateCategoryWithCount,
)
from app.modules.block_templates.service import BlockTemplateService

router = APIRouter(prefix="/api/block-templates", tags=["Шаблоны блоков"])


# Эндпоинты для категорий

@router.get(
    "/categories",
    response_model=List[BlockTemplateCategoryResponse],
    description="Получение списка всех категорий шаблонов."
)
async def get_categories(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(100, ge=1, le=100, description="Максимальное количество записей"),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка всех категорий шаблонов.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия БД

    Returns:
        List[BlockTemplateCategoryResponse]: Список категорий
    """
    categories = await BlockTemplateService.get_all_categories(
        db=db,
        skip=skip,
        limit=limit
    )
    return categories


@router.post(
    "/categories",
    response_model=BlockTemplateCategoryResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание новой категории шаблонов (только для администраторов)."
)
async def create_category(
    category_data: BlockTemplateCategoryCreate,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание новой категории шаблонов (только для администраторов).

    Args:
        category_data: Данные для создания категории
        admin_user: Текущий пользователь (должен быть администратором)
        db: Сессия БД

    Returns:
        BlockTemplateCategoryResponse: Созданная категория

    Raises:
        HTTPException: 403 если пользователь не администратор
        HTTPException: 400 если категория с таким именем уже существует
    """
    try:
        category = await BlockTemplateService.create_category(
            db=db,
            category_data=category_data
        )
        return category
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/categories/{category_id}",
    response_model=BlockTemplateCategoryResponse,
    description="Получение категории по ID."
)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Получение категории по ID.

    Args:
        category_id: ID категории
        db: Сессия БД

    Returns:
        BlockTemplateCategoryResponse: Данные категории

    Raises:
        HTTPException: 404 если категория не найдена
    """
    category = await BlockTemplateService.get_category_by_id(
        db=db,
        category_id=category_id
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена"
        )

    return category


# Эндпоинты для шаблонов

@router.get(
    "",
    response_model=List[BlockTemplateResponse],
    description="Получение списка всех шаблонов блоков."
)
async def get_templates(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(100, ge=1, le=100, description="Максимальное количество записей"),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение списка всех шаблонов блоков.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия БД

    Returns:
        List[BlockTemplateResponse]: Список шаблонов
    """
    templates = await BlockTemplateService.get_all_templates(
        db=db,
        skip=skip,
        limit=limit
    )
    return templates


@router.post(
    "",
    response_model=BlockTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание нового шаблона блока (только для администраторов)."
)
async def create_template(
    template_data: BlockTemplateCreate,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создание нового шаблона блока (только для администраторов).

    Args:
        template_data: Данные для создания шаблона
        admin_user: Текущий пользователь (должен быть администратором)
        db: Сессия БД

    Returns:
        BlockTemplateResponse: Созданный шаблон

    Raises:
        HTTPException: 403 если пользователь не администратор
        HTTPException: 400 если категория не найдена
    """
    try:
        template = await BlockTemplateService.create_template(
            db=db,
            template_data=template_data
        )
        return template
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/{template_id}",
    response_model=BlockTemplateResponse,
    description="Получение шаблона по ID."
)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Получение шаблона по ID.

    Args:
        template_id: ID шаблона
        db: Сессия БД

    Returns:
        BlockTemplateResponse: Данные шаблона

    Raises:
        HTTPException: 404 если шаблон не найден
    """
    template = await BlockTemplateService.get_template_by_id(
        db=db,
        template_id=template_id
    )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Шаблон не найден"
        )

    return template


@router.get(
    "/category/{category_id}/templates",
    response_model=List[BlockTemplateResponse],
    description="Получение шаблонов по категории."
)
async def get_templates_by_category(
    category_id: int,
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(100, ge=1, le=100, description="Максимальное количество записей"),
    db: AsyncSession = Depends(get_db),
):
    """
    Получение шаблонов по категории.

    Args:
        category_id: ID категории
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        db: Сессия БД

    Returns:
        List[BlockTemplateResponse]: Список шаблонов

    Raises:
        HTTPException: 404 если категория не найдена
    """
    # Проверяем существование категории
    category = await BlockTemplateService.get_category_by_id(
        db=db,
        category_id=category_id
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена"
        )

    templates = await BlockTemplateService.get_templates_by_category(
        db=db,
        category_id=category_id,
        skip=skip,
        limit=limit
    )
    return templates


@router.patch(
    "/{template_id}",
    response_model=BlockTemplateResponse,
    description="Обновление шаблона блока (только для администраторов)."
)
async def update_template(
    template_id: int,
    update_data: BlockTemplateUpdate,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновление шаблона блока (только для администраторов).

    Args:
        template_id: ID шаблона
        update_data: Новые данные шаблона
        admin_user: Текущий пользователь (должен быть администратором)
        db: Сессия БД

    Returns:
        BlockTemplateResponse: Обновленный шаблон

    Raises:
        HTTPException: 403 если пользователь не администратор
        HTTPException: 404 если шаблон не найден
        HTTPException: 400 если категория не найдена
    """
    template = await BlockTemplateService.get_template_by_id(
        db=db,
        template_id=template_id
    )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Шаблон не найден"
        )

    try:
        updated_template = await BlockTemplateService.update_template(
            db=db,
            template=template,
            update_data=update_data
        )
        return updated_template
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление шаблона блока (только для администраторов)."
)
async def delete_template(
    template_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Удаление шаблона блока (только для администраторов).

    Args:
        template_id: ID шаблона
        admin_user: Текущий пользователь (должен быть администратором)
        db: Сессия БД

    Raises:
        HTTPException: 403 если пользователь не администратор
        HTTPException: 404 если шаблон не найден
    """
    template = await BlockTemplateService.get_template_by_id(
        db=db,
        template_id=template_id
    )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Шаблон не найден"
        )

    await BlockTemplateService.delete_template(db=db, template=template)
