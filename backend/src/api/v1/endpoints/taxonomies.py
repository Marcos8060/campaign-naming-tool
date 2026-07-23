from typing import Optional
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.db.session import get_pool

router = APIRouter()


@router.get("")
async def list_taxonomies(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    type: Optional[str] = None,
    parent_id: Optional[UUID] = None,
    current_user: dict = Depends(get_current_user),
):
    query = "SELECT * FROM taxonomies WHERE workspace_id = $1 AND is_active = true"
    params = [workspace_id]

    if type:
        params.append(type)
        query += f" AND type = ${len(params)}"
    if parent_id:
        params.append(parent_id)
        query += f" AND parent_id = ${len(params)}"

    query += " ORDER BY sort_order, name"
    rows = await pool.fetch(query, *params)
    return [
        {k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}
        for r in rows
    ]


@router.get("/tree")
async def get_taxonomy_tree(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM taxonomies WHERE workspace_id = $1 AND is_active = true ORDER BY level, sort_order, name",
        workspace_id
    )

    nodes = {str(r["id"]): {**{k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}, "children": []} for r in rows}
    roots = []

    for node_id, node in nodes.items():
        parent_id = node.get("parent_id")
        if parent_id and parent_id in nodes:
            nodes[parent_id]["children"].append(node)
        else:
            roots.append(node)

    return roots


@router.post("")
async def create_taxonomy(
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    level = 0
    if body.get("parent_id"):
        parent = await pool.fetchrow(
            "SELECT level FROM taxonomies WHERE id = $1 AND workspace_id = $2",
            UUID(body["parent_id"]), workspace_id
        )
        if parent:
            level = parent["level"] + 1

    row = await pool.fetchrow(
        """INSERT INTO taxonomies (workspace_id, name, type, parent_id, level, code, sort_order, metadata, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *""",
        workspace_id,
        body["name"],
        body["type"],
        UUID(body["parent_id"]) if body.get("parent_id") else None,
        level,
        body["code"],
        body.get("sort_order", 0),
        body.get("metadata", {}),
        current_user["id"],
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.patch("/{taxonomy_id}")
async def update_taxonomy(
    taxonomy_id: UUID,
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    allowed = {"name", "code", "type", "sort_order", "metadata", "is_active"}
    updates = {k: v for k, v in body.items() if k in allowed}

    # Handle parent_id separately (can be None to move to root)
    parent_id_value = body.get("parent_id", "__missing__")
    has_parent_update = parent_id_value != "__missing__"

    if not updates and not has_parent_update:
        raise HTTPException(status_code=400, detail="No valid fields")

    if has_parent_update:
        if parent_id_value:
            parent = await pool.fetchrow(
                "SELECT level FROM taxonomies WHERE id = $1 AND workspace_id = $2",
                UUID(parent_id_value), workspace_id
            )
            new_level = (parent["level"] + 1) if parent else 0
        else:
            new_level = 0
        updates["parent_id"] = UUID(parent_id_value) if parent_id_value else None
        updates["level"] = new_level

    set_clause = ", ".join([f"{k} = ${i+3}" for i, k in enumerate(updates.keys())])
    values = list(updates.values())

    row = await pool.fetchrow(
        f"UPDATE taxonomies SET {set_clause}, updated_at = NOW() WHERE id = $1 AND workspace_id = $2 RETURNING *",
        taxonomy_id, workspace_id, *values
    )
    if not row:
        raise HTTPException(status_code=404, detail="Taxonomy not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.delete("/{taxonomy_id}")
async def delete_taxonomy(
    taxonomy_id: UUID,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    await pool.execute(
        "UPDATE taxonomies SET is_active = false WHERE id = $1 AND workspace_id = $2",
        taxonomy_id, current_user["workspace_id"]
    )
    return {"success": True}
