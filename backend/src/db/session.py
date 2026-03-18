import asyncpg
from src.config import settings
import re

pool: asyncpg.Pool | None = None


def get_db_url() -> str:
    url = settings.database_url
    url = re.sub(r"postgresql\+asyncpg://", "postgresql://", url)
    return url


async def init_db():
    global pool
    pool = await asyncpg.create_pool(
        get_db_url(),
        min_size=5,
        max_size=20,
        command_timeout=60,
    )
    await run_migrations()


async def close_db():
    global pool
    if pool:
        await pool.close()


async def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool


async def run_migrations():
    import os
    migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
    if not os.path.exists(migrations_dir):
        return

    migration_files = sorted([
        f for f in os.listdir(migrations_dir)
        if f.endswith(".sql") and not f.startswith("seed")
    ])

    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT NOW()
            )
        """)

        for migration_file in migration_files:
            version = migration_file.replace(".sql", "")
            exists = await conn.fetchval(
                "SELECT version FROM schema_migrations WHERE version = $1",
                version
            )
            if not exists:
                migration_path = os.path.join(migrations_dir, migration_file)
                with open(migration_path, "r") as f:
                    sql = f.read()
                try:
                    await conn.execute(sql)
                    await conn.execute(
                        "INSERT INTO schema_migrations (version) VALUES ($1)",
                        version
                    )
                    print(f"✅ Applied migration: {migration_file}")
                except Exception as e:
                    print(f"❌ Migration failed {migration_file}: {e}")
                    raise
